'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';

export default function AIMatchingEngine({ isAr }: { isAr?: boolean }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);

  const startAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResultsReady(true);
    }, 2500);
  };

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#0A1520] to-[#0d1f30] border border-[#C9A84C]/30 text-white shadow-2xl overflow-hidden group">
      {/* Background glow animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-64 h-64 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="text-[#C9A84C]" size={32} />
          <h3 className="font-playfair text-2xl font-bold text-[#F4F0E8]">
            {isAr ? 'محرك المطابقة الذكي' : 'AI Matching Engine'}
          </h3>
        </div>

        <p className="text-sm text-white/70 mb-8 max-w-md">
          {isAr
            ? 'دع نظامنا الذكي يحلل تفضيلاتك ويوجهك نحو أفضل الخيارات العقارية التي تلبي تطلعاتك بدقة عالية.'
            : 'Let our intelligent algorithm analyze market data, capital flow, and your unique preferences to curate the perfect estate matches.'}
        </p>

        {!analyzing && !resultsReady && (
          <button
            onClick={startAnalysis}
            className="relative overflow-hidden px-6 py-3 bg-[#C9A84C] text-[#071422] rounded-xl font-bold text-sm flex items-center gap-2 group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all"
          >
            <Sparkles size={18} />
            {isAr ? 'ابدأ التحليل الذكي' : 'Start Intelligent Analysis'}
            <motion.div
              className="absolute inset-0 bg-white/40"
              initial={{ x: '-100%', skewX: -20 }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </button>
        )}

        {analyzing && (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-12 h-12 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full" />
            </motion.div>
            <p className="font-mono text-xs text-[#C9A84C] animate-pulse">
              {isAr ? 'جاري مطابقة المعايير...' : 'Synthesizing market criteria...'}
            </p>
          </div>
        )}

        {resultsReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl"
          >
            <h4 className="text-[#C9A84C] font-semibold mb-2">
              {isAr ? 'تم العثور على 3 تطابقات مثالية' : '3 Perfect Matches Found'}
            </h4>
            <ul className="space-y-3 mb-4">
              <li className="flex justify-between text-xs text-white/80 border-b border-white/10 pb-2">
                <span>The Crown Estate, 5th Settlement</span>
                <span className="text-emerald-400">98% Match</span>
              </li>
              <li className="flex justify-between text-xs text-white/80 border-b border-white/10 pb-2">
                <span>Ivory Villas, Mostakbal City</span>
                <span className="text-emerald-400">94% Match</span>
              </li>
              <li className="flex justify-between text-xs text-white/80">
                <span>Capital Prime Residence</span>
                <span className="text-emerald-400">91% Match</span>
              </li>
            </ul>
            <button className="text-xs font-bold text-[#C9A84C] flex items-center gap-1 hover:text-white transition-colors">
              {isAr ? 'عرض التفاصيل' : 'View Full Report'} <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
