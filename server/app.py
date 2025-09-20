import os
import io
import json
import uuid
import time
import re
import hashlib
import logging
import datetime as dt
from enum import Enum
from typing import Optional, Dict, Any, List
from flask_cors import CORS

from dotenv import load_dotenv
from flask import Flask, Blueprint, request, jsonify, current_app, g, make_response
from werkzeug.utils import secure_filename

import boto3
from botocore.exceptions import ClientError

import pandas as pd
from pymongo import MongoClient
from pymongo.collection import Collection

import openai

from sqlalchemy import (
    create_engine, Column, String, Text, DateTime, Boolean, BigInteger,
    Index, UniqueConstraint, ForeignKey
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import Enum as SAEnum
from flask import redirect



load_dotenv()


logger = logging.getLogger("flux.server")

def get_env(name: str, default: Optional[str] = None, required: bool = False) -> str:
    v = os.getenv(name, default)
    if required and (v is None or v == ""):
        raise RuntimeError(f"Missing required env var: {name}")
    return v

DATABASE_URL = get_env("DATABASE_URL", required=True)
AWS_ACCESS_KEY_ID = get_env("AWS_ACCESS_KEY_ID", required=True)
AWS_SECRET_ACCESS_KEY = get_env("AWS_SECRET_ACCESS_KEY", required=True)
AWS_REGION = get_env("AWS_REGION", "ap-south-1")
S3_BUCKET = get_env("S3_BUCKET", required=True)
MONGO_URI = get_env("MONGO_URI", required=True)
EMBED_DIM = int(get_env("EMBED_DIM", "768"))
OPENAI_API_KEY = get_env("OPENAI_API_KEY", required=False)

# Optional: override the iframe URL via environment
IFRAME_NOTEBOOK_URL = get_env(
    "IFRAME_NOTEBOOK_URL",
    "http://karans-macbook-air.local:8888/notebooks/Untitled.ipynb"
)

def _uuid() -> str:
    return str(uuid.uuid4())



Base = declarative_base()

class IssueStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class PRStatus(str, Enum):
    OPEN = "OPEN"
    MERGED = "MERGED"
    CLOSED = "CLOSED"


class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)

    datasets = relationship("Dataset", back_populates="owner")
    notebooks = relationship("Notebook", back_populates="author")
    issues = relationship("Issue", back_populates="author")
    pullRequests = relationship("PullRequest", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    DatasetVersion = relationship("DatasetVersion", back_populates="user")


class Dataset(Base):
    __tablename__ = "Dataset"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    authorNote = Column(Text, nullable=True)
    license = Column(String, nullable=False)
    isPrivate = Column(Boolean, default=False, nullable=False)
    dataCard = Column(JSONB, nullable=True)
    tags = Column(ARRAY(String), nullable=False, default=list)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)

    ownerId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User", back_populates="datasets")

    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="dataset", cascade="all, delete-orphan")
    pullRequests = relationship("PullRequest", back_populates="dataset", cascade="all, delete-orphan")
    notebooks = relationship("Notebook", back_populates="dataset")


class DatasetVersion(Base):
    __tablename__ = "DatasetVersion"
    id = Column(String, primary_key=True, default=_uuid)
    version = Column(String, nullable=False)
    fileUrl = Column(String, nullable=False)
    fileName = Column(String, nullable=False)
    fileSize = Column(BigInteger, nullable=False)
    commitMessage = Column(Text, nullable=False)
    commitUser = Column(String, ForeignKey("User.id"), nullable=False)
    isLatest = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)

    datasetId = Column(String, ForeignKey("Dataset.id", ondelete="CASCADE"), nullable=False)
    dataset = relationship("Dataset", back_populates="versions")
    user = relationship("User", back_populates="DatasetVersion")
    pullRequests = relationship("PullRequest", back_populates="mergedVersion")

    __table_args__ = (
        UniqueConstraint("datasetId", "version", name="uq_dataset_version_pair"),
        Index("ix_versions_dataset_created", "datasetId", "createdAt"),
    )


class Issue(Base):
    __tablename__ = "Issue"
    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SAEnum(IssueStatus), default=IssueStatus.OPEN, nullable=False)
    labels = Column(ARRAY(String), nullable=False, default=list)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)
    closedAt = Column(DateTime, nullable=True)

    authorId = Column(String, ForeignKey("User.id"), nullable=False)
    author = relationship("User", back_populates="issues")

    datasetId = Column(String, ForeignKey("Dataset.id", ondelete="CASCADE"), nullable=False)
    dataset = relationship("Dataset", back_populates="issues")

    comments = relationship("Comment", back_populates="issue", cascade="all, delete-orphan")


class PullRequest(Base):
    __tablename__ = "PullRequest"
    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SAEnum(PRStatus), default=PRStatus.OPEN, nullable=False)
    modifiedFileUrl = Column(String, nullable=False)
    modifiedFileName = Column(String, nullable=False)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)
    mergedAt = Column(DateTime, nullable=True)
    closedAt = Column(DateTime, nullable=True)

    authorId = Column(String, ForeignKey("User.id"), nullable=False)
    author = relationship("User", back_populates="pullRequests")

    datasetId = Column(String, ForeignKey("Dataset.id", ondelete="CASCADE"), nullable=False)
    dataset = relationship("Dataset", back_populates="pullRequests")

    mergedVersionId = Column(String, ForeignKey("DatasetVersion.id"), nullable=True)
    mergedVersion = relationship("DatasetVersion", back_populates="pullRequests")

    comments = relationship("Comment", back_populates="pullRequest", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "Comment"
    id = Column(String, primary_key=True, default=_uuid)
    content = Column(Text, nullable=False)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)

    authorId = Column(String, ForeignKey("User.id"), nullable=False)
    author = relationship("User", back_populates="comments")

    issueId = Column(String, ForeignKey("Issue.id", ondelete="CASCADE"), nullable=True)
    issue = relationship("Issue", back_populates="comments")

    pullRequestId = Column(String, ForeignKey("PullRequest.id", ondelete="CASCADE"), nullable=True)
    pullRequest = relationship("PullRequest", back_populates="comments")


class Notebook(Base):
    __tablename__ = "Notebook"
    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    fileUrl = Column(String, nullable=True)
    isPublic = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)

    authorId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    author = relationship("User", back_populates="notebooks")

    datasetId = Column(String, ForeignKey("Dataset.id", ondelete="SET NULL"), nullable=True)
    dataset = relationship("Dataset", back_populates="notebooks")


def _configure_logging(app: Flask) -> None:
    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s [%(name)s] %(message)s"
    )

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(log_level)
    stream_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(stream_handler)
    root_logger.setLevel(log_level)

    app.logger.handlers.clear()
    app.logger.setLevel(log_level)
    app.logger.propagate = True

    logger.handlers.clear()
    logger.setLevel(log_level)
    logger.propagate = True


_OPENAI_CLIENT: Any = None
_OPENAI_DISABLED = object()


def _get_openai_client():
    global _OPENAI_CLIENT
    if _OPENAI_CLIENT is _OPENAI_DISABLED:
        return None

    if _OPENAI_CLIENT is not None:
        return _OPENAI_CLIENT

    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not configured; OpenAI features disabled")
        _OPENAI_CLIENT = _OPENAI_DISABLED
        return None

    try:
        if hasattr(openai, "OpenAI"):
            _OPENAI_CLIENT = openai.OpenAI(api_key=OPENAI_API_KEY)
            logger.debug("Initialized OpenAI client using beta SDK")
        else:
            openai.api_key = OPENAI_API_KEY
            _OPENAI_CLIENT = openai
            logger.debug("Initialized OpenAI client using legacy SDK")
        return _OPENAI_CLIENT
    except Exception:
        logger.exception("Failed to initialize OpenAI client")
        _OPENAI_CLIENT = _OPENAI_DISABLED
        return None


def _chat_completion(messages: List[Dict[str, str]], **kwargs) -> Optional[str]:
    client = _get_openai_client()
    if client is None:
        return None

    try:
        if hasattr(client, "chat") and hasattr(client.chat, "completions"):
            response = client.chat.completions.create(messages=messages, **kwargs)
        else:
            response = client.ChatCompletion.create(messages=messages, **kwargs)
    except Exception:
        logger.exception("OpenAI chat completion failed")
        return None

    try:
        choices = getattr(response, "choices", None)
        if choices is None:
            choices = response["choices"]

        first_choice = choices[0]

        message = getattr(first_choice, "message", None)
        if message is None:
            message = first_choice["message"]

        content = getattr(message, "content", None)
        if content is None:
            content = message["content"]

        return content.strip()
    except Exception:
        logger.exception("Unexpected OpenAI response format")
        return None


def _build_basic_model_card(dataset_name: str, description: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    schema = profile.get("dtypes", {})
    features = list(schema.keys())
    row_count = profile.get("rows", 0)
    col_count = profile.get("cols", len(features))
    completeness_score = _calculate_completeness_score(profile.get("null_counts", {}), row_count or 1)

    return {
        "overview": {
            "purpose": description or "General-purpose dataset",
            "domain": (features[0] if features else "general"),
            "keyCharacteristics": [
                f"{row_count:,} rows" if row_count else "unknown rows",
                f"{col_count} columns",
                "auto-generated summary"
            ]
        },
        "dataDescription": {
            "structure": f"Tabular dataset with {col_count} columns",
            "features": features[:10],
            "targetVariable": None
        },
        "dataCollection": {
            "methodology": "Not specified",
            "sources": "Unknown",
            "timeframe": "Unknown"
        },
        "dataQuality": {
            "completeness": f"Approximately {completeness_score}% complete",
            "consistency": "Not evaluated",
            "potentialIssues": ["Auto-generated card – review manually"]
        },
        "intendedUseCases": [
            "Exploratory analysis",
            "Model prototyping",
            "Data quality assessment"
        ],
        "limitations": [
            "No AI-generated insights available",
            "Requires manual validation"
        ],
        "technicalDetails": {
            "format": "Tabular",
            "recommendedPreprocessing": ["Review schema", "Handle missing values"]
        }
    }


def _generate_basic_tags(dataset_name: str, description: Optional[str], schema: Dict[str, str]) -> List[str]:
    candidates = []

    for text in filter(None, [dataset_name, description]):
        candidates.extend(re.findall(r"[A-Za-z0-9]+", text))

    candidates.extend(schema.keys())

    tags: List[str] = []
    for token in candidates:
        normalized = token.lower()
        if len(normalized) < 3:
            continue
        if normalized not in tags:
            tags.append(normalized)
        if len(tags) >= 5:
            break

    if not tags:
        tags.append("dataset")

    return tags


def _generate_basic_insights(profile: Dict[str, Any]) -> List[str]:
    if not profile:
        return ["Dataset profile unavailable; upload a CSV file to generate insights."]

    rows = profile.get("rows")
    cols = profile.get("cols")
    schema = profile.get("dtypes", {})
    null_counts = profile.get("null_counts", {})

    insights = []
    if rows is not None and cols is not None:
        insights.append(f"Dataset contains approximately {rows:,} rows and {cols} columns.")
    if schema:
        insights.append(f"Key columns include: {', '.join(list(schema.keys())[:5])}.")
    if null_counts:
        high_null = [col for col, count in null_counts.items() if rows and rows > 0 and (count / rows) > 0.2]
        if high_null:
            insights.append(f"Columns with notable missing data: {', '.join(high_null[:5])}.")
    completeness = _calculate_completeness_score(null_counts, rows or 0) if rows is not None else None
    if completeness is not None:
        insights.append(f"Estimated completeness score: {completeness}%.")

    if not insights:
        insights.append("No additional insights available from the uploaded profile data.")

    return insights


def create_app() -> Flask:
    app = Flask(__name__)

    _configure_logging(app)
    app.logger.info("Starting Flux server initialization")

    engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
    Base.metadata.create_all(engine)
    Session = scoped_session(sessionmaker(bind=engine))
    app.session_factory = Session  # type: ignore

    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        config=boto3.session.Config(signature_version='s3v4', s3={'addressing_style': 'virtual'})
    )
    app.s3 = s3  # type: ignore
    _validate_s3(s3, S3_BUCKET)

    mongo = MongoClient(MONGO_URI)
    app.mongo = mongo
    app.embed_coll = mongo["flux"]["dataset_embeddings"] 
    _ensure_mongo_indexes(app.embed_coll)

    app.register_blueprint(datasets_bp(Session, s3), url_prefix="/datasets")
    app.register_blueprint(issues_bp(Session), url_prefix="/issues")
    app.register_blueprint(pulls_bp(Session, s3), url_prefix="/pulls")
    app.register_blueprint(notebooks_bp(Session), url_prefix="/notebooks")
    app.register_blueprint(reco_bp(Session, app.embed_coll), url_prefix="/recommendations")

    @app.before_request
    def _log_request_started():
        g.request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        g.request_started_at = time.perf_counter()
        app.logger.info(
            "Request started id=%s %s %s from=%s",
            g.request_id,
            request.method,
            request.path,
            request.remote_addr,
        )

    @app.after_request
    def _log_request_completed(response):
        duration_ms = 0.0
        if hasattr(g, "request_started_at"):
            duration_ms = (time.perf_counter() - g.request_started_at) * 1000
        request_id = getattr(g, "request_id", "-")
        app.logger.info(
            "Request completed id=%s %s %s status=%s duration_ms=%.2f",
            request_id,
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )
        if request_id:
            response.headers["X-Request-ID"] = request_id
        return response

    @app.teardown_request
    def _log_request_teardown(exc):
        if exc is not None:
            request_id = getattr(g, "request_id", "-")
            app.logger.exception("Request failed id=%s", request_id)

    @app.route("/health")
    def health():
        return {"ok": True, "time": dt.datetime.utcnow().isoformat()}

    # --- SIMPLE IFRAME NOTEBOOK VIEW ---
    @app.route("/notebook", methods=["GET"])
    def notebook_iframe():
        """
        Render a simple HTML page that embeds the Jupyter notebook URL in an iframe.
        - Default URL comes from IFRAME_NOTEBOOK_URL env (or the hardcoded local URL)
        - You can override via query param: /notebook?url=http://host:8888/notebooks/file.ipynb
        """
        target_url = request.args.get("url") or IFRAME_NOTEBOOK_URL
        return redirect("http://46.202.162.243:8850/notebooks/Untitled.ipynb", code=302)
        resp = make_response(html)
        resp.headers["Content-Type"] = "text/html; charset=utf-8"
        return resp

    app.logger.info("Flux server initialized successfully")
    return app


def _ensure_mongo_indexes(coll: Collection):
    coll.create_index([("dataset_id", 1)], background=True)
    coll.create_index([("slug", 1)], background=True, unique=True)

def _validate_s3(s3, bucket: str):
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError as e:
        logger.warning("S3 bucket validation failed: %s", e)

def _sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def _infer_content_type(filename: str) -> str:
    fn = filename.lower()
    if fn.endswith(".csv"):
        return "text/csv"
    if fn.endswith(".json"):
        return "application/json"
    if fn.endswith(".parquet"):
        return "application/octet-stream"
    return "application/octet-stream"

def _profile_csv_bytes(content: bytes) -> Dict[str, Any]:
    try:
        df = pd.read_csv(io.BytesIO(content))
        summary = df.describe(include="all").to_dict()

        def clean_nan(x):
            if isinstance(x, dict):
                return {k: clean_nan(v) for k, v in x.items()}
            if isinstance(x, list):
                return [clean_nan(v) for v in x]
            try:
                if pd.isna(x):
                    return None
            except Exception:
                pass
            return x

        sample_rows = df.head(10).fillna("").to_dict(orient="records")

        return {
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "dtypes": {c: str(df[c].dtype) for c in df.columns},
            "null_counts": {c: int(df[c].isna().sum()) for c in df.columns},
            "summary": clean_nan(summary),
            "sample_rows": sample_rows,
        }
    except Exception:
        return {}

def _make_dataset_card(dataset_name: str, profile: Dict[str, Any], dataset_description: str = None) -> Dict[str, Any]:

    insights = _enhance_dataset_insights(dataset_name, dataset_description, profile)
    
   
    ai_model_card = _generate_ai_model_card(dataset_name, dataset_description, profile)

    return {
        "title": f"Dataset Card: {dataset_name}",
        "generatedAt": dt.datetime.utcnow().isoformat(),
        "description": dataset_description or "No description provided",
        "datasetOverview": {
            "insights": insights,
            "totalRows": profile.get("rows"),
            "totalColumns": profile.get("cols"),
            "sampleData": profile.get("sample_rows", [])[:10]  
        },
        "schema": profile.get("dtypes", {}),
        "dataQuality": {
            "rows": profile.get("rows"),
            "cols": profile.get("cols"),
            "nullCounts": profile.get("null_counts", {}),
            "completenessScore": _calculate_completeness_score(profile.get("null_counts", {}), profile.get("rows", 1))
        },
        "statisticalSummary": profile.get("summary", {}),
        "aiModelCard": ai_model_card, 
        "recommendedUses": [
            "Exploratory data analysis and visualization",
            "Machine learning model training and testing",
            "Statistical analysis and research",
            "Educational demonstrations and tutorials"
        ],
        "limitations": [
            "Auto-generated card - verify data quality before use",
            "Sample represents only first 10 rows",
            "Statistical summaries may not capture all data patterns"
        ]
    }

def _calculate_completeness_score(null_counts: Dict[str, int], total_rows: int) -> float:
    """Calculate data completeness score as percentage of non-null values"""
    if not null_counts or total_rows == 0:
        return 100.0
    
    total_cells = len(null_counts) * total_rows
    total_nulls = sum(null_counts.values())
    completeness = ((total_cells - total_nulls) / total_cells) * 100
    return round(completeness, 2)

def _generate_dataset_tags(dataset_name: str, description: str, sample_rows: List[Dict[str, Any]], schema: Dict[str, str]) -> List[str]:
    """Generate 3-5 relevant tags for a dataset using OpenAI with graceful fallback"""
    schema_summary = ", ".join([f"{col}({dtype})" for col, dtype in list(schema.items())[:10]])
    sample_preview = str(sample_rows[:3]) if sample_rows else "No sample data available"

    system_prompt = """You are a data science expert tasked with generating relevant tags for datasets. 
Generate 3-5 concise, descriptive tags that capture the domain, data type, and potential use cases.
Tags should be:
- Single words or short phrases (2-3 words max)
- Lowercase
- Domain-specific when possible
- Relevant for discovery and categorization
- Cover different aspects: domain, data type, use case, technique

Examples of good tags: "finance", "time-series", "classification", "nlp", "computer-vision", "healthcare", "customer-analytics", "geospatial", "text-mining", "predictive-modeling"
"""

    user_prompt = f"""Dataset: {dataset_name}
Description: {description or "No description provided"}
Schema: {schema_summary}
Sample data: {sample_preview}

Generate 3-5 relevant tags for this dataset. Return only the tags separated by commas, no other text."""

    logger.info("Generating dataset tags using OpenAI for dataset='%s'", dataset_name)
    tags_text = _chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model=os.getenv("OPENAI_TAG_MODEL", "gpt-3.5-turbo"),
        max_tokens=100,
        temperature=0.3
    )

    if tags_text:
        tags = [tag.strip().lower() for tag in tags_text.split(",") if tag.strip()]
        if tags:
            logger.info("Generated %s tags for dataset='%s'", len(tags), dataset_name)
            return tags[:5]

    logger.warning("Falling back to heuristic tag generation for dataset='%s'", dataset_name)
    fallback_tags = _generate_basic_tags(dataset_name, description, schema)
    logger.debug("Heuristic tags for dataset='%s': %s", dataset_name, fallback_tags)
    return fallback_tags

def _enhance_dataset_insights(dataset_name: str, description: str, profile: Dict[str, Any]) -> List[str]:
    """Generate AI-enhanced insights about the dataset"""
    if not profile:
        return _generate_basic_insights(profile)

    sample_rows = profile.get("sample_rows", [])[:3]
    schema = profile.get("dtypes", {})

    system_prompt = """You are a data analyst providing insights about datasets. 
Generate 4-6 bullet-point insights that help users understand:
- Data characteristics and patterns
- Potential use cases and applications  
- Data quality observations
- Interesting findings from the sample

Keep insights concise, factual, and actionable. Focus on what makes this dataset valuable or noteworthy."""

    user_prompt = f"""Dataset: {dataset_name}
Description: {description or "No description provided"}
Rows: {profile.get('rows', 0):,}
Columns: {profile.get('cols', 0)}
Schema: {list(schema.keys())[:10]}
Sample data: {str(sample_rows) if sample_rows else "No sample available"}

Generate 4-6 key insights about this dataset:"""

    logger.info("Generating AI insights for dataset='%s'", dataset_name)
    insights_text = _chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model=os.getenv("OPENAI_INSIGHTS_MODEL", "gpt-3.5-turbo"),
        max_tokens=300,
        temperature=0.4
    )

    if insights_text:
        insights = [insight.strip().lstrip("•-*").strip() for insight in insights_text.split("\n") if insight.strip()]
        if insights:
            logger.info("Generated %s AI insights for dataset='%s'", len(insights), dataset_name)
            return insights[:6] + _generate_basic_insights(profile)

    logger.warning("Falling back to basic insights for dataset='%s'", dataset_name)
    return _generate_basic_insights(profile)

def _generate_ai_model_card(dataset_name: str, description: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a comprehensive AI model card in JSON format with fallback"""
    if not profile:
        return {}

    sample_rows = profile.get("sample_rows", [])[:5]
    schema = profile.get("dtypes", {})

    system_prompt = """You are a data science expert creating professional dataset model cards. Generate a comprehensive JSON model card that includes:

1. Dataset Overview (purpose, domain, key characteristics)
2. Data Description (structure, features, target variables if applicable)  
3. Data Collection (methodology, sources, timeframe when inferable)
4. Data Quality Assessment (completeness, consistency, potential issues)
5. Intended Use Cases (primary applications, suitable tasks)
6. Limitations and Considerations (biases, constraints, ethical considerations)
7. Technical Details (format, size, preprocessing recommendations)

Make the model card professional, informative, and actionable. Focus on insights that help users understand if this dataset fits their needs. Be specific about data characteristics you can observe from the schema and samples.

Return ONLY valid JSON in this exact structure:
{
  "overview": {
    "purpose": "string",
    "domain": "string", 
    "keyCharacteristics": ["string"]
  },
  "dataDescription": {
    "structure": "string",
    "features": ["string"],
    "targetVariable": "string or null"
  },
  "dataCollection": {
    "methodology": "string",
    "sources": "string",
    "timeframe": "string"
  },
  "dataQuality": {
    "completeness": "string",
    "consistency": "string", 
    "potentialIssues": ["string"]
  },
  "intendedUseCases": ["string"],
  "limitations": ["string"],
  "technicalDetails": {
    "format": "string",
    "recommendedPreprocessing": ["string"]
  }
}"""

    user_prompt = f"""Dataset: {dataset_name}
Description: {description or "No description provided"}
Rows: {profile.get('rows', 0):,}
Columns: {profile.get('cols', 0)}
Schema: {dict(list(schema.items())[:15])}
Sample data (first 5 rows): {str(sample_rows) if sample_rows else "No sample available"}
Null counts: {profile.get('null_counts', {})}

Generate a comprehensive model card JSON for this dataset:"""

    logger.info("Generating AI model card for dataset='%s'", dataset_name)
    ai_card_text = _chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model=os.getenv("OPENAI_MODEL_CARD_MODEL", "gpt-3.5-turbo"),
        max_tokens=1000,
        temperature=0.2
    )

    if ai_card_text:
        try:
            ai_model_card = json.loads(ai_card_text)
            logger.info("Generated AI model card for dataset='%s'", dataset_name)
            return ai_model_card
        except json.JSONDecodeError:
            logger.warning(
                "Failed to parse AI model card JSON for dataset='%s': %s",
                dataset_name,
                ai_card_text[:200],
            )

    logger.warning("Using basic model card fallback for dataset='%s'", dataset_name)
    return _build_basic_model_card(dataset_name, description, profile)

def _compute_embedding_from_profile(profile: Dict[str, Any]) -> List[float]:
    dim = EMBED_DIM
    vec = [0.0] * dim
    for i, (k, v) in enumerate(sorted(profile.get("dtypes", {}).items())):
        h = int(hashlib.sha256(f"{k}:{v}".encode()).hexdigest(), 16)
        vec[i % dim] += (h % 1000) / 1000.0
    norm = sum(x*x for x in vec) ** 0.5 or 1.0
    return [x / norm for x in vec]

def _cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x*y for x, y in zip(a, b))
    na = sum(x*x for x in a) ** 0.5 or 1.0
    nb = sum(x*x for x in b) ** 0.5 or 1.0
    return dot / (na * nb)

def _presigned_get(s3, key: str) -> str:
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=3600
    )

def _next_version_label(sess, dataset_id: str) -> str:
    n = sess.query(DatasetVersion).filter_by(datasetId=dataset_id).count()
    return f"v{n+1}"

def _csv_diff(a_bytes: bytes, b_bytes: bytes, limit: int = 3000) -> Dict[str, Any]:
    """
    Return transient diff for preview in responses (NOT persisted to SQL).
    """
    try:
        a = pd.read_csv(io.BytesIO(a_bytes))
        b = pd.read_csv(io.BytesIO(b_bytes))
        a_keyed = a.astype(str).agg("|".join, axis=1)
        b_keyed = b.astype(str).agg("|".join, axis=1)
        added = list(set(b_keyed) - set(a_keyed))
        removed = list(set(a_keyed) - set(b_keyed))
        modified = []
        if "id" in a.columns and "id" in b.columns:
            a_i = a.set_index("id")
            b_i = b.set_index("id")
            for cid in list(set(a_i.index).intersection(b_i.index))[:limit]:
                ra = a_i.loc[cid].astype(str).to_dict()
                rb = b_i.loc[cid].astype(str).to_dict()
                if ra != rb:
                    modified.append({"id": str(cid), "before": ra, "after": rb})
        return {
            "added_count": len(added),
            "removed_count": len(removed),
            "modified_count": len(modified),
            "sample_added": added[:10],
            "sample_removed": removed[:10],
            "sample_modified": modified[:10],
        }
    except Exception:
        return {
            "added_count": 0, "removed_count": 0, "modified_count": 0,
            "sample_added": [], "sample_removed": [], "sample_modified": []
        }

# ---------------------- Blueprints ----------------------

def datasets_bp(Session, s3):
    bp = Blueprint("datasets", __name__)

    @bp.route("", methods=["POST"])
    def create_dataset():
        """
        Body: { name, slug, license, ownerId, description?, authorNote?, isPrivate?, tags? }
        ownerId is an opaque string from the frontend.
        """
        data = request.get_json(force=True)
        required = ["name", "slug", "license", "ownerId"]
        if any(not data.get(k) for k in required):
            return jsonify({"error": "name, slug, license, ownerId are required"}), 400

        sess = Session()
        try:
            current_app.logger.info(
                "Creating dataset slug=%s owner=%s",
                data.get("slug"),
                data.get("ownerId"),
            )
            if sess.query(Dataset).filter_by(slug=data["slug"]).first():
                current_app.logger.warning("Dataset slug conflict slug=%s", data.get("slug"))
                return jsonify({"error": "slug already exists"}), 409

            ds = Dataset(
                name=data["name"],
                slug=data["slug"],
                description=data.get("description"),
                authorNote=data.get("authorNote"),
                license=data["license"],
                isPrivate=bool(data.get("isPrivate", False)),
                tags=data.get("tags") or [],
                ownerId=data["ownerId"]
            )
            sess.add(ds)
            sess.commit()
            current_app.logger.info("Dataset created id=%s slug=%s", ds.id, ds.slug)
            return jsonify({"id": ds.id, "slug": ds.slug, "name": ds.name}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            current_app.logger.exception("Failed to create dataset slug=%s", data.get("slug"))
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("", methods=["GET"])
    def list_datasets():
        sess = Session()
        try:
            rows = sess.query(Dataset).order_by(Dataset.createdAt.desc()).all()
            return jsonify([{
                "id": r.id, "name": r.name, "slug": r.slug, "license": r.license,
                "description": r.description, "authorNote": r.authorNote,
                "isPrivate": r.isPrivate, "tags": r.tags,
                "dataCard": r.dataCard,
                "ownerId": r.ownerId,
                "createdAt": r.createdAt.isoformat(),
                "updatedAt": r.updatedAt.isoformat()
            } for r in rows])
        finally:
            sess.close()

    @bp.route("/<slug>", methods=["GET"])
    def get_dataset(slug):
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=slug).first()
            if not ds:
                return jsonify({"error": "not found"}), 404
            return jsonify({
                "id": ds.id, "name": ds.name, "slug": ds.slug, "license": ds.license,
                "description": ds.description, "authorNote": ds.authorNote,
                "isPrivate": ds.isPrivate, "tags": ds.tags,
                "dataCard": ds.dataCard,
                "ownerId": ds.ownerId,
                "createdAt": ds.createdAt.isoformat(),
                "updatedAt": ds.updatedAt.isoformat()
            })
        finally:
            sess.close()

    @bp.route("/<slug>/upload", methods=["POST"])
    def upload_version(slug):
      
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=slug).first()
            if not ds:
                current_app.logger.warning("Dataset not found for upload slug=%s", slug)
                return jsonify({"error": "dataset not found"}), 404

            authorId = request.form.get("authorId")
            if not authorId:
                return jsonify({"error": "authorId required"}), 400

            if "file" not in request.files:
                return jsonify({"error": "file is required"}), 400

            f = request.files["file"]
            filename = secure_filename(f.filename)
            if not filename:
                return jsonify({"error": "invalid filename"}), 400

            content = f.read()
            file_size = len(content)
            content_type = _infer_content_type(filename)

            current_app.logger.info(
                "Uploading dataset version slug=%s user=%s file=%s size=%s",
                slug,
                authorId,
                filename,
                file_size,
            )

            today = dt.datetime.utcnow().date().isoformat()
            s3_key = f"datasets/{slug}/{today}/{uuid.uuid4().hex}_{filename}"
            try:
                s3.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=content, ContentType=content_type)
            except ClientError as ce:
                current_app.logger.exception(
                    "S3 upload failed slug=%s file=%s", slug, filename
                )
                return jsonify({"error": f"S3 upload failed: {str(ce)}"}), 502

            # CSV profiling -> update dataset-level model card JSON
            profile = _profile_csv_bytes(content) if filename.lower().endswith(".csv") else {}
            if profile:
                current_app.logger.info(
                    "Generating dataset card slug=%s rows=%s cols=%s",
                    slug,
                    profile.get("rows"),
                    profile.get("cols"),
                )
                ds.dataCard = _make_dataset_card(ds.name, profile, ds.description)
                
                # Auto-generate tags if none provided
                if not ds.tags:
                    generated_tags = _generate_dataset_tags(
                        ds.name, 
                        ds.description, 
                        profile.get("sample_rows", []), 
                        profile.get("dtypes", {})
                    )
                    if generated_tags:
                        ds.tags = generated_tags
                        current_app.logger.info(
                            "Applied generated tags slug=%s tags=%s",
                            slug,
                            generated_tags,
                        )

            ds.updatedAt = dt.datetime.utcnow()
            sess.commit()

            current_app.logger.debug(
                "Dataset metadata updated slug=%s version_pending", slug
            )

            version_label = _next_version_label(sess, ds.id)

            # ensure only one latest
            sess.query(DatasetVersion).filter_by(datasetId=ds.id, isLatest=True).update({"isLatest": False})

            dv = DatasetVersion(
                version=version_label,
                fileUrl=s3_key,
                fileName=filename,
                fileSize=file_size,
                commitMessage=request.form.get("commitMessage") or f"Upload {filename}",
                commitUser=authorId,
                isLatest=True,
                datasetId=ds.id
            )
            sess.add(dv)
            sess.commit()
            current_app.logger.info(
                "Created dataset version dataset_id=%s version=%s",
                ds.id,
                dv.version,
            )

            if profile:
                vec = _compute_embedding_from_profile(profile)
                current_app.embed_coll.update_one(
                    {"slug": ds.slug},
                    {"$set": {
                        "dataset_id": ds.id,
                        "slug": ds.slug,
                        "version_id": dv.id,
                        "vec": vec,
                        "schema": profile.get("dtypes", {}),
                        "updated_at": dt.datetime.utcnow(),
                    }},
                    upsert=True
                )
                current_app.logger.debug(
                    "Updated embedding slug=%s version_id=%s", ds.slug, dv.id
                )

            return jsonify({
                "dataset": {"id": ds.id, "slug": ds.slug, "name": ds.name},
                "version": {
                    "id": dv.id,
                    "version": dv.version,
                    "fileName": dv.fileName,
                    "fileSize": dv.fileSize,
                    "commitUser": dv.commitUser,
                    "commitMessage": dv.commitMessage,
                    "isLatest": dv.isLatest,
                    "createdAt": dv.createdAt.isoformat()
                },
                "datasetCard": ds.dataCard
            }), 201
        except SQLAlchemyError as e:
            sess.rollback()
            current_app.logger.exception(
                "Database error while uploading version slug=%s", slug
            )
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/<slug>/versions", methods=["GET"])
    def list_versions(slug):
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=slug).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404
            rows = sess.query(DatasetVersion).filter_by(datasetId=ds.id).order_by(DatasetVersion.createdAt.desc()).all()
            return jsonify([{
                "id": v.id,
                "version": v.version,
                "fileUrl": v.fileUrl,
                "fileName": v.fileName,
                "fileSize": v.fileSize,
                "commitMessage": v.commitMessage,
                "commitUser": v.commitUser,
                "isLatest": v.isLatest,
                "createdAt": v.createdAt.isoformat()
            } for v in rows])
        finally:
            sess.close()

    @bp.route("/<slug>/download_url", methods=["GET"])
    def download_url(slug):
        version_id = request.args.get("version_id")
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=slug).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404
            q = sess.query(DatasetVersion).filter_by(datasetId=ds.id)
            v = q.filter_by(id=version_id).first() if version_id else q.order_by(DatasetVersion.createdAt.desc()).first()
            if not v:
                return jsonify({"error": "no versions"}), 404
            try:
                url = _presigned_get(s3, v.fileUrl)
                return jsonify({"url": url, "version_id": v.id})
            except ClientError as ce:
                return jsonify({"error": f"presign failed: {str(ce)}"}), 502
        finally:
            sess.close()

    return bp

def issues_bp(Session):
    bp = Blueprint("issues", __name__)

    @bp.route("/<dataset_slug>", methods=["POST"])
    def create_issue(dataset_slug):
        """
        Body: { title, description, labels[], authorId }
        authorId is an opaque string from the frontend.
        """
        data = request.get_json(force=True)
        required = ["title", "description", "authorId"]
        if any(not data.get(k) for k in required):
            return jsonify({"error": "title, description, authorId required"}), 400
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=dataset_slug).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404
            issue = Issue(
                title=data["title"],
                description=data["description"],
                labels=data.get("labels") or [],
                authorId=data["authorId"],
                datasetId=ds.id
            )
            sess.add(issue)
            sess.commit()
            return jsonify({"id": issue.id, "status": issue.status.value}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/<dataset_slug>", methods=["GET"])
    def list_issues(dataset_slug):
        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=dataset_slug).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404
            rows = sess.query(Issue).filter_by(datasetId=ds.id).order_by(Issue.createdAt.desc()).all()
            return jsonify([{
                "id": r.id, "title": r.title, "description": r.description,
                "status": r.status.value, "labels": r.labels,
                "authorId": r.authorId,
                "createdAt": r.createdAt.isoformat(),
                "updatedAt": r.updatedAt.isoformat(),
                "closedAt": r.closedAt.isoformat() if r.closedAt else None
            } for r in rows])
        finally:
            sess.close()

    @bp.route("/comment/<issue_id>", methods=["POST"])
    def comment_issue(issue_id):
        """
        Body: { content, authorId }
        authorId is an opaque string from the frontend.
        """
        data = request.get_json(force=True)
        if not data.get("content") or not data.get("authorId"):
            return jsonify({"error": "content and authorId required"}), 400
        sess = Session()
        try:
            issue = sess.query(Issue).filter_by(id=issue_id).first()
            if not issue:
                return jsonify({"error": "issue not found"}), 404
            c = Comment(content=data["content"], authorId=data["authorId"], issueId=issue.id)
            sess.add(c)
            sess.commit()
            return jsonify({"ok": True}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/close/<issue_id>", methods=["POST"])
    def close_issue(issue_id):
        sess = Session()
        try:
            issue = sess.query(Issue).filter_by(id=issue_id).first()
            if not issue:
                return jsonify({"error": "issue not found"}), 404
            issue.status = IssueStatus.CLOSED
            issue.closedAt = dt.datetime.utcnow()
            sess.commit()
            return jsonify({"ok": True})
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    return bp

def pulls_bp(Session, s3):
    bp = Blueprint("pulls", __name__)

    @bp.route("/open", methods=["POST"])
    def open_pull():
        
        data = request.get_json(force=True)
        required = ["dataset_slug", "title", "description", "authorId", "modifiedFileUrl", "modifiedFileName"]
        if any(not data.get(k) for k in required):
            return jsonify({"error": "dataset_slug, title, description, authorId, modifiedFileUrl, modifiedFileName required"}), 400

        sess = Session()
        try:
            ds = sess.query(Dataset).filter_by(slug=data["dataset_slug"]).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404

            pr = PullRequest(
                title=data["title"],
                description=data["description"],
                status=PRStatus.OPEN,
                modifiedFileUrl=data["modifiedFileUrl"],
                modifiedFileName=data["modifiedFileName"],
                authorId=data["authorId"],
                datasetId=ds.id
            )
            sess.add(pr)
            sess.commit()

            diff = {}
            try:
                pr_bytes = _s3_get_bytes(s3, data["modifiedFileUrl"])
                base_v = None
                if data.get("against_version_id"):
                    base_v = sess.query(DatasetVersion).filter_by(id=data["against_version_id"], datasetId=ds.id).first()
                if not base_v:
                    base_v = sess.query(DatasetVersion).filter_by(datasetId=ds.id, isLatest=True).first()
                base_bytes = _s3_get_bytes(s3, base_v.fileUrl) if base_v else b""
                if data["modifiedFileName"].lower().endswith(".csv"):
                    diff = _csv_diff(base_bytes, pr_bytes)
            except Exception:
                diff = {}

            return jsonify({"pull_id": pr.id, "status": pr.status.value, "diff_preview": diff}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/merge/<pull_id>", methods=["POST"])
    def merge_pull(pull_id):
        """
        Creates a new DatasetVersion from PR.modifiedFileUrl and marks it latest.
        Sets PR.status=MERGED and mergedVersionId.
        Body: { "commitUser": "<opaque user id>", "commitMessage": "Merge PR ..." }
        Also updates Dataset.dataCard if merged file is CSV.
        """
        data = request.get_json(force=True) if request.data else {}
        commitUser = data.get("commitUser")
        commitMessage = data.get("commitMessage") or "Merge PR"
        sess = Session()
        try:
            pr = sess.query(PullRequest).filter_by(id=pull_id).first()
            if not pr:
                return jsonify({"error": "pull not found"}), 404
            if pr.status == PRStatus.CLOSED:
                return jsonify({"error": "cannot merge closed PR"}), 409
            if not commitUser:
                return jsonify({"error": "valid commitUser required"}), 400

            ds = sess.query(Dataset).filter_by(id=pr.datasetId).first()
            if not ds:
                return jsonify({"error": "dataset not found"}), 404

            sess.query(DatasetVersion).filter_by(datasetId=ds.id, isLatest=True).update({"isLatest": False})

            new_ver = DatasetVersion(
                version=_next_version_label(sess, ds.id),
                fileUrl=pr.modifiedFileUrl,
                fileName=pr.modifiedFileName,
                fileSize=_s3_size(s3, pr.modifiedFileUrl) or 0,
                commitMessage=f"{commitMessage}: {pr.title}",
                commitUser=commitUser,
                isLatest=True,
                datasetId=ds.id
            )
            sess.add(new_ver)

            profile = {}
            try:
                if pr.modifiedFileName.lower().endswith(".csv"):
                    merged_bytes = _s3_get_bytes(s3, pr.modifiedFileUrl)
                    profile = _profile_csv_bytes(merged_bytes)
                    if profile:
                        ds.dataCard = _make_dataset_card(ds.name, profile, ds.description)
            except Exception:
                profile = {}

            sess.commit()

            pr.status = PRStatus.MERGED
            pr.mergedAt = dt.datetime.utcnow()
            pr.mergedVersionId = new_ver.id
            sess.commit()

            if profile:
                vec = _compute_embedding_from_profile(profile)
                current_app.embed_coll.update_one(
                    {"slug": ds.slug},
                    {"$set": {
                        "dataset_id": ds.id,
                        "slug": ds.slug,
                        "version_id": new_ver.id,
                        "vec": vec,
                        "schema": profile.get("dtypes", {}),
                        "updated_at": dt.datetime.utcnow(),
                    }},
                    upsert=True
                )

            return jsonify({"ok": True, "merged_version_id": new_ver.id, "pr_status": pr.status.value})
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/close/<pull_id>", methods=["POST"])
    def close_pull(pull_id):
        sess = Session()
        try:
            pr = sess.query(PullRequest).filter_by(id=pull_id).first()
            if not pr:
                return jsonify({"error": "pull not found"}), 404
            pr.status = PRStatus.CLOSED
            pr.closedAt = dt.datetime.utcnow()
            sess.commit()
            return jsonify({"ok": True})
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("/comment/<pull_id>", methods=["POST"])
    def comment_pull(pull_id):
        """
        Body: { content, authorId }
        authorId is an opaque string from the frontend.
        """
        data = request.get_json(force=True)
        if not data.get("content") or not data.get("authorId"):
            return jsonify({"error": "content and authorId required"}), 400
        sess = Session()
        try:
            pr = sess.query(PullRequest).filter_by(id=pull_id).first()
            if not pr:
                return jsonify({"error": "pull not found"}), 404
            c = Comment(content=data["content"], authorId=data["authorId"], pullRequestId=pr.id)
            sess.add(c)
            sess.commit()
            return jsonify({"ok": True}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    return bp

def _s3_get_bytes(s3, key: str) -> bytes:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return obj["Body"].read()

def _s3_size(s3, key: str) -> Optional[int]:
    try:
        head = s3.head_object(Bucket=S3_BUCKET, Key=key)
        return int(head.get("ContentLength", 0))
    except Exception:
        return None

def notebooks_bp(Session):
    bp = Blueprint("notebooks", __name__)

    @bp.route("", methods=["POST"])
    def create_notebook():
      
        data = request.get_json(force=True)
        if not data.get("title") or not data.get("authorId"):
            return jsonify({"error": "title and authorId required"}), 400
        sess = Session()
        try:
            if data.get("datasetId"):
                if not sess.query(Dataset).filter_by(id=data["datasetId"]).first():
                    return jsonify({"error": "invalid datasetId"}), 400
            nb = Notebook(
                title=data["title"],
                authorId=data["authorId"],
                description=data.get("description"),
                fileUrl=data.get("fileUrl"),
                isPublic=bool(data.get("isPublic", True)),
                datasetId=data.get("datasetId")
            )
            sess.add(nb)
            sess.commit()
            return jsonify({"id": nb.id}), 201
        except SQLAlchemyError as e:
            sess.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            sess.close()

    @bp.route("", methods=["GET"])
    def list_notebooks():
        sess = Session()
        try:
            rows = sess.query(Notebook).order_by(Notebook.createdAt.desc()).all()
            return jsonify([{
                "id": r.id, "title": r.title, "description": r.description,
                "fileUrl": r.fileUrl, "isPublic": r.isPublic,
                "authorId": r.authorId, "datasetId": r.datasetId,
                "createdAt": r.createdAt.isoformat(), "updatedAt": r.updatedAt.isoformat()
            } for r in rows])
        finally:
            sess.close()

    return bp

def reco_bp(Session, coll: Collection):
    bp = Blueprint("reco", __name__)

    @bp.route("", methods=["GET"])
    def related():
        slug = request.args.get("dataset_slug")
        k = int(request.args.get("k", "5"))
        if not slug:
            return jsonify({"error": "dataset_slug required"}), 400
        seed = coll.find_one({"slug": slug})
        if not seed:
            return jsonify({"error": "no embedding for dataset"}), 404
        others = list(coll.find({"slug": {"$ne": slug}}).limit(1000))
        scored = []
        for d in others:
            if "vec" in d and "vec" in seed:
                scored.append((_cosine(seed["vec"], d["vec"]), d))
        scored.sort(key=lambda x: x[0], reverse=True)
        return jsonify([{
            "dataset_id": d.get("dataset_id"),
            "slug": d.get("slug"),
            "score": float(score),
            "schema_sample": d.get("schema", {})
        } for score, d in scored[:k]])

    return bp

# ---------------------- Entry ----------------------

if __name__ == "__main__":
    app = create_app()
    CORS(app)
    port = int(get_env("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=True)
