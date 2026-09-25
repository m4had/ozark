#!/usr/bin/env python3
"""Copy site/ to _site/ with seller details and payment links from ops/config.json filled in.

Refuses to build while any value is missing, so a page with dead "Buy" buttons can never go live.
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / "site", ROOT / "_site"


def placeholders(shop):
    links = shop.get("payment_links", {})
    return {
        "SELLER_LEGAL_NAME": shop.get("seller_legal_name"),
        "CONTACT_EMAIL": shop.get("contact_email"),
        **{f"PAYMENT_LINK_{k.upper()}": v for k, v in links.items()},
    }


def build():
    shop = json.loads((ROOT / "ops" / "config.json").read_text()).get("shop", {})
    values = placeholders(shop)
    missing = [k for k, v in values.items() if not v]
    if missing:
        sys.exit(f"Not building: fill in ops/config.json shop values for {', '.join(missing)}")
    for k, v in values.items():
        if k.startswith("PAYMENT_LINK") and not v.startswith("https://"):
            sys.exit(f"{k} must be an https:// link")
    shutil.rmtree(OUT, ignore_errors=True)
    shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns("build.py", "*.test.js"))
    for page in OUT.rglob("*.html"):
        text = page.read_text()
        for k, v in values.items():
            text = text.replace(k, v)
        page.write_text(text)
    print(f"Built {OUT}")


if __name__ == "__main__":
    build()
