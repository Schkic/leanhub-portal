"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, FileDown } from 'lucide-react';

const GUBICI = ['Prekomjerna proizvodnja', 'Čekanje', 'Transport', 'Prerada', 'Zalihe', 'Kretanje', 'Škart/Dorada', 'Neiskorišten potencijal'];
const PRIORITETI = ['Visoki', 'Srednji', 'Nizak'];
const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];
const CILJEVI = ['Sigurnost', 'Kvaliteta', 'Produktivnost', 'Gubici (Muda)', '5S', 'Takt i protok', 'Opće'];

interface ZapazanjeRow { lokacija: string; vrsta: string; opis: string; uzrok: string; prioritet: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

export default function GembaWalkPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  // Meta
  const [datum, setDatum] = useState('');
  const [pocetak, setPocetak] = useState('');
  const [kraj, setKraj] = useState('');
  const [voditelj, setVoditelj] = useState('');
  const [sudionici, setSudionici] = useState('');
  const [lokacija, setLokacija] = useState('');
  const [cilj, setCilj] = useState('Opće');
  const [napomena, setNapomena] = useState('');

  // Zapažanja
  const [zapazanja, setZapazanja] = useState<ZapazanjeRow[]>([
    { lokacija: '', vrsta: '', opis: '', uzrok: '', prioritet: 'Srednji' }
  ]);

  // Akcije
  const [akcije, setAkcije] = useState<AkcijaRow[]>([
    { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }
  ]);

  // Sažetak
  const [sumPoz, setSumPoz] = useState('');
  const [sumProb, setSumProb] = useState('');
  const [sumHitno, setSumHitno] = useState('');
  const [sumSljedeci, setSumSljedeci] = useState('');
  const [sumPotpis, setSumPotpis] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addZapazanje = () => setZapazanja([...zapazanja, { lokacija: '', vrsta: '', opis: '', uzrok: '', prioritet: 'Srednji' }]);
  const removeZapazanje = (i: number) => setZapazanja(zapazanja.filter((_, idx) => idx !== i));
  const updateZapazanje = (i: number, field: keyof ZapazanjeRow, value: string) => {
    const updated = [...zapazanja];
    updated[i][field] = value;
    setZapazanja(updated);
  };

  const addAkcija = () => setAkcije([...akcije, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(akcije.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    const updated = [...akcije];
    updated[i][field] = value;
    setAkcije(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('gemba_walk').insert({
      user_id: user.id,
      datum, pocetak, kraj, voditelj, sudionici,
      lokacija, cilj, napomena,
      zapazanja, akcije,
      sum_poz: sumPoz, sum_prob: sumProb,
      sum_hitno: sumHitno, sum_sljedeci: sumSljedeci || null,
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
        <div className="max-w-[1000px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">🚶 Gemba Walk</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Gemba Walk obrazac</h1>
          <p className="text-sm text-[#5a5a5a]">Dokumentirajte zapažanja, identificirajte gubitke i definirajte akcije za poboljšanje.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1000px] mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta podaci */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">📋</div>
            <div>
              <h3 className="text-sm font-semibold">Opći podaci</h3>
              <p className="text-xs text-[#9a9a9a]">Tko, kada i gdje</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>Datum obilaska</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
            <div><label className={labelCls}>Početak</label><input type="time" className={inputCls} value={pocetak} onChange={e => setPocetak(e.target.value)} /></div>
            <div><label className={labelCls}>Kraj</label><input type="time" className={inputCls} value={kraj} onChange={e => setKraj(e.target.value)} /></div>
            <div><label className={labelCls}>Voditelj Gemba Walka</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
            <div><label className={labelCls}>Sudionici</label><input type="text" className={inputCls} placeholder="npr. Voditelj linije, Lean koordinator" value={sudionici} onChange={e => setSudionici(e.target.value)} /></div>
            <div><label className={labelCls}>Odjel / Pogon / Linija</label><input type="text" className={inputCls} placeholder="npr. Montažna linija B" value={lokacija} onChange={e => setLokacija(e.target.value)} /></div>
            <div>
              <label className={labelCls}>Fokus obilaska</label>
              <select className={inputCls} value={cilj} onChange={e => setCilj(e.target.value)}>
                {CILJEVI.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className={labelCls}>Napomena / kontekst</label><input type="text" className={inputCls} placeholder="npr. Povećan broj reklamacija u zadnja 2 tjedna" value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
          </div>
        </div>

        {/* Zapažanja */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-sm">👁️</div>
            <div>
              <h3 className="text-sm font-semibold">Zapažanja s terena</h3>
              <p className="text-xs text-[#9a9a9a]">Dokumentirajte sve što ste uočili</p>
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Lokacija</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Vrsta gubitka</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Opis zapažanja</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Mogući uzrok</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Prioritet</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {zapazanja.map((z, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#9a9a9a] text-center">{i + 1}</td>
                      <td className="py-1 px-1"><input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Lokacija..." value={z.lokacija} onChange={e => updateZapazanje(i, 'lokacija', e.target.value)} /></td>
                      <td className="py-1 px-1">
                        <select className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={z.vrsta} onChange={e => updateZapazanje(i, 'vrsta', e.target.value)}>
                          <option value="">Odaberi...</option>
                          {GUBICI.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </td>
                      <td className="py-1 px-1"><textarea className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none" rows={2} placeholder="Opis..." value={z.opis} onChange={e => updateZapazanje(i, 'opis', e.target.value)} /></td>
                      <td className="py-1 px-1"><textarea className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none" rows={2} placeholder="Uzrok..." value={z.uzrok} onChange={e => updateZapazanje(i, 'uzrok', e.target.value)} /></td>
                      <td className="py-1 px-1">
                        <select className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={z.prioritet} onChange={e => updateZapazanje(i, 'prioritet', e.target.value)}>
                          {PRIORITETI.map(p => <option key={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <button onClick={() => removeZapazanje(i)} className="text-[#9a9a9a] hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addZapazanje} className="mt-3 flex items-center gap-2 text-xs text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-4 py-2 hover:bg-[#e8f5f0] transition-all">
              <Plus size={14} /> Dodaj zapažanje
            </button>
          </div>
        </div>

        {/* Akcijski plan */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-sm">🎯</div>
            <div>
              <h3 className="text-sm font-semibold">Akcijski plan</h3>
              <p className="text-xs text-[#9a9a9a]">Konkretne akcije s odgovornom osobom i rokom</p>
            </div>
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
                      <td className="py-1 px-1"><textarea className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none" rows={2} placeholder="Opis akcije..." value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" placeholder="Ime..." value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                      <td className="py-1 px-1"><input type="date" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                      <td className="py-1 px-1">
                        <select className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
                          {STATUSI.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <button onClick={() => removeAkcija(i)} className="text-[#9a9a9a] hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                      </td>
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
            <div>
              <h3 className="text-sm font-semibold">Sažetak obilaska</h3>
              <p className="text-xs text-[#9a9a9a]">Zaključci i preporuke</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Ključna pozitivna zapažanja</label><textarea className={`${inputCls} resize-none`} rows={3} placeholder="Što funkcionira dobro?" value={sumPoz} onChange={e => setSumPoz(e.target.value)} /></div>
            <div><label className={labelCls}>Ključni problemi / gubici</label><textarea className={`${inputCls} resize-none`} rows={3} placeholder="Najveći problemi uočeni..." value={sumProb} onChange={e => setSumProb(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Preporuke za hitnu akciju</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Što treba napraviti odmah?" value={sumHitno} onChange={e => setSumHitno(e.target.value)} /></div>
            <div><label className={labelCls}>Datum sljedećeg Gemba Walka</label><input type="date" className={inputCls} value={sumSljedeci} onChange={e => setSumSljedeci(e.target.value)} /></div>
            <div><label className={labelCls}>Potpis voditelja</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={sumPotpis} onChange={e => setSumPotpis(e.target.value)} /></div>
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi Gemba Walk'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Gemba Walk je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
