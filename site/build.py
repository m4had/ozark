#!/usr/bin/env python3
"""Build the deployable site into _site/: fill in seller details, point every "Buy" button at the USDC
crypto checkout, and copy the downloadable products.

Refuses to build while legally required seller details are missing or the payment network is unconfirmed,
so a page that can't lawfully or safely take payment never goes live.
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT, DIST = ROOT / "site", ROOT / "_site", ROOT / "dist"


def check(cfg):
    shop, crypto = cfg["shop"], cfg["crypto_checkout"]
    problems = [f"shop.{k}" for k in ("seller_legal_name", "seller_address", "contact_email") if not shop.get(k)]
    if not crypto.get("network_confirmed"):
        problems.append("crypto_checkout.network_confirmed (owner must confirm the wallet receives USDC on "
                        f"{crypto['network']})")
    if crypto.get("address") != cfg.get("payout_address_on_file"):
        problems.append("crypto_checkout.address must match payout_address_on_file")
    return problems


def add_google_verification(token):
    """Google Search Console: either an HTML verification file or a meta tag on the home page."""
    if not token:
        return
    token = token.strip()
    if re.fullmatch(r"google[0-9a-f]+\.html", token):
        (OUT / token).write_text(f"google-site-verification: {token}")
    elif re.fullmatch(r"[A-Za-z0-9_-]{20,80}", token):
        home = OUT / "index.html"
        tag = f'<meta name="google-site-verification" content="{token}">'
        home.write_text(home.read_text().replace("</title>", "</title>" + tag, 1))
    else:
        sys.exit("search.google_site_verification must be the meta tag's content value or a googleXXXX.html file name")


def build():
    cfg = json.loads((ROOT / "ops" / "config.json").read_text())
    problems = check(cfg)
    if problems:
        sys.exit("Not building. Missing: " + "; ".join(problems))
    shop, crypto, catalog = cfg["shop"], cfg["crypto_checkout"], cfg["catalog"]
    shutil.rmtree(OUT, ignore_errors=True)
    shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns("*.py", "*.test.js"))
    (OUT / "dl").mkdir()
    products = {}
    for key, p in catalog.items():
        if key.startswith("_"):
            continue
        if p.get("file"):
            shutil.copy(DIST / p["file"], OUT / "dl" / p["file"])
        products[key] = {"name": p["name"], "gbp": p["gbp"], "usdc": p["usdc"],
                         "file": f"dl/{p['file']}" if p.get("file") else None}
    (OUT / "checkout-config.js").write_text("window.CHECKOUT = " + json.dumps({
        "address": crypto["address"], "network": crypto["network"], "contact": shop["contact_email"],
        "products": products}, indent=1) + ";\n")
    values = {"SELLER_LEGAL_NAME": shop["seller_legal_name"], "SELLER_ADDRESS": shop["seller_address"],
              "CONTACT_EMAIL": shop["contact_email"],
              **{f"PAYMENT_LINK_{k.upper()}": f"pay.html?p={k}" for k in products}}
    for page in OUT.rglob("*.html"):
        text = page.read_text()
        for k, v in values.items():
            text = text.replace(k, v)
        page.write_text(text)
    add_google_verification(cfg.get("search", {}).get("google_site_verification"))
    print(f"Built {OUT}")


if __name__ == "__main__":
    build()
