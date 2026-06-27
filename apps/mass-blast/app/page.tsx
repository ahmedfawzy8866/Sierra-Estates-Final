'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  MessageSquare, Upload, Send, Trash2, Download, Copy,
  X, Users, FileText, Settings, Zap,
  CheckCircle, Loader2, ChevronRight, Plus
} from 'lucide-react';
import {
  parseNumbers, parseCSV, generateLinks, exportToCSV,
  personalizeMessage, type ParsedNumber
} from '@/lib/phone-parser';

type InputTab = 'paste' | 'upload' | 'manual';
type Step = 'input' | 'compose' | 'preview' | 'sending';

export default function MassBlastPage() {
  const [step, setStep] = useState<Step>('input');
  const [inputTab, setInputTab] = useState<InputTab>('paste');

  // Input state
  const [rawText, setRawText] = useState('');
  const [manualNumbers, setManualNumbers] = useState<Array<{ name: string; phone: string }>>([{ name: '', phone: '' }]);
  const [defaultCountryCode, setDefaultCountryCode] = useState('20');
  const [parsedNumbers, setParsedNumbers] = useState<ParsedNumber[]>([]);

  // Message state
  const [messageTemplate, setMessageTemplate] = useState(
    'Hello {name}! 👋\n\nWe have exclusive luxury properties in New Cairo that match your interests. Would you like to see the catalog?\n\nBest regards,\nSierra Estates Team'
  );

  // Send state
  const [batchSize, setBatchSize] = useState(5);
  const [batchDelay, setBatchDelay] = useState(3);
  const [useWhatsAppWeb, setUseWhatsAppWeb] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);

  // Stats
  const validNumbers = useMemo(() => parsedNumbers.filter((n) => n.valid), [parsedNumbers]);
  const invalidNumbers = useMemo(() => parsedNumbers.filter((n) => !n.valid), [parsedNumbers]);
  const duplicateCount = useMemo(() => {
    const raw = rawText.split(/[\n\r]+/).filter(Boolean).length;
    return Math.max(0, raw - parsedNumbers.length);
  }, [rawText, parsedNumbers]);

  const links = useMemo(
    () => generateLinks(validNumbers, messageTemplate, useWhatsAppWeb),
    [validNumbers, messageTemplate, useWhatsAppWeb]
  );

  // ── Handlers ────────────────────────────────────────────────────────

  const handleParse = useCallback(() => {
    let numbers: ParsedNumber[] = [];
    if (inputTab === 'paste' && rawText.trim()) {
      numbers = parseNumbers(rawText, { defaultCountryCode, extractNames: true, deduplicate: true });
    } else if (inputTab === 'manual') {
      const text = manualNumbers
        .filter((m) => m.phone.trim())
        .map((m) => m.name && m.name.trim() ? `${m.name.trim()},${m.phone.trim()}` : m.phone.trim())
        .join('\n');
      numbers = parseNumbers(text, { defaultCountryCode, extractNames: true, deduplicate: true });
    }
    setParsedNumbers(numbers);
    if (numbers.length > 0) {
      setStep('compose');
    }
  }, [inputTab, rawText, manualNumbers, defaultCountryCode]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const numbers = parseCSV(text, { defaultCountryCode, extractNames: true, deduplicate: true });
    setParsedNumbers(numbers);
    setRawText(text); // Store for reference
    if (numbers.length > 0) {
      setStep('compose');
    }
  }, [defaultCountryCode]);

  const handleSendBatch = useCallback(async (startIndex: number) => {
    const batch = links.slice(startIndex, startIndex + batchSize);
    for (const item of batch) {
      window.open(item.link, '_blank');
      setSentCount((c) => c + 1);
      // Small delay between individual opens to avoid browser blocking
      await new Promise((r) => setTimeout(r, 200));
    }
  }, [links, batchSize]);

  const handleSendAll = useCallback(async () => {
    setSending(true);
    setSentCount(0);
    setCurrentBatch(0);

    const totalBatches = Math.ceil(links.length / batchSize);
    for (let i = 0; i < totalBatches; i++) {
      setCurrentBatch(i + 1);
      await handleSendBatch(i * batchSize);
      if (i < totalBatches - 1) {
        // Wait between batches
        await new Promise((r) => setTimeout(r, batchDelay * 1000));
      }
    }

    setSending(false);
    setStep('preview');
  }, [links, batchSize, batchDelay, handleSendBatch]);

  const handleAddManualRow = () => {
    setManualNumbers((prev) => [...prev, { name: '', phone: '' }]);
  };

  const handleManualChange = (index: number, field: 'name' | 'phone', value: string) => {
    setManualNumbers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveManualRow = (index: number) => {
    setManualNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(parsedNumbers, true, messageTemplate);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `massblast-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAllLinks = () => {
    const text = links.map((l) => l.link).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setStep('input');
    setParsedNumbers([]);
    setRawText('');
    setManualNumbers([{ name: '', phone: '' }]);
    setSentCount(0);
    setCurrentBatch(0);
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">MassBlast</h1>
              <p className="text-[10px] text-[var(--muted-foreground)] -mt-0.5">WhatsApp Bulk Sender</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {parsedNumbers.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 h-8 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
              >
                <X size={14} strokeWidth={1.75} />
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 text-[12px]">
          {[
            { id: 'input', label: 'Numbers', icon: Users },
            { id: 'compose', label: 'Message', icon: FileText },
            { id: 'preview', label: 'Preview', icon: Settings },
            { id: 'sending', label: 'Send', icon: Send },
          ].map((s, i) => {
            const stepOrder = ['input', 'compose', 'preview', 'sending'];
            const isActive = step === s.id;
            const isPast = stepOrder.indexOf(step) > stepOrder.indexOf(s.id);
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  isActive ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-medium' :
                  isPast ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                }`}>
                  <s.icon size={13} strokeWidth={1.75} />
                  {s.label}
                </div>
                {i < 3 && <ChevronRight size={12} className="text-[var(--border)]" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {step === 'input' && (
          <InputStep
            inputTab={inputTab}
            setInputTab={setInputTab}
            rawText={rawText}
            setRawText={setRawText}
            manualNumbers={manualNumbers}
            handleManualChange={handleManualChange}
            handleAddManualRow={handleAddManualRow}
            handleRemoveManualRow={handleRemoveManualRow}
            handleFileUpload={handleFileUpload}
            defaultCountryCode={defaultCountryCode}
            setDefaultCountryCode={setDefaultCountryCode}
            handleParse={handleParse}
            parsedNumbers={parsedNumbers}
            duplicateCount={duplicateCount}
          />
        )}

        {step === 'compose' && (
          <ComposeStep
            messageTemplate={messageTemplate}
            setMessageTemplate={setMessageTemplate}
            validCount={validNumbers.length}
            onBack={() => setStep('input')}
            onNext={() => setStep('preview')}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            links={links}
            parsedNumbers={parsedNumbers}
            validCount={validNumbers.length}
            invalidCount={invalidNumbers.length}
            duplicateCount={duplicateCount}
            messageTemplate={messageTemplate}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            batchDelay={batchDelay}
            setBatchDelay={setBatchDelay}
            useWhatsAppWeb={useWhatsAppWeb}
            setUseWhatsAppWeb={setUseWhatsAppWeb}
            onBack={() => setStep('compose')}
            onSend={handleSendAll}
            sending={sending}
            sentCount={sentCount}
            currentBatch={currentBatch}
            handleExportCSV={handleExportCSV}
            handleCopyAllLinks={handleCopyAllLinks}
          />
        )}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STEP 1: INPUT — paste, upload, or manually enter numbers
// ════════════════════════════════════════════════════════════════════════

interface InputStepProps {
  inputTab: InputTab;
  setInputTab: (t: InputTab) => void;
  rawText: string;
  setRawText: (s: string) => void;
  manualNumbers: Array<{ name: string; phone: string }>;
  handleManualChange: (i: number, f: 'name' | 'phone', v: string) => void;
  handleAddManualRow: () => void;
  handleRemoveManualRow: (i: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultCountryCode: string;
  setDefaultCountryCode: (s: string) => void;
  handleParse: () => void;
  parsedNumbers: ParsedNumber[];
  duplicateCount: number;
}

function InputStep(props: InputStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Import Phone Numbers</h2>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
          Paste numbers, upload a CSV, or enter them manually. We'll parse, validate, and deduplicate automatically.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[
          { id: 'paste' as const, label: 'Paste', icon: FileText },
          { id: 'upload' as const, label: 'Upload CSV', icon: Upload },
          { id: 'manual' as const, label: 'Manual', icon: Plus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => props.setInputTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-md text-[13px] font-medium transition ${
              props.inputTab === tab.id
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <tab.icon size={14} strokeWidth={1.75} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Country code selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="country-code-select" className="text-[12px] font-medium text-[var(--muted-foreground)]">Default country code:</label>
        <select
          id="country-code-select"
          title="Default country code"
          aria-label="Default country code"
          value={props.defaultCountryCode}
          onChange={(e) => props.setDefaultCountryCode(e.target.value)}
          className="bg-[var(--muted)] border border-[var(--border)] rounded-md px-2.5 h-8 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          <option value="20">🇪🇬 +20 (Egypt)</option>
          <option value="971">🇦🇪 +971 (UAE)</option>
          <option value="966">🇸🇦 +966 (Saudi)</option>
          <option value="965">🇰🇼 +965 (Kuwait)</option>
          <option value="974">🇶🇦 +974 (Qatar)</option>
          <option value="1">🇺🇸 +1 (USA)</option>
          <option value="44">🇬🇧 +44 (UK)</option>
          <option value="49">🇩🇪 +49 (Germany)</option>
          <option value="33">🇫🇷 +33 (France)</option>
        </select>
        <span className="text-[11px] text-[var(--muted-foreground)]">
          Applied to numbers without a + or 00 prefix
        </span>
      </div>

      {/* Input content */}
      {props.inputTab === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={props.rawText}
            onChange={(e) => props.setRawText(e.target.value)}
            placeholder={
              'Paste phone numbers here — one per line.\n\nExamples:\n+20 100 123 4567\n01001234567\nJohn,+201001234567\nSarah,01001234568\n00201001234569'
            }
            rows={12}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-[13px] font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40 transition resize-none"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
            <span>{props.rawText.split(/[\n\r]+/).filter(Boolean).length} lines</span>
            <span>Supports: +20, 0100…, 0020…, Name,Phone format</span>
          </div>
        </div>
      )}

      {props.inputTab === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const input = fileRef.current!;
              const dt = new DataTransfer();
              dt.items.add(file);
              input.files = dt.files;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              props.handleFileUpload({ target: { files: input.files } } as any);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition"
        >
          <Upload className="mx-auto mb-3 text-[var(--muted-foreground)]" size={32} strokeWidth={1.25} />
          <p className="text-[14px] font-medium text-[var(--foreground)]">
            Drop CSV file here or click to browse
          </p>
          <p className="text-[12px] text-[var(--muted-foreground)] mt-1">
            Supports .csv, .txt — auto-detects phone column
          </p>
          <input
            title="Upload file"
            aria-label="Upload file"
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            onChange={props.handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {props.inputTab === 'manual' && (
        <div className="space-y-2">
          {props.manualNumbers.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={entry.name}
                onChange={(e) => props.handleManualChange(i, 'name', e.target.value)}
                placeholder="Name (optional)"
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-md px-3 h-9 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition"
              />
              <input
                type="text"
                value={entry.phone}
                onChange={(e) => props.handleManualChange(i, 'phone', e.target.value)}
                placeholder="+20 100 123 4567"
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-md px-3 h-9 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition"
              />
              {props.manualNumbers.length > 1 && (
                <button
                  title="Remove row"
                  aria-label="Remove row"
                  onClick={() => props.handleRemoveManualRow(i)}
                  className="p-2 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={props.handleAddManualRow}
            className="flex items-center gap-1.5 px-3 h-8 text-[13px] font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition"
          >
            <Plus size={14} strokeWidth={1.75} />
            Add row
          </button>
        </div>
      )}

      {/* Parse results preview */}
      {props.parsedNumbers.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Parse Results</h3>
            <button
              onClick={props.handleParse}
              className="flex items-center gap-1.5 px-3 h-8 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-md text-[13px] font-medium transition"
            >
              <Send size={14} strokeWidth={1.75} />
              Continue to Message →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--muted)] rounded-lg p-3">
              <div className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wide">Valid</div>
              <div className="text-2xl font-bold text-emerald-500">{props.parsedNumbers.filter(n => n.valid).length}</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3">
              <div className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wide">Invalid</div>
              <div className="text-2xl font-bold text-red-500">{props.parsedNumbers.filter(n => !n.valid).length}</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3">
              <div className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wide">Duplicates removed</div>
              <div className="text-2xl font-bold text-amber-500">{props.duplicateCount}</div>
            </div>
          </div>
          {/* Preview first 5 */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {props.parsedNumbers.slice(0, 10).map((n, i) => (
              <div key={i} className="flex items-center gap-3 text-[12px] py-1.5 px-2 rounded hover:bg-[var(--muted)]">
                {n.valid ? (
                  <CheckCircle size={13} className="text-emerald-500 shrink-0" strokeWidth={1.75} />
                ) : (
                  <X size={13} className="text-red-500 shrink-0" strokeWidth={1.75} />
                )}
                <span className="font-mono text-[var(--foreground)]">{n.display}</span>
                {n.name && <span className="text-[var(--muted-foreground)]">— {n.name}</span>}
                {n.countryCode && (
                  <span className="ml-auto text-[10px] uppercase text-[var(--muted-foreground)]">{n.countryCode}</span>
                )}
                {!n.valid && n.error && (
                  <span className="ml-auto text-[10px] text-red-500">{n.error}</span>
                )}
              </div>
            ))}
            {props.parsedNumbers.length > 10 && (
              <div className="text-[11px] text-[var(--muted-foreground)] text-center py-1">
                +{props.parsedNumbers.length - 10} more…
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parse button (for paste/manual) */}
      {props.inputTab !== 'upload' && (
        <div className="flex justify-end">
          <button
            onClick={props.handleParse}
            disabled={props.inputTab === 'paste' ? !props.rawText.trim() : !props.manualNumbers.some(m => m.phone.trim())}
            className="flex items-center gap-2 px-5 h-10 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-[14px] font-medium transition shadow-sm"
          >
            <Users size={16} strokeWidth={1.75} />
            Parse Numbers
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STEP 2: COMPOSE — write the message with variables
// ════════════════════════════════════════════════════════════════════════

interface ComposeStepProps {
  messageTemplate: string;
  setMessageTemplate: (s: string) => void;
  validCount: number;
  onBack: () => void;
  onNext: () => void;
}

function ComposeStep({ messageTemplate, setMessageTemplate, validCount, onBack, onNext }: ComposeStepProps) {
  const [previewName, setPreviewName] = useState('John Doe');
  const [previewPhone, setPreviewPhone] = useState('+20 100 123 4567');

  const previewNumber: ParsedNumber = useMemo(() => ({
    raw: previewPhone,
    normalized: previewPhone.replace(/\D/g, ''),
    e164: '+' + previewPhone.replace(/\D/g, ''),
    display: previewPhone,
    name: previewName,
    valid: true,
    waLink: () => '',
  }), [previewName, previewPhone]);

  const previewMessage = useMemo(
    () => personalizeMessage(messageTemplate, previewNumber),
    [messageTemplate, previewNumber]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Compose Message</h2>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
          Write your message. Use variables to personalize for each recipient.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Variables:</span>
            {[
              { var: '{name}', label: 'Full name' },
              { var: '{first}', label: 'First name' },
              { var: '{phone}', label: 'Phone' },
            ].map((v) => (
              <button
                key={v.var}
                onClick={() => {
                  setMessageTemplate(messageTemplate + v.var);
                }}
                className="px-2 py-0.5 bg-[var(--muted)] hover:bg-[var(--primary)]/15 hover:text-[var(--primary)] rounded text-[11px] font-mono transition"
              >
                {v.var} <span className="text-[var(--muted-foreground)] ml-1">{v.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={12}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-[14px] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/40 transition resize-none"
            placeholder="Type your WhatsApp message here…"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
            <span>{messageTemplate.length} characters</span>
            <span>{validCount} recipients will receive this</span>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-3">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Live Preview</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              placeholder="Preview name"
              className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-md px-3 h-8 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition"
            />
            <input
              type="text"
              value={previewPhone}
              onChange={(e) => setPreviewPhone(e.target.value)}
              placeholder="+20…"
              className="w-40 bg-[var(--card)] border border-[var(--border)] rounded-md px-3 h-8 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition"
            />
          </div>
          {/* WhatsApp-style chat bubble */}
          <div className="bg-[#0a0f1d] rounded-xl p-4 min-h-[300px] whatsapp-bg">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[11px] font-semibold text-white">
                {previewName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] font-medium text-white">{previewName || 'Contact'}</div>
                <div className="text-[10px] text-emerald-400">online</div>
              </div>
            </div>
            <div className="bg-[#005c4b] rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]">
              <p className="text-[13px] text-white whitespace-pre-wrap leading-relaxed">{previewMessage}</p>
              <div className="text-[9px] text-slate-400 text-right mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        <button
          onClick={onBack}
          className="px-4 h-9 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 h-10 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-md text-[14px] font-medium transition shadow-sm"
        >
          Preview & Send →
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STEP 3: PREVIEW & SEND — review and blast
// ════════════════════════════════════════════════════════════════════════

interface PreviewStepProps {
  links: Array<{ number: ParsedNumber; message: string; link: string }>;
  parsedNumbers: ParsedNumber[];
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  messageTemplate: string;
  batchSize: number;
  setBatchSize: (n: number) => void;
  batchDelay: number;
  setBatchDelay: (n: number) => void;
  useWhatsAppWeb: boolean;
  setUseWhatsAppWeb: (b: boolean) => void;
  onBack: () => void;
  onSend: () => void;
  sending: boolean;
  sentCount: number;
  currentBatch: number;
  handleExportCSV: () => void;
  handleCopyAllLinks: () => void;
}

function PreviewStep(props: PreviewStepProps) {
  const totalBatches = Math.ceil(props.links.length / props.batchSize);
  const progress = props.sending ? (props.sentCount / props.links.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Preview & Send</h2>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
            {props.validCount} valid numbers ready · {props.invalidCount} invalid · {props.duplicateCount} duplicates removed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={props.handleExportCSV}
            className="flex items-center gap-1.5 px-3 h-8 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-md text-[12px] font-medium transition"
          >
            <Download size={13} strokeWidth={1.75} />
            Export CSV
          </button>
          <button
            onClick={props.handleCopyAllLinks}
            className="flex items-center gap-1.5 px-3 h-8 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-md text-[12px] font-medium transition"
          >
            <Copy size={13} strokeWidth={1.75} />
            Copy links
          </button>
        </div>
      </div>

      {/* Send settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-4">
        <h3 className="text-[13px] font-semibold flex items-center gap-2">
          <Settings size={14} strokeWidth={1.75} />
          Send Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="batch-size-input" className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1.5">
              Batch size (tabs per batch)
            </label>
            <input
              id="batch-size-input"
              type="number"
              value={props.batchSize}
              onChange={(e) => props.setBatchSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
              min="1"
              max="20"
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 h-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Max 20 — browsers block more</p>
          </div>
          <div>
            <label htmlFor="batch-delay-input" className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1.5">
              Delay between batches (seconds)
            </label>
            <input
              id="batch-delay-input"
              type="number"
              value={props.batchDelay}
              onChange={(e) => props.setBatchDelay(Math.max(1, parseInt(e.target.value) || 3))}
              min="1"
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 h-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Prevents browser from blocking popups</p>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1.5">
              Open mode
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={() => props.setUseWhatsAppWeb(false)}
                className={`flex-1 px-2 h-8 rounded-md text-[12px] font-medium transition ${
                  !props.useWhatsAppWeb ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                wa.me
              </button>
              <button
                onClick={() => props.setUseWhatsAppWeb(true)}
                className={`flex-1 px-2 h-8 rounded-md text-[12px] font-medium transition ${
                  props.useWhatsAppWeb ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                Web App
              </button>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">wa.me opens app; Web opens browser</p>
          </div>
        </div>
      </div>

      {/* Sending progress */}
      {props.sending && (
        <div className="bg-[var(--card)] border border-[var(--primary)]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" strokeWidth={2} />
              <span className="text-[14px] font-medium">
                Sending batch {props.currentBatch} of {totalBatches}…
              </span>
            </div>
            <span className="text-[13px] font-mono text-[var(--muted-foreground)]">
              {props.sentCount} / {props.links.length}
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
              style={(() => {
                const s = { width: `${progress}%` };
                return s;
              })()}
            />
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            WhatsApp tabs are opening in your browser. Click "Send" in each tab, then come back here.
          </p>
        </div>
      )}

      {/* Recipient list */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Recipients ({props.links.length})</h3>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            {props.useWhatsAppWeb ? 'web.whatsapp.com' : 'wa.me'} links
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {props.links.map((item, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition"
            >
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] w-6 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--foreground)]">
                    {item.number.name || item.number.display}
                  </span>
                  {item.number.name && (
                    <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                      {item.number.display}
                    </span>
                  )}
                  {item.number.countryCode && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[var(--muted)] rounded text-[var(--muted-foreground)]">
                      {item.number.countryCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                  {item.message || '(no message)'}
                </p>
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 h-7 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-md text-[11px] font-medium transition"
              >
                <Send size={11} strokeWidth={1.75} />
                Open
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        <button
          onClick={props.onBack}
          disabled={props.sending}
          className="px-4 h-9 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={props.onSend}
          disabled={props.sending || props.links.length === 0}
          className="flex items-center gap-2 px-6 h-10 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-[14px] font-medium transition shadow-sm"
        >
          {props.sending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending… ({props.sentCount}/{props.links.length})
            </>
          ) : (
            <>
              <Zap size={16} strokeWidth={2} />
              Blast {props.links.length} messages
            </>
          )}
        </button>
      </div>
    </div>
  );
}
