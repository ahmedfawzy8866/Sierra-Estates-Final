'use client';

/**
 * SIERRA ESTATES — AI Search Bar (bilingual)
 *
 * Accepts natural-language queries in English or Arabic:
 *   - "3 bedroom apartment for rent in New Cairo under 50k EGP"
 *   - "شقة 3 غرف للإيجار في التجمع الخامس تحت ٥٠ ألف"
 *   - "furnished studio Tagamoa monthly 20k"
 *   - "فيلا مفروشة الشيخ زايد شهرية"
 *
 * Calls POST /api/search/semantic and renders ranked results inline.
 * Defaults to English locale (foreigner-renter friendly).
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2, X, Sparkles, MapPin, BedDouble, Bath, Maximize2, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  monthlyRent?: number;
  currency: string;
  compound: string;
  beds: number;
  baths: number;
  area: number;
  propertyType: string;
  status: string;
  image?: string | null;
  matchScore: number;
  matchReason: string;
  isRental: boolean;
}

interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  intent?: {
    offerType: string;
    propertyType: string;
    bedsMin?: number;
    bedsMax?: number;
    priceMax?: number;
    currency: string;
    districts: string[];
    furnishing: string;
    detectedLocale: 'en' | 'ar';
  };
  extractionMethod?: 'ai' | 'regex-fallback';
  total?: number;
  error?: string;
}

interface AISearchBarProps {
  /** Default: 'en'. When 'ar', shows Arabic placeholder + RTL. */
  locale?: 'en' | 'ar';
  /** Optional callback when results come back (parent can use for analytics). */
  onResults?: (results: SearchResult[]) => void;
  /** Optional callback when user clicks a result. */
  onSelectResult?: (result: SearchResult) => void;
  /** Visual variant: 'hero' (large, centered) or 'inline' (compact, in a bar). */
  variant?: 'hero' | 'inline';
}

const PLACEHOLDERS = {
  en: [
    '3 bed apartment for rent in New Cairo under 50k EGP per month',
    'Furnished studio in Tagamoa, monthly budget 20k',
    'Villa for sale in Sheikh Zayed with private pool',
    'Penthouse in the New Administrative Capital, 8% ROI',
  ],
  ar: [
    'شقة ٣ غرف للإيجار في القاهرة الجديدة تحت ٥٠ ألف شهرياً',
    'استوديو مفروش في التجمع الخامس بميزانية ٢٠ ألف شهرياً',
    'فيلا للبيع في الشيخ زايد بمسبح خاص',
    'بنتهاوس في العاصمة الإدارية الجديدة بعائد ٨٪',
  ],
};

const STRINGS = {
  en: {
    placeholder: 'Describe what you are looking for — try natural language',
    search: 'Search',
    searching: 'Searching…',
    aiBadge: 'AI',
    results: 'results',
    rental: 'Rent',
    sale: 'Sale',
    perMonth: '/mo',
    noResults: 'No matches found. Try rephrasing your query.',
    error: 'Search is temporarily unavailable. Please try again.',
    extractedWith: 'Matched by',
    ai: 'AI',
    regex: 'keyword rules',
    beds: 'beds',
    baths: 'baths',
    sqm: 'sqm',
    matchScore: 'match',
  },
  ar: {
    placeholder: 'صف ما تبحث عنه — جرّب لغة طبيعية',
    search: 'بحث',
    searching: 'جارٍ البحث…',
    aiBadge: 'ذكاء',
    results: 'نتائج',
    rental: 'إيجار',
    sale: 'بيع',
    perMonth: '/شهر',
    noResults: 'لا توجد نتائج مطابقة. جرّب صياغة أخرى للبحث.',
    error: 'البحث غير متاح مؤقتاً. حاول مرة أخرى لاحقاً.',
    extractedWith: 'مطابقة بـ',
    ai: 'الذكاء الاصطناعي',
    regex: 'قواعد الكلمات المفتاحية',
    beds: 'غرف نوم',
    baths: 'حمامات',
    sqm: 'م²',
    matchScore: 'تطابق',
  },
};

function formatPrice(result: SearchResult, locale: 'en' | 'ar'): string {
  const price = result.isRental ? (result.monthlyRent ?? result.price) : result.price;
  if (!price) return locale === 'ar' ? 'السعر عند الطلب' : 'Price on request';
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(price);
  const suffix = result.isRental
    ? ` ${result.currency}${locale === 'ar' ? '/شهر' : '/mo'}`
    : ` ${result.currency}`;
  return `${formatted}${suffix}`;
}

function rotatePlaceholder(locale: 'en' | 'ar', intervalMs = 3500): [string, (idx: number) => void] {
  const placeholders = PLACEHOLDERS[locale];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % placeholders.length), intervalMs);
    return () => clearInterval(t);
  }, [locale, intervalMs, placeholders.length]);
  return [placeholders[idx], setIdx];
}

export default function AISearchBar({
  locale = 'en',
  onResults,
  onSelectResult,
  variant = 'hero',
}: AISearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'regex-fallback' | null>(null);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [placeholderText] = rotatePlaceholder(locale);
  const t = STRINGS[locale];
  const isRtl = locale === 'ar';

  // Close results when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setShowResults(true);

    try {
      const res = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, locale, limit: 12 }),
      });
      const data: SearchResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results ?? []);
      setExtractionMethod(data.extractionMethod ?? null);
      setTotal(data.total ?? 0);
      onResults?.(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, locale, onResults, t.error]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
    inputRef.current?.focus();
  };

  // ── Styling per variant ────────────────────────────────────────────────
  const isHero = variant === 'hero';
  const containerClasses = isHero
    ? 'w-full max-w-3xl mx-auto'
    : 'w-full';
  const inputClasses = isHero
    ? `w-full ${isRtl ? 'pr-14 pl-32' : 'pl-14 pr-32'} py-5 text-base md:text-lg bg-white rounded-2xl border-2 border-transparent shadow-2xl focus:border-[var(--gold)] focus:outline-none transition-all duration-300`
    : `w-full ${isRtl ? 'pr-10 pl-28' : 'pl-10 pr-28'} py-3 text-sm bg-white rounded-xl border border-[var(--navy-15)] focus:border-[var(--gold)] focus:outline-none transition-all`;
  const buttonClasses = isHero
    ? `absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 px-6 py-3 bg-[var(--navy)] hover:bg-[var(--gold)] hover:text-[var(--navy)] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center gap-2`
    : `absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[var(--navy)] hover:bg-[var(--gold)] hover:text-[var(--navy)] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5`;

  return (
    <div className={containerClasses} dir={isRtl ? 'rtl' : 'ltr'} ref={resultsRef}>
      <div className="relative">
        {/* Search icon */}
        <Search
          className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-[var(--navy-60)] pointer-events-none`}
          size={isHero ? 22 : 18}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholderText}
          className={inputClasses}
          aria-label={t.placeholder}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear button (when there's text) */}
        {query && !loading && (
          <button
            onClick={handleClear}
            className={`absolute ${isRtl ? 'left-20' : 'right-20'} top-1/2 -translate-y-1/2 text-[var(--navy-60)] hover:text-[var(--navy)] transition-colors`}
            aria-label="Clear"
          >
            <X size={isHero ? 20 : 16} />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? <Loader2 size={isHero ? 18 : 14} className="animate-spin" /> : <Sparkles size={isHero ? 18 : 14} />}
          <span>{loading ? t.searching : t.search}</span>
        </button>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          className={`mt-3 bg-white rounded-2xl shadow-2xl border border-[var(--navy-08)] overflow-hidden ${
            isHero ? 'max-h-[600px]' : 'max-h-[400px]'
          } overflow-y-auto`}
        >
          {/* Status header */}
          {!loading && !error && results.length > 0 && (
            <div className="px-5 py-3 bg-[var(--navy-04)] border-b border-[var(--navy-08)] flex items-center justify-between text-xs">
              <span className="text-[var(--navy-60)] font-semibold">
                {total} {t.results}
                {extractionMethod && (
                  <span className="mx-2 text-[var(--navy-40)]">·</span>
                )}
                {extractionMethod && (
                  <span className="text-[var(--navy-40)]">
                    {t.extractedWith}{' '}
                    {extractionMethod === 'ai' ? (
                      <span className="text-[var(--gold)] font-semibold">{t.ai}</span>
                    ) : (
                      <span className="font-semibold">{t.regex}</span>
                    )}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-5 py-12 text-center">
              <Loader2 className="animate-spin mx-auto text-[var(--gold)] mb-3" size={32} />
              <p className="text-sm text-[var(--navy-60)]">{t.searching}</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[var(--red)]">{t.error}</p>
              <p className="text-xs text-[var(--navy-40)] mt-2">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && query && (
            <div className="px-5 py-12 text-center">
              <Search className="mx-auto text-[var(--navy-30)] mb-3" size={32} />
              <p className="text-sm text-[var(--navy-60)]">{t.noResults}</p>
            </div>
          )}

          {/* Results list */}
          {!loading && !error && results.length > 0 && (
            <ul className="divide-y divide-[var(--navy-08)]">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      onSelectResult?.(r);
                      setShowResults(false);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-[var(--navy-04)] transition-colors flex gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[var(--navy-08)]">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--navy-30)]">
                          <MapPin size={24} />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-[var(--navy)] text-sm truncate group-hover:text-[var(--gold)] transition-colors">
                          {(locale === 'ar' && r.titleAr) ? r.titleAr : r.title}
                        </h4>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.isRental
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {r.isRental ? t.rental : t.sale}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--navy-60)] mb-2 flex items-center gap-1">
                        <MapPin size={11} />
                        {r.compound}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[var(--navy-60)] mb-2">
                        {r.beds > 0 && (
                          <span className="flex items-center gap-1">
                            <BedDouble size={11} /> {r.beds} {t.beds}
                          </span>
                        )}
                        {r.baths > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath size={11} /> {r.baths} {t.baths}
                          </span>
                        )}
                        {r.area > 0 && (
                          <span className="flex items-center gap-1">
                            <Maximize2 size={11} /> {r.area} {t.sqm}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--navy)] text-sm">
                          {formatPrice(r, locale)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[var(--gold)] font-bold uppercase tracking-wider">
                          <TrendingUp size={10} />
                          {r.matchScore}% {t.matchScore}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
