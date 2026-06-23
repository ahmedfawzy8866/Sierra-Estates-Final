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

  // Initial data load — tries REST API, falls back gracefully to empty array
  // so the Firestore real-time listener below can fill in the data.
  const { data: rawListings, isLoading } = useQuery({
    queryKey: LISTINGS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await fetchListings({ limit: 200 });
        return res.listings.map(fromApiListing);
      } catch (err) {
        console.warn("REST API unavailable — Firestore listener will provide data:", err);
        return [] as Property[];
      }
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  // Real-time Firestore listener — this is the PRIMARY data source.
  // Firestore has `allow read: if true` on /listings so no auth needed.
  // When the snapshot fires, it overwrites the REST cache with live data.
  useEffect(() => {
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

  return { data, total, loading: isLoading && !rawListings?.length };
}
