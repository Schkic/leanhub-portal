"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

const KATEGORIJE = ['Kvaliteta', 'Sigurnost', 'Produktivnost', 'Održavanje', 'Logistika', 'Ostalo'];
const STATUSI = ['📋 Otvoreno', '🔄 U tijeku', '✅ Završeno', '⏸️ Na čekanju'];
const WHY_LABELS = ['Zašto 1?', 'Zašto 2?', 'Zašto 3?', 'Zašto 4?', 'Zašto 5? (Korijenski uzrok)'];
const WHY_HINTS = [
  'Koji je neposredni uzrok problema?',
  'Zašto se taj uzrok pojavio?',
  'Zašto je do toga došlo?',
  'Što je uzrokovalo prethodni uzrok?',
  'Ovo je korijenski uzrok — što treba trajno eliminirati?',
];

interface Analiza { problem: string; zasto: string[]; korijen: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const novaAnaliza = (): Analiza => ({ problem: '', zasto: ['', '', '', '', ''], korijen: '' });

export default function PetZastoPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [datum, setDatum] = useState('');
  const [voditelj, setVoditelj] = useState('');
  const [tim, setTim] = useState('');
  const [odjel, setOdjel] = useState('');
  const [broj, setBroj] = useState('');
  const [kategorija, setKategorija] = useState('Kvaliteta');
  const [analize, setAnalize] = useState<Analiza[]>([novaAnaliza()]);
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: '📋 Otvoreno' }]);
  const [sumUzroci, setSumUzroci] = useState('');
  const [sumOcekivano, setSumOcekivano] = useState('');
  const [sumProva, setSumProva] = useState('');
  const [sumRezultat, setSumRezultat] = useState('');
  const [sumPotpis, setSumPotpis] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/prijava');
      else setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addAnaliza = () => setAnalize([...analize, novaAnaliza()]);
  const removeAnaliza = (i: number) => setAnalize(analize.filter((_, idx) => idx !== i));
  const updateAnaliza = (i: number, field: keyof Analiza, value: any) => {
    const updated = [...analize]; updated[i] = { ...updated[i], [field]: value }; setAnalize(updated);
  };
  const updateZasto = (ai: number, wi: number, value: string) => {
    const updated = [...analize];
    const z = [...updated[ai].zasto]; z[wi] = value;
    updated[ai] = { ...updated[ai], zasto: z };
    setAnalize(updated);
  };

  const addAkcija = () => setAkcije([...akcije, { akcija: '', odgovorna: '', rok: '', status: '📋 Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(akcije.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    const updated = [...akcije]; updated[i][field] = value; setAkcije(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('pet_zasto').insert({
      user_id: user.id,
      datum, voditelj, tim, odjel, broj, kategorija,
      analize, akcije,
      sum_uzroci: sumUzroci,
      sum_ocekivano: sumOcekivano,
      sum_provjera: sumProva || null,
      sum_rezultat: sumRezultat,
      sum_potpis: sumPotpis,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3">❓ 5x Zašto</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">5x Zašto — analiza uzroka</h1>
          <p className="text-sm text-[#5a5a5a]">Pronađite korijenski uzrok problema postavljanjem pet uzastopnih pitanja "Zašto?"</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[900px] mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta podaci */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-sm">📋</div>
            <div><h3 className="text-sm font-semibold">Opći podaci</h3><p className="text-xs text-[#9a9a9a]">Tko, kada i što analiziramo</p></div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>Datum analize</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
            <div><label className={labelCls}>Voditelj analize</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
            <div><label className={labelCls}>Tim / Sudionici</label><input type="text" className={inputCls} placeholder="npr. Voditelj kvalitete, Lean koordinator" value={tim} onChange={e => setTim(e.target.value)} /></div>
            <div><label className={labelCls}>Odjel / Linija / Proces</label><input type="text" className={inputCls} placeholder="npr. Montažna linija A" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
            <div><label className={labelCls}>Broj izvještaja / Reference</label><input type="text" className={inputCls} placeholder="npr. NC-2024-042" value={broj} onChange={e => setBroj(e.target.value)} /></div>
            <div>
              <label className={labelCls}>Kategorija problema</label>
              <select className={inputCls} value={kategorija} onChange={e => setKategorija(e.target.value)}>
                {KATEGORIJE.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Analize */}
        {analize.map((a, ai) => (
          <div key={ai} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
            <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">{ai + 1}</div>
                <div><h3 className="text-sm font-semibold">Analiza {ai + 1}</h3><p className="text-xs text-[#9a9a9a]">Problem → 5x Zašto → Korijenski uzrok</p></div>
              </div>
              {analize.length > 1 && (
                <button onClick={() => removeAnaliza(ai)} className="text-[#9a9a9a] hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
              )}
            </div>
            <div className="p-4 space-y-4">
              {/* Problem */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">🔴 Problem / Simptom</label>
                <textarea
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:border-orange-400 outline-none bg-white resize-none"
                  rows={2}
                  placeholder="Što se točno dogodilo? Budite specifični — kada, gdje, koliko često, koliki je utjecaj?"
                  value={a.problem}
                  onChange={e => updateAnaliza(ai, 'problem', e.target.value)}
                />
              </div>

              {/* 5x Zašto */}
              <div className="space-y-3">
                {a.zasto.map((z, wi) => (
                  <div key={wi} className="flex gap-3 items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${wi === 4 ? 'bg-[#e8f5f0] text-[#1a7a5e]' : 'bg-[#fafaf8] border border-[#e2e2e2] text-[#5a5a5a]'}`}>
                      {wi + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider mb-1">{WHY_LABELS[wi]}</label>
                      <textarea
                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none resize-none bg-[#fafaf8] ${wi === 4 ? 'border-[#1a7a5e] focus:border-[#155f49]' : 'border-[#e2e2e2] focus:border-[#1a7a5e]'}`}
                        rows={2}
                        placeholder={WHY_HINTS[wi]}
                        value={z}
                        onChange={e => updateZasto(ai, wi, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Korijenski uzrok */}
              <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-4">
                <label className="block text-xs font-bold text-[#1a7a5e] uppercase tracking-wider mb-2">✅ Korijenski uzrok (zaključak)</label>
                <textarea
                  className="w-full px-3 py-2 border border-[#1a7a5e]/30 rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-white resize-none"
                  rows={2}
                  placeholder="Sažmite korijenski uzrok u jednu-dvije rečenice. Ovo je uzrok koji treba eliminirati."
                  value={a.korijen}
                  onChange={e => updateAnaliza(ai, 'korijen', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addAnaliza} className="flex items-center gap-2 text-sm text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-xl px-5 py-3 hover:bg-[#e8f5f0] transition-all w-full justify-center">
          <Plus size={16} /> Dodaj još jednu analizu
        </button>

        {/* Akcijski plan */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-sm">🎯</div>
            <div><h3 className="text-sm font-semibold">Akcijski plan</h3><p className="text-xs text-[#9a9a9a]">Korektivne i preventivne akcije</p></div>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Akcija</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Odgovorna osoba</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Rok</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Status</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {akcije.map((a, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#9a9a9a] text-center">{i + 1}</td>
                      <td className="py-1 px-1"><input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Opis akcije..." value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Ime..." value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                      <td className="py-1 px-1"><input type="date" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                      <td className="py-1 px-1">
                        <select className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
                          {STATUSI.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-1 px-1"><button onClick={() => removeAkcija(i)} className="text-[#9a9a9a] hover:text-red-500 p-1"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addAkcija} className="mt-3 flex items-center gap-2 text-xs text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-4 py-2 hover:bg-[#e8f5f0] transition-all">
              <Plus size={14} /> Dodaj akciju
            </button>
          </div>
        </div>

        {/* Sažetak */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-sm">📝</div>
            <div><h3 className="text-sm font-semibold">Sažetak i provjera</h3><p className="text-xs text-[#9a9a9a]">Zaključci i praćenje učinkovitosti</p></div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Sažetak korijenskih uzroka</label><textarea className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none" rows={3} placeholder="Ukratko opišite što ste otkrili kao korijenski uzrok..." value={sumUzroci} onChange={e => setSumUzroci(e.target.value)} /></div>
            <div><label className={labelCls}>Očekivani rezultat nakon provedbe akcija</label><textarea className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none" rows={3} placeholder="Što se očekuje poboljšati / koje metrike pratiti?" value={sumOcekivano} onChange={e => setSumOcekivano(e.target.value)} /></div>
            <div><label className={labelCls}>Datum provjere učinkovitosti</label><input type="date" className={inputCls} value={sumProva} onChange={e => setSumProva(e.target.value)} /></div>
            <div><label className={labelCls}>Rezultat provjere</label><input type="text" className={inputCls} placeholder="Ispuniti nakon provjere..." value={sumRezultat} onChange={e => setSumRezultat(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Potpis voditelja analize</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={sumPotpis} onChange={e => setSumPotpis(e.target.value)} /></div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi analizu'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Analiza je uspješno spremljena! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
