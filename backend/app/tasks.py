
from app.celery_worker import celery
from app.utils.playwright import capture_snapshot

@celery.task
def archive_website(url: str):
    return capture_snapshot(url)
