
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ArchiveRequest(BaseModel):
    url: str

class SnapshotResponse(BaseModel):
    timestamp: str
    url: str
    title: Optional[str] = None
    status: str = "completed"
    size: Optional[str] = None

    class Config:
        from_attributes = True

class ArchiveResponse(BaseModel):
    domain: str
    snapshots: List[SnapshotResponse]
    total: int

class BulkExportRequest(BaseModel):
    timestamps: List[str]
    format: str = "zip"  # zip, json, csv

class ExportResponse(BaseModel):
    download_url: str
    filename: str
    expires_at: datetime
