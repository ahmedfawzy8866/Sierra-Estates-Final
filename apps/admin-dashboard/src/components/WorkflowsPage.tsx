import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Workflow } from '../types';

interface WorkflowsPageProps {
  T: (key: string) => string;
  isAr?: boolean;
  searchQuery?: string;
}

const WORKFLOW_FALLBACKS: Record<string, { nameAr: string; descEn: string; descAr: string }> = {
  'Lead Ingestion → Firestore': {
    nameAr: 'معالجة وتوجيه العملاء الجدد',
    descEn: 'Processes raw WhatsApp text and routes parsed leads info into Firestore.',
    descAr: 'تحليل وتنسيق معلومات المعاينات من نصوص واتس اب الخام وتوجيهها إلى قاعدة البيانات.'
  },
  'WhatsApp Scraper Cron (30m)': {
    nameAr: 'مراقب مجموعات الواتساب والمواقع',
    descEn: 'Periodically audits WhatsApp broker communities for raw listing postings.',
    descAr: 'سحب البيانات التلقائي وعمل فحص دوري لمجموعات السماسرة والمواقع العقارية.'
  },
  'Listing Price AVM Sync': {
    nameAr: 'مزامنة الأسعار مع محرك التقييم',
    descEn: 'Synchronizes listing prices with actual Sierra valuation models.',
    descAr: 'مراجعة أسعار السوق المعروضة وتعديلها تلقائياً بالاعتماد على ذكاء نماذج سييرا.'
  },
  'Stage-9 Contract Generator': {
    nameAr: 'توليد العقود للمرحلة الختامية',
    descEn: 'Prepares contract PDFs and logs legal signatures dynamic events.',
    descAr: 'إعداد مسودات العقود القانونية النهائية وتسجيل تواقيع العملاء وإيداع الدفعات.'
  },
  'Broker KPI Report (Daily)': {
    nameAr: 'تقرير مؤشرات الأداء اليومي للوسطاء',
    descEn: 'Synthesizes daily metrics on agent activity and lead progression rates.',
    descAr: 'استخلاص وتقييم تقارير الأداء اليومية ونشاط الوكلاء ونسب الإغلاق الفعلي.'
  },
  'Stale Listing Monitor': {
    nameAr: 'مراقب العقود والوحدات الراكدة',
    descEn: 'Audits old database entries and changes status of stale units to Review.',
    descAr: 'فلترة العقارات القديمة والوحدات غير المحدثة وتغيير حالتها تلقائياً للمراجعة.'
  },
  'Email Follow-Up Sequence': {
    nameAr: 'سلسلة رسائل المتابعة البريدية',
    descEn: 'Dispatches periodic reminders to prospects showing interest.',
    descAr: 'إرسال رسائل بريد تذكيرية آلية دورية للعملاء المهتمين بوحدات محددة.'
  },
  'Telegram Alert Dispatcher': {
    nameAr: 'مرسل تنبيهات تيليجرام للعمليات الإدارية',
    descEn: 'Pushes high-priority bot matches instantly to team Telegram channels.',
    descAr: 'بث فوري لأحدث ترشيحات العقارات ومطابقة العملاء لقنوات العمل الإدارية.'
  }
};

export default function WorkflowsPage({ T, isAr, searchQuery = '' }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runningAll, setRunningAll] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'workflows'), (snap) => {
      const loaded: Workflow[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        const key = d.name || '';
        const fallback = WORKFLOW_FALLBACKS[key];
        loaded.push({
          id: doc.id,
          name: d.name,
          nameAr: d.nameAr || fallback?.nameAr || d.name,
          desc: d.desc || fallback?.descEn || '',
          descAr: d.descAr || fallback?.descAr || '',
          status: d.status,
          runs: d.runs,
          last: d.last,
          color: d.color,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
        });
      });
      // Sort in logical workflow order
      setWorkflows(loaded.sort((a,b) => a.id.localeCompare(b.id)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'workflows');
    });

    return () => unsub();
  }, []);

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows;
    const qLower = searchQuery.toLowerCase();
    return workflows.filter((w) => {
      const statusKey = w.status === 'active' ? 'online' : w.status === 'paused' ? 'idle' : 'config';
      const statusTranslated = T(statusKey);
      return (
        w.name.toLowerCase().includes(qLower) ||
        (w.nameAr && w.nameAr.toLowerCase().includes(qLower)) ||
        w.desc.toLowerCase().includes(qLower) ||
        (w.descAr && w.descAr.toLowerCase().includes(qLower)) ||
        statusTranslated.toLowerCase().includes(qLower) ||
        w.status.toLowerCase().includes(qLower)
      );
    });
  }, [workflows, searchQuery, T]);

  const toggleWorkflow = async (wf: Workflow) => {
    const ref = doc(db, 'workflows', wf.id);
    const nextStatus = wf.status === 'paused' ? 'active' : 'paused';
    try {
      await updateDoc(ref, {
        status: nextStatus,
        updatedAt: new Date()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `workflows/${wf.id}`);
    }
  };

  const triggerRunAll = async () => {
    setRunningAll(true);
    try {
      // Loop through running ones and increment run counts in Firestore
      for (const wf of workflows) {
        if (wf.status === 'active') {
          const ref = doc(db, 'workflows', wf.id);
          await updateDoc(ref, {
            runs: wf.runs + 1,
            last: 'Just now',
            updatedAt: new Date()
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRunningAll(false), 800);
    }
  };

  const translateTime = (timeStr: string) => {
    if (!isAr) return timeStr;
    const lower = timeStr.toLowerCase().trim();
    if (lower.includes('just now')) return 'الآن';
    if (lower.includes('2 min ago')) return 'منذ دقيقتين';
    if (lower.includes('28 min ago')) return 'منذ ٢٨ دقيقة';
    if (lower.includes('15 min ago')) return 'منذ ١٥ دقيقة';
    if (lower.includes('4 min ago')) return 'منذ ٤ دقائق';
    if (lower.includes('1 hr ago')) return 'منذ ساعة';
    if (lower.includes('2 hrs ago')) return 'منذ ساعتين';
    if (lower.includes('6 hrs ago')) return 'منذ ٦ ساعات';
    if (lower.includes('1 day ago')) return 'منذ يوم من العجز';
    return timeStr;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Upper Control Bar */}
      <div className="flex gap-2.5 flex-wrap">
        <button
          onClick={triggerRunAll}
          disabled={runningAll}
          className="px-4 py-2 text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded flex items-center gap-2 select-none transition active:scale-95 disabled:opacity-50 disabled:scale-100 duration-100 cursor-pointer"
          id="btn-trigger-all-workflows"
        >
          <span>⚡</span>
          <span>
            {runningAll 
              ? (isAr ? "يجري تنفيذ مهام الأتمتة..." : "Pipelining crons...") 
              : (isAr ? "تشغيل كافة مهام الأتمتة" : "Activate All Routines")}
          </span>
        </button>
        <button
          onClick={triggerRunAll}
          className="px-4 py-2 text-xs font-bold bg-white/5 border border-slate-800 text-white rounded flex items-center gap-1.5 hover:bg-white/10 transition select-none active:scale-95 duration-100 cursor-pointer"
          id="btn-refresh-workflows"
        >
          <span>🔄</span>
          <span>{isAr ? "مزامنة سير العمل الكلي" : "Sync Pipelines"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* n8n Workflows */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              {isAr ? "تفاصيل عمليات الأتمتة · نظام n8n الذكي" : "Automation Workflows · n8n System"}
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase select-none">
              {workflows.length} {isAr ? "أتمتة مبرمجة" : "Configured"}
            </span>
          </div>
          <div className="p-4 space-y-2 max-h-[460px] overflow-y-auto">
            {filteredWorkflows.map((w) => (
              <div
                key={w.id}
                className="flex flex-col gap-2 px-4 py-3 bg-slate-900/40 border border-slate-800 rounded hover:border-slate-700 hover:bg-white/5 transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-110 transition duration-150 animate-pulse"
                    style={{ backgroundColor: w.status === 'paused' ? '#E63946' : w.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate mb-0.5">
                      {isAr ? w.nameAr : w.name}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
                      {isAr ? w.descAr : w.desc}
                    </p>
                    <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                      {w.runs.toLocaleString()} {isAr ? "تشغيلات" : "RUNS"} · {isAr ? "آخر عمل: " : "LAST: "}{translateTime(w.last)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-mono uppercase tracking-wider text-right font-bold py-0.5 px-2 rounded-full border ${
                      w.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : w.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {w.status === 'active' ? (isAr ? "نشط" : "active") : w.status === 'paused' ? (isAr ? "موقف" : "paused") : (isAr ? "تنبيه" : "warning")}
                    </span>

                    <button
                      onClick={() => toggleWorkflow(w)}
                      className="p-1.5 hover:bg-white/5 border border-slate-800 rounded text-xs text-slate-400 hover:text-cyan-400 transition shadow shrink-0 cursor-pointer"
                      title={w.status === 'paused' ? 'Activate' : 'Pause'}
                    >
                      {w.status === 'paused' ? '▶' : '⏸'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Pipeline Funnel Status */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-805 bg-slate-900/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              {isAr ? "مراحل تصنيف وتدفق العملاء الفعالة" : "Lead Pipeline · Stage Funnel"}
            </span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { s: 'S1-2', label: isAr ? 'استقبال وتحليل البيانات المتكامل' : 'Ingestion & Parsing', count: 4821, pct: 100, color: '#1E88D9' },
              { s: 'S3-5', label: isAr ? 'إدارة المخزون والتسعير التلقائي' : 'Inventory & Pricing', count: 3102, pct: 64, color: '#06b6d4' },
              { s: 'S6-8', label: isAr ? 'المطابقة والتواصل الذكي النشط' : 'Matching & Outreach', count: 1240, pct: 26, color: '#34D399' },
              { s: 'S9', label: isAr ? 'المفاوضات وصياغة العقود الفورية' : 'Negotiation', count: 421, pct: 8.7, color: '#7C3AED' },
              { s: 'S10', label: isAr ? 'الصفقات المغلقة المنجزة بالكامل' : 'Closed Deals', count: 97, pct: 2, color: '#E63946' }
            ].map((row, i) => (
              <div key={i} className="space-y-1.5 animate-slide-in">
                <div className="flex justify-between items-center text-xs select-none">
                  <span className="text-slate-350 font-medium flex items-center gap-1.5">
                    <strong className="font-mono text-sm tracking-wide" style={{ color: row.color }}>
                      {row.s}
                    </strong>
                    <span>{row.label}</span>
                  </span>
                  <span className="font-mono text-slate-500 font-bold">{row.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${row.pct}%`,
                      background: `linear-gradient(to right, ${row.color}50, ${row.color})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
