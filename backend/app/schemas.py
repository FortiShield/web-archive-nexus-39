
from pydantic import BaseModel

class ArchiveRequest(BaseModel):
    url: str

class ArchiveResponse(BaseModel):
    id: int
    domain: str
    timestamp: str
    snapshot_path: str

    class Config:
        orm_mode = True
