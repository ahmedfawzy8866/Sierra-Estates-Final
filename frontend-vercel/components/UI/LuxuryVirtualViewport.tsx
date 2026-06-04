'use client';

import React, { useState, transition } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldCheck, Compass } from 'lucide-react';

interface LuxuryVirtualViewportProps {
  isAr?: boolean;
}

export default function LuxuryVirtualViewport({ isAr = false }: LuxuryVirtualViewportProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-[16/9] min-h-[300px] bg-gradient-to-br from-[#071422]/10 to-[#C9A84C]/5 rounded-3xl border border-[#071422]/15 dark:border-white/10 overflow-hidden shadow-luxury">
      {!isLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#F4F0E8] to-[#eae5d8] dark:from-[#071422] dark:to-[#0a1520] transition-all duration-500">
          {/* Parallax style vector circles */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full border border-current animate-spin" style={{ animationDuration: '30s' }} />
            <div className="w-[300px] h-[300px] rounded-full border border-dashed border-current animate-spin" style={{ animationDuration: '15s' }} />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] mb-6 mx-auto">
              <Compass size={28} className="animate-pulse" />
            </div>
            
            <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
              {isAr ? 'بوابة افتراضية ثلاثية الأبعاد' : '3D SPATIAL TELEMETRY'}
            </span>
            <h4 className="text-2xl font-playfair font-light text-[#071422] dark:text-white mb-3">
              {isAr ? 'جولة افتراضية عالية الدقة 360°' : '360° Ultra-High-Fidelity Virtual Walkthrough'}
            </h4>
            <p className="text-xs text-[#071422]/60 dark:text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              {isAr
                ? 'اختبر المشي الفضائي في أرقى المشاريع العقارية بالتجمع الخامس عبر بوابة معالجة لا مركزية فائقة السرعة.'
                : 'Teleport directly inside New Cairo\'s premier luxury estates. Stream highly complex spatial models instantly on demand.'}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoaded(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#071422] text-white dark:bg-gradient-to-r dark:from-[#C9A84C] dark:to-[#E9C176] dark:text-[#071422] font-semibold text-xs rounded-xl shadow-lg hover:shadow-2xl transition-all uppercase tracking-widest"
            >
              <Eye size={14} />
              {isAr ? 'بدء جولة المعاينة الحية' : 'Launch 360 Teleportation'}
            </motion.button>

            <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-[#071422]/40 dark:text-white/40">
              <ShieldCheck size={12} />
              <span>{isAr ? 'اتصال مؤمن ومحسن للسرعة (أقل من ثانيتين)' : 'End-to-End Encrypted telemetry & Speed Optimized (<2s)'}</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Embedded Virtual Telemetry Frame (simulated with interactive visual component) */}
          <div className="relative w-full h-full bg-[#050b14] flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.66579294578!2d31.428781600000004!3d30.007949399999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145822de0cdfae65%3A0x280e22709e365022!2sFifth%20Settlement%2C%20New%20Cairo%201%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1717172000000!5m2!1sen!2seg"
              className="w-full h-full border-0 opacity-80"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Control Overlays */}
            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
              <button
                onClick={() => setIsLoaded(false)}
                className="px-4 py-2 bg-[#071422]/90 hover:bg-[#071422] text-white border border-[#C9A84C]/30 hover:border-[#C9A84C] text-[10px] font-mono rounded-lg transition-all"
              >
                {isAr ? 'إنهاء البث ✕' : 'Terminate Telemetry ✕'}
              </button>
            </div>
            {/* Live Indicator */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-[9px] font-mono text-white tracking-widest font-semibold animate-pulse">
              ● LIVE VIEWPORTSTREAM
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
