'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Layers, CheckCircle, X } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface ComparisonProperty {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  location: string;
  pricePerSqm: number;
}

export default function PropertyComparisonPage() {
  const [allProperties, setAllProperties] = useState<ComparisonProperty[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const propsSnap = await getDocs(collection(db, COLLECTIONS.portfolioAssets));
        const props = propsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            price: data.price || 0,
            area: data.area || 0,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            propertyType: data.propertyType || 'apartment',
            location: data.location || 'Unknown',
            pricePerSqm: data.area ? (data.price || 0) / data.area : 0,
          } as ComparisonProperty;
        });

        setAllProperties(props.sort((a, b) => b.price - a.price));
        setSelected(props.slice(0, 2).map(p => p.id));
      } catch (err) {
        console.error('Property load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const selectedProps = allProperties.filter(p => selected.includes(p.id));

  const comparison = {
    avgPrice: selectedProps.length > 0
      ? selectedProps.reduce((sum, p) => sum + p.price, 0) / selectedProps.length
      : 0,
    avgArea: selectedProps.length > 0
      ? selectedProps.reduce((sum, p) => sum + p.area, 0) / selectedProps.length
      : 0,
    avgPricePerSqm: selectedProps.length > 0
      ? selectedProps.reduce((sum, p) => sum + p.pricePerSqm, 0) / selectedProps.length
      : 0,
  };

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Property Comparison Tool</h1>
        <p className="text-[#3a5570]/60">Compare up to 5 properties side-by-side</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#071422] mb-4 flex items-center gap-2">
              <Layers size={20} className="text-[#C9A24A]" />
              Select Properties
            </h2>

            {loading ? (
              <div className="text-center text-slate-400 py-8">Loading...</div>
            ) : (
              <div className="space-y-3">
                {allProperties.map((prop) => (
                  <motion.button
                    key={prop.id}
                    onClick={() => toggleSelection(prop.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                      selected.includes(prop.id)
                        ? 'border-[#C9A24A] bg-[#C9A24A]/5'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#071422] line-clamp-1">{prop.title}</div>
                    <div className="text-xs text-[#3a5570]/60 mt-1">{prop.location}</div>
                    <div className="text-sm font-bold text-[#C9A24A] mt-2">
                      EGP {(prop.price / 1_000_000).toFixed(1)}M
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {selectedProps.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-slate-400 mb-4">Select properties from the left to compare</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-slate-50 to-transparent border-b border-slate-200">
                  <h2 className="text-xl font-bold text-[#071422]">Comparison Overview</h2>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#071422]">Property</th>
                      {selectedProps.map((prop) => (
                        <th key={prop.id} className="px-6 py-4 text-left text-sm font-semibold text-[#071422]">
                          <button
                            onClick={() => toggleSelection(prop.id)}
                            className="text-[#C9A24A] hover:text-[#071422] transition-colors"
                          >
                            ✕
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      {
                        label: 'Price',
                        values: selectedProps.map(p => `EGP ${(p.price / 1_000_000).toFixed(1)}M`),
                      },
                      {
                        label: 'Area (sqm)',
                        values: selectedProps.map(p => `${p.area.toLocaleString()}`),
                      },
                      {
                        label: 'Price/sqm',
                        values: selectedProps.map(p => `EGP ${Math.round(p.pricePerSqm).toLocaleString()}`),
                      },
                      {
                        label: 'Type',
                        values: selectedProps.map(p => p.propertyType),
                      },
                      {
                        label: 'Location',
                        values: selectedProps.map(p => p.location),
                      },
                      {
                        label: 'Bedrooms',
                        values: selectedProps.map(p => p.bedrooms || '—'),
                      },
                      {
                        label: 'Bathrooms',
                        values: selectedProps.map(p => p.bathrooms || '—'),
                      },
                    ].map((row) => (
                      <tr key={row.label} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#071422] text-sm">{row.label}</td>
                        {row.values.map((value, idx) => (
                          <td key={idx} className="px-6 py-4 text-sm text-[#3a5570]">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="px-6 py-6 bg-gradient-to-r from-[#C9A24A]/10 to-transparent border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-[#071422] mb-4">Average Metrics</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-[#3a5570]/60 mb-1">Avg Price</div>
                      <div className="text-2xl font-bold text-[#C9A24A]">
                        EGP {(comparison.avgPrice / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#3a5570]/60 mb-1">Avg Area</div>
                      <div className="text-2xl font-bold text-[#071422]">
                        {Math.round(comparison.avgArea).toLocaleString()} sqm
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#3a5570]/60 mb-1">Avg Price/sqm</div>
                      <div className="text-2xl font-bold text-[#071422]">
                        EGP {Math.round(comparison.avgPricePerSqm).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
