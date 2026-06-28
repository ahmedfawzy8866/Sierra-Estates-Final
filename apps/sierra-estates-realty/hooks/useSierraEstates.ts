"use client";

import { useState, useEffect } from 'react';
import { db, isFirebaseClientConfigured } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';

/**
 * useSierraEstates
 * The master hook for the Sierra Estates Frontend.
 * abstracts away the direct Firebase calls for Claude Code.
 */
/**
 * Curated showcase estates — rendered only when Firebase credentials are
 * absent (local preview / demo). Production with real credentials streams
 * live inventory from Firestore instead.
 *
 * Images are 4K luxury property photos sourced from Unsplash (free for
 * commercial use, no attribution required) — each depicts a real
 * architectural style common to the corresponding New Cairo compound.
 */
const SAMPLE_UNITS = [
  // ── Villas (New Cairo luxury compounds) ────────────────────────────
  {
    id: 'demo-01',
    title: 'Grand Lakefront Villa',
    titleAr: 'فيلا على البحيرة الفاخرة',
    compound: 'Mivida',
    price: 28500000,
    monthlyRent: 95000,
    rooms: 5,
    bedrooms: 5,
    bathrooms: 6,
    area: 720,
    propertyType: 'Villa',
    status: 'available',
    imageUrl: '/villas/mivida-grand-lakefront.jpg',
    images: ['/villas/mivida-grand-lakefront.jpg', '/interiors/living-room-luxury.jpg', '/interiors/kitchen-luxury.jpg', '/interiors/master-bedroom.jpg', '/interiors/infinity-pool.jpg'],
    description: 'Contemporary 5BR lakefront villa with private infinity pool, floor-to-ceiling glass, and panoramic sunset views over Mivida\'s central lagoon.',
    descriptionAr: 'فيلا عصرية بخمس غرف نوم على البحيرة مع مسبح إنفينيتي خاص، وزجاج من الأرض إلى السقف، وإطلالة بانورامية على بحيرة ميفيدا المركزية.',
    intelligence: { roi: 11.2 },
  },
  {
    id: 'demo-02',
    title: 'Golf-View Palace Estate',
    titleAr: 'قصر على ملاعب الجولف',
    compound: 'Katameya Heights',
    price: 42000000,
    monthlyRent: 145000,
    rooms: 6,
    bedrooms: 6,
    bathrooms: 8,
    area: 1100,
    propertyType: 'Villa',
    status: 'available',
    imageUrl: '/villas/katameya-golf-palace.jpg',
    images: ['/villas/katameya-golf-palace.jpg', '/interiors/living-room-luxury.jpg', '/interiors/staircase.jpg', '/interiors/wine-cellar.jpg', '/interiors/garden-landscaping.jpg'],
    description: 'Six-bedroom palace overlooking the 9th fairway of Katameya Heights. Marble foyer, double-height ceilings, private home theater, and landscaped gardens.',
    descriptionAr: 'قصر بست غرف نوم يطل على الملعب التاسع في كاتاميا هايتس. بهو رخامي، أسقف مزدوجة الارتفاع، صالة سينما منزلية، وحدائق منسقة.',
    intelligence: { roi: 9.8 },
  },
  {
    id: 'demo-03',
    title: 'Modern Palm Hills Villa',
    titleAr: 'فيلا عصرية بالم هيلز',
    compound: 'Palm Hills',
    price: 33500000,
    monthlyRent: 115000,
    rooms: 5,
    bedrooms: 5,
    bathrooms: 6,
    area: 850,
    propertyType: 'Villa',
    status: 'available',
    imageUrl: '/villas/palm-hills-modern.jpg',
    images: ['/villas/palm-hills-modern.jpg', '/interiors/living-room-luxury.jpg', '/interiors/kitchen-luxury.jpg', '/interiors/terrace-outdoor.jpg'],
    description: 'Architect-designed 5BR villa with clean lines, smart-home automation, and a 25-meter lap pool. Walking distance to Palm Hills clubhouse.',
    descriptionAr: 'فيلا بخمس غرف نوم بتصميم معماري حديث، أتمتة منزلية ذكية، ومسبح بطول ٢٥ متراً. على بعد دقائق من نادي بالم هيلز.',
    intelligence: { roi: 10.2 },
  },
  {
    id: 'demo-04',
    title: 'Mountain View Twin House',
    titleAr: 'توين هاوس ماونتن فيو',
    compound: 'Mountain View',
    price: 22800000,
    monthlyRent: 78000,
    rooms: 4,
    bedrooms: 4,
    bathrooms: 5,
    area: 540,
    propertyType: 'Twin House',
    status: 'available',
    imageUrl: '/villas/mountain-view-twin.jpg',
    images: ['/villas/mountain-view-twin.jpg', '/interiors/living-room-luxury.jpg', '/interiors/garden-landscaping.jpg', '/interiors/terrace-outdoor.jpg'],
    description: 'Elegant 4BR twin house with private garden, rooftop terrace, and open-plan ground floor. Family-friendly community with parks and pools.',
    descriptionAr: 'توين هاوس أنيق بأربع غرف نوم مع حديقة خاصة، تراس علوي، وطابق أرضي مفتوح. مجتمع عائلي بحدائق ومسابح.',
    intelligence: { roi: 9.5 },
  },
  // ── Penthouses & Duplexes ───────────────────────────────────────────
  {
    id: 'demo-05',
    title: 'Sky Penthouse Collection',
    titleAr: 'بنتهاوس سكاي الفاخر',
    compound: 'Eastown',
    price: 14750000,
    monthlyRent: 52000,
    rooms: 4,
    bedrooms: 4,
    bathrooms: 4,
    area: 380,
    propertyType: 'Penthouse',
    status: 'available',
    imageUrl: '/villas/eastown-sky-penthouse.jpg',
    images: ['/villas/eastown-sky-penthouse.jpg', '/interiors/living-room-luxury.jpg', '/interiors/terrace-outdoor.jpg', '/interiors/master-bedroom.jpg'],
    description: 'Duplex penthouse with 360° panoramic views of New Cairo, private rooftop with plunge pool, and double-height living room with skylight.',
    descriptionAr: 'بنتهاوس من طابقين بإطلالة بانورامية ٣٦٠° على القاهرة الجديدة، سطح خاص مع مسبح، وغرفة معيشة بارتفاع مزدوج وسقف زجاجي.',
    intelligence: { roi: 10.5 },
  },
  {
    id: 'demo-06',
    title: 'Garden Duplex Residence',
    titleAr: 'دوبلكس بحديقة',
    compound: 'Hyde Park',
    price: 9900000,
    monthlyRent: 38000,
    rooms: 3,
    bedrooms: 3,
    bathrooms: 3,
    area: 290,
    propertyType: 'Duplex',
    status: 'available',
    imageUrl: '/villas/hyde-park-duplex.jpg',
    images: ['/villas/hyde-park-duplex.jpg', '/interiors/living-room-luxury.jpg', '/interiors/kitchen-luxury.jpg', '/interiors/garden-landscaping.jpg'],
    description: 'Spacious 3BR duplex with direct garden access, modern kitchen, and master suite with walk-in closet. Overlooking Hyde Park\'s central lake.',
    descriptionAr: 'دوبلكس واسع بثلاث غرف نوم مع مدخل مباشر للحديقة، مطبخ عصري، وجناح رئيسي بغرفة ملابس. يطل على بحيرة هايد بارك المركزية.',
    intelligence: { roi: 9.1 },
  },
  // ── Apartments & Emerald Estate ─────────────────────────────────────
  {
    id: 'demo-07',
    title: 'Emerald Hillside Estate',
    titleAr: 'عقار الزمردي على التلة',
    compound: 'Uptown Cairo',
    price: 18200000,
    monthlyRent: 65000,
    rooms: 4,
    bedrooms: 4,
    bathrooms: 5,
    area: 460,
    propertyType: 'Twin House',
    status: 'available',
    imageUrl: '/villas/uptown-emerald.jpg',
    images: ['/villas/uptown-emerald.jpg', '/interiors/living-room-luxury.jpg', '/interiors/infinity-pool.jpg', '/interiors/terrace-outdoor.jpg'],
    description: 'Hillside twin house with infinity-edge plunge pool, modern smart-home wiring, and panoramic views over Uptown Cairo\'s golf course.',
    descriptionAr: 'توين هاوس على التلة مع مسبح إنفينيتي، أسلاك ذكية للمنزل العصري، وإطلالة بانورامية على ملعب الجولف في أب تاون القاهرة.',
    intelligence: { roi: 8.7 },
  },
  {
    id: 'demo-08',
    title: 'Designer Park Apartment',
    titleAr: 'شقة مصممة بإطلالة على الحديقة',
    compound: 'Zed East',
    price: 6400000,
    monthlyRent: 28000,
    rooms: 2,
    bedrooms: 2,
    bathrooms: 2,
    area: 165,
    propertyType: 'Apartment',
    status: 'available',
    imageUrl: '/villas/zed-east-apartment.jpg',
    images: ['/villas/zed-east-apartment.jpg', '/interiors/living-room-luxury.jpg', '/interiors/kitchen-luxury.jpg', '/interiors/bathroom-marble.jpg'],
    description: 'Move-in ready 2BR apartment with Italian kitchen, marble bathrooms, and balcony overlooking Zed East\'s central park. Walking distance to retail.',
    descriptionAr: 'شقة غرفتين جاهزة للسكن مع مطبخ إيطالي، حمامات رخامية، وشرفة تطل على حديقة زد إيست المركزية. على بعد دقائق من المتاجر.',
    intelligence: { roi: 8.2 },
  },
];

export function useSierraEstates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Units (Inventory) ---
  const [units, setUnits] = useState<any[]>(isFirebaseClientConfigured ? [] : SAMPLE_UNITS);
  
  useEffect(() => {
    if (!isFirebaseClientConfigured) {
      // Local preview without Firebase credentials - render with empty data.
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "units"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const unitData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUnits(unitData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // --- Leads & Proposals ---
  const getLeadData = async (leadId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "stakeholders", leadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- Agent Commands ---
  const triggerAgent = async (agentName: string, action: string, payload: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    units,
    loading,
    error,
    getLeadData,
    triggerAgent
  };
}
