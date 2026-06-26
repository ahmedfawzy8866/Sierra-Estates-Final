/**
 * POST /api/listings/smart-filter
 * AI-powered natural language property search.
 * Uses Gemini to parse user queries into structured filters,
 * then executes against Firestore listings collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';
import { getAIService } from '@/lib/ai';
import { applyRateLimit, publicEndpointLimiter } from '@/lib/server/rate-limit';

interface SmartFilterParams {
  query: string;  // Natural language search, e.g. "3 bedroom villa in New Cairo under 5 million"
  limit?: number;
}

interface StructuredFilter {
  propertyType?: string;
  bedrooms?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  priceMax?: number;
  priceMin?: number;
  location?: string;
  compound?: string;
  city?: string;
  offeringType?: string;
  furnishingType?: string;
  amenities?: string[];
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, publicEndpointLimiter);
  if (limited) return limited;
  try {
    const { query: userQuery, limit: resultLimit = 20 } = await request.json() as SmartFilterParams;

    if (!userQuery || typeof userQuery !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query string is required' },
        { status: 400 }
      );
    }

    // Use AI to parse the natural language query into structured filters
    const ai = getAIService();
    const filterResult = await ai.generateJSON<StructuredFilter>(
      'smart-filter',
      'parse-query',
      {
        system: `You are a real estate search assistant for Sierra Estates in Egypt. Parse the user's natural language property search query into structured filter parameters. 
        Available property types: apartment, villa, townhouse, duplex, penthouse, studio, chalet, commercial, land.
        Available offering types: sale, rent.
        Available furnishing types: fully-finished, semi-finished, core-shell, not-finished.
        Common locations in Egypt: New Cairo, Sheikh Zayed, 6th October, Maadi, Heliopolis, New Administrative Capital, Sharm El Sheikh, Ain Sokhna, Gouna, North Coast.
        Common compounds: Madinaty, Mountain View, Palm Hills, Mivida, Allegria, SODIC, Emaar, Orascom.
        Return ONLY a JSON object with the applicable filter fields. Do not include fields you cannot determine from the query.`,
        user: userQuery,
      },
      { jsonMode: true }
    );

    console.log('[SMART-FILTER] Parsed filters:', filterResult);

    // Build Firestore query from structured filters
    let query = adminDb.collection(COLLECTIONS.units);

    // Apply equality filters
    if (filterResult.propertyType) {
      query = query.where('propertyType', '==', filterResult.propertyType);
    }
    if (filterResult.bedrooms) {
      query = query.where('bedrooms', '==', filterResult.bedrooms);
    }
    if (filterResult.location) {
      query = query.where('location', '==', filterResult.location);
    }
    if (filterResult.compound) {
      query = query.where('compound', '==', filterResult.compound);
    }
    if (filterResult.offeringType) {
      query = query.where('category', '==', filterResult.offeringType === 'rent' ? 'residential' : 'residential');
    }

    // Apply ordering and limit
    query = query.orderBy('price', 'asc').limit(resultLimit);

    const snapshot = await query.get();
    let results: any[] = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Apply range filters in memory (Firestore doesn't support multiple range filters)
    if (filterResult.priceMin) {
      results = results.filter((r: any) => (r.price || 0) >= filterResult.priceMin!);
    }
    if (filterResult.priceMax) {
      results = results.filter((r: any) => (r.price || 0) <= filterResult.priceMax!);
    }
    if (filterResult.bedroomsMin) {
      results = results.filter((r: any) => (r.bedrooms || 0) >= filterResult.bedroomsMin!);
    }
    if (filterResult.bedroomsMax) {
      results = results.filter((r: any) => (r.bedrooms || 0) <= filterResult.bedroomsMax!);
    }
    if (filterResult.amenities && filterResult.amenities.length > 0) {
      results = results.filter((r: any) => {
        const listingAmenities = r.amenities || [];
        return filterResult.amenities!.every((a: string) => listingAmenities.includes(a));
      });
    }

    return NextResponse.json({
      success: true,
      query: userQuery,
      parsedFilters: filterResult,
      results,
      count: results.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown filter error';
    console.error('[SMART-FILTER] Failed:', message);
    return NextResponse.json(
      { success: false, error: `Smart filter failed: ${message}` },
      { status: 500 }
    );
  }
}
