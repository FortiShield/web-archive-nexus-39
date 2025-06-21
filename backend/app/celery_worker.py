from celery import Celery
import os

celery = Celery(
    "worker",
    broker=os.getenv("REDIS_BROKER", "redis://redis:6379/0"),
    backend=os.getenv("REDIS_BROKER", "redis://redis:6379/0"),
)
