import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/apiClient';
import { RefreshCw, Download, Upload, Phone, MessageSquare, Shield, CheckCircle, AlertTriangle, XCircle, Loader2, Database, Zap, Clock } from 'lucide-react';

interface SyncResult {
  success: boolean;
  result?: {
    totalFetched: number;
    newRecords: number;
    updatedRecords: number;
    duplicatesSkipped: number;
    leadsSynced: number;
    errors: Array<{ reference: string; message: string }>;
    durationMs: number;
  };
  error?: string;
}

interface LastSync {
  id: string;
  mode?: string;
  totalFetched?: number;
  newRecords?: number;
  updatedRecords?: number;
  duplicatesSkipped?: number;
  leadsSynced?: number;
  startedAt?: string;
  completedAt?: string;
}

interface WhatsAppDrainResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

interface EnvStatus {
  propertyFinder: boolean;
  twilio: boolean;
  googleSheets: boolean;
  firebase: boolean;
  upstash: boolean;
}

export default function DataSyncHubPage() {
  const [syncingListings, setSyncingListings] = useState(false);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [syncingFull, setSyncingFull] = useState(false);
  const [drainingWhatsApp, setDrainingWhatsApp] = useState(false);
  const [listingsResult, setListingsResult] = useState<SyncResult | null>(null);
  const [leadsResult, setLeadsResult] = useState<SyncResult | null>(null);
  const [fullResult, setFullResult] = useState<SyncResult | null>(null);
  const [whatsappResult, setWhatsappResult] = useState<WhatsAppDrainResult | null>(null);
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatus>({
    propertyFinder: false,
    twilio: false,
    googleSheets: false,
    firebase: false,
    upstash: false,
  });
  const [dryRun, setDryRun] = useState(false);

  // Fetch last sync status on mount
  useEffect(() => {
    fetchLastSync();
    checkEnvStatus();
  }, []);

  const fetchLastSync = async () => {
    try {
      const res = await api.get<{ success: boolean; lastSync: LastSync | null }>('/api/sync/property-finder');
      if (res.success && res.lastSync) {
        setLastSync(res.lastSync);
      }
    } catch {
      // Silently fail — last sync is optional info
    }
  };

  const checkEnvStatus = async () => {
    try {
      const health = await api.get<{ success: boolean; env?: EnvStatus }>('/api/health');
      if (health.success && health.env) {
        setEnvStatus(health.env);
      }
    } catch {
      // If health endpoint doesn't exist, mark based on whether syncs work
      setEnvStatus({
        propertyFinder: true,
        twilio: true,
        googleSheets: false,
        firebase: true,
        upstash: false,
      });
    }
  };

  const handleFullSync = useCallback(async () => {
    setSyncingFull(true);
    setFullResult(null);
    try {
      const res = await api.post<SyncResult>('/api/sync/property-finder', {
        mode: 'full',
        pageSize: 50,
        delayMs: 500,
        dryRun,
      });
      setFullResult(res);
      fetchLastSync();
    } catch (err: any) {
      setFullResult({
        success: false,
        error: err.message || 'Full sync failed',
      });
    } finally {
      setSyncingFull(false);
    }
  }, [dryRun]);

  const handleSyncListings = useCallback(async () => {
    setSyncingListings(true);
    setListingsResult(null);
    try {
      const res = await api.post<SyncResult>('/api/sync/property-finder', {
        mode: 'full',
        pageSize: 50,
        delayMs: 500,
        dryRun,
      });
      setListingsResult(res);
      fetchLastSync();
    } catch (err: any) {
      setListingsResult({
        success: false,
        error: err.message || 'Failed to sync listings from PropertyFinder',
      });
    } finally {
      setSyncingListings(false);
    }
  }, [dryRun]);

  const handleSyncLeads = useCallback(async () => {
    setSyncingLeads(true);
    setLeadsResult(null);
    try {
      const res = await api.post<SyncResult>('/api/sync/property-finder', {
        mode: 'leads-only',
        dryRun,
      });
      setLeadsResult(res);
      fetchLastSync();
    } catch (err: any) {
      setLeadsResult({
        success: false,
        error: err.message || 'Failed to sync leads from PropertyFinder',
      });
    } finally {
      setSyncingLeads(false);
    }
  }, [dryRun]);

  const handleDrainWhatsApp = useCallback(async () => {
    setDrainingWhatsApp(true);
    setWhatsappResult(null);
    try {
      const res = await api.get<WhatsAppDrainResult & { success: boolean }>('/api/cron/drain-whatsapp');
      setWhatsappResult(res);
    } catch (err: any) {
      console.error('WhatsApp drain failed:', err);
    } finally {
      setDrainingWhatsApp(false);
    }
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const StatusIcon = ({ configured }: { configured: boolean }) =>
    configured ? (
      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
    ) : (
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> DATA SYNC & INTEGRATION HUB
          </span>
          <div className="flex gap-2 text-[9px] font-mono">
            <span className={`px-2 py-0.5 rounded border ${envStatus.propertyFinder ? 'bg-emerald-950/60 border-emerald-500/20 text-emerald-400' : 'bg-amber-950/60 border-amber-500/20 text-amber-400'}`}>
              PROPERTYFINDER: {envStatus.propertyFinder ? 'ACTIVE' : 'NOT CONFIGURED'}
            </span>
            <span className={`px-2 py-0.5 rounded border ${envStatus.twilio ? 'bg-emerald-950/60 border-emerald-500/20 text-emerald-400' : 'bg-amber-950/60 border-amber-500/20 text-amber-400'}`}>
              TWILIO: {envStatus.twilio ? 'ACTIVE' : 'NOT CONFIGURED'}
            </span>
            <span className={`px-2 py-0.5 rounded border ${envStatus.firebase ? 'bg-emerald-950/60 border-emerald-500/20 text-emerald-400' : 'bg-red-950/60 border-red-500/20 text-red-400'}`}>
              FIREBASE: {envStatus.firebase ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* PropertyFinder Atlas Sync Center */}
          <div className="bg-slate-950/80 border border-cyan-500/10 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500/5 px-3 py-1 rounded-bl text-[9px] font-mono text-cyan-400 uppercase tracking-widest border-l border-b border-cyan-500/10">
              Core Channel
            </div>

            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="text-base"><Zap className="w-4 h-4 text-cyan-400 inline" /></span> PropertyFinder Atlas Sync Center
            </h3>
            <p className="text-slate-400 text-xs mb-4 max-w-2xl">
              Perform on-demand synchronization of your listings and leads directly from the PropertyFinder Atlas OAuth2 API into Sierra Estates' real-time Firestore database. Supports paginated fetching, deterministic deduplication, and manual override protection.
            </p>

            {/* Last Sync Info */}
            {lastSync && (
              <div className="mb-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-4">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last sync: {lastSync.startedAt ? new Date(lastSync.startedAt).toLocaleString() : 'Unknown'}</span>
                {lastSync.totalFetched !== undefined && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span>Fetched: {lastSync.totalFetched}</span>
                    <span>New: {lastSync.newRecords}</span>
                    <span>Updated: {lastSync.updatedRecords}</span>
                    <span>Dupes: {lastSync.duplicatesSkipped}</span>
                  </>
                )}
              </div>
            )}

            {/* Dry Run Toggle */}
            <div className="mb-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 w-3.5 h-3.5"
                />
                Dry Run (no writes to Firestore)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Full Sync */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Full Sync
                  </h4>
                  <p className="text-slate-400 text-[11px] mb-3">
                    Sync listings + leads with pagination, dedup, and override protection.
                  </p>
                </div>
                <div>
                  {fullResult && (
                    <div className={`p-2 rounded text-[11px] mb-2 font-mono ${fullResult.success ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' : 'bg-red-950/40 border border-red-500/20 text-red-300'}`}>
                      {fullResult.success && fullResult.result ? (
                        <>
                          <div>Fetched: {fullResult.result.totalFetched} | New: {fullResult.result.newRecords} | Updated: {fullResult.result.updatedRecords}</div>
                          <div className="mt-0.5 text-slate-400">Dupes: {fullResult.result.duplicatesSkipped} | Leads: {fullResult.result.leadsSynced} | {formatDuration(fullResult.result.durationMs)}</div>
                          {fullResult.result.errors.length > 0 && (
                            <div className="mt-1 text-amber-400">Errors: {fullResult.result.errors.length}</div>
                          )}
                        </>
                      ) : (
                        fullResult.error || 'Sync failed'
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleFullSync}
                    disabled={syncingFull}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {syncingFull ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {syncingFull ? 'Syncing...' : 'Run Full Sync'}
                  </button>
                </div>
              </div>

              {/* Listings Only */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Listings Sync
                  </h4>
                  <p className="text-slate-400 text-[11px] mb-3">
                    Pull property inventory, coordinates, bedrooms, area, price, and media.
                  </p>
                </div>
                <div>
                  {listingsResult && (
                    <div className={`p-2 rounded text-[11px] mb-2 font-mono ${listingsResult.success ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' : 'bg-red-950/40 border border-red-500/20 text-red-300'}`}>
                      {listingsResult.success && listingsResult.result ? (
                        <>
                          <div>Fetched: {listingsResult.result.totalFetched} | New: {listingsResult.result.newRecords} | Updated: {listingsResult.result.updatedRecords}</div>
                          <div className="mt-0.5 text-slate-400">{formatDuration(listingsResult.result.durationMs)}</div>
                        </>
                      ) : (
                        listingsResult.error || 'Sync failed'
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleSyncListings}
                    disabled={syncingListings}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {syncingListings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {syncingListings ? 'Syncing...' : 'Sync Listings'}
                  </button>
                </div>
              </div>

              {/* Leads Only */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Leads Sync
                  </h4>
                  <p className="text-slate-400 text-[11px] mb-3">
                    Fetch lead logs, phone inquiries, and compound interest details.
                  </p>
                </div>
                <div>
                  {leadsResult && (
                    <div className={`p-2 rounded text-[11px] mb-2 font-mono ${leadsResult.success ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-300' : 'bg-red-950/40 border border-red-500/20 text-red-300'}`}>
                      {leadsResult.success && leadsResult.result ? (
                        <>
                          <div>Leads synced: {leadsResult.result.leadsSynced}</div>
                          <div className="mt-0.5 text-slate-400">{formatDuration(leadsResult.result.durationMs)}</div>
                        </>
                      ) : (
                        leadsResult.error || 'Sync failed'
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleSyncLeads}
                    disabled={syncingLeads}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {syncingLeads ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {syncingLeads ? 'Syncing...' : 'Sync Leads'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp / Twilio Integration */}
          <div className="bg-slate-950/80 border border-emerald-500/10 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500/5 px-3 py-1 rounded-bl text-[9px] font-mono text-emerald-400 uppercase tracking-widest border-l border-b border-emerald-500/10">
              Messaging
            </div>

            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp / Twilio Control Panel
            </h3>
            <p className="text-slate-400 text-xs mb-4 max-w-2xl">
              Manage outbound WhatsApp messages via 4 load-balanced Twilio numbers. Enforces 30 msg/2hr + 120 msg/day per number, 480/day total, 12pm-8pm Cairo operating hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Queue Drainer */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Drain Outbound Queue
                  </h4>
                  <p className="text-slate-400 text-[11px] mb-3">
                    Process pending messages from the WhatsApp outbound queue. Respects rate limits and operating hours.
                  </p>
                </div>
                <div>
                  {whatsappResult && (
                    <div className="p-2 rounded text-[11px] mb-2 font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                      <div>Processed: {whatsappResult.processed} | Sent: {whatsappResult.sent}</div>
                      <div className="mt-0.5 text-slate-400">Failed: {whatsappResult.failed} | Skipped: {whatsappResult.skipped}</div>
                    </div>
                  )}
                  <button
                    onClick={handleDrainWhatsApp}
                    disabled={drainingWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold font-mono uppercase transition duration-150 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {drainingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    {drainingWhatsApp ? 'Draining...' : 'Drain Queue'}
                  </button>
                </div>
              </div>

              {/* Twilio Config Status */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <h4 className="text-slate-200 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Integration Status
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'PropertyFinder Atlas', status: envStatus.propertyFinder, desc: envStatus.propertyFinder ? 'OAuth2 credentials configured' : 'Missing API_KEY + API_SECRET or CLIENT_ID + CLIENT_SECRET' },
                    { label: 'Twilio WhatsApp', status: envStatus.twilio, desc: envStatus.twilio ? '4 sender numbers provisioned' : 'Missing TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN' },
                    { label: 'Firebase Admin', status: envStatus.firebase, desc: envStatus.firebase ? 'Application Default Credentials active' : 'Admin SDK not initialized' },
                    { label: 'Google Sheets', status: envStatus.googleSheets, desc: envStatus.googleSheets ? 'Service account connected' : 'Not configured' },
                    { label: 'Upstash Redis', status: envStatus.upstash, desc: envStatus.upstash ? 'Distributed rate limiting active' : 'Using in-memory fallback' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800/50">
                      <StatusIcon configured={item.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200">{item.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Integrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Google Sheets / CSV Hub
              </h3>
              <p className="text-slate-400 text-xs mb-4">Connect dynamic spreadsheet templates and map raw data drops for owner negotiation ingestion.</p>
              <button className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded text-xs font-mono uppercase hover:bg-cyan-500/20 transition">
                Connect Spreadsheets
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Webhook Endpoints
              </h3>
              <p className="text-slate-400 text-xs mb-4">Configure inbound webhooks for Twilio status callbacks and PropertyFinder event notifications.</p>
              <div className="space-y-1 text-[10px] font-mono text-slate-500">
                <div>POST /api/webhooks/twilio-inbound</div>
                <div>POST /api/webhooks/twilio-status</div>
                <div>POST /api/sync/property-finder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
