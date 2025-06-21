
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from sqlalchemy.orm import Session
from app import tasks, database, models, schemas
from app.utils.export import create_export_archive
from app.config import get_settings
import os
import json
import csv
from io import StringIO, BytesIO
import zipfile
from datetime import datetime, timedelta
from typing import Optional
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Redis for rate limiting
    redis = await FastAPILimiter.init(
        f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
        prefix="fastapi-limiter"
    )
    yield
    # Cleanup Redis connection
    await redis.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # Update with actual allowed hosts
)

# Add middleware for security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}

# Create tables
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/archive")
def archive_site(item: schemas.ArchiveRequest, db: Session = Depends(get_db)):
    # Create initial snapshot record
    snapshot = models.Snapshot(
        domain=item.url.split("://")[-1].split("/")[0],
        url=item.url,
        timestamp=str(int(datetime.now().timestamp())),
        status="processing"
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    
    # Start background task
    task = tasks.archive_website.delay(item.url, snapshot.id)
    return {"task_id": task.id, "status": "queued", "snapshot_id": snapshot.id}

@app.get("/archive/{domain}", response_model=schemas.ArchiveResponse)
def get_snapshots(
    domain: str, 
    status: Optional[str] = None,
    size: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Snapshot).filter(models.Snapshot.domain == domain)
    
    # Apply filters
    if status:
        query = query.filter(models.Snapshot.status == status)
    
    if search:
        query = query.filter(
            models.Snapshot.content_preview.contains(search) |
            models.Snapshot.title.contains(search) |
            models.Snapshot.url.contains(search)
        )
    
    snapshots = query.order_by(models.Snapshot.created_at.desc()).all()
    
    # Filter by size if provided
    if size:
        filtered_snapshots = []
        for s in snapshots:
            if s.size:
                if size == "small" and s.size < 1:
                    filtered_snapshots.append(s)
                elif size == "medium" and 1 <= s.size <= 5:
                    filtered_snapshots.append(s)
                elif size == "large" and s.size > 5:
                    filtered_snapshots.append(s)
        snapshots = filtered_snapshots
    
    # Convert to response format
    snapshot_responses = []
    for s in snapshots:
        snapshot_responses.append(schemas.SnapshotResponse(
            timestamp=s.timestamp,
            url=s.url,
            title=s.title,
            status=s.status,
            size=f"{s.size:.1f} MB" if s.size else None
        ))
    
    return schemas.ArchiveResponse(
        domain=domain,
        snapshots=snapshot_responses,
        total=len(snapshot_responses)
    )

@app.get("/archive/{domain}/{timestamp}")
def get_snapshot(domain: str, timestamp: str, db: Session = Depends(get_db)):
    snapshot = db.query(models.Snapshot).filter(
        models.Snapshot.domain == domain,
        models.Snapshot.timestamp == timestamp
    ).first()
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    if snapshot.status != "completed":
        raise HTTPException(status_code=400, detail=f"Snapshot is {snapshot.status}")
    
    file_path = f"snapshots/{domain}/{timestamp}/index.html"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Snapshot file not found")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

@app.post("/archive/{domain}/export")
def export_snapshots(
    domain: str, 
    export_request: schemas.BulkExportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    snapshots = db.query(models.Snapshot).filter(
        models.Snapshot.domain == domain,
        models.Snapshot.timestamp.in_(export_request.timestamps),
        models.Snapshot.status == "completed"
    ).all()
    
    if not snapshots:
        raise HTTPException(status_code=404, detail="No completed snapshots found")
    
    if export_request.format == "json":
        # Return JSON data
        data = []
        for s in snapshots:
            data.append({
                "timestamp": s.timestamp,
                "url": s.url,
                "title": s.title,
                "size": s.size,
                "created_at": s.created_at.isoformat() if s.created_at else None
            })
        
        json_str = json.dumps(data, indent=2)
        return StreamingResponse(
            BytesIO(json_str.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={domain}_snapshots.json"}
        )
    
    elif export_request.format == "csv":
        # Return CSV data
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["Timestamp", "URL", "Title", "Size (MB)", "Created At"])
        
        for s in snapshots:
            writer.writerow([
                s.timestamp,
                s.url,
                s.title or "",
                s.size or "",
                s.created_at.isoformat() if s.created_at else ""
            ])
        
        csv_content = output.getvalue()
        return StreamingResponse(
            BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={domain}_snapshots.csv"}
        )
    
    else:  # zip format
        # Create ZIP file
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for s in snapshots:
                file_path = f"snapshots/{domain}/{s.timestamp}/index.html"
                if os.path.exists(file_path):
                    zip_file.write(file_path, f"{s.timestamp}/index.html")
            
            # Add metadata
            metadata = []
            for s in snapshots:
                metadata.append({
                    "timestamp": s.timestamp,
                    "url": s.url,
                    "title": s.title,
                    "size": s.size
                })
            
            zip_file.writestr("metadata.json", json.dumps(metadata, indent=2))
        
        zip_buffer.seek(0)
        return StreamingResponse(
            BytesIO(zip_buffer.read()),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={domain}_snapshots.zip"}
        )

@app.delete("/archive/{domain}/{timestamp}")
def delete_snapshot(domain: str, timestamp: str, db: Session = Depends(get_db)):
    snapshot = db.query(models.Snapshot).filter(
        models.Snapshot.domain == domain,
        models.Snapshot.timestamp == timestamp
    ).first()
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    # Delete files
    import shutil
    snapshot_dir = f"snapshots/{domain}/{timestamp}"
    if os.path.exists(snapshot_dir):
        shutil.rmtree(snapshot_dir)
    
    # Delete database record
    db.delete(snapshot)
    db.commit()
    
    return {"message": "Snapshot deleted successfully"}

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/")
def root():
    return {"message": "Archive Hub API", "version": "1.0.0"}
