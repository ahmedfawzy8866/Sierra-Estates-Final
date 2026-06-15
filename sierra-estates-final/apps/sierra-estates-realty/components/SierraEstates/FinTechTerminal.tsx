import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PropertyCard } from '../../types/sierra-estates';

export function FinTechTerminal({ property }: { property: PropertyCard }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [mortgageTerm, setMortgageTerm] = useState(30);

  const downPayment = property.price * (downPaymentPercent / 100);
  const loanAmount = property.price - downPayment;
  const monthlyRate = 0.042 / 12;
  const numPayments = mortgageTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  return (
    <section className="bg-[#0A1628] px-8 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
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
            <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-3">RERA Compliance</p>
            <div className="flex items-center gap-2 text-xs text-[#F4F0E8]/70 p-2 bg-[#C9A84C]/10 rounded">
              <Check className="w-4 h-4 text-[#C9A84C]" />
              <span>Escrow: DIFC Bank #7734</span>
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
      </div>
    </section>
  );
}
