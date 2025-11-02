from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
import uuid


class Asset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_id: str = Field(index=True, default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    category: Optional[str] = None
    owner: Optional[str] = None
    owner_email: Optional[str] = None
    last_seen: Optional[datetime] = None
    location: Optional[str] = None
    status: str = Field(default="Active")  # Active / Missing / Recovered
    value_estimate: Optional[float] = None
    disposition_suggestion: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)