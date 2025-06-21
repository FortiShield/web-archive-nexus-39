
from fastapi import FastAPI
from app import tasks, database, models, schemas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/archive")
def archive_site(item: schemas.ArchiveRequest):
    task = tasks.archive_website.delay(item.url)
    return {"task_id": task.id, "status": "queued"}

@app.get("/archive/{domain}")
def get_snapshots(domain: str):
    db = database.get_db()
    results = db.query(models.Snapshot).filter_by(domain=domain).all()
    return [schemas.ArchiveResponse.from_orm(r) for r in results]

@app.get("/archive/{domain}/{timestamp}")
def get_snapshot(domain: str, timestamp: str):
    path = f"snapshots/{domain}/{timestamp}/index.html"
    return open(path).read()

@app.get("/health")
def health_check():
    return {"status": "ok"}
