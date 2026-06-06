'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface ROIInputs {
  investmentAmount: number;
  expectedAnnualReturn: number;
  investmentYears: number;
  monthlyIncome: number;
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<ROIInputs>({
    investmentAmount: 1_000_000,
    expectedAnnualReturn: 8,
    investmentYears: 5,
    monthlyIncome: 50_000,
  });

  const calculation = useMemo(() => {
    const principal = inputs.investmentAmount;
    const rate = inputs.expectedAnnualReturn / 100;
    const years = inputs.investmentYears;
    const monthlyIncome = inputs.monthlyIncome;

    const futureValue = principal * Math.pow(1 + rate, years);
    const totalGain = futureValue - principal;
    const totalReturn = (totalGain / principal) * 100;
    const totalPassiveIncome = monthlyIncome * 12 * years;
    const totalWealth = futureValue + totalPassiveIncome;

    return {
      futureValue,
      totalGain,
      totalReturn,
      totalPassiveIncome,
      totalWealth,
      annualPassiveIncome: monthlyIncome * 12,
    };
  }, [inputs]);

  const handleInputChange = (key: keyof ROIInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Investment ROI Calculator</h1>
        <p className="text-[#3a5570]/60">Calculate projected returns and wealth accumulation</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#071422] mb-6">Investment Parameters</h2>

            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-sm font-semibold text-[#071422] mb-3">
                Initial Investment
              </label>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
                <DollarSign size={18} className="text-[#C9A24A]" />
                <input
                  type="number"
                  value={inputs.investmentAmount}
                  onChange={(e) => handleInputChange('investmentAmount', Number(e.target.value))}
                  className="bg-transparent text-[#071422] font-mono font-bold w-full outline-none"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="10000000"
                step="100000"
                value={inputs.investmentAmount}
                onChange={(e) => handleInputChange('investmentAmount', Number(e.target.value))}
                className="w-full mt-3 accent-[#C9A24A]"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-sm font-semibold text-[#071422] mb-3">
                Expected Annual Return
              </label>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
                <Percent size={18} className="text-green-500" />
                <input
                  type="number"
                  value={inputs.expectedAnnualReturn}
                  onChange={(e) => handleInputChange('expectedAnnualReturn', Number(e.target.value))}
                  className="bg-transparent text-[#071422] font-mono font-bold w-full outline-none"
                  step="0.1"
                />
                <span className="text-[#3a5570]/60">%</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="0.5"
                value={inputs.expectedAnnualReturn}
                onChange={(e) => handleInputChange('expectedAnnualReturn', Number(e.target.value))}
                className="w-full mt-3 accent-green-500"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-sm font-semibold text-[#071422] mb-3">
                Investment Period
              </label>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
                <span className="text-[#3a5570]/60 text-sm">Years:</span>
                <input
                  type="number"
                  value={inputs.investmentYears}
                  onChange={(e) => handleInputChange('investmentYears', Number(e.target.value))}
                  className="bg-transparent text-[#071422] font-mono font-bold w-full outline-none"
                />
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={inputs.investmentYears}
                onChange={(e) => handleInputChange('investmentYears', Number(e.target.value))}
                className="w-full mt-3 accent-blue-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-[#071422] mb-3">
                Monthly Passive Income
              </label>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
                <DollarSign size={18} className="text-purple-500" />
                <input
                  type="number"
                  value={inputs.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  className="bg-transparent text-[#071422] font-mono font-bold w-full outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={inputs.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                className="w-full mt-3 accent-purple-500"
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#C9A24A]">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} className="text-[#C9A24A]" />
                <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest">
                  Investment Growth
                </h3>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <div className="text-4xl font-bold text-[#C9A24A] mb-2">
                  EGP {(calculation.futureValue / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-sm text-[#3a5570]/60">
                  Gain: <span className="text-green-600 font-bold">
                    EGP {(calculation.totalGain / 1_000_000).toFixed(2)}M
                  </span>
                </div>
                <div className="text-sm text-[#3a5570]/60 mt-2">
                  Return: <span className="text-green-600 font-bold">{calculation.totalReturn.toFixed(1)}%</span>
                </div>
              </motion.div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign size={24} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest">
                  Passive Income
                </h3>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <div className="text-4xl font-bold text-purple-500 mb-2">
                  EGP {(calculation.annualPassiveIncome / 1_000_000).toFixed(2)}M/yr
                </div>
                <div className="text-sm text-[#3a5570]/60">
                  {inputs.investmentYears} year total:{' '}
                  <span className="font-bold text-purple-600">
                    EGP {(calculation.totalPassiveIncome / 1_000_000).toFixed(2)}M
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-[#C9A24A]/10 to-purple-500/10 rounded-2xl shadow-lg p-8 border-t-4 border-[#C9A24A]">
              <h3 className="text-sm font-semibold text-[#3a5570] uppercase tracking-widest mb-4">
                Total Wealth Projection
              </h3>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-5xl font-bold text-[#071422]">
                  EGP {(calculation.totalWealth / 1_000_000).toFixed(2)}M
                </div>
                <p className="text-sm text-[#3a5570]/60 mt-3">
                  After {inputs.investmentYears} years, combining investment growth and passive income
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-[#071422] mb-6">Projection Timeline</h3>
            <div className="space-y-4">
              {Array.from({ length: inputs.investmentYears }).map((_, year) => {
                const y = year + 1;
                const futureVal = inputs.investmentAmount * Math.pow(1 + inputs.expectedAnnualReturn / 100, y);
                const gain = futureVal - inputs.investmentAmount;
                const passiveIncome = inputs.monthlyIncome * 12 * y;
                const totalWealthAtYear = futureVal + passiveIncome;
                const percentage = (y / inputs.investmentYears) * 100;

                return (
                  <motion.div
                    key={y}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * y }}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="font-bold text-[#071422] min-w-12">Year {y}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#C9A24A] to-[#E5B76F]"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.1 * y, duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-48">
                      <div className="text-sm font-semibold text-[#071422]">
                        EGP {(totalWealthAtYear / 1_000_000).toFixed(2)}M
                      </div>
                      <div className="text-xs text-green-600">+EGP {(gain / 1_000_000).toFixed(2)}M</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
