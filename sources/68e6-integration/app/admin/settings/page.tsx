'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Globe, Mail, Eye, ToggleRight, ToggleLeft } from 'lucide-react';

interface Setting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  value: boolean;
  category: 'notifications' | 'privacy' | 'integrations' | 'display';
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'email-alerts',
      label: 'Email Alerts',
      description: 'Receive email notifications for important events',
      icon: Mail,
      value: true,
      category: 'notifications',
    },
    {
      id: 'push-notifications',
      label: 'Push Notifications',
      description: 'Enable browser push notifications',
      icon: Bell,
      value: true,
      category: 'notifications',
    },
    {
      id: 'deal-updates',
      label: 'Deal Updates',
      description: 'Get notified when deals progress',
      icon: ToggleRight,
      value: true,
      category: 'notifications',
    },
    {
      id: 'privacy-mode',
      label: 'Privacy Mode',
      description: 'Hide sensitive data on shared screens',
      icon: Eye,
      value: false,
      category: 'privacy',
    },
    {
      id: 'api-access',
      label: 'API Access',
      description: 'Allow external integrations',
      icon: Globe,
      value: true,
      category: 'integrations',
    },
    {
      id: 'two-factor',
      label: 'Two-Factor Authentication',
      description: 'Require 2FA for account access',
      icon: Lock,
      value: true,
      category: 'privacy',
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map(s =>
        s.id === id ? { ...s, value: !s.value } : s
      )
    );
  };

  const categories = ['notifications', 'privacy', 'integrations', 'display'] as const;

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
        <h1 className="text-4xl font-bold text-[#071422] tracking-tight mb-2 flex items-center gap-3">
          <Settings size={32} className="text-[#C9A24A]" />
          Settings & Configuration
        </h1>
        <p className="text-[#3a5570]/60">Manage preferences, integrations, and security settings</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {categories.map((category) => {
          const categorySettings = settings.filter(s => s.category === category);
          if (categorySettings.length === 0) return null;

          const categoryLabels: Record<string, string> = {
            notifications: '🔔 Notifications',
            privacy: '🔒 Privacy & Security',
            integrations: '🔗 Integrations',
            display: '🎨 Display',
          };

          return (
            <motion.div key={category} variants={itemVariants}>
              <h2 className="text-2xl font-bold text-[#071422] mb-6">{categoryLabels[category]}</h2>
              <div className="space-y-4">
                {categorySettings.map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <motion.div
                      key={setting.id}
                      whileHover={{ x: 4 }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#C9A24A]/10 flex items-center justify-center mt-1">
                          <Icon size={20} className="text-[#C9A24A]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#071422]">{setting.label}</h3>
                          <p className="text-sm text-[#3a5570]/60 mt-1">{setting.description}</p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => toggleSetting(setting.id)}
                        className={`relative w-16 h-8 rounded-full transition-colors ${
                          setting.value ? 'bg-[#C9A24A]' : 'bg-slate-300'
                        }`}
                      >
                        <motion.div
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                          animate={{ left: setting.value ? '28px' : '4px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-xl font-bold text-[#071422] mb-6">Save & Export</h2>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-[#C9A24A] text-white rounded-lg font-semibold"
          >
            Save Changes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-white border border-slate-200 text-[#071422] rounded-lg font-semibold"
          >
            Export Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
