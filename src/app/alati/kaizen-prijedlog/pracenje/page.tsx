"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Link2, Check } from 'lucide-react';

const STATUSI = ['Otvoreno', 'U razmatranju', 'Odobreno', 'U provedbi', 'Završeno', 'Odbijeno'];
const ZAVRSNI_STATUSI = ['Završeno', 'Odbijeno'];

const STATUS_BOJA: Record<string, string> = {
  'Otvoreno': '#9a9a9a',
  'U razmatranju': '#ca8a04',
  'Odobreno': '#2563eb',
  'U provedbi': '#7c3aed',
  'Završeno': '#1a7a5e',
  'Odbijeno': '#dc2626',
};

interface Prijedlog {
  id: string;
  created_at: string;
  closed_at: string | null;
  ime: string | null;
  odjel: string | null;
  radno_mjesto: string | null;
  prob_opis: string | null;
  kategorija: string | null;
  prioritet: string | null;
  status: string;
}

export default function PracenjeKaizenPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [prijedlozi, setPrijedlozi] = useState<Prijedlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const router = useRouter();

  const load = async (uid: string) => {
    const [{ data: profil }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('kaizen_share_token').eq('id', uid).single(),
      supabase.from('kaizen_prijedlog')
        .select('id, created_at, closed_at, ime, odjel, radno_mjesto, prob_opis, kategorija, prioritet, status')
        .order('created_at', { ascending: false }),
    ]);
    if (profil?.kaizen_share_token) setToken(profil.kaizen_share_token);
    setPrijedlozi(rows || []);
    setLoading(false);
  };

  useEffect(() => {
    requireAuth(router).then(u => {
      if (!u) return;
      setUser(u);
      load(u.id);
    });
  }, [router]);

  const shareUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/kaizen/${token}` : '';

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (id: string, novi: string) => {
    setPrijedlozi(prev => prev.map(p => p.id === id ? { ...p, status: novi, closed_at: ZAVRSNI_STATUSI.includes(novi) ? new Date().toISOString() : null } : p));
    await supabase.from('kaizen_prijedlog').update({
      status: novi,
      closed_at: ZAVRSNI_STATUSI.includes(novi) ? new Date().toISOString() : null,
    }).eq('id', id);
  };

  const kpi = useMemo(() => {
    const total = prijedlozi.length;
    const brojPoStatusu = STATUSI.map(s => ({ status: s, broj: prijedlozi.filter(p => p.status === s).length }));
    const zavrseno = prijedlozi.filter(p => p.status === 'Završeno').length;
    const odbijeno = prijedlozi.filter(p => p.status === 'Odbijeno').length;
    const zatvoreni = zavrseno + odbijeno;
    const stopaRealizacije = zatvoreni > 0 ? Math.round((zavrseno / zatvoreni) * 100) : null;

    const trajanja = prijedlozi
      .filter(p => p.closed_at)
      .map(p => (new Date(p.closed_at as string).getTime() - new Date(p.created_at).getTime()) / 86400000);
    const prosjekDana = trajanja.length > 0 ? Math.round((trajanja.reduce((a, b) => a + b, 0) / trajanja.length) * 10) / 10 : null;

    const poKategoriji: Record<string, number> = {};
    prijedlozi.forEach(p => { const k = p.kategorija || 'Nekategorizirano'; poKategoriji[k] = (poKategoriji[k] || 0) + 1; });
    const kategorijeSortirane = Object.entries(poKategoriji).sort((a, b) => b[1] - a[1]);

    const poOdjelu: Record<string, number> = {};
    prijedlozi.forEach(p => { const o = p.odjel || 'Nepoznato'; poOdjelu[o] = (poOdjelu[o] || 0) + 1; });
    const odjeliSortirani = Object.entries(poOdjelu).sort((a, b) => b[1] - a[1]);

    return { total, brojPoStatusu, stopaRealizacije, prosjekDana, kategorijeSortirane, odjeliSortirani };
  }, [prijedlozi]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-[#9a9a9a]">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">📊 Praćenje prijedloga</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Sustav praćenja Kaizen prijedloga</h1>
          <p className="text-sm text-[#5a5a5a] mb-4">Svi prijedlozi vašeg tima na jednom mjestu — povucite karticu između kolona za promjenu statusa.</p>

          <div className="flex items-center gap-2 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl px-4 py-3 max-w-[560px]">
            <Link2 size={16} className="text-[#9a9a9a] shrink-0" />
            <input readOnly value={shareUrl} className="flex-1 bg-transparent text-xs text-[#5a5a5a] outline-none truncate" />
            <button onClick={copyLink} className="shrink-0 text-xs font-semibold text-[#1a7a5e] hover:underline flex items-center gap-1">
              {copied ? <><Check size={14} /> Kopirano!</> : 'Kopiraj link'}
            </button>
          </div>
          <p className="text-xs text-[#9a9a9a] mt-2">Podijelite ovaj link (ili QR kod) sa zaposlenicima — mogu predati prijedlog bez prijave.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6">

        {/* KPI kartice */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Ukupno prijedloga</p>
            <p className="text-2xl font-bold text-[#1a1a1a]">{kpi.total}</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Stopa realizacije</p>
            <p className="text-2xl font-bold text-[#1a7a5e]">{kpi.stopaRealizacije !== null ? `${kpi.stopaRealizacije}%` : '—'}</p>
            <p className="text-[10px] text-[#9a9a9a] mt-0.5">Završeno / (Završeno + Odbijeno)</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Prosj. vrijeme rješavanja</p>
            <p className="text-2xl font-bold text-[#1a1a1a]">{kpi.prosjekDana !== null ? `${kpi.prosjekDana} d` : '—'}</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-2">Top kategorije</p>
            <div className="space-y-1">
              {kpi.kategorijeSortirane.slice(0, 3).map(([k, n]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-[#5a5a5a] truncate">{k}</span>
                  <span className="font-semibold text-[#1a1a1a]">{n}</span>
                </div>
              ))}
              {kpi.kategorijeSortirane.length === 0 && <span className="text-xs text-[#c0c0c0]">—</span>}
            </div>
          </div>
        </div>

        {kpi.odjeliSortirani.length > 0 && (
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-[#5a5a5a] mb-3">Raspodjela po odjelu</p>
            <div className="space-y-2">
              {kpi.odjeliSortirani.map(([o, n]) => (
                <div key={o} className="flex items-center gap-3">
                  <span className="text-xs text-[#5a5a5a] w-32 truncate">{o}</span>
                  <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a7a5e] rounded-full" style={{ width: `${(n / kpi.total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-[#1a1a1a] w-6 text-right">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban board */}
        {prijedlozi.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#e2e2e2] rounded-xl">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Još nema prijedloga</h3>
            <p className="text-[#5a5a5a] text-sm">Podijelite link iznad sa zaposlenicima da počnu stizati prijedlozi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3" style={{ minWidth: STATUSI.length * 260 }}>
              {STATUSI.map(status => {
                const kartice = prijedlozi.filter(p => p.status === status);
                return (
                  <div
                    key={status}
                    className="flex-1 bg-white border border-[#e2e2e2] rounded-xl overflow-hidden"
                    style={{ minWidth: 250 }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { if (dragId) updateStatus(dragId, status); setDragId(null); }}
                  >
                    <div className="px-3 py-2.5 border-b border-[#e2e2e2] flex items-center justify-between" style={{ background: '#fafaf8' }}>
                      <span className="text-xs font-bold" style={{ color: STATUS_BOJA[status] }}>{status}</span>
                      <span className="text-xs font-semibold text-[#9a9a9a] bg-[#f0f0f0] px-2 py-0.5 rounded-full">{kartice.length}</span>
                    </div>
                    <div className="p-2 space-y-2 min-h-[80px]">
                      {kartice.map(p => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => setDragId(p.id)}
                          className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#1a7a5e] transition-colors"
                        >
                          <p className="text-xs text-[#1a1a1a] font-medium line-clamp-3 mb-2">{p.prob_opis || '(bez opisa)'}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#9a9a9a]">
                            <span>{p.ime || 'Anonimno'}{p.odjel ? ` · ${p.odjel}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {p.kategorija && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f5f0] text-[#1a7a5e]">{p.kategorija}</span>}
                            {p.prioritet && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#fef9c3] text-[#ca8a04]">{p.prioritet}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
