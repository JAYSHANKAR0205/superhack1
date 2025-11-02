# Asset Reviver — Backend (FastAPI, mock DB)

This repository contains a minimal FastAPI backend for an asset recovery system. It stores assets in a small SQLite database and exposes endpoints for ingestion, flagging, outreach (mocked), valuation, a simple RAG-style chat, and a dashboard.

Features implemented:
- POST /api/assets/bulk_upload — CSV upload to ingest assets
- GET /api/assets — list assets with filters (status, owner, asset_id, search)
- POST /api/assets/{id}/flag_missing — mark asset as Missing
- POST /api/assets/{id}/draft_email — generate a draft recovery email (OpenAI if API key provided, otherwise mocked)
- POST /api/assets/{id}/send_email — simulate sending an email (logs to emails.json). Optional simulate_recovery=true to mark asset as Recovered.
- POST /api/assets/{id}/estimate_value — rule-based estimate with ML stub and disposition suggestion
- POST /api/chat — simple RAG-style chat that uses asset data as context
- GET /api/dashboard — 3 KPIs and 2 charts (status breakdown, value buckets)

Getting started (local):
1. Create a Python environment (recommended).
2. Install dependencies:
   pip install -r requirements.txt

3. (Optional) Set OPENAI_API_KEY if you want real LLM calls:
   export OPENAI_API_KEY="sk-..."

4. Run the app:
   uvicorn main:app --reload

CSV format hints:
- Column headers can include: asset_id, name, category, owner, owner_email, last_seen (ISO format), location, notes
- last_seen should be ISO datetime (e.g., 2024-05-01T14:00:00). If not parsable, it will be left blank.

Notes:
- The OpenAI integration will be attempted only if OPENAI_API_KEY is set. Otherwise draft email and chat responses are mocked heuristics.
- Emails are logged to `emails.json` as a simple simulation.
- The database file `assets.db` is created in the working directory by default.

Example curl:
- Upload CSV:
  curl -F "file=@assets_sample.csv" http://127.0.0.1:8000/api/assets/bulk_upload

- List assets:
  curl http://127.0.0.1:8000/api/assets

- Draft email:
  curl -X POST http://127.0.0.1:8000/api/assets/1/draft_email

- Send email (simulate and simulate recovery):
  curl -X POST "http://127.0.0.1:8000/api/assets/1/send_email?simulate_recovery=true"

- Estimate:
  curl -X POST http://127.0.0.1:8000/api/assets/1/estimate_value

- Chat:
  curl -X POST http://127.0.0.1:8000/api/chat -H "Content-Type: application/json" -d '{"query":"Who is the owner of asset 123","context_asset_ids":[1]}'

License: MIT (example)