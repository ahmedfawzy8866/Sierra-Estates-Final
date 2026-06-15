'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface PropertyFiltersProps {
  initialParams: { q?:string; type?:string; for?:string; minPrice?:string; maxPrice?:string; };
}

export function PropertyFilters({ initialParams }: PropertyFiltersProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string,boolean>>({ type:true, price:true, beds:true });
  const [type, setType]         = useState(initialParams.type ?? '');
  const [minPrice, setMinPrice] = useState(initialParams.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice ?? '');
  const [beds, setBeds]         = useState('');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (initialParams.q)   params.set('q',   initialParams.q);
    if (type)     params.set('type', type);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (beds)     params.set('beds', beds);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const TYPES = ['Apartment','Villa','Penthouse','Townhouse','Duplex'];
  const BEDS  = ['1','2','3','4','5+'];

  return (
    <div className="bg-white rounded-xl card-shadow p-6 sticky top-28">
      <div className="flex items-center gap-2 mb-6"><SlidersHorizontal className="w-4 h-4 text-se-gold" /><h2 className="font-display text-lg text-se-navy">Filters</h2></div>

      <FilterGroup label="Property Type" expanded={expanded.type} onToggle={()=>toggle('type')}>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={()=>setType(type===t?'':t)}
              className={clsx('px-3 py-1.5 text-xs rounded-full border transition-all', type===t ? 'bg-se-gold border-se-gold text-se-navy font-medium' : 'border-se-stone text-se-muted hover:border-se-gold hover:text-se-navy')}>{t}</button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Price Range (EGP)" expanded={expanded.price} onToggle={()=>toggle('price')}>
        <div className="flex gap-2">
          <input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min" className="flex-1 border border-se-stone rounded px-3 py-2 text-sm text-se-navy focus:outline-none focus:border-se-gold" />
          <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max" className="flex-1 border border-se-stone rounded px-3 py-2 text-sm text-se-navy focus:outline-none focus:border-se-gold" />
        </div>
      </FilterGroup>

      <FilterGroup label="Bedrooms" expanded={expanded.beds} onToggle={()=>toggle('beds')}>
        <div className="flex flex-wrap gap-2">
          {BEDS.map(b => (
            <button key={b} onClick={()=>setBeds(beds===b?'':b)}
              className={clsx('w-10 h-10 text-sm rounded-full border transition-all', beds===b ? 'bg-se-gold border-se-gold text-se-navy font-medium' : 'border-se-stone text-se-muted hover:border-se-gold')}>{b}</button>
          ))}
        </div>
      </FilterGroup>

      <button onClick={applyFilters} className="btn-primary w-full justify-center mt-4">Apply Filters</button>
    </div>
  );
}

function FilterGroup({ label,expanded,onToggle,children }:{ label:string;expanded:boolean;onToggle:()=>void;children:React.ReactNode }) {
  return (
    <div className="mb-5 border-b border-se-stone pb-5">
      <button onClick={onToggle} className="w-full flex items-center justify-between text-sm font-medium text-se-navy mb-3">
        {label}<ChevronDown className={clsx('w-4 h-4 text-se-muted transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && children}
    </div>
  );
}
