"""
core-modules/schema.py — Shared business logic (Single Source of Truth).

DRY enforcement: the 21-compound matrix and listing schema live HERE and only
here. engine_core.py, the orchestration layer, and any future bot import from
this module — never redefine these constants locally.
"""

from __future__ import annotations

from typing import Any

# ── The 21-compound target matrix (New Cairo / Greater Cairo) ────────────────
COMPOUND_MATRIX: tuple[str, ...] = (
    "Mivida",
    "Mountain View iCity",
    "Hyde Park",
    "Villette",
    "Taj City",
    "Fifth Square",
    "Stone Residence",
    "Palm Hills New Cairo",
    "The Waterway",
    "Sarai",
    "Uptown Cairo",
    "Eastown",
    "Madinaty",
    "Al Rehab",
    "Katameya Heights",
    "Lake View Residence",
    "Galleria Moon Valley",
    "Cairo Gate",
    "Zed East",
    "Bloomfields",
    "Sodic East",
)

# Canonical listing fields and their target types.
_SCHEMA: dict[str, type] = {
    "compound": str,
    "unit_type": str,
    "bedrooms": int,
    "bathrooms": int,
    "area_sqm": int,
    "price_egp": int,
    "finishing": str,
    "delivery": str,
    "raw_contact": str,
}

_NULLABLE = {"bedrooms", "bathrooms", "area_sqm", "delivery", "finishing", "raw_contact"}


def normalize_listing(parsed: dict[str, Any]) -> dict[str, Any]:
    """Coerce a raw Gemini-parsed dict into the canonical schema shape."""
    out: dict[str, Any] = {}
    for field, ftype in _SCHEMA.items():
        val = parsed.get(field)
        if val in (None, "", "null"):
            out[field] = None
            continue
        try:
            out[field] = ftype(val) if ftype is not int else int(float(str(val).replace(",", "")))
        except (ValueError, TypeError):
            out[field] = None
    return out


def validate_listing(listing: dict[str, Any]) -> tuple[bool, str]:
    """Return (ok, reason). A listing is valid when it maps to a known compound
    and carries a usable price — everything else may be null."""
    if listing.get("compound") not in COMPOUND_MATRIX:
        return False, "compound_not_in_matrix"
    if not listing.get("price_egp") or listing["price_egp"] <= 0:
        return False, "missing_or_invalid_price"
    missing_required = [
        f for f, t in _SCHEMA.items()
        if f not in _NULLABLE and listing.get(f) in (None, "")
    ]
    if missing_required:
        return False, f"missing_required:{','.join(missing_required)}"
    return True, "ok"
