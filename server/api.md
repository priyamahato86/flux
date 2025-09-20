
---

# Open Data Platform API

Base URL: `https://<your-domain>`
Content types: `application/json` unless noted

Standard error shape:

```json
{ "error": "human-readable message" }
```

## Auth

For now, endpoints accept `authorId` / `ownerId` in the payload. (Replace with JWT/RBAC later.)

---

## Health

### GET `/health`

**Desc:** Liveness check.

**Response 200**

```json
{ "ok": true, "time": "2025-09-20T07:05:00.123456" }
```

---

## Users

### POST `/users`

**Desc:** Create a user (needed to reference `ownerId`/`authorId`).

**Body**

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "name": "Alice",
  "avatar": "https://...",
  "bio": "Data scientist"
}
```

**Response 201**

```json
{ "id": "uuid", "email": "alice@example.com", "username": "alice" }
```

`GET /users/:id` is not exposed in this API. (Add if needed.)

---

## Datasets

### POST `/datasets`

**Desc:** Create dataset (owner is a User).

**Body**

```json
{
  "name": "Global Education Index",
  "slug": "global-education-index",
  "license": "CC-BY-4.0",
  "ownerId": "uuid-of-user",
  "description": "Index across countries",
  "authorNote": "Initial seed",
  "isPrivate": false,
  "tags": ["education", "sdg4"]
}
```

**Response 201**

```json
{ "id": "uuid", "slug": "global-education-index", "name": "Global Education Index" }
```

**Errors:** 409 slug exists, 400 invalid ownerId.

---

### GET `/datasets`

**Desc:** List datasets (no pagination yet).

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "Global Education Index",
    "slug": "global-education-index",
    "license": "CC-BY-4.0",
    "description": "Index across countries",
    "authorNote": "Initial seed",
    "isPrivate": false,
    "tags": ["education","sdg4"],
    "dataCard": { "...": "optional model card JSON" },
    "ownerId": "uuid",
    "createdAt": "2025-09-20T07:05:00.000Z",
    "updatedAt": "2025-09-20T07:05:00.000Z"
  }
]
```

---

### GET `/datasets/{slug}`

**Desc:** Get dataset by slug.

**Response 200**

```json
{
  "id": "uuid",
  "name": "Global Education Index",
  "slug": "global-education-index",
  "license": "CC-BY-4.0",
  "description": "Index across countries",
  "authorNote": "Initial seed",
  "isPrivate": false,
  "tags": ["education","sdg4"],
  "dataCard": { "...": "optional model card JSON" },
  "ownerId": "uuid",
  "createdAt": "2025-09-20T07:05:00.000Z",
  "updatedAt": "2025-09-20T07:05:00.000Z"
}
```

**Errors:** 404 not found.

---

### POST `/datasets/{slug}/upload`  *(multipart/form-data)*

**Desc:** Upload a new dataset version to S3 and create a `DatasetVersion`. Generates/updates dataset-level `dataCard` when CSV.

**Form fields**

* `file` (required): CSV/JSON/Parquet
* `authorId` (required): `User.id` → stored in `commitUser`
* `commitMessage` (optional)

**Response 201**

```json
{
  "dataset": { "id": "uuid", "slug": "global-education-index", "name": "Global Education Index" },
  "version": {
    "id": "uuid",
    "version": "v3",
    "fileName": "gei_2025.csv",
    "fileSize": 123456,
    "commitUser": "uuid-of-user",
    "commitMessage": "Upload gei_2025.csv",
    "isLatest": true,
    "createdAt": "2025-09-20T07:05:00.000Z"
  },
  "datasetCard": { "...": "model card JSON if CSV" }
}
```

**Errors:** 404 dataset, 400 authorId/file invalid, 502 S3 error.

**curl**

```bash
curl -X POST https://api.example.com/datasets/global-education-index/upload \
  -F authorId=USER_UUID \
  -F commitMessage="Upload v3" \
  -F file=@./data/gei_2025.csv
```

---

### GET `/datasets/{slug}/versions`

**Desc:** List all versions for a dataset (latest first).

**Response 200**

```json
[
  {
    "id": "uuid",
    "version": "v3",
    "fileUrl": "datasets/global-education-index/2025-09-20/<uuid>_gei_2025.csv",
    "fileName": "gei_2025.csv",
    "fileSize": 123456,
    "commitMessage": "Upload v3",
    "commitUser": "uuid-of-user",
    "isLatest": true,
    "createdAt": "2025-09-20T07:05:00.000Z"
  }
]
```

---

### GET `/datasets/{slug}/download_url?version_id={uuid}`

**Desc:** Get a presigned S3 download URL. If `version_id` omitted, uses the latest version.

**Response 200**

```json
{ "url": "https://s3...", "version_id": "uuid" }
```

**Errors:** 404 dataset or no versions, 502 presign failed.

---

## Issues

### POST `/issues/{dataset_slug}`

**Desc:** Create an issue on a dataset.

**Body**

```json
{
  "title": "Column mismatch",
  "description": "The latest CSV has an extra column",
  "labels": ["bug","schema"],
  "authorId": "uuid-of-user"
}
```

**Response 201**

```json
{ "id": "uuid", "status": "OPEN" }
```

**Errors:** 404 dataset, 400 invalid authorId.

---

### GET `/issues/{dataset_slug}`

**Desc:** List issues for a dataset.

**Response 200**

```json
[
  {
    "id": "uuid",
    "title": "Column mismatch",
    "description": "The latest CSV has an extra column",
    "status": "OPEN",
    "labels": ["bug","schema"],
    "authorId": "uuid",
    "createdAt": "2025-09-20T07:05:00.000Z",
    "updatedAt": "2025-09-20T07:05:00.000Z",
    "closedAt": null
  }
]
```

---

### POST `/issues/comment/{issue_id}`

**Desc:** Add a comment to an issue.

**Body**

```json
{ "content": "Can you share the header row?", "authorId": "uuid-of-user" }
```

**Response 201**

```json
{ "ok": true }
```

**Errors:** 404 issue, 400 invalid authorId.

---

### POST `/issues/close/{issue_id}`

**Desc:** Close an issue.

**Response 200**

```json
{ "ok": true }
```

**Errors:** 404 issue.

---

## Pull Requests

### POST `/pulls/open`

**Desc:** Open a PR proposing dataset changes. Stores PR metadata only (per schema). Returns **transient diff preview** (not persisted) if CSV and base found.

**Body**

```json
{
  "dataset_slug": "global-education-index",
  "title": "Update 2025 rows",
  "description": "Adds new countries and fixes typos",
  "authorId": "uuid-of-user",
  "modifiedFileUrl": "datasets/global-education-index/2025-09-20/<uuid>_proposal.csv",
  "modifiedFileName": "proposal.csv",
  "against_version_id": "uuid-of-base-version"  // optional; defaults to dataset latest
}
```

**Response 201**

```json
{
  "pull_id": "uuid",
  "status": "OPEN",
  "diff_preview": {
    "added_count": 12,
    "removed_count": 0,
    "modified_count": 3,
    "sample_added": ["row-as-string|..."],
    "sample_removed": [],
    "sample_modified": [
      { "id": "rowKey", "before": { "col":"val" }, "after": { "col":"new" } }
    ]
  }
}
```

**Errors:** 404 dataset, 400 invalid authorId, 201 even if diff can’t be computed (diff will be empty).

---

### POST `/pulls/merge/{pull_id}`

**Desc:** Merge PR by **creating a new `DatasetVersion`** from `modifiedFileUrl`, set it as latest, and mark PR `MERGED`.

**Body**

```json
{ "commitUser": "uuid-of-user", "commitMessage": "Merge PR" }
```

**Response 200**

```json
{ "ok": true, "merged_version_id": "uuid", "pr_status": "MERGED" }
```

**Errors:** 404 pull, 409 closed PR, 400 invalid commitUser.

---

### POST `/pulls/close/{pull_id}`

**Desc:** Close PR without merging.

**Response 200**

```json
{ "ok": true }
```

**Errors:** 404 pull.

---

### POST `/pulls/comment/{pull_id}`

**Desc:** Comment on a PR.

**Body**

```json
{ "content": "Looks good, please add a README.", "authorId": "uuid-of-user" }
```

**Response 201**

```json
{ "ok": true }
```

**Errors:** 404 pull, 400 invalid authorId.

---

## Notebooks

### POST `/notebooks`

**Desc:** Create a notebook record (bind to dataset optional).

**Body**

```json
{
  "title": "Exploration on GEI",
  "authorId": "uuid-of-user",
  "description": "EDA notebook",
  "fileUrl": "notebooks/<uuid>.ipynb",
  "isPublic": true,
  "datasetId": "uuid-of-dataset"  // optional
}
```

**Response 201**

```json
{ "id": "uuid" }
```

**Errors:** 400 invalid authorId/datasetId.

---

### GET `/notebooks`

**Desc:** List notebooks.

**Response 200**

```json
[
  {
    "id": "uuid",
    "title": "Exploration on GEI",
    "description": "EDA notebook",
    "fileUrl": "notebooks/<uuid>.ipynb",
    "isPublic": true,
    "authorId": "uuid",
    "datasetId": "uuid-or-null",
    "createdAt": "2025-09-20T07:05:00.000Z",
    "updatedAt": "2025-09-20T07:05:00.000Z"
  }
]
```

---

## Recommendations

### GET `/recommendations?dataset_slug={slug}&k=5`

**Desc:** Returns k nearest datasets by vector similarity (MongoDB Atlas Vector Search placeholder backed by your current embedding upserts).

**Response 200**

```json
[
  {
    "dataset_id": "uuid",
    "slug": "another-dataset",
    "score": 0.83,
    "schema_sample": { "colA": "float64", "colB": "string" }
  }
]
```

**Errors:** 400 missing slug, 404 no embedding.

---

## Notes & Limits

* **Version labels:** automatically assigned `v1`, `v2`, …
* **`isLatest`:** backend ensures only one latest per dataset.
* **Presigned URLs:** valid for \~1 hour.
* **Diff preview:** transient only; computed on PR open when `modifiedFileName` ends with `.csv`.
* **DataCard:** stored at **dataset** level (`Dataset.dataCard`). Per schema, `DatasetVersion` has no JSON fields.

---

## Quick cURL Examples

Create user:

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"email":"a@ex.com","username":"alice"}'
```

Create dataset:

```bash
curl -X POST https://api.example.com/datasets \
  -H "Content-Type: application/json" \
  -d '{"name":"GEI","slug":"gei","license":"CC-BY-4.0","ownerId":"USER_UUID","tags":["sdg4"]}'
```

Upload version:

```bash
curl -X POST https://api.example.com/datasets/gei/upload \
  -F authorId=USER_UUID \
  -F file=@./data/gei.csv
```

Open PR:

```bash
curl -X POST https://api.example.com/pulls/open \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_slug":"gei",
    "title":"update 2025",
    "description":"adds rows",
    "authorId":"USER_UUID",
    "modifiedFileUrl":"datasets/gei/2025-09-20/<uuid>_proposal.csv",
    "modifiedFileName":"proposal.csv"
  }'
```

Merge PR:

```bash
curl -X POST https://api.example.com/pulls/merge/PULL_UUID \
  -H "Content-Type: application/json" \
  -d '{"commitUser":"USER_UUID","commitMessage":"Merge PR"}'
```

List versions:

```bash
curl https://api.example.com/datasets/gei/versions
```

Get download URL:

```bash
curl "https://api.example.com/datasets/gei/download_url?version_id=VERSION_UUID"
```

---
