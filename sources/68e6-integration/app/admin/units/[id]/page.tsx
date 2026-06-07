'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Home, DollarSign, Maximize, Bed, Bath, Image } from 'lucide-react';
import Link from 'next/link';
import { COLLECTIONS } from '@/lib/models/schema';

interface UnitDetail {
  id: string;
  title?: string;
  location?: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  status?: string;
  description?: string;
  featuredImage?: string;
}

export default function UnitDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.portfolioAssets, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUnit({ id: docSnap.id, ...docSnap.data() } as UnitDetail);
        }
      } catch (err) {
        console.error('Unit load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadUnit();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#C9A24A] text-2xl animate-spin mb-4">⟳</div>
          <p className="text-[#3a5570]">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#3a5570] text-lg mb-4">Property not found</p>
          <Link href="/admin/units" className="text-[#C9A24A] font-semibold hover:underline">
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/admin/units"
          className="flex items-center gap-2 text-[#C9A24A] font-semibold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Inventory
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {unit.featuredImage && (
            <div className="w-full h-96 bg-slate-200 flex items-center justify-center overflow-hidden relative">
              <img
                src={unit.featuredImage}
                alt={unit.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const icon = document.createElement('div');
                    icon.innerHTML = '🏠';
                    icon.className = 'text-6xl';
                    parent.innerHTML = '';
                    parent.appendChild(icon);
                  }
                }}
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">{unit.title || 'Untitled'}</h1>

            <div className="flex items-center gap-2 text-[#3a5570]/60 mb-8">
              <MapPin size={20} className="text-[#C9A24A]" />
              {unit.location || 'Unknown location'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center">
                    <DollarSign size={24} className="text-[#C9A24A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3a5570]/60 font-semibold">PRICE</p>
                    <p className="text-2xl font-bold text-[#071422]">
                      EGP {unit.price ? (unit.price / 1_000_000).toFixed(1) : '0'}M
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Maximize size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3a5570]/60 font-semibold">AREA</p>
                    <p className="text-2xl font-bold text-[#071422]">{unit.area || '0'} sqm</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {unit.bedrooms !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Bed size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">BEDROOMS</p>
                      <p className="text-2xl font-bold text-[#071422]">{unit.bedrooms}</p>
                    </div>
                  </div>
                )}

                {unit.bathrooms !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bath size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#3a5570]/60 font-semibold">BATHROOMS</p>
                      <p className="text-2xl font-bold text-[#071422]">{unit.bathrooms}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#3a5570]/60 uppercase tracking-widest mb-2">
                  Property Type
                </p>
                <p className="text-lg text-[#071422] font-semibold capitalize">{unit.propertyType || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#3a5570]/60 uppercase tracking-widest mb-2">Status</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest ${
                  unit.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : unit.status === 'sold'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {unit.status || 'unknown'}
                </span>
              </div>

              {unit.description && (
                <div>
                  <p className="text-sm font-semibold text-[#3a5570]/60 uppercase tracking-widest mb-2">
                    Description
                  </p>
                  <p className="text-[#3a5570] leading-relaxed">{unit.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
