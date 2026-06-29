import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const doc = await adminDb.collection(COLLECTIONS.units).doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ success: false, error: 'Portfolio Asset not found' }, { status: 404 });
      }
      const data = doc.data()!;
      return NextResponse.json({ 
        success: true, 
        asset: {
          id: doc.id,
          ...data,
          residences: data.bedrooms || 0,
          washrooms: data.bathrooms || 0,
          areaSqM: data.area || 0,
          assetType: data.propertyType || data.type || 'apartment',
        } 
      });
    }

    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const type = searchParams.get('type');
    const compound = searchParams.get('compound');
    const beds = searchParams.get('beds');
    const maxPrice = searchParams.get('maxPrice');

    let query = adminDb.collection(COLLECTIONS.units).limit(limitParam);

    if (type) query = query.where('propertyType', '==', type);
    if (compound) query = query.where('compound', '==', compound);
    if (beds) query = query.where('bedrooms', '>=', parseInt(beds, 10));
    if (maxPrice) query = query.where('price', '<=', parseInt(maxPrice, 10));

    const snapshot = await query.get();

    const assets = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        residences: data.bedrooms || 0,
        washrooms: data.bathrooms || 0,
        areaSqM: data.area || 0,
        assetType: data.propertyType || data.type || 'apartment',
      };
    });

    return NextResponse.json({ success: true, assets, count: assets.length });
  } catch (error) {
    console.error('[PORTFOLIO_ASSET_ERROR] Failed to fetch assets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
