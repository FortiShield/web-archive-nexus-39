
from sqlalchemy import Column, Integer, String
from app.database import Base

class Snapshot(Base):
    __tablename__ = "snapshots"
    id = Column(Integer, primary_key=True)
    domain = Column(String)
    timestamp = Column(String)
    snapshot_path = Column(String)
