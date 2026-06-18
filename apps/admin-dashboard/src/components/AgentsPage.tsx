import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Agent, ChatMessage } from '../types';

interface AgentsPageProps {
  T: (key: string) => string;
  searchQuery?: string;
}

export default function AgentsPage({ T, searchQuery = '' }: AgentsPageProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Live Agent records
    const unsub = onSnapshot(collection(db, 'agents'), (snap) => {
      const loaded: Agent[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        loaded.push({
          id: doc.id,
          name: d.name,
          desc: d.desc,
          emoji: d.emoji,
          color: d.color,
          status: d.status,
          load: d.load,
          tasks: d.tasks,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
        });
      });
      setAgents(loaded);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'agents');
    });

    // Live chat log (first 15 messages)
    const unsubChats = onSnapshot(collection(db, 'chats'), (snap) => {
      const messages: ChatMessage[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        messages.push({
          id: doc.id,
          sender: d.sender,
          text: d.text,
          timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date(),
        });
      });
      // Sort oldest to newest
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setChatMessages(messages);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'chats');
    });

    return () => {
      unsub();
      unsubChats();
    };
  }, []);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;
    const qLower = searchQuery.toLowerCase();
    return agents.filter((a) => {
      const statusKey = a.status.toLowerCase();
      const statusTranslated = T(statusKey);
      return (
        a.name.toLowerCase().includes(qLower) ||
        (a.desc && a.desc.toLowerCase().includes(qLower)) ||
        a.status.toLowerCase().includes(qLower) ||
        statusTranslated.toLowerCase().includes(qLower)
      );
    });
  }, [agents, searchQuery, T]);

  const handleRestart = async (agent: Agent) => {
    try {
      // Toggle status to Running, loads 100% then drops
      const agentRef = doc(db, 'agents', agent.id);
      await updateDoc(agentRef, {
        status: 'Running',
        load: 100,
        updatedAt: new Date()
      });
      setTimeout(async () => {
        await updateDoc(agentRef, {
          status: 'Online',
          load: Math.floor(Math.random() * 30) + 50,
          updatedAt: new Date()
        });
      }, 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `agents/${agent.id}`);
    }
  };

  const submitChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || sending) return;
    setSending(true);
    setChatInput('');

    try {
      // Add user message
      await addDoc(collection(db, 'chats'), {
        sender: 'user',
        text,
        timestamp: new Date()
      });

      // Simple real-time chatbot response simulation
      setTimeout(async () => {
        let reply = "Processing instructions under Intelligence protocol...";
        if (text.toLowerCase().includes('hyde park') || text.includes('هايد بارك')) {
          reply = "Lola/Leila: We currently index 3 exquisite villas in Hyde Park starting from EGP 18.5M. Shall I draft the dossier?";
        } else if (text.toLowerCase().includes('villa') || text.includes('فيلا')) {
          reply = "Sierra AI: Understood. Scanning high-AVM New Cairo inventory matching private pool requests...";
        }

        await addDoc(collection(db, 'chats'), {
          sender: 'ai',
          text: reply,
          timestamp: new Date()
        });
        setSending(false);
      }, 1200);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'chats');
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAgents.map((a) => {
          const isActive = activeId === a.id;
          return (
            <div
              key={a.id}
              className={`bg-[#0a0f1d] border rounded-xl p-4 transition-all duration-300 relative cursor-pointer ${
                isActive ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 hover:border-cyan-500/30'
              }`}
              onClick={() => setActiveId(isActive ? null : a.id)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 shadow"
                style={{ backgroundColor: `${a.color}15`, border: `1px solid ${a.color}30` }}
              >
                {a.emoji}
              </div>

              <div className="flex justify-between items-start mb-1">
                <div className="text-xs font-bold text-white tracking-wide">{a.name}</div>
                <span className={`text-[8px] font-mono tracking-wider uppercase font-bold py-0.5 px-2 rounded-full flex items-center gap-1 ${
                  a.status === 'Online' || a.status === 'Running'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-amber-500/10 text-amber-550'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {a.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 min-h-[32px]">
                {a.desc}
              </p>

              {/* Loader Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] text-slate-500 select-none">
                  <span>{T('load')}</span>
                  <span className="font-bold text-white" style={{ color: a.color }}>
                    {a.load}%
                  </span>
                </div>
                <div className="w-full bg-slate-850 rounded-full h-[4px] overflow-hidden">
                  <div
                     className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${a.load}%`, backgroundColor: a.color || '#06b6d4' }}
                  />
                </div>
              </div>

              <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-3 border-t border-slate-800 pt-2 select-none">
                <span>{T('totalTasks')}</span>
                <span className="font-bold text-white">{a.tasks.toLocaleString()}</span>
              </div>

              {isActive && (
                <div
                  className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="flex-1 py-1 px-2 hover:bg-white/5 border border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-white rounded-md transition duration-150 cursor-pointer">
                    ⚙️ CONFIG
                  </button>
                  <button className="flex-1 py-1 px-2 hover:bg-white/5 border border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-white rounded-md transition duration-150 cursor-pointer">
                    📋 LOGS
                  </button>
                  <button
                    onClick={() => handleRestart(a)}
                    className="flex-1 py-1 px-2 bg-green-500/15 border border-green-500/20 text-[10px] uppercase font-mono tracking-wider text-green-400 font-bold rounded-md hover:bg-green-500/25 transition duration-150 cursor-pointer"
                  >
                    🔁 REBOOT
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Chat Emulator at the bottom */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            🐪 Lola · Live Ingestion Sandbox
          </span>
          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
            ONLINE
          </span>
        </div>
        <div className="p-5 flex flex-col h-[280px]">
          {/* Scrollable messages log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar mb-4 text-xs font-mono">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1.5 select-none">
                <span className="text-2xl font-sans">🐪</span>
                <p>Interactive Lola Arabic/English channel offline</p>
                <p className="text-[10px]">Type instructions below to verify live chat database bindings</p>
              </div>
            ) : (
              chatMessages.map((m) => {
                const isAi = m.sender === 'ai';
                return (
                  <div key={m.id} className={`flex max-w-[85%] ${isAi ? 'self-start mr-auto' : 'ml-auto text-right'}`}>
                    <div
                      className={`p-3 rounded-xl shadow-sm leading-relaxed text-xs ${
                        isAi
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                          : 'bg-cyan-500 text-black rounded-tr-sm font-semibold'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Typing area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitChatMessage()}
              placeholder="Query Lola e.g., 'Hyde Park villa above 15m'..."
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition duration-150"
            />
            <button
               onClick={submitChatMessage}
               disabled={sending || !chatInput.trim()}
               className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-black rounded font-bold text-xs select-none transition active:scale-95 duration-100 disabled:opacity-40 disabled:scale-100 cursor-pointer"
            >
              {sending ? '...' : T('sendMsg')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
