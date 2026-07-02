'use client';

import React, { useState } from 'react';
import { Brain, Zap, Database, Activity } from 'lucide-react';

export default function IntelligenceOSPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Intelligence OS</h1>
        <p className="text-[#C9A84C]/60">AI-powered property matching and market analysis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#C9A84C]/20">
        {['overview', 'matching', 'market', 'agents'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === tab
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#C9A84C]/60 hover:text-[#C9A84C]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-[#C9A84C]" size={24} />
                <h3 className="text-lg font-bold text-white">AI Engine</h3>
              </div>
              <p className="text-[#C9A84C]/60 mb-4">Advanced property matching using machine learning</p>
              <div className="space-y-2 text-sm text-[#C9A84C]/80">
                <p>✓ Real-time market analysis</p>
                <p>✓ Investor profile matching</p>
                <p>✓ ROI predictions</p>
              </div>
            </div>

            <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-[#C9A84C]" size={24} />
                <h3 className="text-lg font-bold text-white">Data Integration</h3>
              </div>
              <p className="text-[#C9A84C]/60 mb-4">Connected to property finder and external sources</p>
              <div className="space-y-2 text-sm text-[#C9A84C]/80">
                <p>✓ PropertyFinder sync</p>
                <p>✓ Market data feeds</p>
                <p>✓ Live pricing updates</p>
              </div>
            </div>

            <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-[#C9A84C]" size={24} />
                <h3 className="text-lg font-bold text-white">Automation</h3>
              </div>
              <p className="text-[#C9A84C]/60 mb-4">n8n workflows for lead routing and follow-up</p>
              <div className="space-y-2 text-sm text-[#C9A84C]/80">
                <p>✓ Lead qualification</p>
                <p>✓ WhatsApp notifications</p>
                <p>✓ Task automation</p>
              </div>
            </div>

            <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-[#C9A84C]" size={24} />
                <h3 className="text-lg font-bold text-white">Monitoring</h3>
              </div>
              <p className="text-[#C9A84C]/60 mb-4">Real-time system health and performance tracking</p>
              <div className="space-y-2 text-sm text-[#C9A84C]/80">
                <p>✓ System uptime: 99.9%</p>
                <p>✓ Lead processing: Real-time</p>
                <p>✓ Database sync: Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matching' && (
          <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Property Matching Engine</h3>
            <p className="text-[#C9A84C]/60 mb-6">The AI analyzes investor profiles and matches them with optimal properties based on:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-[#C9A84C]">Investment Criteria</h4>
                <ul className="space-y-1 text-[#C9A84C]/80 text-sm">
                  <li>• Budget range</li>
                  <li>• Expected ROI</li>
                  <li>• Property type preference</li>
                  <li>• Location preference</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-[#C9A84C]">Property Scoring</h4>
                <ul className="space-y-1 text-[#C9A84C]/80 text-sm">
                  <li>• Market position (0-100)</li>
                  <li>• ROI potential</li>
                  <li>• Historical appreciation</li>
                  <li>• Risk assessment</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Market Analysis</h3>
            <p className="text-[#C9A84C]/60 mb-6">Real-time market intelligence across New Cairo communities:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[#C9A84C] font-semibold mb-3">Madinaty</p>
                <div className="space-y-1 text-sm text-[#C9A84C]/80">
                  <p>Avg ROI: 8-12%</p>
                  <p>Appreciation: +5% YoY</p>
                  <p>Rental Yield: 4.5%</p>
                </div>
              </div>
              <div>
                <p className="text-[#C9A84C] font-semibold mb-3">Mostakbal City</p>
                <div className="space-y-1 text-sm text-[#C9A84C]/80">
                  <p>Avg ROI: 10-15%</p>
                  <p>Appreciation: +7% YoY</p>
                  <p>Rental Yield: 5.2%</p>
                </div>
              </div>
              <div>
                <p className="text-[#C9A84C] font-semibold mb-3">5th Settlement</p>
                <div className="space-y-1 text-sm text-[#C9A84C]/80">
                  <p>Avg ROI: 12-18%</p>
                  <p>Appreciation: +9% YoY</p>
                  <p>Rental Yield: 6.1%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Integrated Agents</h3>
            <p className="text-[#C9A84C]/60 mb-6">Connected agents and automation workflows:</p>
            <div className="space-y-4">
              <div className="bg-[#071422] rounded-lg p-4 border border-[#C9A84C]/10">
                <h4 className="font-semibold text-[#C9A84C] mb-2">PropertyFinder Sync Agent</h4>
                <p className="text-[#C9A84C]/60 text-sm">Automated synchronization with PropertyFinder listings</p>
              </div>
              <div className="bg-[#071422] rounded-lg p-4 border border-[#C9A84C]/10">
                <h4 className="font-semibold text-[#C9A84C] mb-2">Lead Classification Agent</h4>
                <p className="text-[#C9A84C]/60 text-sm">Automatic categorization and scoring of incoming leads</p>
              </div>
              <div className="bg-[#071422] rounded-lg p-4 border border-[#C9A84C]/10">
                <h4 className="font-semibold text-[#C9A84C] mb-2">WhatsApp Notification Agent</h4>
                <p className="text-[#C9A84C]/60 text-sm">Real-time lead notifications via WhatsApp through n8n</p>
              </div>
              <div className="bg-[#071422] rounded-lg p-4 border border-[#C9A84C]/10">
                <h4 className="font-semibold text-[#C9A84C] mb-2">Match Recommendation Agent</h4>
                <p className="text-[#C9A84C]/60 text-sm">Intelligent property recommendations based on investor profile</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
