'use client';

import React, { useEffect, useState } from 'react';
import { Database, FileText, Loader2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  tags?: string[];
  lastModified: string;
  metadata?: {
    priority?: string;
    [key: string]: unknown;
  };
}

export default function KnowledgeBasePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/knowledge-base')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#071422]" style={{ fontFamily: 'var(--font-display)' }}>
            System Knowledge Base
          </h1>
          <p className="text-[#3a5570] mt-2 text-sm">
            View the rules, memory, and logic imported from the Obsidian Vault that guides AI behavior.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#f3f4f5]">
          <Database className="h-5 w-5 text-[#C9A84C]" />
          <span className="font-mono text-sm font-semibold text-[#071422]">{notes.length} Active Nodes</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#031632]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          Failed to sync with Obsidian Vault: {error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(3,22,50,0.1)] transition border border-[#f3f4f5] cursor-pointer flex flex-col justify-between h-40">
              <div>
                <div className="flex items-center gap-3 pb-2 border-b border-[#f3f4f5] mb-3">
                  <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                  <h3 className="text-sm font-bold text-[#071422] truncate uppercase tracking-wider font-display" title={note.title}>
                    {note.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {note.tags?.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                      #{tag}
                    </span>
                  ))}
                  {(!note.tags || note.tags.length === 0) && (
                    <span className="text-[10px] text-[#3a5570]/40 italic">No tags</span>
                  )}
                </div>
              </div>
              
              <div className="text-[10px] text-[#3a5570]/60 flex justify-between font-semibold uppercase tracking-wider border-t border-[#f3f4f5]/60 pt-2.5">
                <span>Priority: {note.metadata?.priority || 'normal'}</span>
                <span>{new Date(note.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#3a5570]/60 border border-dashed border-[#d1d5db] rounded-2xl bg-white/50 font-semibold text-sm">
              No markdown files found in the specified Obsidian Vault.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
