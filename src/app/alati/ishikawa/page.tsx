"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

const KATEGORIJE_DEFAULT = [
  { id: 'covjek',    label: 'Čovjek',   emoji: '👷', color: '#1a7a5e', bg: '#e8f5f0' },
  { id: 'stroj',     label: 'Stroj',    emoji: '⚙️',  color: '#2563eb', bg: '#eff6ff' },
  { id: 'metoda',    label: 'Metoda',   emoji: '📋', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'materijal', label: 'Materijal',emoji: '📦', color: '#ca8a04', bg: '#fefce8' },
  { id: 'mjerenje',  label: 'Mjerenje', emoji: '📏', color: '#dc2626', bg: '#fef2f2' },
  { id: 'okolis',    label: 'Okoliš',   emoji: '🌱', color: '#0891b2', bg: '#ecfeff' },
];

const defaultKategorije = () =>
  Object.fromEntries(KATEGORIJE_DEFAULT.map(k => [k.id, ['', '', '']]));

export default function IshikawaPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [problem, setProblem] = useState('');
  const [datum, setDatum] = useState('');
  const [tim, setTim] = useState('');
  const [odjel, setOdjel] = useState('');
  const [kategorije, setKategorije] = useState<Record<string, string[]>>(defaultKategorije());
  const [korijenski, setKorijenski] = useState('');
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/prijava');
      else setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addUzrok = (katId: string) => {
    setKategorije(prev => ({ ...prev, [katId]: [...prev[katId], ''] }));
  };

  const removeUzrok = (katId: string, idx: number) => {
    setKategorije(prev => ({
      ...prev,
      [katId]: prev[katId].filter((_, i) => i !== idx)
    }));
  };

  const updateUzrok = (katId: string, idx: number, value: string) => {
    setKategorije(prev => {
      const updated = [...prev[katId]];
      updated[idx] = value;
      return { ...prev, [katId]: updated };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('ishikawa').insert({
      user_id: user.id,
      problem, datum, tim, odjel,
      kategorije, korijenski_uzrok: korijenski, napomena,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  // SVG dimenzije
  const W = 900, H = 420;
  const spineY = H / 2;
  const headX = W - 60;
  const tailX = 60;

  // Kategorije pozicije — gornje i donje
  const gornje = ['covjek', 'metoda', 'mjerenje'];
  const donje  = ['stroj', 'materijal', 'okolis'];
  const positions = [0.25, 0.5, 0.75];

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#dc2626] bg-red-50 px-3 py-1 rounded-full mb-3">🐟 Ishikawa</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Ishikawa dijagram (Riblja kost)</h1>
          <p className="text-sm text-[#5a5a5a]">Vizualno identificirajte uzroke problema metodom 6M — Čovjek, Stroj, Metoda, Materijal, Mjerenje, Okoliš.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1000px] mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta podaci */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Opći podaci</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Problem / Efekt (glava ribe)</label>
              <input type="text" className={`${inputCls} border-red-300 focus:border-red-500 font-semibold`}
                placeholder="npr. Povećan broj reklamacija na sklopu X — što se dogodilo?" value={problem} onChange={e => setProblem(e.target.value)} />
            </div>
            <div><label className={labelCls}>Datum analize</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
            <div><label className={labelCls}>Tim / Sudionici</label><input type="text" className={inputCls} placeholder="npr. Voditelj kvalitete, Lean koordinator" value={tim} onChange={e => setTim(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Odjel / Pogon</label><input type="text" className={inputCls} placeholder="npr. Montažna linija A" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
          </div>
        </div>

        {/* SVG Dijagram */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
            <h3 className="text-sm font-semibold">Dijagram riblje kosti</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 600 }}>
              {/* Pozadina */}
              <rect width={W} height={H} fill="#fafaf8" rx={8} />

              {/* Glavna kičma */}
              <line x1={tailX} y1={spineY} x2={headX} y2={spineY} stroke="#dc2626" strokeWidth={3} />

              {/* Glava — efekt/problem */}
              <rect x={headX} y={spineY - 28} width={110} height={56} rx={6} fill="#dc2626" />
              <text x={headX + 55} y={spineY - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill="white">PROBLEM</text>
              <text x={headX + 55} y={spineY + 8} textAnchor="middle" fontSize={8} fill="white" opacity={0.9}>
                {problem ? (problem.length > 14 ? problem.substring(0, 14) + '...' : problem) : 'Unesite problem'}
              </text>
              <polygon points={`${headX},${spineY} ${headX-12},${spineY-8} ${headX-12},${spineY+8}`} fill="#dc2626" />

              {/* Rep */}
              <polygon points={`${tailX},${spineY} ${tailX+14},${spineY-8} ${tailX+14},${spineY+8}`} fill="#9a9a9a" />

              {/* Gornje kategorije */}
              {gornje.map((katId, i) => {
                const kat = KATEGORIJE_DEFAULT.find(k => k.id === katId)!;
                const x = tailX + (headX - tailX) * positions[i];
                const y = spineY - 120;
                return (
                  <g key={katId}>
                    {/* Kosa linija */}
                    <line x1={x} y1={spineY} x2={x - 20} y2={y + 30} stroke={kat.color} strokeWidth={2} />
                    {/* Horizontalna linija kategorije */}
                    <line x1={x - 80} y1={y + 10} x2={x - 20} y2={y + 30} stroke={kat.color} strokeWidth={1.5} />
                    {/* Label kategorije */}
                    <rect x={x - 105} y={y - 8} width={90} height={22} rx={4} fill={kat.color} />
                    <text x={x - 60} y={y + 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">{kat.emoji} {kat.label}</text>
                    {/* Uzroci */}
                    {kategorije[katId].filter(u => u).map((uzrok, ui) => (
                      <g key={ui}>
                        <line x1={x - 25 - ui * 22} y1={spineY - 15 - ui * 18} x2={x - 25 - ui * 22 - 10} y2={y + 28 - ui * 5} stroke={kat.color} strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
                        <text x={x - 30 - ui * 22} y={spineY - 20 - ui * 18} textAnchor="end" fontSize={8} fill={kat.color} fontWeight={500}>{uzrok}</text>
                      </g>
                    ))}
                  </g>
                );
              })}

              {/* Donje kategorije */}
              {donje.map((katId, i) => {
                const kat = KATEGORIJE_DEFAULT.find(k => k.id === katId)!;
                const x = tailX + (headX - tailX) * positions[i];
                const y = spineY + 90;
                return (
                  <g key={katId}>
                    <line x1={x} y1={spineY} x2={x - 20} y2={y - 30} stroke={kat.color} strokeWidth={2} />
                    <line x1={x - 80} y1={y - 10} x2={x - 20} y2={y - 30} stroke={kat.color} strokeWidth={1.5} />
                    <rect x={x - 105} y={y - 14} width={90} height={22} rx={4} fill={kat.color} />
                    <text x={x - 60} y={y} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">{kat.emoji} {kat.label}</text>
                    {kategorije[katId].filter(u => u).map((uzrok, ui) => (
                      <g key={ui}>
                        <text x={x - 30 - ui * 22} y={spineY + 22 + ui * 18} textAnchor="end" fontSize={8} fill={kat.color} fontWeight={500}>{uzrok}</text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Unos uzroka po kategorijama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KATEGORIJE_DEFAULT.map(kat => (
            <div key={kat.id} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: kat.bg, borderBottom: `2px solid ${kat.color}` }}>
                <span className="text-lg">{kat.emoji}</span>
                <h3 className="text-sm font-bold" style={{ color: kat.color }}>{kat.label}</h3>
                <span className="text-xs ml-auto" style={{ color: kat.color }}>{kategorije[kat.id].filter(u => u).length} uzroka</span>
              </div>
              <div className="p-3 space-y-2">
                {kategorije[kat.id].map((uzrok, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: kat.color }}>{idx + 1}</div>
                    <input
                      type="text"
                      className="flex-1 px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm focus:outline-none bg-[#fafaf8]"
                      style={{ '--tw-ring-color': kat.color } as any}
                      placeholder={`Uzrok ${idx + 1}...`}
                      value={uzrok}
                      onChange={e => updateUzrok(kat.id, idx, e.target.value)}
                      onFocus={e => e.target.style.borderColor = kat.color}
                      onBlur={e => e.target.style.borderColor = '#e2e2e2'}
                    />
                    {kategorije[kat.id].length > 1 && (
                      <button onClick={() => removeUzrok(kat.id, idx)} className="text-[#9a9a9a] hover:text-red-500 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addUzrok(kat.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed transition-all w-full justify-center"
                  style={{ borderColor: kat.color, color: kat.color }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = kat.bg)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <Plus size={12} /> Dodaj uzrok
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Zaključak */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Zaključak analize</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Korijenski uzrok (zaključak tima)</label>
              <textarea className={`${inputCls} resize-none`} rows={3}
                placeholder="Na temelju analize, tim je zaključio da je korijenski uzrok..."
                value={korijenski} onChange={e => setKorijenski(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Napomena / Sljedeći koraci</label>
              <textarea className={`${inputCls} resize-none`} rows={2}
                placeholder="Sljedeći koraci, akcije, odgovorne osobe..."
                value={napomena} onChange={e => setNapomena(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi Ishikawa dijagram'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Dijagram je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
