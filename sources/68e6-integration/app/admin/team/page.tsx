'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Shield, UserPlus, MoreVertical } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager' | 'viewer';
  status: 'active' | 'inactive';
  joinDate: string;
  deals?: number;
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ahmed Fawzy',
      email: 'a.fawzy8866@gmail.com',
      role: 'admin',
      status: 'active',
      joinDate: '2026-01-15',
      deals: 24,
    },
    {
      id: '2',
      name: 'Sarah Hassan',
      email: 'sarah@sierraestates.luxury',
      role: 'agent',
      status: 'active',
      joinDate: '2026-02-20',
      deals: 12,
    },
    {
      id: '3',
      name: 'Mohamed Ali',
      email: 'mali@sierraestates.luxury',
      role: 'agent',
      status: 'active',
      joinDate: '2026-03-10',
      deals: 8,
    },
  ]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      agent: 'bg-blue-100 text-blue-700',
      manager: 'bg-purple-100 text-purple-700',
      viewer: 'bg-slate-100 text-slate-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2 flex items-center gap-3">
              <Users size={32} className="text-[#C9A24A]" />
              Team Management
            </h1>
            <p className="text-[#3a5570]/60">Manage team members, roles, and permissions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-[#C9A24A] text-white rounded-lg font-semibold"
          >
            <UserPlus size={20} />
            Add Member
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 mb-12"
      >
        {team.map((member) => (
          <motion.div key={member.id} variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#071422]">{member.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#3a5570]/60">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {member.email}
                    </span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-100 rounded-lg">
                  <MoreVertical size={20} className="text-[#3a5570]" />
                </motion.button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                {member.deals && (
                  <div className="text-right">
                    <div className="text-xs text-[#3a5570]/60 font-semibold">CLOSED DEALS</div>
                    <div className="text-lg font-bold text-[#071422]">{member.deals}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
