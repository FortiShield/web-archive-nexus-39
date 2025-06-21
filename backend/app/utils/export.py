import zipfile
import json
import csv
import os
from io import StringIO, BytesIO
from typing import List
from app.models import Snapshot


def create_export_archive(snapshots: List[Snapshot], format: str = "zip"):
    """Create export archive in specified format"""

    if format == "json":
        data = []
        for s in snapshots:
            data.append(
                {
                    "timestamp": s.timestamp,
                    "url": s.url,
                    "title": s.title,
                    "size": s.size,
                    "domain": s.domain,
                    "status": s.status,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
            )
        return json.dumps(data, indent=2)

    elif format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(
            ["Domain", "Timestamp", "URL", "Title", "Size (MB)", "Status", "Created At"]
        )

        for s in snapshots:
            writer.writerow(
                [
                    s.domain,
                    s.timestamp,
                    s.url,
                    s.title or "",
                    s.size or "",
                    s.status,
                    s.created_at.isoformat() if s.created_at else "",
                ]
            )

        return output.getvalue()

    else:  # zip format
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for s in snapshots:
                # Add HTML file
                html_path = f"snapshots/{s.domain}/{s.timestamp}/index.html"
                if os.path.exists(html_path):
                    zip_file.write(html_path, f"{s.domain}/{s.timestamp}/index.html")

                # Add screenshot if exists
                screenshot_path = f"snapshots/{s.domain}/{s.timestamp}/screenshot.png"
                if os.path.exists(screenshot_path):
                    zip_file.write(
                        screenshot_path, f"{s.domain}/{s.timestamp}/screenshot.png"
                    )

            # Add metadata file
            metadata = []
            for s in snapshots:
                metadata.append(
                    {
                        "timestamp": s.timestamp,
                        "url": s.url,
                        "title": s.title,
                        "size": s.size,
                        "domain": s.domain,
                        "status": s.status,
                    }
                )

            zip_file.writestr("metadata.json", json.dumps(metadata, indent=2))

        zip_buffer.seek(0)
        return zip_buffer.getvalue()


def get_export_filename(domain: str, format: str) -> str:
    """Generate export filename"""
    timestamp = int(time.time())
    return f"{domain}_snapshots_{timestamp}.{format}"
