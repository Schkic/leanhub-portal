"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LokacijaOdjelPicker from '@/components/LokacijaOdjelPicker';
import { Loader2, Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';

type Status = 'otvoreno' | 'u_tijeku' | 'zavrseno' | 'odbijeno';

interface Action {
  id: string;
  naziv: string;
  odgovorna_osoba: string | null;
  rok: string | null;
  status: Status;
  napomena: string | null;
  izvor_alat: string | null;
  izvor_id: string | null;
  location_id: string | null;
  department_id: string | null;
  created_at: string;
  closed_at: string | null;
}

const KOLONE: { key: Status; label: string; color: string }[] = [
  { key: 'otvoreno', label: 'Otvoreno', color: '#9a9a9a' },
  { key: 'u_tijeku', label: 'U tijeku', color: '#7c3aed' },
  { key: 'zavrseno', label: 'Završeno', color: '#1a7a5e' },
  { key: 'odbijeno', label: 'Odbijeno', color: '#dc2626' },
];

const IZVOR_LABEL: Record<string, string> = {
  a3_obrazac: '📄 A3',
  gemba_walk: '🚶 Gemba',
  pet_zasto: '❓ 5×Zašto',
  smed: '⚡ SMED',
  kaizen_planer: '♾️ Kaizen event',
  audits_5s: '📋 5S',
  rucno: '✏️ Ručno',
};

const IZVOR_HREF: Record<string, string> = {
  a3_obrazac: '/alati/a3-obrazac',
  gemba_walk: '/alati/gemba-walk',
  pet_zasto: '/alati/5-zasto',
  smed: '/alati/smed',
  kaizen_planer: '/alati/kaizen-planer',
  audits_5s: '/alati/5s-audit',
};

const isOverdue = (a: Action) =>
  !!a.rok && (a.status === 'otvoreno' || a.status === 'u_tijeku') && new Date(a.rok) < new Date(new Date().toDateString());

export default function AkcijePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [locations, setLocations] = useState<{ id: string; naziv: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; naziv: string }[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNapomena, setEditNapomena] = useState('');
  const [editRok, setEditRok] = useState('');
  const [editOdgovorna, setEditOdgovorna] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [novNaziv, setNovNaziv] = useState('');
  const [novOdgovorna, setNovOdgovorna] = useState('');
  const [novRok, setNovRok] = useState('');
  const [novLokacijaId, setNovLokacijaId] = useState('');
  const [novOdjelId, setNovOdjelId] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  const load = async () => {
    const [act, loc, dep] = await Promise.all([
      supabase.from('actions').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('id, naziv'),
      supabase.from('departments').select('id, naziv'),
    ]);
    setActions((act.data as Action[]) || []);
    setLocations(loc.data || []);
    setDepartments(dep.data || []);
    setLoading(false);
  };

  useEffect(() => {
    requireAuth(router).then((u) => { if (!u) return; load(); });
  }, [router]);

  const locName = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l.naziv])), [locations]);
  const depName = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.naziv])), [departments]);

  const kpi = useMemo(() => {
    const total = actions.length;
    const aktivne = actions.filter((a) => a.status === 'otvoreno' || a.status === 'u_tijeku').length;
    const zakasnjelo = actions.filter(isOverdue).length;
    const zavrseno = actions.filter((a) => a.status === 'zavrseno').length;
    const odbijeno = actions.filter((a) => a.status === 'odbijeno').length;
    const zatvoreno = zavrseno + odbijeno;
    const stopa = zatvoreno > 0 ? Math.round((zavrseno / zatvoreno) * 100) : null;
    return { total, aktivne, zakasnjelo, stopa };
  }, [actions]);

  const updateStatus = async (id: string, status: Status) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await supabase.from('actions').update({ status }).eq('id', id);
  };

  const startEdit = (a: Action) => {
    setEditingId(a.id);
    setEditNapomena(a.napomena || '');
    setEditRok(a.rok || '');
    setEditOdgovorna(a.odgovorna_osoba || '');
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async (id: string) => {
    const patch = { napomena: editNapomena || null, rok: editRok || null, odgovorna_osoba: editOdgovorna || null };
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    await supabase.from('actions').update(patch).eq('id', id);
    setEditingId(null);
  };
  const deleteAction = async (id: string) => {
    if (!confirm('Obrisati ovu akciju?')) return;
    setActions((prev) => prev.filter((a) => a.id !== id));
    await supabase.from('actions').delete().eq('id', id);
  };

  const addManual = async () => {
    if (!novNaziv.trim()) return;
    setAddBusy(true);
    const { data } = await supabase.from('actions').insert({
      naziv: novNaziv.trim(),
      odgovorna_osoba: novOdgovorna.trim() || null,
      rok: novRok || null,
      location_id: novLokacijaId || null,
      department_id: novOdjelId || null,
      izvor_alat: 'rucno',
    }).select('*').single();
    setAddBusy(false);
    if (data) {
      setActions((prev) => [data as Action, ...prev]);
      setNovNaziv(''); setNovOdgovorna(''); setNovRok(''); setNovLokacijaId(''); setNovOdjelId('');
      setShowAdd(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-[#9a9a9a]">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">✅ Akcije</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Akcijski planovi</h1>
          <p className="text-sm text-[#5a5a5a]">Sve akcije iz svih alata na jednom mjestu — povucite karticu između kolona za promjenu statusa.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6">

        {/* KPI kartice */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Ukupno akcija</p>
            <p className="text-2xl font-bold text-[#1a1a1a]">{kpi.total}</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Aktivne</p>
            <p className="text-2xl font-bold text-[#1a1a1a]">{kpi.aktivne}</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Zakašnjele</p>
            <p className="text-2xl font-bold" style={{ color: kpi.zakasnjelo > 0 ? '#dc2626' : '#1a1a1a' }}>{kpi.zakasnjelo}</p>
          </div>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <p className="text-xs text-[#9a9a9a] font-medium mb-1">Stopa realizacije</p>
            <p className="text-2xl font-bold text-[#1a7a5e]">{kpi.stopa !== null ? `${kpi.stopa}%` : '—'}</p>
          </div>
        </div>

        {/* Ručno dodavanje */}
        <div className="mb-6">
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 border border-[#e2e2e2] bg-white text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
              <Plus size={16} /> Nova akcija
            </button>
          ) : (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Nova ručna akcija</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="md:col-span-2">
                  <input className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Što treba napraviti?" value={novNaziv} onChange={(e) => setNovNaziv(e.target.value)} />
                </div>
                <input className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Odgovorna osoba" value={novOdgovorna} onChange={(e) => setNovOdgovorna(e.target.value)} />
                <input type="date" className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={novRok} onChange={(e) => setNovRok(e.target.value)} />
                <LokacijaOdjelPicker
                  locationId={novLokacijaId}
                  departmentId={novOdjelId}
                  onChange={({ locationId, departmentId }) => { setNovLokacijaId(locationId); setNovOdjelId(departmentId); }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addManual} disabled={addBusy || !novNaziv.trim()} className="flex items-center gap-1.5 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-60">
                  {addBusy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Dodaj
                </button>
                <button onClick={() => setShowAdd(false)} className="text-sm font-semibold text-[#5a5a5a] px-3">Odustani</button>
              </div>
            </div>
          )}
        </div>

        {/* Kanban board */}
        {actions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#e2e2e2] rounded-xl">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Još nema akcija</h3>
            <p className="text-[#5a5a5a] text-sm">Akcije koje dodate u alatima (A3, Gemba, 5×Zašto, SMED, Kaizen event) ovdje se automatski pojavljuju.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3" style={{ minWidth: KOLONE.length * 280 }}>
              {KOLONE.map((kol) => {
                const kartice = actions.filter((a) => a.status === kol.key);
                return (
                  <div
                    key={kol.key}
                    className="flex-1 bg-white border border-[#e2e2e2] rounded-xl overflow-hidden"
                    style={{ minWidth: 270 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragId) updateStatus(dragId, kol.key); setDragId(null); }}
                  >
                    <div className="px-3 py-2.5 border-b border-[#e2e2e2] flex items-center justify-between" style={{ background: '#fafaf8' }}>
                      <span className="text-xs font-bold" style={{ color: kol.color }}>{kol.label}</span>
                      <span className="text-xs font-semibold text-[#9a9a9a] bg-[#f0f0f0] px-2 py-0.5 rounded-full">{kartice.length}</span>
                    </div>
                    <div className="p-2 space-y-2 min-h-[80px]">
                      {kartice.map((a) => {
                        const editing = editingId === a.id;
                        return (
                          <div
                            key={a.id}
                            draggable={!editing}
                            onDragStart={() => setDragId(a.id)}
                            className={`bg-[#fafaf8] border rounded-lg p-3 transition-colors ${editing ? 'border-[#1a7a5e]' : 'border-[#e2e2e2] cursor-grab active:cursor-grabbing hover:border-[#1a7a5e]'}`}
                          >
                            <p className="text-xs text-[#1a1a1a] font-medium mb-2">{a.naziv}</p>
                            <div className="flex items-center justify-between text-[10px] text-[#9a9a9a] mb-1.5">
                              <span>{a.odgovorna_osoba || 'Nije dodijeljeno'}</span>
                              {a.rok && (
                                <span className={isOverdue(a) ? 'text-[#dc2626] font-bold flex items-center gap-0.5' : ''}>
                                  {isOverdue(a) && <AlertTriangle size={10} />}
                                  {new Date(a.rok).toLocaleDateString('hr-HR')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              {a.izvor_alat && (
                                a.izvor_alat === 'rucno' ? (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f0f0f0] text-[#5a5a5a]">{IZVOR_LABEL[a.izvor_alat]}</span>
                                ) : (
                                  <a href={IZVOR_HREF[a.izvor_alat] || '#'} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f5f0] text-[#1a7a5e] hover:underline">{IZVOR_LABEL[a.izvor_alat] || a.izvor_alat}</a>
                                )
                              )}
                              {a.location_id && locName[a.location_id] && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{locName[a.location_id]}</span>
                              )}
                              {a.department_id && depName[a.department_id] && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">{depName[a.department_id]}</span>
                              )}
                            </div>

                            {editing ? (
                              <div className="space-y-1.5 mt-2 pt-2 border-t border-[#e2e2e2]">
                                <input className="w-full px-2 py-1 border border-[#e2e2e2] rounded text-xs bg-white outline-none focus:border-[#1a7a5e]" placeholder="Odgovorna osoba" value={editOdgovorna} onChange={(e) => setEditOdgovorna(e.target.value)} />
                                <input type="date" className="w-full px-2 py-1 border border-[#e2e2e2] rounded text-xs bg-white outline-none focus:border-[#1a7a5e]" value={editRok} onChange={(e) => setEditRok(e.target.value)} />
                                <textarea className="w-full px-2 py-1 border border-[#e2e2e2] rounded text-xs bg-white outline-none focus:border-[#1a7a5e] resize-none" rows={2} placeholder="Napomena / rješenje..." value={editNapomena} onChange={(e) => setEditNapomena(e.target.value)} />
                                <div className="flex items-center gap-2 pt-0.5">
                                  <button onClick={() => saveEdit(a.id)} className="flex items-center gap-1 text-[10px] font-bold text-[#1a7a5e]"><Check size={12} /> Spremi</button>
                                  <button onClick={cancelEdit} className="flex items-center gap-1 text-[10px] font-bold text-[#9a9a9a]"><X size={12} /> Odustani</button>
                                  <button onClick={() => deleteAction(a.id)} className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#dc2626]"><Trash2 size={12} /> Obriši</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                {a.napomena ? <p className="text-[10px] text-[#5a5a5a] italic flex-1 truncate">{a.napomena}</p> : <span />}
                                <button onClick={() => startEdit(a)} className="text-[#9a9a9a] hover:text-[#1a7a5e] shrink-0"><Pencil size={12} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
