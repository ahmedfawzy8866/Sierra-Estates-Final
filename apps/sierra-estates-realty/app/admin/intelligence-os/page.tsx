'use client';

import { useState } from 'react';
import { ExternalLink, BrainCircuit, RefreshCw } from 'lucide-react';

/**
 * Intelligence OS — embeds the externally-deployed Sierra Estates
 * "Intelligence OS" console (Remix app on Google Cloud Run).
 *
 * The URL is configurable via NEXT_PUBLIC_INTELLIGENCE_OS_URL; the deployed
 * Cloud Run service is the default so the panel works out of the box.
 */
const INTELLIGENCE_OS_URL =
  process.env.NEXT_PUBLIC_INTELLIGENCE_OS_URL ||
  'https://remix-remix-remix-sierra-estates-intelligence-os-755638710103.europe-west2.run.app';

export default function IntelligenceOSPage() {
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#031632] flex items-center justify-center text-[#C9A84C] shrink-0">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#071422] font-display tracking-tight">
              Intelligence OS
            </h1>
            <p className="text-[12px] text-[#3a5570]/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live cognitive console · Cloud Run
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-[#071422]/60 hover:text-[#071422] hover:bg-black/[0.04] border border-black/5 transition-colors"
            title="Reload console"
          >
            <RefreshCw size={14} />
            Reload
          </button>
          <a
            href={INTELLIGENCE_OS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#031632] hover:bg-[#06203f] transition-colors"
          >
            <ExternalLink size={14} />
            Open full screen
          </a>
        </div>
      </div>

      {/* Embedded console */}
      <div className="relative rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] h-[calc(100vh-220px)] min-h-[520px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
              <div className="text-[11px] font-mono tracking-widest uppercase text-[#3a5570]/50">
                Connecting to Intelligence OS…
              </div>
            </div>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={INTELLIGENCE_OS_URL}
          title="Sierra Estates Intelligence OS"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <p className="text-[10px] text-[#3a5570]/40 font-mono">
        If the console does not load,{' '}
        <a
          href={INTELLIGENCE_OS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C9A84C] hover:underline"
        >
          open it in a new tab
        </a>
        .
      </p>
    </div>
  );
}
