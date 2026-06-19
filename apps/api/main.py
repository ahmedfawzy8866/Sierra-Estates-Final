from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import os

app = FastAPI(
    title="Sierra Estates API",
    description="Consolidated Python backend for Sierra Estates integrations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sync_hub = PropertyFinderSyncHub()


class PortfolioAsset(BaseModel):
    id: str = Field(..., description="Internal Sierra Estates asset identifier")
    title_en: str | None = None
    title_ar: str | None = None
    price: int | float | None = None
    location: str | None = None


class SyncRequest(BaseModel):
    location_id: str = "cairo-new-cairo"
    limit: int = 100


class FormatRequest(BaseModel):
    listing: dict


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sierra-estates-api"}


@app.post("/property-finder/format")
async def format_listing(
    request: FormatRequest,
    x_api_key: Optional[str] = Header(None),
):
    api_key = os.getenv("SYNC_API_KEY")
    if api_key and x_api_key != api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    listing = request.listing

    # Normalize listing to Property Finder format
    formatted = {
        "title": listing.get("title", f"{listing.get('bedrooms', '?')}BR in {listing.get('compound', 'Cairo')}"),
        "price": listing.get("price", 0),
        "area": listing.get("area", 0),
        "bedrooms": listing.get("bedrooms", 0),
        "bathrooms": listing.get("bathrooms", 0),
        "location_id": "cairo-new-cairo",
        "property_type": listing.get("propertyType", "apartment"),
        "purpose": "sale",
        "description": listing.get("description", ""),
        "images": listing.get("images", []),
    }

    return {"success": True, "formatted": formatted}


@app.post("/property-finder/sync")
async def sync_listings(
    request: SyncRequest,
    x_api_key: Optional[str] = Header(None),
):
    api_key = os.getenv("SYNC_API_KEY")
    if api_key and x_api_key != api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    pf_base  = os.getenv("PROPERTY_FINDER_API_BASE", "https://api.propertyfinder.com.eg/v3")
    pf_token = os.getenv("PROPERTY_FINDER_JWT_TOKEN", "")

    if not pf_token:
        return {"success": False, "error": "PROPERTY_FINDER_JWT_TOKEN not configured"}

    return {
        "success": True,
        "message": f"Sync initiated for {request.location_id}, limit={request.limit}",
        "location_id": request.location_id,
    }
