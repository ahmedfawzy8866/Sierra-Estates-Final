import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Listing } from '../types';

interface ListingsHubPageProps {
  T: (key: string) => string;
  searchQuery?: string;
}

const HUB_IMGS = [
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=120&q=70',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&q=70',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=120&q=70',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&q=70',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=120&q=70',
];

export default function ListingsHubPage({ T, searchQuery = '' }: ListingsHubPageProps) {
  const [q, setQ] = useState('');

  useEffect(() => {
    if (searchQuery !== undefined) {
      setQ(searchQuery);
    }
  }, [searchQuery]);
  const [cmpF, setCmpF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [sortCol, setSortCol] = useState<'code' | 'beds' | 'area' | 'ai' | 'price'>('ai');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'listings'),
      (snap) => {
        const loaded: Listing[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          loaded.push({
            id: doc.id,
            code: d.code,
            cmp: d.cmp,
            type: d.type,
            beds: d.beds,
            area: d.area,
            price: d.price,
            ai: d.ai,
            status: d.status,
            img: d.img || 0,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          });
        });
        setListings(loaded);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'listings');
      }
    );

    return () => unsub();
  }, []);

  // Compute compounds dynamic list
  const compounds = useMemo(() => {
    return ['All', ...Array.from(new Set(listings.map((l) => l.cmp)))];
  }, [listings]);

  const filtered = useMemo(() => {
    let r = [...listings];
    if (q) {
      const qLower = q.toLowerCase();
      r = r.filter(
        (l) =>
          l.code.toUpperCase().includes(q.toUpperCase()) ||
          l.cmp.toLowerCase().includes(qLower) ||
          l.type.toLowerCase().includes(qLower) ||
          // Leveraging T() translation to match multilingual queries (e.g. Arabic words for status / type / compound)
          T(l.type.toLowerCase()).toLowerCase().includes(qLower) ||
          T(l.status.toLowerCase()).toLowerCase().includes(qLower) ||
          T(l.cmp.toLowerCase()).toLowerCase().includes(qLower)
      );
    }
    if (cmpF !== 'All') {
      r = r.filter((l) => l.cmp === cmpF);
    }
    if (statusF !== 'All') {
      r = r.filter((l) => l.status === statusF);
    }

    // Sort
    return r.sort((a, b) => {
      let av: any = a[sortCol];
      let bv: any = b[sortCol];

      if (sortCol === 'price') {
        av = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
        bv = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
      }

      if (sortDir === 'asc') {
        return av > bv ? 1 : av < bv ? -1 : 0;
      } else {
        return av < bv ? 1 : av > bv ? -1 : 0;
      }
    });
  }, [q, cmpF, statusF, sortCol, sortDir, listings]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const handleListingDelete = async (id: string, code: string) => {
    if (!confirm(`Remove listing ${code} from registry?`)) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `listings/${id}`);
    }
  };

  const renderSortIndicator = (col: typeof sortCol) => {
    if (sortCol !== col) return <span className="text-white/20 select-none ml-1">⇅</span>;
    return <span className="text-cyan-400 select-none ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const handleExportCSV = () => {
    const rows = filtered.map((l) => ({
      Code: l.code,
      Compound: l.cmp,
      Type: l.type,
      Beds: l.beds,
      Area: l.area,
      Price: l.price,
      AVM_Score: l.ai,
      Status: l.status,
    }));
    if (!rows.length) return;
    const keys = Object.keys(rows[0]) as (keyof typeof rows[0])[];
    const csvContent = [
      keys.join(','),
      ...rows.map((r) => keys.map((k) => `"${String(r[k]).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'sierra_realty_listings.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Search and filter toolbar */}
      <div className="flex gap-2.5 flex-wrap items-center">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T('search') || "Search Registry..."}
          className="flex-1 min-w-[160px] max-w-xs bg-[#0a0f1d] border border-slate-800 rounded px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50 shrink-0"
        />

        <select
          value={cmpF}
          onChange={(e) => setCmpF(e.target.value)}
          className="bg-[#0a0f1d] border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 shrink-0 cursor-pointer"
        >
          {compounds.map((c) => (
            <option key={c} value={c} className="bg-[#0a0f1d] text-white">
              {c}
            </option>
          ))}
        </select>

        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="bg-[#0a0f1d] border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 shrink-0 cursor-pointer"
        >
          {['All', 'Active', 'Review', 'Sold'].map((s) => (
            <option key={s} value={s} className="bg-[#0a0f1d] text-slate-300">
              {s}
            </option>
          ))}
        </select>

        <span className="font-mono text-[10px] text-slate-500 select-none">
          {filtered.length} / {listings.length} LISTS
        </span>

        <div className="md:ml-auto flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-mono bg-white/5 border border-slate-800 text-slate-300 rounded flex items-center gap-1 hover:bg-white/10 transition select-none cursor-pointer active:scale-95 duration-100"
          >
            <span>⬇</span>
            <span>{T('exportCSV')}</span>
          </button>
          <button className="px-4 py-2 text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded flex items-center gap-1.5 shadow select-none hover:bg-cyan-500/20 transition active:scale-95 duration-100 uppercase font-mono tracking-wider cursor-pointer">
            <span>＋</span>
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Main listings list table */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto text-xs">
          {loading ? (
            <div className="p-12 text-center font-mono text-slate-500 select-none">
              LOADING ASSETS REGISTRY...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono select-none">
              No matching listings in inventory.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#05080f] font-mono text-[9px] text-cyan-400 uppercase tracking-wider select-none">
                  <th className="p-4" style={{ width: 64 }}>
                    Photo
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('code')}>
                    Code {renderSortIndicator('code')}
                  </th>
                  <th className="p-4">Compound</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('beds')}>
                    Beds {renderSortIndicator('beds')}
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('area')}>
                    Area {renderSortIndicator('area')}
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('price')}>
                    Price {renderSortIndicator('price')}
                  </th>
                  <th className="p-4 cursor-pointer" onClick={() => handleSort('ai')}>
                    AI ▸ {renderSortIndicator('ai')}
                  </th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 border-b border-slate-800/55 transition duration-100">
                    <td className="p-4 select-none">
                      <img
                        src={HUB_IMGS[l.img] || HUB_IMGS[0]}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-14 h-9 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      />
                    </td>
                    <td className="p-4 font-mono text-white font-bold tracking-wide select-all">
                      {l.code}
                    </td>
                    <td className="p-4 font-semibold text-white uppercase">{l.cmp}</td>
                    <td className="p-4">
                      <span className="bg-[#1E88D9]/10 text-[#1E88D9] font-mono text-[9px] px-2 py-0.5 rounded border border-[#1E88D9]/20 uppercase">
                        {l.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{l.beds}</td>
                    <td className="p-4 font-mono text-slate-300">{l.area}m²</td>
                    <td className="p-4 font-mono text-cyan-400 font-bold">{l.price}</td>
                    <td className="p-4">
                      <span
                        className={`font-mono font-bold ${
                          l.ai >= 9.5 ? 'text-emerald-400' : l.ai >= 9 ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      >
                        {l.ai.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          l.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : l.status === 'Review'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleListingDelete(l.id, l.code)}
                          className="px-2.5 py-1 hover:bg-red-500/10 text-red-400 border border-white/5 hover:border-red-500/30 text-[9.5px] uppercase font-mono tracking-wider rounded transition select-none cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
