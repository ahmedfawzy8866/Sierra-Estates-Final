import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, X, SlidersHorizontal } from 'lucide-react';
import { api } from '../lib/apiClient';

interface SmartFilterBarProps {
  onResults?: (results: any[], parsedFilters: any) => void;
  placeholder?: string;
  className?: string;
}

interface FilterResult {
  success: boolean;
  results: any[];
  parsedFilters: any;
  query: string;
  count: number;
  error?: string;
}

export default function SmartFilterBar({ onResults, placeholder, className = '' }: SmartFilterBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FilterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<FilterResult>('/api/listings/smart-filter', {
        query: trimmed,
        limit: 20,
      });
      setResult(res);
      onResults?.(res.results || [], res.parsedFilters || {});
    } catch (err: any) {
      setError(err.message || 'Smart filter failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      handleSearch();
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(handleSearch, 800);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Search with AI... e.g. "3 bedroom villa in New Cairo under 5 million"'}
            className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition"
          />
          {query && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {loading ? 'Searching...' : 'AI Search'}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 border rounded-lg transition ${showFilters ? 'border-cyan-500/50 text-cyan-400' : 'border-slate-800 text-slate-500 hover:text-white'}`}
          title="Show parsed filters"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Parsed Filters Display */}
      {showFilters && result?.parsedFilters && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-2">AI Parsed Filters</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.parsedFilters).map(([key, value]) => {
              if (value === undefined || value === null || value === '') return null;
              return (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-300">
                  <span className="text-cyan-400">{key}</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-white">{String(value)}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Summary */}
      {result && (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-emerald-400">{result.count}</span>
          <span>results for</span>
          <span className="text-white">"{result.query}"</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
