'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, Trash2, Search, Filter, Eye } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadDate: string;
  url?: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([
    {
      id: '1',
      name: 'Property_Exterior_Main.jpg',
      type: 'image',
      size: 2.5,
      uploadDate: '2026-05-20',
    },
    {
      id: '2',
      name: 'Aerial_Tour_4K.mp4',
      type: 'video',
      size: 450.0,
      uploadDate: '2026-05-19',
    },
    {
      id: '3',
      name: 'Property_Specs.pdf',
      type: 'document',
      size: 1.8,
      uploadDate: '2026-05-18',
    },
  ]);

  const [search, setSearch] = useState('');

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      image: 'bg-blue-100 text-blue-700',
      video: 'bg-purple-100 text-purple-700',
      document: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      image: '🖼️',
      video: '🎬',
      document: '📄',
    };
    return icons[type] || '📁';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2 flex items-center gap-3">
              <ImageIcon size={32} className="text-[#C9A24A]" aria-hidden="true" />
              Media Library
            </h1>
            <p className="text-[#3a5570]/60">Manage images, videos, and documents</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-[#C9A24A] text-white rounded-lg font-semibold"
          >
            <Upload size={20} />
            Upload Media
          </motion.button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-[#3a5570]/60" size={20} />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A24A]"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-[#3a5570]"
          >
            <Filter size={20} />
            Filter
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4"
      >
        {media.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-3xl">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-[#071422]">{item.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-[#3a5570]/60">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span>{item.size} MB</span>
                    <span>{item.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 hover:bg-slate-100 rounded-lg text-[#3a5570]"
                >
                  <Eye size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  onClick={() => setMedia(media.filter(m => m.id !== item.id))}
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
