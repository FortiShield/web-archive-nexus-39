
import os, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import re

def capture_snapshot(url: str, snapshot_id: int):
    try:
        domain = urlparse(url).netloc
        timestamp = str(int(time.time()))
        save_dir = f"snapshots/{domain}/{timestamp}"
        os.makedirs(save_dir, exist_ok=True)

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # Navigate to page
            page.goto(url, timeout=60000, wait_until="networkidle")
            
            # Get page title
            title = page.title() or domain
            
            # Get HTML content
            html = page.content()
            
            # Extract text content for search
            text_content = page.evaluate("() => document.body.innerText || ''")
            content_preview = text_content[:1000] if text_content else ""
            
            # Save HTML
            html_path = f"{save_dir}/index.html"
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)
            
            # Calculate file size
            file_size = os.path.getsize(html_path) / (1024 * 1024)  # MB
            
            # Take screenshot (optional)
            screenshot_path = f"{save_dir}/screenshot.png"
            page.screenshot(path=screenshot_path, full_page=True)
            
            browser.close()

        return {
            "domain": domain,
            "timestamp": timestamp,
            "title": title,
            "size": round(file_size, 2),
            "content_preview": content_preview,
            "snapshot_path": html_path,
            "screenshot_path": screenshot_path
        }
    
    except Exception as e:
        return {"error": str(e)}
