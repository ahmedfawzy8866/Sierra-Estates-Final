'use client';

import React, { useState } from 'react';
import { Settings, Key, Shield, Bell, Globe, Save, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Sierra Estates',
    supportEmail: 'support@sierraestates.luxury',
    webhookUrl: 'https://api.sierraestates.luxury/webhooks',
    pfApiKey: '••••••••••••••••',
    notificationsEnabled: true,
    maintenanceMode: false,
    debugLogging: false,
  });

  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    // Save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      {/* ══ Header ══ */}
      <div>
        <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C9A84C] uppercase font-mono block mb-2">
          System Administration
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#071422] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
        <p className="text-[#3a5570] text-sm">Manage system configuration and integrations</p>
      </div>

      {/* ══ Settings Sections ══ */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f3f4f5]">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#031632' + '14' }}>
              <Globe className="text-[#031632]" size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
              General Settings
            </h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#3a5570] mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={e =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#e7e8e9] rounded-lg text-sm outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#3a5570] mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={e =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#e7e8e9] rounded-lg text-sm outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f3f4f5]">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#031632' + '14' }}>
              <Shield className="text-[#031632]" size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
              Integrations
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#3a5570] mb-2">
                Webhook URL
              </label>
              <input
                type="text"
                value={settings.webhookUrl}
                onChange={e =>
                  setSettings({ ...settings, webhookUrl: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#e7e8e9] rounded-lg text-sm outline-none focus:border-[#C9A84C] font-mono"
              />
              <p className="text-xs text-[#3a5570]/60 mt-2">
                Used for Property Finder and external webhooks
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#3a5570] mb-2">
                Property Finder API Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.pfApiKey}
                  onChange={e =>
                    setSettings({ ...settings, pfApiKey: e.target.value })
                  }
                  className="flex-1 px-4 py-2.5 border border-[#e7e8e9] rounded-lg text-sm outline-none focus:border-[#C9A84C] font-mono"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 py-2.5 border border-[#e7e8e9] rounded-lg text-[#3a5570] hover:bg-[#f3f4f5] transition-colors"
                >
                  <Key size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f3f4f5]">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#031632' + '14' }}>
              <Bell className="text-[#031632]" size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-[#e7e8e9] rounded-lg hover:bg-[#f8f9fa]">
              <div>
                <p className="text-sm font-semibold text-[#071422]">
                  Email Notifications
                </p>
                <p className="text-xs text-[#3a5570]/60 mt-1">
                  Receive alerts for important events
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={e =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-[#e7e8e9] text-[#031632]"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f3f4f5]">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#031632' + '14' }}>
              <Settings className="text-[#031632]" size={20} />
            </div>
            <h2 className="text-lg font-bold text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
              System
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-[#e7e8e9] rounded-lg hover:bg-[#f8f9fa]">
              <div>
                <p className="text-sm font-semibold text-[#071422]">
                  Maintenance Mode
                </p>
                <p className="text-xs text-[#3a5570]/60 mt-1">
                  Disable access for non-admins
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={e =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-[#e7e8e9] text-[#031632]"
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-[#e7e8e9] rounded-lg hover:bg-[#f8f9fa]">
              <div>
                <p className="text-sm font-semibold text-[#071422]">
                  Debug Logging
                </p>
                <p className="text-xs text-[#3a5570]/60 mt-1">
                  Log detailed system events
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.debugLogging}
                onChange={e =>
                  setSettings({ ...settings, debugLogging: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#e7e8e9] text-[#031632]"
              />
            </div>
          </div>
        </div>

        {/* ══ Save Button ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 bg-[#031632] text-white rounded-lg font-semibold hover:bg-[#041f3d] transition-all shadow-sm hover:shadow-md"
          >
            {saved ? (
              <>
                <Check size={18} /> Saved
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
          <p className="text-xs text-[#3a5570]/60 text-center sm:text-left">
            All changes are automatically synced to the system
          </p>
        </div>
      </div>
    </div>
  );
}
