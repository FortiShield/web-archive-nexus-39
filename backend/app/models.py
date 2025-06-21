from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Snapshot(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True)
    url = Column(String)
    timestamp = Column(String, index=True)
    snapshot_path = Column(String)
    title = Column(String, nullable=True)
    status = Column(String, default="processing")  # processing, completed, failed
    size = Column(Float, nullable=True)  # Size in MB
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    content_preview = Column(Text, nullable=True)  # For search functionality
    screenshot_path = Column(String, nullable=True)
