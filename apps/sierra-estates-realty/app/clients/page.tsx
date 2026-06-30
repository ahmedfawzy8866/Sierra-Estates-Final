'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import SearchRequestModal from '@/components/SearchRequestModal';

export default function ClientRequest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [_error, setError] = useState('');
  const [_formData, setFormData] = useState({
    type: '',
    area: '',
    budget: '',
    rooms: '',
    name: '',
    phone: '',
  });

  const handleModalSubmit = async (data: any) => {
    if (!data.name || !data.phone) {
      setError('Please enter your name and phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'client_requests'), {
        ...data,
        status: 'new',
        source: 'Sierra Mobile Landing',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setIsModalOpen(false);
    } catch (err: any) {
      setError('حدث خطأ أثناء إرسال الطلب، برجاء المحاولة لاحقاً.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 font-serif">
            Request Submitted!
          </h1>
          <p className="text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
            Thank you for choosing Sierra Estates. Our team will review your
            request and contact you via WhatsApp within 4 seconds with the best
            options available.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold hover:opacity-90 transition"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section with Sierra Mobile Design */}
      <Hero />

      {/* Search Modal */}
      <SearchRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Premium CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 to-slate-800 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Let our expert team guide you through the finest luxury properties in New Cairo.
              Start your search today and discover homes beyond imagination.
            </p>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="px-12 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300"
            >
              Explore Listings
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 bg-slate-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <div className="text-4xl font-bold text-amber-400 mb-2">500+</div>
            <p className="text-white/70">Premium Listings</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <div className="text-4xl font-bold text-amber-400 mb-2">24/7</div>
            <p className="text-white/70">Expert Support</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <div className="text-4xl font-bold text-amber-400 mb-2">100%</div>
            <p className="text-white/70">Verified Properties</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
