'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Database, ChevronDown, Search, Copy, Check, Zap } from 'lucide-react';

interface CollectionData {
  name: string;
  docCount: number;
  sample?: Record<string, any>;
}

const COLLECTIONS_LIST = [
  { name: 'Portfolio Assets', id: 'units' },
  { name: 'Investment Stakeholders', id: 'leads' },
  { name: 'Strategic Pipeline', id: 'deals' },
  { name: 'Investment Proposals', id: 'proposals' },
  { name: 'Activities', id: 'activities' },
  { name: 'Media', id: 'media' },
  { name: 'Sync Jobs', id: 'sync_jobs' },
];

export default function AdminDatabasePage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadDatabase() {
      try {
        const data: CollectionData[] = [];

        for (const coll of COLLECTIONS_LIST) {
          try {
            const q = query(collection(db, coll.id), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);

            data.push({
              name: coll.name,
              docCount: snap.size,
              sample: snap.docs[0]?.data(),
            });
          } catch (err) {
            data.push({
              name: coll.name,
              docCount: 0,
            });
          }
        }

        setCollections(data);
      } catch (err) {
        console.error('Database load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDatabase();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2 flex items-center gap-3">
          <Database size={32} className="text-[#C9A24A]" />
          Firestore Explorer
        </h1>
        <p className="text-[#3a5570]/60">Browse collections, inspect documents, and manage data</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading database...</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {collections.map((coll, idx) => (
            <motion.div key={coll.name} variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedCollection(expandedCollection === coll.name ? null : coll.name)
                  }
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center">
                      <Zap size={20} className="text-[#C9A24A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#071422] text-lg">{coll.name}</h3>
                      <p className="text-sm text-[#3a5570]/60">
                        {coll.docCount} document{coll.docCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCollection === coll.name ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-[#3a5570]" />
                  </motion.div>
                </button>

                {expandedCollection === coll.name && coll.sample && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-200 px-8 py-6 bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#071422]">Sample Document</h4>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(coll.sample),
                            coll.name
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm font-semibold border border-slate-200 hover:border-[#C9A24A] transition-colors"
                      >
                        {copied === coll.name ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy JSON
                          </>
                        )}
                      </motion.button>
                    </div>
                    <pre className="bg-white rounded-xl p-4 text-sm text-[#071422] overflow-x-auto border border-slate-200 font-mono">
                      {JSON.stringify(coll.sample, null, 2).slice(0, 500)}...
                    </pre>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
