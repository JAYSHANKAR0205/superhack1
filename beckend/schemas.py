from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class AssetCreate(BaseModel):
    asset_id: Optional[str]
    name: Optional[str]
    category: Optional[str]
    owner: Optional[str]
    owner_email: Optional[str]
    last_seen: Optional[datetime]
    location: Optional[str]
    notes: Optional[str]


class AssetRead(BaseModel):
    id: int
    asset_id: str
    name: Optional[str]
    category: Optional[str]
    owner: Optional[str]
    owner_email: Optional[str]
    last_seen: Optional[datetime]
    location: Optional[str]
    status: str
    value_estimate: Optional[float]
    disposition_suggestion: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class EmailDraft(BaseModel):
    subject: str
    body: str
    to: Optional[str]


class EstimateResult(BaseModel):
    rule_based: float
    ml_stub: float
    final: float
    disposition: str


class ChatRequest(BaseModel):
    query: str
    context_asset_ids: Optional[List[int]] = None