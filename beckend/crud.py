from sqlmodel import select
from sqlmodel import Session
from typing import List, Optional
from beckend.models import Asset
from datetime import datetime
import json
import os

EMAIL_LOG = os.getenv("EMAIL_LOG", "emails.json")


def create_asset(session: Session, **data) -> Asset:
    asset = Asset(**data)
    asset.created_at = datetime.utcnow()
    asset.updated_at = datetime.utcnow()
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


def bulk_create_assets(session: Session, assets: List[dict]) -> List[Asset]:
    created = []
    for item in assets:
        # normalize keys to match model
        if "asset_id" not in item or not item.get("asset_id"):
            # SQLModel default will set a uuid
            pass
        # convert last_seen if string
        if item.get("last_seen") and isinstance(item.get("last_seen"), str):
            try:
                item["last_seen"] = datetime.fromisoformat(item["last_seen"])
            except Exception:
                item["last_seen"] = None
        asset = Asset(**item)
        session.add(asset)
        created.append(asset)
    session.commit()
    for a in created:
        session.refresh(a)
    return created


def list_assets(session: Session, status: Optional[str] = None, owner: Optional[str] = None,
                asset_id: Optional[str] = None, search: Optional[str] = None,
                limit: int = 100, offset: int = 0) -> List[Asset]:
    query = select(Asset)
    if status:
        query = query.where(Asset.status == status)
    if owner:
        query = query.where(Asset.owner.contains(owner))
    if asset_id:
        query = query.where(Asset.asset_id == asset_id)
    if search:
        s = f"%{search}%"
        query = query.where((Asset.name.like(s)) | (Asset.owner.like(s)) | (Asset.location.like(s)))
    query = query.offset(offset).limit(limit)
    results = session.exec(query).all()
    return results


def get_asset(session: Session, asset_id: int) -> Optional[Asset]:
    return session.get(Asset, asset_id)


def set_missing(session: Session, asset: Asset) -> Asset:
    asset.status = "Missing"
    asset.updated_at = datetime.utcnow()
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


def set_recovered(session: Session, asset: Asset) -> Asset:
    asset.status = "Recovered"
    asset.updated_at = datetime.utcnow()
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


def update_value_and_disposition(session: Session, asset: Asset, value: float, disposition: str) -> Asset:
    asset.value_estimate = value
    asset.disposition_suggestion = disposition
    asset.updated_at = datetime.utcnow()
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


def log_email(entry: dict):
    # Append to a json array in EMAIL_LOG
    data = []
    if os.path.exists(EMAIL_LOG):
        try:
            with open(EMAIL_LOG, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = []
    data.append(entry)
    with open(EMAIL_LOG, "w", encoding="utf-8") as f:
        json.dump(data, f, default=str, indent=2)