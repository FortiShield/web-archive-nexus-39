
from app.celery_worker import celery
from app.utils.playwright import capture_snapshot
from app.database import SessionLocal
from app.models import Snapshot
import os

@celery.task
def archive_website(url: str, snapshot_id: int):
    db = SessionLocal()
    try:
        # Get snapshot record
        snapshot = db.query(Snapshot).filter(Snapshot.id == snapshot_id).first()
        if not snapshot:
            return {"error": "Snapshot not found"}
        
        # Update status to processing
        snapshot.status = "processing"
        db.commit()
        
        # Capture the snapshot
        result = capture_snapshot(url, snapshot_id)
        
        if result.get("error"):
            snapshot.status = "failed"
            db.commit()
            return result
        
        # Update snapshot with results
        snapshot.title = result.get("title")
        snapshot.size = result.get("size")
        snapshot.content_preview = result.get("content_preview")
        snapshot.snapshot_path = result.get("snapshot_path")
        snapshot.status = "completed"
        
        db.commit()
        return result
        
    except Exception as e:
        # Mark as failed
        if snapshot:
            snapshot.status = "failed"
            db.commit()
        return {"error": str(e)}
    finally:
        db.close()

@celery.task
def cleanup_old_snapshots():
    """Clean up snapshots older than 30 days"""
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    try:
        cutoff_date = datetime.now() - timedelta(days=30)
        old_snapshots = db.query(Snapshot).filter(
            Snapshot.created_at < cutoff_date
        ).all()
        
        for snapshot in old_snapshots:
            # Delete files
            import shutil
            snapshot_dir = f"snapshots/{snapshot.domain}/{snapshot.timestamp}"
            if os.path.exists(snapshot_dir):
                shutil.rmtree(snapshot_dir)
            
            # Delete database record
            db.delete(snapshot)
        
        db.commit()
        return {"cleaned": len(old_snapshots)}
    finally:
        db.close()
