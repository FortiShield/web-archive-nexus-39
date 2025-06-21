
import os, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

def capture_snapshot(url: str):
    domain = urlparse(url).netloc
    timestamp = str(int(time.time()))
    save_dir = f"snapshots/{domain}/{timestamp}"
    os.makedirs(save_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, timeout=60000)
        html = page.content()
        with open(f"{save_dir}/index.html", "w", encoding="utf-8") as f:
            f.write(html)
        browser.close()

    return {"domain": domain, "timestamp": timestamp}
