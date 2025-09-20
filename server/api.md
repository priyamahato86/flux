# Flux API — Reference

Base URL: `https://<your-host>`
All responses are JSON. Timestamps are ISO 8601 (UTC). Common error shape: `{"error":"<message>"}`.
Requests/Responses include an `X-Request-ID` header for tracing.

---

## Health

### GET `/health`

**Desc:** Liveness probe.

**cURL**

```bash
curl -s https://<host>/health
```

**Sample Response**

```json
{"ok": true, "time": "2025-09-20T08:40:18.925764"}
```

---

## Datasets

### POST `/datasets`

**Desc:** Create a dataset.

**Body**

```json
{
  "name": "NYC Taxi",
  "slug": "nyc-taxi",
  "license": "CC-BY-4.0",
  "ownerId": "user-123",
  "description": "Yellow taxi trips"
}
```

**cURL**

```bash
curl -X POST https://<host>/datasets \
  -H 'Content-Type: application/json' \
  -d '{"name":"NYC Taxi","slug":"nyc-taxi","license":"CC-BY-4.0","ownerId":"user-123","description":"Yellow taxi trips"}'
```

**Sample Response (201)**

```json
{"id":"a3b8...","slug":"nyc-taxi","name":"NYC Taxi"}
```

---

### GET `/datasets`

**Desc:** List datasets (newest first).

**cURL**

```bash
curl -s https://<host>/datasets
```

**Sample Response**

```json
[
  {
    "id":"a3b8...",
    "name":"NYC Taxi",
    "slug":"nyc-taxi",
    "license":"CC-BY-4.0",
    "description":"Yellow taxi trips",
    "authorNote":null,
    "isPrivate":false,
    "tags":["transport","time-series","ml"],
    "dataCard":{ "...": "..." },
    "ownerId":"user-123",
    "createdAt":"2025-09-20T08:10:00",
    "updatedAt":"2025-09-20T08:12:30"
  }
]
```

---

### GET `/datasets/{slug}`

**Desc:** Get dataset by slug.

**cURL**

```bash
curl -s https://<host>/datasets/nyc-taxi
```

**Sample Response**

```json
{
  "id":"a3b8...",
  "name":"NYC Taxi",
  "slug":"nyc-taxi",
  "license":"CC-BY-4.0",
  "description":"Yellow taxi trips",
  "authorNote":null,
  "isPrivate":false,
  "tags":["transport","time-series","ml"],
  "dataCard":{ "...": "..." },
  "ownerId":"user-123",
  "createdAt":"2025-09-20T08:10:00",
  "updatedAt":"2025-09-20T08:12:30"
}
```

---

### POST `/datasets/{slug}/upload`

**Desc:** Upload a new version (CSV/JSON/Parquet supported). CSVs are profiled to update `dataCard`, tags, and embeddings.

**Form fields**

* `authorId` (required)
* `commitMessage` (optional)
* `file` (required; multipart)

**cURL**

```bash
curl -X POST https://<host>/datasets/nyc-taxi/upload \
  -F authorId=user-123 \
  -F commitMessage='Initial upload' \
  -F file=@/path/to/trips.csv
```

**Sample Response (201)**

```json
{
  "dataset": {"id":"a3b8...","slug":"nyc-taxi","name":"NYC Taxi"},
  "version": {
    "id":"v-uuid...",
    "version":"v1",
    "fileName":"trips.csv",
    "fileSize":1234567,
    "commitUser":"user-123",
    "commitMessage":"Upload trips.csv",
    "isLatest":true,
    "createdAt":"2025-09-20T08:12:30"
  },
  "datasetCard": { "...": "..." }
}
```

---

### GET `/datasets/{slug}/versions`

**Desc:** List versions for a dataset (newest first).

**cURL**

```bash
curl -s https://<host>/datasets/nyc-taxi/versions
```

**Sample Response**

```json
[
  {
    "id":"v-uuid-2",
    "version":"v2",
    "fileUrl":"datasets/nyc-taxi/2025-09-20/abcd_trips.csv",
    "fileName":"trips.csv",
    "fileSize":1250000,
    "commitMessage":"Fix header issues",
    "commitUser":"user-123",
    "isLatest":true,
    "createdAt":"2025-09-20T10:01:00"
  },
  {
    "id":"v-uuid-1",
    "version":"v1",
    "fileUrl":"datasets/nyc-taxi/2025-09-20/efgh_trips.csv",
    "fileName":"trips.csv",
    "fileSize":1234567,
    "commitMessage":"Upload trips.csv",
    "commitUser":"user-123",
    "isLatest":false,
    "createdAt":"2025-09-20T08:12:30"
  }
]
```

---

### GET `/datasets/{slug}/download_url[?version_id=...]`

**Desc:** Get a time-limited S3 presigned URL for the latest or a specific version.

**cURL (latest)**

```bash
curl -s 'https://<host>/datasets/nyc-taxi/download_url'
```

**cURL (specific version)**

```bash
curl -s 'https://<host>/datasets/nyc-taxi/download_url?version_id=v-uuid-2'
```

**Sample Response**

```json
{
  "url":"https://s3.amazonaws.com/...&X-Amz-Signature=...",
  "version_id":"v-uuid-2"
}
```

---

## Issues

### POST `/issues/{dataset_slug}`

**Desc:** Open an issue for a dataset.

**Body**

```json
{
  "title": "Column types look wrong",
  "description": "pickup_datetime parsed as object.",
  "labels": ["bug","schema"],
  "authorId": "user-123"
}
```

**cURL**

```bash
curl -X POST https://<host>/issues/nyc-taxi \
  -H 'Content-Type: application/json' \
  -d '{"title":"Column types look wrong","description":"pickup_datetime parsed as object.","labels":["bug","schema"],"authorId":"user-123"}'
```

**Sample Response (201)**

```json
{"id":"issue-uuid...","status":"OPEN"}
```

---

### GET `/issues/{dataset_slug}`

**Desc:** List issues for a dataset.

**cURL**

```bash
curl -s https://<host>/issues/nyc-taxi
```

**Sample Response**

```json
[
  {
    "id":"issue-uuid...",
    "title":"Column types look wrong",
    "description":"pickup_datetime parsed as object.",
    "status":"OPEN",
    "labels":["bug","schema"],
    "authorId":"user-123",
    "createdAt":"2025-09-20T09:00:00",
    "updatedAt":"2025-09-20T09:00:00",
    "closedAt":null
  }
]
```

---

### POST `/issues/comment/{issue_id}`

**Desc:** Add a comment to an issue.

**Body**

```json
{"content":"Can you share sample rows?","authorId":"user-456"}
```

**cURL**

```bash
curl -X POST https://<host>/issues/comment/issue-uuid \
  -H 'Content-Type: application/json' \
  -d '{"content":"Can you share sample rows?","authorId":"user-456"}'
```

**Sample Response (201)**

```json
{"ok": true}
```

---

### POST `/issues/close/{issue_id}`

**Desc:** Close an issue.

**cURL**

```bash
curl -X POST https://<host>/issues/close/issue-uuid
```

**Sample Response**

```json
{"ok": true}
```

---

## Pull Requests

> Use PRs to propose a replacement file. You provide an already-uploaded object key via `modifiedFileUrl` (e.g., an S3 key), not the bytes themselves.

### POST `/pulls/open`

**Desc:** Open a pull request against a dataset. Returns a lightweight CSV diff preview when base & PR are CSV.

**Body**

```json
{
  "dataset_slug":"nyc-taxi",
  "title":"Fix headers, add 2025 trips",
  "description":"Normalized header case and added new rows.",
  "authorId":"user-456",
  "modifiedFileUrl":"datasets/nyc-taxi/tmp/new_trips.csv",
  "modifiedFileName":"new_trips.csv",
  "against_version_id":"v-uuid-1"
}
```

**cURL**

```bash
curl -X POST https://<host>/pulls/open \
  -H 'Content-Type: application/json' \
  -d '{"dataset_slug":"nyc-taxi","title":"Fix headers, add 2025 trips","description":"Normalized header case and added new rows.","authorId":"user-456","modifiedFileUrl":"datasets/nyc-taxi/tmp/new_trips.csv","modifiedFileName":"new_trips.csv","against_version_id":"v-uuid-1"}'
```

**Sample Response (201)**

```json
{
  "pull_id":"pr-uuid...",
  "status":"OPEN",
  "diff_preview":{
    "added_count": 1200,
    "removed_count": 0,
    "modified_count": 3,
    "sample_added": ["..."],
    "sample_removed": [],
    "sample_modified": [
      {"id":"1001","before":{"vendor":"1"},"after":{"vendor":"2"}}
    ]
  }
}
```

---

### POST `/pulls/merge/{pull_id}`

**Desc:** Merge PR → creates a new `DatasetVersion` from `modifiedFileUrl`, refreshes dataset card if CSV.

**Body**

```json
{"commitUser":"user-999","commitMessage":"Merge PR #12"}
```

**cURL**

```bash
curl -X POST https://<host>/pulls/merge/pr-uuid \
  -H 'Content-Type: application/json' \
  -d '{"commitUser":"user-999","commitMessage":"Merge PR #12"}'
```

**Sample Response**

```json
{"ok": true, "merged_version_id":"v-uuid-3", "pr_status":"MERGED"}
```

---

### POST `/pulls/close/{pull_id}`

**Desc:** Close PR without merging.

**cURL**

```bash
curl -X POST https://<host>/pulls/close/pr-uuid
```

**Sample Response**

```json
{"ok": true}
```

---

### POST `/pulls/comment/{pull_id}`

**Desc:** Comment on a PR.

**Body**

```json
{"content":"Looks good. Any schema drift?","authorId":"user-123"}
```

**cURL**

```bash
curl -X POST https://<host>/pulls/comment/pr-uuid \
  -H 'Content-Type: application/json' \
  -d '{"content":"Looks good. Any schema drift?","authorId":"user-123"}'
```

**Sample Response (201)**

```json
{"ok": true}
```

---

## Notebooks

### POST `/notebooks`

**Desc:** Create a notebook (optionally link to a dataset).

**Body**

```json
{
  "title":"EDA on NYC Taxi",
  "authorId":"user-123",
  "description":"Quick EDA",
  "fileUrl":"s3://.../eda.ipynb",
  "isPublic":true,
  "datasetId":"a3b8..."
}
```

**cURL**

```bash
curl -X POST https://<host>/notebooks \
  -H 'Content-Type: application/json' \
  -d '{"title":"EDA on NYC Taxi","authorId":"user-123","description":"Quick EDA","fileUrl":"s3://.../eda.ipynb","isPublic":true,"datasetId":"a3b8..."}'
```

**Sample Response (201)**

```json
{"id":"nb-uuid..."}
```

---

### GET `/notebooks`

**Desc:** List notebooks (newest first).

**cURL**

```bash
curl -s https://<host>/notebooks
```

**Sample Response**

```json
[
  {
    "id":"nb-uuid...",
    "title":"EDA on NYC Taxi",
    "description":"Quick EDA",
    "fileUrl":"s3://.../eda.ipynb",
    "isPublic":true,
    "authorId":"user-123",
    "datasetId":"a3b8...",
    "createdAt":"2025-09-20T09:30:00",
    "updatedAt":"2025-09-20T09:30:00"
  }
]
```

---

## Recommendations

### GET `/recommendations?dataset_slug={slug}&k={k}`

**Desc:** Get up to `k` related datasets by cosine similarity of schema-derived embeddings.

**Params**

* `dataset_slug` (required)
* `k` (optional, default `5`)

**cURL**

```bash
curl -s 'https://<host>/recommendations?dataset_slug=nyc-taxi&k=3'
```

**Sample Response**

```json
[
  {"dataset_id":"b7c1...","slug":"chicago-taxi","score":0.91,"schema_sample":{"trip_id":"int64","fare":"float64"}},
  {"dataset_id":"9f20...","slug":"sf-taxi","score":0.88,"schema_sample":{"trip_id":"int64","fare":"float64"}}
]
```

---

## Notes & Behaviors

* **CSV profiling:** On upload or merge of a CSV, the server computes a dataset profile, updates `Dataset.dataCard`, and (if no tags set) may generate tags. If `OPENAI_API_KEY` is unset, it falls back to heuristic tags/insights.
* **Storage:** File bytes live in S3. Endpoints accept/return S3 keys (e.g., `datasets/<slug>/.../uuid_filename.csv`). Use `/download_url` to obtain a presigned URL.
* **Versioning:** Semantic labels are auto-generated (`v1`, `v2`, ...). Exactly one version is `isLatest=true`.
* **Issues & PRs:** Comments are supported on both; status transitions are explicit endpoints.
* **Logging:** Every request logs start/end and adds `X-Request-ID` to the response.

---

## Quick Error Examples

**Conflict (slug exists)**

```json
{"error":"slug already exists"}
```

**Not Found (dataset / issue / PR)**

```json
{"error":"dataset not found"}
```

**Validation**

```json
{"error":"name, slug, license, ownerId are required"}
```

---
