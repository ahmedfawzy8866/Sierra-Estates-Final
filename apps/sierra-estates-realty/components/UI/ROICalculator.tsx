'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

export default function ROICalculator({ isAr }: { isAr?: boolean }) {
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [downPayment, setDownPayment] = useState(10);
  const [years, setYears] = useState(5);

  const downPaymentValue = (propertyValue * downPayment) / 100;
  const estimatedAppreciation = propertyValue * Math.pow(1.12, years) - propertyValue;
  const totalYield = estimatedAppreciation + (propertyValue * 0.08 * years); // Assuming 8% rental yield

  return (
    <div className="bg-white dark:bg-[#0A1520] rounded-3xl p-8 border border-[#071422]/10 dark:border-white/10 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A84C] to-[#E9C176]" />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#C9A84C]/10 rounded-xl">
          <Calculator className="text-[#C9A84C]" size={24} />
        </div>
        <h3 className="font-playfair text-2xl font-bold text-[#071422] dark:text-white">
          {isAr ? 'حاسبة العائد على الاستثمار' : 'ROI Engine'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Controls */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-[#071422] dark:text-white">
                {isAr ? 'قيمة العقار' : 'Property Value'}
              </label>
              <span className="font-mono text-[#C9A84C] font-bold">EGP {(propertyValue / 1000000).toFixed(1)}M</span>
            </div>
            <input
              type="range"
              min="1000000"
              max="50000000"
              step="500000"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full h-2 bg-[#071422]/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-[#071422] dark:text-white">
                {isAr ? 'الدفعة المقدمة' : 'Down Payment'}
              </label>
              <span className="font-mono text-[#C9A84C] font-bold">{downPayment}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-[#071422]/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-[#071422] dark:text-white">
                {isAr ? 'فترة الاستثمار' : 'Investment Horizon'}
              </label>
              <span className="font-mono text-[#C9A84C] font-bold">{years} {isAr ? 'سنوات' : 'Years'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-[#071422]/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-[#050b14] rounded-2xl p-6 text-white border border-[#C9A84C]/20 relative overflow-hidden">
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C9A84C]/30 blur-2xl rounded-full"
          />
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">
                {isAr ? 'المطلوب للدفع المقدم' : 'Required Down Payment'}
              </p>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[#C9A84C]" />
                <span className="text-xl font-bold font-mono">{(downPaymentValue).toLocaleString()} EGP</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">
                {isAr ? 'إجمالي العائد المتوقع (إيجار + زيادة رأس المال)' : 'Projected Total Yield (Rental + Capital)'}
              </p>
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp size={24} />
                <span className="text-3xl font-bold font-mono">+{(totalYield / 1000000).toFixed(2)}M EGP</span>
              </div>
              <p className="text-xs text-white/40 mt-2">
                * {isAr ? 'مبني على تحليل بيانات تاريخية 12% نمو و 8% إيجار' : 'Based on historical data of 12% capital appreciation & 8% rental yield.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
