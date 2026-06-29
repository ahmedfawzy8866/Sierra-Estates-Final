'use client';
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SIERRA ESTATES MOBILE — Client/Clients Landing Page
 * Replaced with new Sierra Mobile design (updated 2026-06-29)
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Phone, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import SearchRequestModal from '@/components/SearchRequestModal';

export default function ClientRequest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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
      setError('Error submitting request. Please try again.');
      logger.error(err);
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
    <div className="min-h-screen">
      {/* Hero Section with Sierra Mobile Design */}
      <Hero />

      {/* Search Modal */}
      <SearchRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* CTA Section - Optional Additional Content */}
      <section className="py-16 bg-slate-900/50 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold hover:opacity-90 transition"
        >
          Start Your Search
        </button>
      </section>
    </div>
  );
}
