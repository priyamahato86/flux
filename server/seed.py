# seed.py
import os
import json
import random
import tempfile
import subprocess
import datetime as dt
from pathlib import Path
from textwrap import dedent

BASE_URL = os.getenv("FLUX_BASE_URL", "127.0.0.1:8080")

USERS = [
    "acb94e26-910a-46b3-a3f9-84136f9a1336",
    "5c8a7007-2f86-4f03-b047-976c916badbd",
]

DATASETS = [
    "Student-Performance-and-Demographic-Indicators.csv",
    "Retail-Product-Sales-and-Inventory.csv",
    "Employee-Skills-and-Workforce-Development.csv",
    "Agricultural-Crop-Yield-Measurements.csv",
    "Public-Library-Usage-Statistics.csv",
    "Regional-Economic-Indicators.csv",
]

RNG = random.Random(42)  # deterministic runs


# ----------------------- curl helpers -----------------------

def run_curl(args, expect_json=True):
    """
    Run curl via subprocess, return (status_code, parsed_json_or_text, stderr).
    Logs both success and error output to console.
    """
    cmd = ["bash", "-lc", " ".join(args)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    out = proc.stdout.strip()
    err = proc.stderr.strip()

    status = None
    payload = out
    # We append ' -w "\\n%{http_code}" ' to get status on last line
    if "\n" in out:
        *body_lines, code_line = out.splitlines()
        if code_line.isdigit():
            status = int(code_line)
            body = "\n".join(body_lines).strip()
        else:
            body = out
    else:
        body = out

    if expect_json:
        try:
            payload = json.loads(body) if body else {}
        except json.JSONDecodeError:
            # leave payload as raw text if JSON parsing fails
            pass

    if status is None:
        # if -w code missing, set 0 to indicate issue
        status = 0

    if status >= 400 or proc.returncode != 0:
        print(f"[curl:error] status={status} rc={proc.returncode}\nSTDERR:\n{err}\nBODY:\n{body}\n")

    return status, payload, err


def curl_json(method, url_path, data):
    url = f"http://{BASE_URL}{url_path}"
    payload = json.dumps(data).replace('"', '\\"')
    cmd = [
        f"curl -sS -X {method} '{url}'",
        "-H 'Content-Type: application/json'",
        f'-d "{payload}"',
        r"-w '\n%{http_code}'"
    ]
    return run_curl(cmd)


def curl_get(url_path):
    url = f"http://{BASE_URL}{url_path}"
    # IMPORTANT: avoid f-string around %{http_code}. Use format() so %{http_code} stays literal for curl.
    cmd = ["curl -sS '{}'".format(url), r"-w '\n%{http_code}'"]
    return run_curl(cmd)


def curl_form(url_path, fields, file_field=None, file_path=None):
    """
    fields: dict[str, str]
    file_field: name of multipart field for file
    file_path: path to file to upload
    """
    url = f"http://{BASE_URL}{url_path}"
    parts = [f"curl -sS -X POST '{url}'"]
    for k, v in fields.items():
        parts.append(f"-F {k}='{str(v)}'")
    if file_field and file_path:
        parts.append(f"-F {file_field}=@'{file_path}'")
    parts.append(r"-w '\n%{http_code}'")
    return run_curl(parts)


# ----------------------- content generators -----------------------

def slugify(filename: str) -> str:
    base = filename.rsplit(".", 1)[0]
    return base.lower().replace(" ", "-").replace("_", "-")


def csv_for_dataset(name: str, variant: str = "base") -> str:
    """
    Generate small CSVs with id column so CSV diff can detect modifications.
    variant: 'base' or 'pr' to slightly change few rows / add rows.
    """
    if "Student-Performance" in name:
        header = "id,student_id,grade_level,math_score,reading_score,attendance_pct,demographic_group\n"
        rows = [
            "1,S1001,10,78,82,94,A",
            "2,S1002,11,88,90,96,B",
            "3,S1003,9,67,73,88,A",
            "4,S1004,12,92,95,97,C",
            "5,S1005,10,81,79,92,B",
        ]
        if variant == "pr":
            rows[2] = "3,S1003,9,71,76,90,A"  # modified
            rows.append("6,S1006,11,85,83,95,B")  # added
        return header + "\n".join(rows) + "\n"

    if "Retail-Product-Sales" in name:
        header = "id,sku,category,units_sold,unit_price,inventory,on_sale\n"
        rows = [
            "1,SKU-001,Apparel,120,19.99,340,false",
            "2,SKU-002,Electronics,45,149.99,75,false",
            "3,SKU-003,Home,200,9.99,1200,true",
            "4,SKU-004,Apparel,95,29.99,410,false",
            "5,SKU-005,Electronics,15,499.0,20,true",
        ]
        if variant == "pr":
            rows[1] = "2,SKU-002,Electronics,52,149.99,70,false"
            rows.append("6,SKU-006,Home,60,39.99,140,true")
        return header + "\n".join(rows) + "\n"

    if "Employee-Skills" in name:
        header = "id,employee_id,dept,skill,level,last_assessed\n"
        rows = [
            "1,E100,Data,SQL,Intermediate,2025-06-01",
            "2,E101,Engineering,Rust,Beginner,2025-05-15",
            "3,E102,Security,ThreatModeling,Advanced,2025-05-20",
            "4,E103,Data,Python,Advanced,2025-05-05",
            "5,E104,HR,PeopleOps,Intermediate,2025-04-28",
        ]
        if variant == "pr":
            rows[0] = "1,E100,Data,SQL,Advanced,2025-07-01"
            rows.append("6,E105,Engineering,DevOps,Intermediate,2025-06-30")
        return header + "\n".join(rows) + "\n"

    if "Agricultural-Crop-Yield" in name:
        header = "id,region,crop,hectares,yield_tonnes,season\n"
        rows = [
            "1,North,Wheat,120,360,2024",
            "2,South,Rice,90,405,2024",
            "3,East,Corn,140,490,2024",
            "4,West,Soybean,110,264,2024",
            "5,Central,Barley,80,192,2024",
        ]
        if variant == "pr":
            rows[3] = "4,West,Soybean,110,270,2024"
            rows.append("6,North,Potato,60,180,2024")
        return header + "\n".join(rows) + "\n"

    if "Public-Library-Usage" in name:
        header = "id,branch,visitors,loans,digital_sessions,events\n"
        rows = [
            "1,Downtown,5400,7200,3100,22",
            "2,Westside,1800,2400,900,8",
            "3,Eastend,2100,2600,1100,10",
            "4,Northhill,1500,1900,700,6",
            "5,Southpark,1700,2050,820,7",
        ]
        if variant == "pr":
            rows[0] = "1,Downtown,5600,7350,3250,23"
            rows.append("6,Midtown,2200,2750,1150,11")
        return header + "\n".join(rows) + "\n"

    if "Regional-Economic-Indicators" in name:
        header = "id,region,quarter,gdp_billion,unemployment_pct,cpi_index\n"
        rows = [
            "1,North,Q1-2025,85.4,4.8,108.2",
            "2,South,Q1-2025,72.1,5.1,107.5",
            "3,East,Q1-2025,63.9,6.0,109.3",
            "4,West,Q1-2025,91.2,4.5,106.9",
            "5,Central,Q1-2025,58.7,5.6,108.8",
        ]
        if variant == "pr":
            rows[2] = "3,East,Q1-2025,65.2,5.8,109.6"
            rows.append("6,NorthEast,Q1-2025,40.1,6.5,110.1")
        return header + "\n".join(rows) + "\n"

    # default fallback
    return "id,value\n1,foo\n2,bar\n"


def random_desc_and_note(filename: str):
    topic = filename.replace(".csv", "").replace("-", " ")
    desc = f"{topic}: curated sample for analytics, QA, and demonstrations."
    note = "Auto-seeded dataset. Validate schema and completeness before production use."
    return desc, note


def random_issue_for(slug: str):
    titles = [
        "Column types look off",
        "Missing values observed",
        "Outliers detected in metrics",
        "Potential schema drift",
        "Header case inconsistency",
    ]
    descs = [
        "Please review data types and null handling.",
        "We should standardize date/time fields and categories.",
        "Consider capping or winsorizing extreme values.",
        "Check id uniqueness and referential integrity.",
    ]
    labels = [
        ["bug", "schema"],
        ["data-quality"],
        ["enhancement"],
        ["cleanup", "qa"],
    ]
    return RNG.choice(titles), RNG.choice(descs), RNG.choice(labels)


def random_pr_title_desc():
    titles = [
        "Normalize headers + add rows",
        "Data quality fixes + enrichment",
        "Update values and append new records",
        "Hotfix: corrected metrics and typos",
    ]
    descs = [
        "Standardized cases, adjusted a few values, appended incremental records.",
        "Minor corrections and added missing entries for recent period.",
        "Addressed small discrepancies and expanded coverage.",
    ]
    return RNG.choice(titles), RNG.choice(descs)


# ----------------------- seeding steps -----------------------

def write_temp_csv(dirpath: Path, filename: str, variant="base") -> Path:
    p = dirpath / filename
    p.write_text(csv_for_dataset(filename, variant), encoding="utf-8")
    return p


def create_dataset(slug, name, license_str, owner_id, description, author_note):
    status, payload, _ = curl_json(
        "POST",
        "/datasets",
        {
            "name": name,
            "slug": slug,
            "license": license_str,
            "ownerId": owner_id,
            "description": description,
            "authorNote": author_note,
            "isPrivate": False
        },
    )
    ok = status == 201
    ds_id = payload.get("id") if isinstance(payload, dict) else None
    print(f"[dataset:create] slug={slug} owner={owner_id} status={status} id={ds_id}")
    return ok, ds_id


def upload_version(slug, author_id, file_path: Path, commit_msg: str):
    status, payload, _ = curl_form(
        f"/datasets/{slug}/upload",
        fields={"authorId": author_id, "commitMessage": commit_msg},
        file_field="file",
        file_path=str(file_path),
    )
    ok = status == 201
    ver = payload.get("version", {}) if isinstance(payload, dict) else {}
    ver_id = ver.get("id")
    # Correct S3 key is under 'fileUrl' but upload response omits it; fetch from versions.
    versions_ok, latest_version = fetch_latest_version(slug)
    file_key = latest_version.get("fileUrl") if versions_ok else None

    print(f"[dataset:upload] slug={slug} status={status} ver_id={ver_id} file_key={file_key}")
    return ok, payload, ver_id, file_key


def fetch_latest_version(slug):
    st, payload, _ = curl_get(f"/datasets/{slug}/versions")
    if st == 200 and isinstance(payload, list) and payload:
        return True, payload[0]
    return False, {}


def open_issue(dataset_slug, title, description, labels, author_id):
    st, payload, _ = curl_json(
        "POST",
        f"/issues/{dataset_slug}",
        {"title": title, "description": description, "labels": labels, "authorId": author_id},
    )
    ok = st == 201
    issue_id = payload.get("id") if isinstance(payload, dict) else None
    print(f"[issue:open] slug={dataset_slug} status={st} id={issue_id}")
    return ok, issue_id


def comment_issue(issue_id, content, author_id):
    st, payload, _ = curl_json(
        "POST",
        f"/issues/comment/{issue_id}",
        {"content": content, "authorId": author_id},
    )
    print(f"[issue:comment] id={issue_id} status={st}")
    return st == 201


def close_issue(issue_id):
    st, payload, _ = curl_json("POST", f"/issues/close/{issue_id}", {})
    print(f"[issue:close] id={issue_id} status={st}")
    return st == 200


def open_pr(dataset_slug, title, description, author_id, modified_file_key, modified_file_name, against_version_id):
    st, payload, _ = curl_json(
        "POST",
        "/pulls/open",
        {
            "dataset_slug": dataset_slug,
            "title": title,
            "description": description,
            "authorId": author_id,
            "modifiedFileUrl": modified_file_key,
            "modifiedFileName": modified_file_name,
            "against_version_id": against_version_id,
        },
    )
    ok = st == 201
    pr_id = payload.get("pull_id") if isinstance(payload, dict) else None
    print(f"[pr:open] slug={dataset_slug} status={st} id={pr_id}")
    return ok, pr_id


def comment_pr(pr_id, content, author_id):
    st, payload, _ = curl_json(
        "POST",
        f"/pulls/comment/{pr_id}",
        {"content": content, "authorId": author_id},
    )
    print(f"[pr:comment] id={pr_id} status={st}")
    return st == 201


def merge_pr(pr_id, commit_user, commit_message):
    st, payload, _ = curl_json(
        "POST",
        f"/pulls/merge/{pr_id}",
        {"commitUser": commit_user, "commitMessage": commit_message},
    )
    print(f"[pr:merge] id={pr_id} status={st}")
    return st == 200


def close_pr(pr_id):
    st, payload, _ = curl_json("POST", f"/pulls/close/{pr_id}", {})
    print(f"[pr:close] id={pr_id} status={st}")
    return st == 200


def create_notebook(title, author_id, description, file_url, dataset_id=None):
    st, payload, _ = curl_json(
        "POST",
        "/notebooks",
        {
            "title": title,
            "authorId": author_id,
            "description": description,
            "fileUrl": file_url,
            "isPublic": True,
            "datasetId": dataset_id,
        },
    )
    ok = st == 201
    nb_id = payload.get("id") if isinstance(payload, dict) else None
    print(f"[notebook:create] title={title} status={st} id={nb_id}")
    return ok, nb_id


# ----------------------- main orchestration -----------------------

def main():
    start = dt.datetime.utcnow()
    tmpdir = Path(tempfile.mkdtemp(prefix="flux_seed_"))

    print(f"Seeding Flux @ http://{BASE_URL}  (tmp={tmpdir})")

    for fname in DATASETS:
        slug = slugify(fname)
        name = fname.replace(".csv", "").replace("-", " ")
        owner = RNG.choice(USERS)
        other = USERS[1] if owner == USERS[0] else USERS[0]
        desc, note = random_desc_and_note(fname)

        # 1) create dataset
        ok, ds_id = create_dataset(slug, name, "CC-BY-4.0", owner, desc, note)
        if not ok:
            continue

        # 2) upload v1
        base_csv = write_temp_csv(tmpdir, fname, "base")
        ok_up, up_payload, v1_id, v1_s3key = upload_version(slug, owner, base_csv, "Initial upload")
        if not ok_up:
            continue

        # refresh versions to recover IDs/keys reliably
        versions_ok, latest = fetch_latest_version(slug)
        if not versions_ok:
            continue

        # find v1 explicitly
        st, all_versions, _ = curl_get(f"/datasets/{slug}/versions")
        v1 = None
        if isinstance(all_versions, list):
            for v in all_versions:
                if v.get("version") == "v1":
                    v1 = v
                    break
        if not v1:
            v1 = latest  # fallback

        # 3) open an issue from the other user
        ititle, idesc, ilabels = random_issue_for(slug)
        issue_ok, issue_id = open_issue(slug, ititle, idesc, ilabels, other)
        if issue_ok and issue_id:
            comment_issue(issue_id, "Acknowledged. Will address in the next batch.", owner)
            if RNG.random() < 0.5:
                close_issue(issue_id)

        # 4) stage a PR by uploading a 'PR file' (this creates v2)
        pr_csv = write_temp_csv(tmpdir, f"PR-{fname}", "pr")
        ok_up2, up_payload2, v2_id, _ = upload_version(slug, other, pr_csv, "PR staging upload")
        if not ok_up2:
            continue

        # get v2 S3 key to feed into PR.open as modifiedFileUrl
        versions_ok2, latest2 = fetch_latest_version(slug)
        v2 = None
        if versions_ok2:
            st2, all_versions2, _ = curl_get(f"/datasets/{slug}/versions")
            if isinstance(all_versions2, list):
                for v in all_versions2:
                    if v.get("version") == "v2":
                        v2 = v
                        break
        if not v2 and versions_ok2:
            v2 = latest2

        v1_id_exact = v1.get("id") if isinstance(v1, dict) else None
        v2_key_exact = v2.get("fileUrl") if isinstance(v2, dict) else None

        # 5) open PR against v1 with v2 file key
        pr_title, pr_desc = random_pr_title_desc()
        pr_ok, pr_id = open_pr(
            dataset_slug=slug,
            title=pr_title,
            description=pr_desc,
            author_id=other,
            modified_file_key=v2_key_exact,
            modified_file_name=Path(pr_csv).name,
            against_version_id=v1_id_exact,
        )
        if pr_ok and pr_id:
            comment_pr(pr_id, "LGTM. Merging after CI passes.", owner)
            if RNG.random() < 0.5:
                merge_pr(pr_id, commit_user=owner, commit_message="Merge seeded PR")
            else:
                close_pr(pr_id)

        # 6) create notebook
        create_notebook(
            title=f"EDA - {name}",
            author_id=owner,
            description=f"Quick EDA notebook for {name}",
            file_url=f"s3://demo-bucket/{slug}/eda.ipynb",
            dataset_id=ds_id,
        )

    end = dt.datetime.utcnow()
    print(f"Seeding complete in {(end - start).total_seconds():.2f}s")


if __name__ == "__main__":
    main()
