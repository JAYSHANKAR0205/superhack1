from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import csv
import io
from typing import List, Optional
from .database import init_db, get_session
from sqlmodel import Session
from . import crud, schemas, llm
from .models import Asset
from datetime import datetime
import random

app = FastAPI(title="Asset Reviver - Backend (mock)")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize DB on startup
@app.on_event("startup")
def on_startup():
    init_db()


# 1. Bulk upload CSV
@app.post("/api/assets/bulk_upload")
async def bulk_upload(file: UploadFile = File(...), session: Session = Depends(get_session)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except Exception:
        text = content.decode("latin-1")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        # Basic normalization
        if "last_seen" in row and row["last_seen"]:
            try:
                row["last_seen"] = datetime.fromisoformat(row["last_seen"])
            except Exception:
                # leave as string; CRUD will attempt conversion
                pass
        # Trim empty strings
        for k, v in list(row.items()):
            if v is not None and isinstance(v, str) and v.strip() == "":
                row[k] = None
        rows.append(row)
    created = crud.bulk_create_assets(session=session, assets=rows)
    return {"created": len(created)}


# 2. Asset listing with filters
@app.get("/api/assets", response_model=List[schemas.AssetRead])
def list_assets(
    status: Optional[str] = Query(None, description="Filter by status (Active/Missing/Recovered)"),
    owner: Optional[str] = Query(None),
    asset_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
):
    assets = crud.list_assets(session=session, status=status, owner=owner, asset_id=asset_id, search=search, limit=limit, offset=offset)
    return assets


# 3. Flag missing
@app.post("/api/assets/{id}/flag_missing")
def flag_missing(id: int, session: Session = Depends(get_session)):
    asset = crud.get_asset(session=session, asset_id=id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset = crud.set_missing(session=session, asset=asset)
    return {"id": asset.id, "status": asset.status}


# 4. Draft email (LLM mockable)
@app.post("/api/assets/{id}/draft_email")
def draft_email(id: int, session: Session = Depends(get_session)):
    asset = crud.get_asset(session=session, asset_id=id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    # Convert to dict
    asset_dict = asset.dict()
    email = llm.draft_email_via_llm(asset_dict)
    # return draft (not stored)
    return {"email": email}


# 5. Send email (simulate)
@app.post("/api/assets/{id}/send_email")
def send_email(id: int, simulate_recovery: bool = False, session: Session = Depends(get_session)):
    asset = crud.get_asset(session=session, asset_id=id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset_dict = asset.dict()
    email = llm.draft_email_via_llm(asset_dict)
    # Log the send (simulate). Store timestamp, to, subject, body, asset_id
    entry = {
        "asset_id": asset.asset_id,
        "asset_db_id": asset.id,
        "to": email.get("to"),
        "subject": email.get("subject"),
        "body": email.get("body"),
        "sent_at": datetime.utcnow().isoformat(),
        "simulated": True
    }
    crud.log_email(entry)
    # Optionally simulate recovery (for dashboard update)
    if simulate_recovery:
        asset = crud.set_recovered(session=session, asset=asset)
        entry["simulated_recovery"] = True
        crud.log_email({"note": f"Simulated recovery for asset {asset.asset_id} at {datetime.utcnow().isoformat()}"})
    return {"sent": True, "log": entry, "asset_status": asset.status}


# 6. Estimate value (rule-based + ML stub)
@app.post("/api/assets/{id}/estimate_value")
def estimate_value(id: int, session: Session = Depends(get_session)):
    asset = crud.get_asset(session=session, asset_id=id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    # Simple rule-based: base by category
    base_values = {
        "laptop": 1200,
        "phone": 700,
        "monitor": 200,
        "printer": 150,
    }
    cat = (asset.category or "").lower()
    rule_based = base_values.get(cat, 300)  # default
    # Depreciation by age if last_seen present
    if asset.last_seen:
        days = (datetime.utcnow() - asset.last_seen).days
        years = max(days / 365.0, 0)
        rule_based = rule_based * max(0.2, 1 - 0.2 * years)  # simplistic depreciation
    # ML stub: random small adjustment
    ml_adjust = rule_based * (1 + random.uniform(-0.15, 0.15))
    final = (rule_based + ml_adjust) / 2
    # Disposition suggestion
    if final < 100:
        disp = "Recycle"
    elif final < 500:
        disp = "Repair/Refurbish"
    else:
        disp = "Attempt Recovery for Reuse/Sale"
    # Save to asset
    asset = crud.update_value_and_disposition(session=session, asset=asset, value=round(final, 2), disposition=disp)
    res = {"rule_based": round(rule_based, 2), "ml_stub": round(ml_adjust, 2), "final": round(final, 2), "disposition": disp}
    return res


# 7. Chat endpoint (RAG-ish)
@app.post("/api/chat")
def chat_endpoint(req: schemas.ChatRequest, session: Session = Depends(get_session)):
    # Build context: if context_asset_ids provided, pull those; otherwise do a simple search for tokens in assets
    target_assets = []
    if req.context_asset_ids:
        for aid in req.context_asset_ids:
            a = crud.get_asset(session=session, asset_id=aid)
            if a:
                target_assets.append(a.dict())
    else:
        # naive retrieval: look for owner or asset in query
        q = req.query.lower()
        candidates = crud.list_assets(session=session, search=None, limit=200, offset=0)
        for a in candidates:
            if (a.owner and q in (a.owner or "").lower()) or (a.asset_id and q in (a.asset_id or "").lower()) or (a.name and q in (a.name or "").lower()):
                target_assets.append(a.dict())
        # if none, fall back to last 5 assets
        if not target_assets:
            candidates = crud.list_assets(session=session, limit=5, offset=0)
            target_assets = [c.dict() for c in candidates]
    context = llm.rag_context_for_assets(target_assets)
    answer = llm.answer_chat_via_llm(req.query, context)
    return {"answer": answer, "context_count": len(target_assets)}


# 8. Dashboard: KPIs + charts
@app.get("/api/dashboard")
def dashboard(session: Session = Depends(get_session)):
    # KPIs: total_assets, missing_count, recovered_count
    assets = crud.list_assets(session=session, limit=10000, offset=0)
    total = len(assets)
    missing = len([a for a in assets if a.status == "Missing"])
    recovered = len([a for a in assets if a.status == "Recovered"])
    # Charts:
    # Chart 1: status breakdown
    status_counts = {}
    for a in assets:
        status_counts[a.status] = status_counts.get(a.status, 0) + 1
    # Chart 2: value distribution buckets
    buckets = {"<100": 0, "100-499": 0, "500-999": 0, "1000+": 0, "unknown": 0}
    for a in assets:
        v = a.value_estimate
        if v is None:
            buckets["unknown"] += 1
        elif v < 100:
            buckets["<100"] += 1
        elif v < 500:
            buckets["100-499"] += 1
        elif v < 1000:
            buckets["500-999"] += 1
        else:
            buckets["1000+"] += 1
    kpis = {"total_assets": total, "missing": missing, "recovered": recovered}
    charts = {"status_breakdown": status_counts, "value_buckets": buckets}
    return {"kpis": kpis, "charts": charts}