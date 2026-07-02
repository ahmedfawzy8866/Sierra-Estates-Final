'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPin, DollarSign, BarChart2 } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  compound: string;
  priceLabel: string;
  beds: number;
  baths: number;
  area: string;
  status: 'active' | 'sold' | 'inactive';
  aiScore: number;
  netCapitalRoi?: number;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'properties'), (snap) => {
      const listingsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Listing[];
      setListings(listingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'properties', listingId), {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating listing:', error);
    }
  };

  const filteredListings = filter === 'all'
    ? listings
    : listings.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Listings Management</h1>
        <p className="text-[#C9A84C]/60">Manage all active property listings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4">
        {(['all', 'active', 'sold'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === tab
                ? 'bg-[#C9A84C] text-[#071422]'
                : 'bg-[#0a1829] text-[#C9A84C] border border-[#C9A84C]/20 hover:border-[#C9A84C]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-[#C9A84C]/60">Loading listings...</div>
        ) : filteredListings.length === 0 ? (
          <div className="col-span-full text-center text-[#C9A84C]/60">No listings found</div>
        ) : (
          filteredListings.map(listing => (
            <div key={listing.id} className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C]/50 transition">
              <h3 className="text-lg font-bold text-white mb-2">{listing.title}</h3>

              <div className="space-y-2 mb-4 text-[#C9A84C]/80 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{listing.compound}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>{listing.priceLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div className="bg-[#071422] rounded p-2 text-center">
                  <p className="text-[#C9A84C]/60 text-xs">Beds</p>
                  <p className="text-white font-bold">{listing.beds}</p>
                </div>
                <div className="bg-[#071422] rounded p-2 text-center">
                  <p className="text-[#C9A84C]/60 text-xs">Baths</p>
                  <p className="text-white font-bold">{listing.baths}</p>
                </div>
                <div className="bg-[#071422] rounded p-2 text-center">
                  <p className="text-[#C9A84C]/60 text-xs">Area</p>
                  <p className="text-white font-bold">{listing.area}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={16} className="text-[#C9A84C]" />
                  <span className="text-sm text-[#C9A84C]/60">AI Score</span>
                </div>
                <div className="w-full bg-[#071422] rounded-full h-2">
                  <div
                    className="bg-[#C9A84C] h-2 rounded-full"
                    style={{ width: `${listing.aiScore}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-[#C9A84C]/60 block mb-2">Status</label>
                <select
                  value={listing.status}
                  onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                  className="w-full bg-[#071422] text-[#C9A84C] border border-[#C9A84C]/20 rounded px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              {listing.netCapitalRoi && (
                <div className="text-sm text-[#C9A84C]/80">
                  Expected ROI: {listing.netCapitalRoi}%
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">Total Listings</p>
          <p className="text-2xl font-bold text-white">{listings.length}</p>
        </div>
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">Active</p>
          <p className="text-2xl font-bold text-white">{listings.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-4">
          <p className="text-[#C9A84C]/60 text-sm">Sold</p>
          <p className="text-2xl font-bold text-white">{listings.filter(l => l.status === 'sold').length}</p>
        </div>
      </div>
    </div>
  );
}
