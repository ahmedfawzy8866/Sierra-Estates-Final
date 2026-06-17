'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bed, Bath, Square, Heart, Check, Loader,
  Home, Sparkles, BarChart3, Map, Ruler, Box,
  CheckCircle2, Camera, ClipboardCheck, Users, ThumbsUp
} from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * SIERRA ESTATES 3.2 — CLIENT HUB
 * Modern luxury property discovery with AI-driven matching
 */

type UserIntent = 'homebuyer' | 'collector' | 'investor' | null;
type PropertyCard = {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  image: string;
  lat: number;
  lng: number;
  yield?: number;
  capRate?: number;
  schoolDist?: string;
  transit?: string;
};

// Mock fallback data — used until /api/listings returns live inventory
const MOCK_PROPERTIES: PropertyCard[] = [
  {
    id: '1',
    title: 'Mivida Garden Penthouse',
    location: 'Mivida',
    price: 2_800_000,
    beds: 3,
    baths: 2,
    area: 2400,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    lat: 30.0587,
    lng: 31.2263,
    yield: 5.2,
    capRate: 6.8,
    schoolDist: '0.8 km to American University',
    transit: '5 min to Metro'
  },
  {
    id: '2',
    title: 'Uptown Cairo Villa',
    location: 'Uptown Cairo',
    price: 4_200_000,
    beds: 5,
    baths: 4,
    area: 4100,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    lat: 30.0444,
    lng: 31.2169,
    yield: 4.8,
    capRate: 5.9,
    schoolDist: '1.2 km to GIS',
    transit: '12 min to Metro'
  },
  {
    id: '3',
    title: 'Katameya Heights Townhouse',
    location: 'Katameya Heights',
    price: 1_500_000,
    beds: 2,
    baths: 2,
    area: 1400,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    lat: 30.0331,
    lng: 31.2088,
    yield: 6.1,
    capRate: 7.4,
    schoolDist: '1.5 km to NIS',
    transit: '8 min to Metro'
  }
];

// ─── COMPONENT: SECTION 1 — ONBOARDING INTENT ────────────────────────────

function OnboardingIntent({ onSelect }: { onSelect: (intent: UserIntent) => void }) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0A1628] to-[#0F1B2E] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-display text-6xl italic text-[#F4F0E8] mb-4"
        >
          Sierra Blu
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-[#F4F0E8]/70 text-lg mb-16"
        >
          Find your next property. Invest with intelligence.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'homebuyer', icon: Home, label: 'Primary Homebuyer', desc: 'School districts, transit, neighborhoods' },
            { id: 'collector', icon: Sparkles, label: 'Luxury Collector', desc: 'Prestige, exclusivity, heritage' },
            { id: 'investor', icon: BarChart3, label: 'Data-Driven Investor', desc: 'Yield, cap rate, cash flow' }
          ].map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
              onClick={() => onSelect(item.id as UserIntent)}
              className="group p-8 border-2 border-[#C9A84C] rounded-lg bg-transparent hover:bg-[#C9A84C]/10 transition-all duration-300 hover:scale-105"
            >
              <item.icon className="w-9 h-9 mb-4 text-[#C9A84C]" strokeWidth={1.5} />
              <h3 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-2">{item.label}</h3>
              <p className="text-[#F4F0E8]/60 text-xs">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMPONENT: SECTION 2 — DUAL-VIEW COMMAND CENTER ────────────────────

function DualViewCommandCenter({
  properties,
  loading,
  intent,
  onPropertySelect,
  selectedId
}: {
  properties: PropertyCard[];
  loading: boolean;
  intent: UserIntent;
  onPropertySelect: (id: string) => void;
  selectedId: string | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Dynamic card data based on intent
  const getDisplayValue = (prop: PropertyCard) => {
    switch (intent) {
      case 'investor':
        return prop.capRate ? `${prop.capRate}% cap rate` : 'Cap rate on request';
      case 'homebuyer':
        return prop.schoolDist ?? 'Schools nearby';
      case 'collector':
        return `${(prop.price / 1_000_000).toFixed(1)}M`;
      default:
        return `$${(prop.price / 1_000_000).toFixed(1)}M`;
    }
  };

  return (
    <section className="h-[calc(100vh-4rem)] flex gap-0 bg-[#0A1628]">
      {/* MAP LAYER (55%) */}
      <div
        ref={mapRef}
        className="w-[55%] bg-gradient-to-br from-[#1a2e4a] to-[#0d1b2e] relative overflow-hidden hidden md:block"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#C9A84C_1px,transparent_1px),linear-gradient(to_bottom,#C9A84C_1px,transparent_1px)] bg-[size:8rem_8rem] opacity-5"></div>

        {/* Map pins */}
        {properties.map(prop => (
          <button
            key={prop.id}
            onClick={() => onPropertySelect(prop.id)}
            style={{
              top: `${30 + Math.random() * 40}%`,
              left: `${20 + Math.random() * 60}%`
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              selectedId === prop.id ? 'z-20 scale-125' : hoveredId === prop.id ? 'z-10 scale-110' : 'z-5'
            }`}
            onMouseEnter={() => setHoveredId(prop.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className={`px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all ${
                selectedId === prop.id
                  ? 'bg-[#C9A84C] text-[#0A1628] shadow-lg shadow-[#C9A84C]/50'
                  : hoveredId === prop.id
                  ? 'bg-[#C9A84C]/80 text-[#0A1628] shadow-md'
                  : 'bg-[#F4F0E8]/10 text-[#F4F0E8] border border-[#C9A84C]/30 backdrop-blur-sm'
              }`}
            >
              ${(prop.price / 1_000_000).toFixed(1)}M
            </div>
          </button>
        ))}

        {/* Map label */}
        <div className="absolute top-6 left-6 flex items-center gap-1.5 text-[#F4F0E8]/40 text-xs uppercase tracking-widest font-semibold">
          <Map className="w-3.5 h-3.5" />
          Interactive Map
        </div>
      </div>

      {/* FEED LAYER (45%) */}
      <div className="w-full md:w-[45%] bg-[#0A1628] border-l border-[#C9A84C]/20 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">
          Featured Listings
          {loading && <Loader className="w-3 h-3 animate-spin" />}
        </div>

        {properties.map((prop, i) => (
          <motion.button
            key={prop.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            onClick={() => onPropertySelect(prop.id)}
            onMouseEnter={() => setHoveredId(prop.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedId === prop.id
                ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                : hoveredId === prop.id
                ? 'border-[#C9A84C]/60 bg-[#C9A84C]/05 scale-[1.02]'
                : 'border-[#C9A84C]/20 bg-transparent hover:border-[#C9A84C]/40'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[#F4F0E8] font-semibold text-sm">{prop.title}</h3>
              <Heart className={`w-4 h-4 ${selectedId === prop.id ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#C9A84C]/40'}`} />
            </div>
            <p className="text-[#F4F0E8]/60 text-xs mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {prop.location}
            </p>
            <div className="flex justify-between text-xs text-[#C9A84C] mb-3">
              <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {prop.beds} beds</span>
              <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {prop.baths} baths</span>
              <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {prop.area} sqft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#C9A84C] font-bold text-lg">${(prop.price / 1_000_000).toFixed(1)}M</span>
              <span className="text-[#F4F0E8]/50 text-xs">{getDisplayValue(prop)}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

// ─── COMPONENT: SECTION 3 — PROPERTY PROFILE HERO ───────────────────────

function PropertyProfileHero({ property }: { property: PropertyCard }) {
  return (
    <section className="relative h-96 bg-[#0A1628] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={property.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {/* Hero image */}
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover opacity-40"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/50 to-transparent"></div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Featured Property</p>
                <h2 className="text-[#F4F0E8] text-4xl font-display italic mb-2">{property.title}</h2>
                <p className="text-[#F4F0E8]/70 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-1">Price</p>
                <p className="text-[#F4F0E8] text-3xl font-bold">${(property.price / 1_000_000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── COMPONENT: SECTION 4 — FLOORPLAN EXPLODED VIEW ──────────────────────

function FloorplanExplodedView() {
  const [view, setView] = useState<'2d' | '3d'>('2d');

  return (
    <section className="bg-[#0F1B2E] px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Visual Exploration</p>
            <h3 className="text-[#F4F0E8] text-2xl font-display italic">Floorplan & Layout</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setView('2d')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                view === '2d'
                  ? 'bg-[#C9A84C] text-[#0A1628]'
                  : 'bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]'
              }`}
            >
              2D Blueprint
            </button>
            <button
              onClick={() => setView('3d')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                view === '3d'
                  ? 'bg-[#C9A84C] text-[#0A1628]'
                  : 'bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]'
              }`}
            >
              3D Rotatable
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a2e4a] to-[#0d1b2e] rounded-lg p-12 h-96 flex items-center justify-center border border-[#C9A84C]/20">
          <div className="text-center">
            {view === '2d'
              ? <Ruler className="w-16 h-16 mx-auto mb-4 text-[#C9A84C]" strokeWidth={1.25} />
              : <Box className="w-16 h-16 mx-auto mb-4 text-[#C9A84C]" strokeWidth={1.25} />
            }
            <p className="text-[#F4F0E8]/60 text-sm">
              {view === '2d'
                ? 'Engineering blueprint with room-by-room breakdown'
                : 'Interactive 3D model - rotate to explore spatial configuration'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── COMPONENT: SECTION 5 — FINTECH COST BREAKDOWN ──────────────────────

function FinTechTerminal({ property }: { property: PropertyCard }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [mortgageTerm, setMortgageTerm] = useState(30);

  const downPayment = property.price * (downPaymentPercent / 100);
  const loanAmount = property.price - downPayment;
  const monthlyRate = 0.042 / 12;
  const numPayments = mortgageTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  return (
    <section className="bg-[#0A1628] px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* LEFT: Cost Breakdown */}
        <div>
          <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Financial Transparency</p>
          <h3 className="text-[#F4F0E8] text-2xl font-display italic mb-8">Transaction Breakdown</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#C9A84C]/20">
              <span className="text-[#F4F0E8]/70">Purchase Price</span>
              <span className="text-[#C9A84C] font-semibold">${(property.price / 1_000_000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#C9A84C]/20">
              <span className="text-[#F4F0E8]/70">Transfer Tax (3%)</span>
              <span className="text-[#C9A84C] font-semibold">${(property.price * 0.03 / 1_000_000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#C9A84C]/20">
              <span className="text-[#F4F0E8]/70">Registration Fee</span>
              <span className="text-[#C9A84C] font-semibold">$3,500</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#C9A84C]/20">
              <span className="text-[#F4F0E8]/70">Legal & Title</span>
              <span className="text-[#C9A84C] font-semibold">$2,500</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-[#C9A84C] mt-4 font-bold">
              <span className="text-[#F4F0E8]">Total Year 1 Outlay</span>
              <span className="text-[#C9A84C]">${((property.price * 1.03 + 6000) / 1_000_000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Compliance */}
          <div className="mt-8 space-y-2">
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-3">Title &amp; Registration</p>
            <div className="flex items-center gap-2 text-xs text-[#F4F0E8]/70 p-2 bg-[#C9A84C]/10 rounded">
              <Check className="w-4 h-4 text-[#C9A84C]" />
              <span>Escrow: Verified Trust Account #7734</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F4F0E8]/70 p-2 bg-[#C9A84C]/10 rounded">
              <Check className="w-4 h-4 text-[#C9A84C]" />
              <span>Title Clear: ID-2024-598472</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F4F0E8]/70 p-2 bg-[#C9A84C]/10 rounded">
              <Check className="w-4 h-4 text-[#C9A84C]" />
              <span>Planning: Zone A1 Residential</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Interactive Calculator */}
        <div className="bg-[#0F1B2E] rounded-lg p-8 border border-[#C9A84C]/20">
          <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-6">Mortgage Calculator</p>

          <div className="space-y-6">
            {/* Down Payment Slider */}
            <div>
              <label className="text-[#F4F0E8] text-sm font-semibold mb-2 block">Down Payment: {downPaymentPercent}%</label>
              <input
                type="range"
                min="10"
                max="50"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-[#C9A84C]/30 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
              />
              <p className="text-[#C9A84C] text-lg font-bold mt-2">${(downPayment / 1_000_000).toFixed(2)}M</p>
            </div>

            {/* Mortgage Term Buttons */}
            <div>
              <label className="text-[#F4F0E8] text-sm font-semibold mb-3 block">Mortgage Term</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map(term => (
                  <button
                    key={term}
                    onClick={() => setMortgageTerm(term)}
                    className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                      mortgageTerm === term
                        ? 'bg-[#C9A84C] text-[#0A1628]'
                        : 'bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C]'
                    }`}
                  >
                    {term} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Payment Display */}
            <div className="bg-[#0A1628] rounded-lg p-4 border border-[#C9A84C]/30">
              <p className="text-[#F4F0E8]/60 text-xs uppercase tracking-wider mb-1">Monthly Payment</p>
              <p className="text-[#C9A84C] text-3xl font-bold">${(monthlyPayment / 1000).toFixed(1)}K</p>
              <p className="text-[#F4F0E8]/50 text-xs mt-2">@ 4.2% interest, {mortgageTerm}-year term</p>
            </div>

            {/* Total Cost */}
            <div className="pt-4 border-t border-[#C9A84C]/20">
              <p className="text-[#F4F0E8]/60 text-xs uppercase tracking-wider mb-1">Total Cost ({mortgageTerm} Years)</p>
              <p className="text-[#C9A84C] text-2xl font-bold">${((monthlyPayment * numPayments + downPayment) / 1_000_000).toFixed(2)}M</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── COMPONENT: SECTION 6 — TRUST BADGES ─────────────────────────────────

function TrustBadges() {
  return (
    <section className="bg-[#0F1B2E] px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Verification & Trust</p>
        <h3 className="text-[#F4F0E8] text-2xl font-display italic mb-12">Verified Credentials</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CheckCircle2, label: 'Price Verified', detail: 'Updated 4 hours ago' },
            { icon: Camera, label: 'Physical Walkthrough', detail: 'Confirmed by agent' },
            { icon: ClipboardCheck, label: 'Title Cleared', detail: 'Registration certified' }
          ].map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="bg-[#0A1628] rounded-lg p-6 border border-[#C9A84C]/30"
            >
              <badge.icon className="w-7 h-7 mb-3 text-[#C9A84C]" strokeWidth={1.5} />
              <p className="text-[#F4F0E8] font-semibold text-sm mb-1">{badge.label}</p>
              <p className="text-[#F4F0E8]/60 text-xs">{badge.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMPONENT: SECTION 7 — CO-BUYER COLLABORATION ───────────────────────

function CoBuyerHub() {
  const [consensus] = useState(75);

  return (
    <section className="bg-[#0A1628] px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto"
      >
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">Partnership & Collaboration</p>
        <h3 className="text-[#F4F0E8] text-2xl font-display italic mb-12">Shared Portfolio</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Status & Voting */}
          <div>
            <div className="bg-[#0F1B2E] rounded-lg p-6 border border-[#C9A84C]/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#C9A84C]" strokeWidth={1.5} />
                <div>
                  <p className="text-[#F4F0E8] font-semibold">You + Sarah</p>
                  <p className="text-[#F4F0E8]/60 text-xs">Partnership active • 4 properties</p>
                </div>
              </div>
              <div className="bg-[#0A1628] rounded p-3 mt-4">
                <p className="text-[#F4F0E8]/60 text-xs uppercase tracking-wider mb-2">Consensus Score</p>
                <p className="text-[#C9A84C] text-2xl font-bold">{consensus}%</p>
              </div>
            </div>

            <div className="space-y-3">
              {['Mivida Garden Penthouse', 'Uptown Cairo Villa', 'Katameya Heights Townhouse'].map((name, i) => (
                <div key={i} className="bg-[#0F1B2E] rounded-lg p-4 border border-[#C9A84C]/20">
                  <p className="text-[#F4F0E8] text-sm font-semibold mb-2">{name}</p>
                  <div className="flex gap-2 text-xs">
                    <button className="flex-1 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded hover:bg-[#C9A84C]/30 flex items-center justify-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" /> You
                    </button>
                    <button className="flex-1 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded hover:bg-[#C9A84C]/30 flex items-center justify-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" /> Sarah
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Shared Notes */}
          <div className="bg-[#0F1B2E] rounded-lg p-6 border border-[#C9A84C]/30">
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-4">Shared Notes & Chat</p>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              <div className="bg-[#0A1628] rounded-lg p-4">
                <p className="text-[#C9A84C] text-xs font-semibold mb-1">Sarah • 2 hours ago</p>
                <p className="text-[#F4F0E8]/80 text-sm">Mivida penthouse has amazing light. Can we negotiate the maintenance fees?</p>
              </div>

              <div className="bg-[#0A1628] rounded-lg p-4 ml-4">
                <p className="text-[#C9A84C] text-xs font-semibold mb-1">You • just now</p>
                <p className="text-[#F4F0E8]/80 text-sm">Called the broker. Fees are fixed, but sellers might cover closing costs.</p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Add a note..."
              className="w-full mt-4 px-3 py-2 bg-[#0A1628] border border-[#C9A84C]/30 rounded text-[#F4F0E8] text-sm placeholder-[#F4F0E8]/40 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────

interface ApiListing {
  id: string;
  title: string;
  price: number;
  compound: string;
  beds: number;
  baths: number;
  area: number;
  image?: string;
}

function mapListingToCard(listing: ApiListing): PropertyCard {
  return {
    id: listing.id,
    title: listing.title,
    location: listing.compound || 'New Cairo',
    price: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    area: listing.area,
    image: listing.image || MOCK_PROPERTIES[0].image,
    lat: 30.03 + Math.random() * 0.03,
    lng: 31.20 + Math.random() * 0.03,
  };
}

export default function ClientHub() {
  const [intent, setIntent] = useState<UserIntent>(null);
  const [properties, setProperties] = useState<PropertyCard[]>(MOCK_PROPERTIES);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(MOCK_PROPERTIES[0].id);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      try {
        const res = await fetch('/api/listings?limit=6');
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.listings) && data.listings.length > 0) {
          const mapped = data.listings.map(mapListingToCard);
          setProperties(mapped);
          setSelectedPropertyId(mapped[0].id);
        }
      } catch (error) {
        logger.error('[CLIENT_HUB] Failed to load live listings, using fallback inventory:', error);
      } finally {
        if (!cancelled) setLoadingProperties(false);
      }
    }
    loadListings();
    return () => { cancelled = true; };
  }, []);

  if (!intent) {
    return <OnboardingIntent onSelect={setIntent} />;
  }

  return (
    <div className="bg-[#0A1628] text-[#F4F0E8] min-h-screen">
      {/* Section 2: Dual-View */}
      <DualViewCommandCenter
        properties={properties}
        loading={loadingProperties}
        intent={intent}
        onPropertySelect={setSelectedPropertyId}
        selectedId={selectedPropertyId}
      />

      {/* Section 3: Property Profile Hero */}
      <PropertyProfileHero property={selectedProperty} />

      {/* Section 4: Floorplan */}
      <FloorplanExplodedView />

      {/* Section 5: Fintech Terminal */}
      <FinTechTerminal property={selectedProperty} />

      {/* Section 6: Trust Badges */}
      <TrustBadges />

      {/* Section 7: Co-Buyer Hub */}
      <CoBuyerHub />
      
      {/* Footer removed to use the global footer */}
    </div>
  );
}
