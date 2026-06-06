'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import { COLLECTIONS } from '@/lib/models/schema';

interface ViewingRequest {
  id: string;
  leadName: string;
  propertyTitle: string;
  propertyLocation: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  phone?: string;
}

export default function ViewingSchedulePage() {
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | ViewingRequest['status']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadViewings = async () => {
      try {
        const viewingsSnap = await getDocs(collection(db, 'viewing_requests'));
        const requests = viewingsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            leadName: data.leadName || 'Unknown',
            propertyTitle: data.propertyTitle || 'Untitled',
            propertyLocation: data.propertyLocation || 'Unknown',
            requestedDate: data.requestedDate || new Date().toISOString(),
            requestedTime: data.requestedTime || '10:00',
            status: data.status || 'pending',
            notes: data.notes,
            phone: data.phone,
          } as ViewingRequest;
        });

        setViewings(requests.sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime()));
      } catch (err) {
        console.error('Viewings load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadViewings();
  }, []);

  const filteredViewings = filterStatus === 'all'
    ? viewings
    : viewings.filter(v => v.status === filterStatus);

  const groupedByDate = filteredViewings.reduce((acc, viewing) => {
    const date = viewing.requestedDate.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(viewing);
    return acc;
  }, {} as Record<string, ViewingRequest[]>);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2">Viewing Schedule</h1>
        <p className="text-[#3a5570]/60">Manage property viewing appointments and confirmations</p>
      </motion.div>

      <div className="mb-8 flex gap-3 flex-wrap">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-2 rounded-full font-semibold text-sm uppercase tracking-widest transition-all ${
              filterStatus === status
                ? 'bg-[#C9A24A] text-white shadow-lg'
                : 'bg-white text-[#3a5570] shadow hover:shadow-md'
            }`}
          >
            {status}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading viewings...</div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 text-lg">No viewings scheduled</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {Object.entries(groupedByDate).map(([date, viewingsOnDate]) => (
            <motion.div key={date} variants={itemVariants}>
              <div className="flex items-center gap-4 mb-4 px-2">
                <div className="flex items-center gap-2 text-[#071422] font-bold">
                  <Calendar size={20} className="text-[#C9A24A]" />
                  {formatDate(date)}
                </div>
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm font-semibold text-[#C9A24A]">{viewingsOnDate.length} viewing{viewingsOnDate.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-4">
                {viewingsOnDate.map((viewing, idx) => (
                  <motion.div
                    key={viewing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="p-6 border-l-4 border-[#C9A24A]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#071422]">{viewing.propertyTitle}</h3>
                          <p className="text-sm text-[#3a5570]/60 mt-1 flex items-center gap-2">
                            <MapPin size={14} />
                            {viewing.propertyLocation}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${statusColors[viewing.status]}`}>
                          {viewing.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-[#C9A24A]" />
                          <div>
                            <div className="text-xs text-[#3a5570]/60 font-semibold">INVESTOR</div>
                            <div className="text-sm font-semibold text-[#071422]">{viewing.leadName}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-[#C9A24A]" />
                          <div>
                            <div className="text-xs text-[#3a5570]/60 font-semibold">TIME</div>
                            <div className="text-sm font-semibold text-[#071422]">{viewing.requestedTime}</div>
                          </div>
                        </div>

                        {viewing.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-[#C9A24A]" />
                            <div>
                              <div className="text-xs text-[#3a5570]/60 font-semibold">CONTACT</div>
                              <div className="text-sm font-semibold text-[#071422]">{viewing.phone}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {viewing.notes && (
                        <div className="pt-4 border-t border-slate-100">
                          <div className="text-xs text-[#3a5570]/60 font-semibold mb-2">NOTES</div>
                          <p className="text-sm text-[#3a5570]">{viewing.notes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
