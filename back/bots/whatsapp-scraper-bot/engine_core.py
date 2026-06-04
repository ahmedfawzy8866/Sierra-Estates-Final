#!/usr/bin/env python3
"""
Sierra Estates 1.0 — engine_core.py
====================================
Single Source of Truth for the WhatsApp → Gemini → Firestore ingestion pipeline.

Anti-Gravity role: TIER-2 WRITE-CONTROL. This is the ONLY process authorized to
write Portfolio Assets into Firestore (via the firebase-admin service account,
which bypasses client security rules by design). The Vercel client hub is
strictly read-only and never imports this module.

Flow:
    raw WhatsApp text/Base64  ──>  Gemini 1.5 Pro (structured parse)
                              ──>  core-modules schema validation (21-compound matrix)
                              ──>  Firestore `listings/` upsert (dedupe by content hash)
                              ──>  Telegram heartbeat on success/failure

Run as a daemon via devops/sierra-engine.service (systemd) or devops/run_engine.sh.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any

import google.generativeai as genai
import requests
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

import firebase_admin
from firebase_admin import credentials, firestore

# core-modules is the shared business-logic package (DRY: schema lives in ONE place)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from packages.core_modules.schema import COMPOUND_MATRIX, normalize_listing, validate_listing

# ──────────────────────────────────────────────────────────────────────────────
# 0. Config & credential vault (.env) — fail fast if anything required is missing
# ──────────────────────────────────────────────────────────────────────────────
load_dotenv(os.environ.get("SIERRA_ENV_FILE", "/etc/sierra-estates/.env"))

REQUIRED_ENV = ("GEMINI_API_KEY", "FIREBASE_CONFIG")
_missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
if _missing:
    raise SystemExit(f"FATAL: missing required env var(s): {', '.join(_missing)}")

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
FIREBASE_CONFIG = os.environ["FIREBASE_CONFIG"]            # path to service-account JSON
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
POLL_INTERVAL_SEC = int(os.environ.get("POLL_INTERVAL_SEC", "60"))
AGENT_STATE_DIR = Path(os.environ.get("AGENT_STATE_DIR", str(Path(__file__).resolve().parents[2] / ".agent")))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] engine_core: %(message)s",
)
log = logging.getLogger("engine_core")

# ──────────────────────────────────────────────────────────────────────────────
# 1. Service clients (initialized once)
# ──────────────────────────────────────────────────────────────────────────────
genai.configure(api_key=GEMINI_API_KEY)
_model = genai.GenerativeModel("gemini-1.5-pro")

if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(FIREBASE_CONFIG))
_db = firestore.client()


def heartbeat(message: str) -> None:
    """Best-effort Telegram ping; never raises (telemetry must not crash the engine)."""
    if not (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID):
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": f"🛰️ Sierra engine: {message}"},
            timeout=10,
        )
    except requests.RequestException as exc:  # noqa: BLE001 - telemetry is non-critical
        log.warning("heartbeat failed: %s", exc)


def _uptime_flag(state: str) -> None:
    """Write an uptime/telemetry flag into .agent/ for the orchestration layer."""
    AGENT_STATE_DIR.mkdir(parents=True, exist_ok=True)
    (AGENT_STATE_DIR / "uptime.flag").write_text(
        json.dumps({"state": state, "ts": time.time()}), encoding="utf-8"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 2. Gemini structured parse (retry with exponential backoff)
# ──────────────────────────────────────────────────────────────────────────────
_PARSE_PROMPT = """You are a real-estate listing parser for the New Cairo market.
Extract a SINGLE JSON object from the WhatsApp message below. Use exactly these keys:
  compound, unit_type, bedrooms, bathrooms, area_sqm, price_egp, finishing, delivery, raw_contact
- `compound` MUST be one of: {compounds}. If none match, use "UNKNOWN".
- Numbers must be integers (no separators, no currency symbols). Use null when absent.
Return ONLY the JSON object, no prose, no code fences.

MESSAGE:
\"\"\"{message}\"\"\"
"""


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=20))
def parse_with_gemini(message: str) -> dict[str, Any]:
    prompt = _PARSE_PROMPT.format(compounds=", ".join(COMPOUND_MATRIX), message=message)
    resp = _model.generate_content(prompt)
    text = (resp.text or "").strip().lstrip("`").lstrip("json").strip("`").strip()
    return json.loads(text)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=20))
def push_to_firestore(listing: dict[str, Any]) -> str:
    """Idempotent upsert keyed by a content hash so re-runs never duplicate."""
    doc_id = hashlib.sha256(
        f"{listing['compound']}|{listing['unit_type']}|{listing['price_egp']}|{listing['area_sqm']}".encode()
    ).hexdigest()[:24]
    listing["id"] = doc_id
    listing["status"] = listing.get("status", "published")
    listing["updated_at"] = firestore.SERVER_TIMESTAMP
    _db.collection("listings").document(doc_id).set(listing, merge=True)
    return doc_id


# ──────────────────────────────────────────────────────────────────────────────
# 3. Ingestion unit
# ──────────────────────────────────────────────────────────────────────────────
def ingest_message(raw: str) -> str | None:
    parsed = parse_with_gemini(raw)
    listing = normalize_listing(parsed)
    ok, reason = validate_listing(listing)
    if not ok:
        log.warning("rejected listing (%s): %s", reason, parsed)
        return None
    doc_id = push_to_firestore(listing)
    log.info("ingested listing %s (%s, %s EGP)", doc_id, listing["compound"], listing["price_egp"])
    return doc_id


def fetch_pending_messages() -> list[str]:
    """Pull unprocessed WhatsApp messages from the Firestore intake queue.

    The WhatsApp webhook (Tier-2 Vercel route) writes raw inbound messages to
    `whatsapp_intake/` with processed=false. We drain and mark them here.
    """
    q = _db.collection("whatsapp_intake").where("processed", "==", False).limit(20)
    out: list[str] = []
    for snap in q.stream():
        data = snap.to_dict() or {}
        body = data.get("body", "")
        out.append(body)
        snap.reference.update({"processed": True})
    return out


# ──────────────────────────────────────────────────────────────────────────────
# 4. Daemon loop — robust against transient failures, leak-resistant
# ──────────────────────────────────────────────────────────────────────────────
def run_forever() -> None:
    log.info("engine_core online | %d compounds in matrix | poll=%ds", len(COMPOUND_MATRIX), POLL_INTERVAL_SEC)
    heartbeat("online")
    _uptime_flag("online")
    while True:
        try:
            messages = fetch_pending_messages()
            for raw in messages:
                try:
                    ingest_message(raw)
                except (json.JSONDecodeError, KeyError) as exc:
                    log.error("unparseable message skipped: %s", exc)
            if messages:
                _uptime_flag("active")
        except Exception as exc:  # noqa: BLE001 - loop must survive any single-cycle error
            log.exception("cycle failed: %s", exc)
            heartbeat(f"cycle error: {exc}")
            _uptime_flag("degraded")
        time.sleep(POLL_INTERVAL_SEC)


if __name__ == "__main__":
    try:
        run_forever()
    except KeyboardInterrupt:
        log.info("engine_core stopped by signal")
        heartbeat("stopped")
        _uptime_flag("stopped")
