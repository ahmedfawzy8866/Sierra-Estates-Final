import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { fetchListings } from "../lib/apiClient";
import type { ApiListing } from "../lib/apiClient";

export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  compound: string;
  purpose: "for-sale" | "for-rent";
  propertyType: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  pfReferenceNumber?: string | null;
  ai_score?: number;
  currency?: string;
  description?: string;
  location?: string;
  city?: string;
  referenceNumber?: string;
}

const LISTINGS_QUERY_KEY = ["listings"] as const;

/**
 * Sample luxury properties for New Cairo compounds.
 * Used as fallback when the REST API and Firestore are both unavailable
 * (e.g. during local dev without backend, or before Firebase is seeded).
 * Images are high-quality 4K photos from Unsplash (free commercial use).
 */
function getSampleProperties(): Property[] {
  return [
    {
      id: "sample-01",
      title: "Grand Lakefront Villa",
      titleAr: "فيلا على البحيرة",
      compound: "Mivida",
      purpose: "for-sale",
      propertyType: "villa",
      price: 28500000,
      area: 720,
      bedrooms: 5,
      bathrooms: 6,
      amenities: ["Private Pool", "Garden", "Smart Home", "24/7 Security", "Garage"],
      images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 92,
      currency: "EGP",
      description: "Contemporary 5BR lakefront villa with private infinity pool, floor-to-ceiling glass, and panoramic sunset views over Mivida's central lagoon.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-V-MIV-001",
    },
    {
      id: "sample-02",
      title: "Golf-View Palace Estate",
      titleAr: "قصر على ملاعب الجولف",
      compound: "Katameya Heights",
      purpose: "for-sale",
      propertyType: "villa",
      price: 42000000,
      area: 1100,
      bedrooms: 6,
      bathrooms: 8,
      amenities: ["Pool", "Home Theater", "Wine Cellar", "Garden", "Staff Quarters", "Garage"],
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 95,
      currency: "EGP",
      description: "Six-bedroom palace overlooking the 9th fairway of Katameya Heights. Marble foyer, double-height ceilings, private home theater, and landscaped gardens.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-V-KH-002",
    },
    {
      id: "sample-03",
      title: "Modern Palm Hills Villa",
      titleAr: "فيلا عصرية بالم هيلز",
      compound: "Palm Hills",
      purpose: "for-sale",
      propertyType: "villa",
      price: 33500000,
      area: 850,
      bedrooms: 5,
      bathrooms: 6,
      amenities: ["Lap Pool", "Smart Home", "Garden", "Clubhouse Access", "Garage"],
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 90,
      currency: "EGP",
      description: "Architect-designed 5BR villa with clean lines, smart-home automation, and a 25-meter lap pool. Walking distance to Palm Hills clubhouse.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-V-PH-003",
    },
    {
      id: "sample-04",
      title: "Furnished Apartment for Rent",
      titleAr: "شقة مفروشة للإيجار",
      compound: "Zed East",
      purpose: "for-rent",
      propertyType: "apartment",
      price: 28000,
      area: 165,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["Furnished", "Balcony", "Gym Access", "Pool Access", "Parking"],
      images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 85,
      currency: "EGP",
      description: "Move-in ready 2BR apartment with Italian kitchen, marble bathrooms, and balcony overlooking Zed East's central park. Monthly rent.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-A-ZE-004",
    },
    {
      id: "sample-05",
      title: "Sky Penthouse Collection",
      titleAr: "بنتهاوس سكاي",
      compound: "Eastown",
      purpose: "for-sale",
      propertyType: "penthouse",
      price: 14750000,
      area: 380,
      bedrooms: 4,
      bathrooms: 4,
      amenities: ["Rooftop Pool", "Panoramic View", "Terrace", "Smart Home", "Parking"],
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 88,
      currency: "EGP",
      description: "Duplex penthouse with 360° panoramic views of New Cairo, private rooftop with plunge pool, and double-height living room with skylight.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-P-ET-005",
    },
    {
      id: "sample-06",
      title: "Garden Duplex Residence",
      titleAr: "دوبلكس بحديقة",
      compound: "Hyde Park",
      purpose: "for-rent",
      propertyType: "duplex",
      price: 38000,
      area: 290,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["Garden", "Furnished", "Lake View", "Parking", "24/7 Security"],
      images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85&auto=format&fit=crop"],
      ai_score: 83,
      currency: "EGP",
      description: "Spacious 3BR duplex with direct garden access, modern kitchen, and master suite with walk-in closet. Overlooking Hyde Park's central lake.",
      location: "New Cairo",
      city: "Cairo",
      referenceNumber: "SE-D-HP-006",
    },
  ];
}

function fromApiListing(l: ApiListing): Property {
  return {
    id: l.id,
    title: l.title,
    titleAr: l.titleAr,
    compound: l.compound,
    purpose: l.purpose,
    propertyType: l.propertyType,
    price: l.price,
    area: l.area,
    bedrooms: l.beds,
    bathrooms: l.baths,
    amenities: l.amenities,
    images: l.images?.length ? l.images : l.image ? [l.image] : [],
    pfReferenceNumber: l.pfReferenceNumber,
    ai_score: (l as any).ai_score ?? (l as any).aiScore,
    currency: (l as any).currency,
    description: (l as any).description,
  };
}

const ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
];

function parsePrice(priceStr: any): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr || typeof priceStr !== "string") return 0;
  const clean = priceStr.replace(/EGP/gi, "").replace(/\s+/g, "").trim();
  if (clean.toLowerCase().endsWith("m")) return parseFloat(clean) * 1_000_000;
  if (clean.toLowerCase().endsWith("k")) return parseFloat(clean) * 1_000;
  return parseFloat(clean) || 0;
}

/**
 * Maps a raw Firestore document to the client Property shape.
 * Handles both the internal seeded schema (bedrooms/bathrooms/compound)
 * and the PropertyFinder synced schema (beds/baths/cmp/pfReferenceNumber).
 */
function fromFirestoreDoc(id: string, data: Record<string, any>): Property {
  const priceNum = typeof data.price === "number" ? data.price : parsePrice(data.price);
  const typeLower = (data.propertyType || data.type || "apartment").toLowerCase();

  let imgIndex = typeof data.img === "number" ? data.img : 0;
  const fallback = ESTATE_IMAGES[imgIndex % ESTATE_IMAGES.length];
  // Prefer featuredImage (seeded data) → image (PF synced) → fallback
  const primaryImage = data.featuredImage || data.image || data.coverPhoto || fallback;
  const images = data.images && data.images.length > 0 ? data.images : [primaryImage];

  return {
    id,
    title: data.title || `${data.type || "Property"} in ${data.cmp || data.compound || "Sierra Estates"}`,
    titleAr: data.titleAr || undefined,
    compound: data.compound || data.cmp || data.location || data.city || "",
    purpose: data.purpose || (data.monthlyRent ? "for-rent" : "for-sale"),
    propertyType: typeLower,
    price: priceNum,
    area: data.area || 0,
    bedrooms: data.bedrooms || data.beds || 0,
    bathrooms: data.bathrooms || data.baths || Math.max(1, (data.bedrooms || data.beds || 1) - 1),
    amenities: data.amenities?.length ? data.amenities : ["24/7 Security", "Private Garden", "Parking", "Clubhouse"],
    images,
    pfReferenceNumber: data.pfReferenceNumber ?? data.referenceNumber ?? null,
    ai_score: data.ai_score ?? data.aiScore ?? data.ai,
    currency: data.currency || "EGP",
    description: data.description || data.descriptionAr || "",
    location: data.location || data.city || "",
    city: data.city || "",
    referenceNumber: data.referenceNumber || data.pfReferenceNumber || data.code || id,
  };
}

export function useProperties(
  mode: string,
  selCmps: string[],
  rooms: number | null,
  sort: string
) {
  const queryClient = useQueryClient();

  // Initial data load — tries REST API, falls back to sample data so the
  // UI always shows listings even if the backend is down or not configured.
  const { data: rawListings, isLoading } = useQuery<Property[]>({
    queryKey: LISTINGS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await fetchListings({ limit: 200 });
        if (res.listings && res.listings.length > 0) {
          return res.listings.map(fromApiListing);
        }
        // API returned empty — use sample data so the UI isn't blank
        return getSampleProperties();
      } catch (err) {
        console.warn("REST API unavailable — using sample data:", err);
        return getSampleProperties();
      }
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  // Real-time Firestore listener — this is the PRIMARY data source.
  // Firestore has `allow read: if true` on /listings so no auth needed.
  // When the snapshot fires, it overwrites the REST cache with live data.
  // If Firebase isn't configured or the collection is empty, the REST API
  // or sample data fallback below handles it.
  useEffect(() => {
    // Guard: skip if Firebase isn't configured (avoids console errors in dev)
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return;

    const unsubscribe = onSnapshot(
      collection(db, "listings"),
      (snapshot) => {
        const properties = snapshot.docs.map((doc) => fromFirestoreDoc(doc.id, doc.data()));
        if (properties.length > 0) {
          queryClient.setQueryData(LISTINGS_QUERY_KEY, properties);
        }
      },
      (error) => {
        console.warn("Firestore listener error, falling back to REST polling:", error.message);
      }
    );
    return () => unsubscribe();
  }, [queryClient]);

  const { data, total } = useMemo(() => {
    let results = rawListings ? [...rawListings] : [];

    // Mode filter
    if (mode === "rent") results = results.filter((p) => p.purpose === "for-rent");
    else if (mode === "resale") results = results.filter((p) => p.purpose === "for-sale");

    // Bedroom filter
    if (rooms) results = results.filter((p) => p.bedrooms === rooms);

    // Compound filter
    if (selCmps.length > 0) {
      results = results.filter((p) =>
        selCmps.some((c) => p.compound?.toLowerCase().includes(c.toLowerCase()))
      );
    }

    // Sort
    if (sort === "priceLow") results.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") results.sort((a, b) => b.price - a.price);
    else if (sort === "area") results.sort((a, b) => b.area - a.area);

    return { data: results, total: results.length };
  }, [rawListings, mode, selCmps, rooms, sort]);

  const hasData = rawListings != null && rawListings.length > 0;
  return { data, total, loading: isLoading && !hasData };
}
