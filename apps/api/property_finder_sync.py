#!/usr/bin/env python3
"""
Sierra Estates Realty - Property Finder Integration Hub
---------------------------------------------
Manages real-time data sync, formatting, and translation of
Portfolio Assets for optimal exposure and alignment.

Terminological Standards:
- Portfolio Assets (never listings)
- Strategic Pipeline (never CRM)
- Investment Stakeholders (never leads)
"""

import os
import requests
from typing import Optional


class PropertyFinderSyncHub:
    def __init__(self):
        self.base_url = os.getenv("PROPERTY_FINDER_API_BASE", "https://api.propertyfinder.com.eg/v3")
        self.token    = os.getenv("PROPERTY_FINDER_JWT_TOKEN", "")

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type":  "application/json",
        }

    def fetch_listings(self, location_id: str = "cairo-new-cairo", limit: int = 100) -> list:
        try:
            res = requests.get(
                f"{self.base_url}/properties",
                headers=self._headers(),
                params={"location_id": location_id, "limit": limit, "sort_by": "date"},
                timeout=30,
            )
            res.raise_for_status()
            return res.json().get("data", [])
        except Exception as e:
            print(f"[PropertyFinderSyncHub] fetch_listings failed: {e}")
            return []

    def push_listing(self, listing: dict) -> Optional[str]:
        try:
            res = requests.post(
                f"{self.base_url}/properties",
                headers=self._headers(),
                json=listing,
                timeout=30,
            )
            res.raise_for_status()
            return res.json().get("id")
        except Exception as e:
            print(f"[PropertyFinderSyncHub] push_listing failed: {e}")
            return None
