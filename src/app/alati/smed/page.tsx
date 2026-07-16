"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface Aktivnost {
  naziv: string;
  trajanje: number;
  tip: 'interna' | 'eksterna';
  prijedlog: string;
  novaTip: 'interna' | 'eksterna';
}

interface AkcijaRow {
  akcija: string;
  odgovorna: string;
  rok: string;
  status: string;
}

const novaAktivnost = (): Aktivnost => ({
  naziv: '', trajanje: 0, tip: 'interna', prijedlog: '', novaTip: 'eksterna'
});

const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];

export default function SMEDPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [stroj, setStroj] = useState('');
  const [proces, setPraces] = useState('');
  const [datum, setDatum] = useState('');
  const [tim, setTim] = useState('');
  const [odjel, setOdjel] = useState('');
  const [aktivnosti, setAktivnosti] = useState<Aktivnost[]>([novaAktivnost()]);
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/prijava');
      else setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addAktivnost = () => setAktivnosti(prev => [...prev, novaAktivnost()]);
  const removeAktivnost = (i: number) => setAktivnosti(prev => prev.filter((_, idx) => idx !== i));
  const updateAktivnost = (i: number, field: keyof Aktivnost, value: any) => {
    setAktivnosti(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const addAkcija = () => setAkcije(prev => [...prev, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i][field] = value; return u; });
  };

  // Kalkulacije
  const totalPrije = aktivnosti.reduce((sum, a) => sum + (a.trajanje || 0), 0);
  const interneAkt = aktivnosti.filter(a => a.tip === 'interna');
  const externeAkt = aktivnosti.filter(a => a.tip === 'eksterna');
  const totalInterne = interneAkt.reduce((sum, a) => sum + (a.trajanje || 0), 0);
  const totalExterne = externeAkt.reduce((sum, a) => sum + (a.trajanje || 0), 0);

  // Nakon SMED — što ostaje interno
  const novoInterne = aktivnosti.filter(a => a.novaTip === 'interna').reduce((sum, a) => sum + (a.trajanje || 0), 0);
  const novoExterne = aktivnosti.filter(a => a.novaTip === 'eksterna').reduce((sum, a) => sum + (a.trajanje || 0), 0);
  const poboljsanje = totalPrije > 0 ? Math.round(((totalPrije - novoInterne) / totalPrije) * 100) : 0;
  const usteda = totalPrije - novoInterne;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('smed').insert({
      user_id: user.id,
      stroj, proces, datum, tim, odjel,
      aktivnosti, akcije, napomena,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  const formatMin = (min: number) => {
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}min`;
  };

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">⚡ SMED</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">SMED analiza</h1>
          <p className="text-sm text-[#5a5a5a]">Single Minute Exchange of Die — smanjite vrijeme izmjene pretvaranjem internih aktivnosti u eksterne.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta + Rezultati */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Opći podaci</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Stroj / Oprema</label><input type="text" className={inputCls} placeholder="npr. Injekcijska preša #3" value={stroj} onChange={e => setStroj(e.target.value)} /></div>
              <div><label className={labelCls}>Proces / Operacija</label><input type="text" className={inputCls} placeholder="npr. Izmjena kalupa" value={proces} onChange={e => setPraces(e.target.value)} /></div>
              <div><label className={labelCls}>Datum</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div><label className={labelCls}>Odjel</label><input type="text" className={inputCls} placeholder="npr. Prerada plastike" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Tim / Sudionici</label><input type="text" className={inputCls} placeholder="npr. Operater, Voditelj smjene, Lean koordinator" value={tim} onChange={e => setTim(e.target.value)} /></div>
            </div>
          </div>

          {/* Rezultati */}
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 flex flex-col justify-between">
            <h3 className="text-sm font-semibold mb-3">Rezultati analize</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#5a5a5a]">Ukupno PRIJE</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{formatMin(totalPrije)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-red-600">↳ Interne aktivnosti</span>
                <span className="text-sm font-semibold text-red-600">{formatMin(totalInterne)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#1a7a5e]">↳ Eksterne aktivnosti</span>
                <span className="text-sm font-semibold text-[#1a7a5e]">{formatMin(totalExterne)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#5a5a5a]">Novo interno NAKON</span>
                <span className="text-sm font-bold text-[#1a7a5e]">{formatMin(novoInterne)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-[#5a5a5a]">Ušteda vremena</span>
                <span className="text-sm font-bold text-[#1a7a5e]">{formatMin(usteda)}</span>
              </div>
            </div>
            <div className={`mt-3 text-center py-3 rounded-xl ${poboljsanje >= 50 ? 'bg-[#e8f5f0] text-[#1a7a5e]' : poboljsanje > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-[#fafaf8] text-[#9a9a9a]'}`}>
              <div className="text-3xl font-bold">{poboljsanje > 0 ? `${poboljsanje}%` : '—'}</div>
              <div className="text-xs font-semibold">poboljšanje</div>
            </div>
          </div>
        </div>

        {/* Vizualni bar */}
        {totalPrije > 0 && (
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Vizualni prikaz</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[#5a5a5a] mb-1">
                  <span>PRIJE — ukupno izmjensko vrijeme</span>
                  <span className="font-semibold">{formatMin(totalPrije)}</span>
                </div>
                <div className="h-8 bg-[#fafaf8] rounded-lg overflow-hidden flex border border-[#e2e2e2]">
                  {aktivnosti.map((a, i) => a.trajanje > 0 && (
                    <div key={i}
                      style={{ width: `${(a.trajanje / totalPrije) * 100}%`, backgroundColor: a.tip === 'interna' ? '#dc2626' : '#1a7a5e', opacity: 0.8 }}
                      title={`${a.naziv} (${a.trajanje} min)`}
                      className="h-full transition-all hover:opacity-100"
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-1 text-[10px] text-[#9a9a9a]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>Interno</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1a7a5e] inline-block"></span>Eksterno</span>
                </div>
              </div>
              {novoInterne > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-[#5a5a5a] mb-1">
                    <span>NAKON SMED-a — novo izmjensko vrijeme</span>
                    <span className="font-semibold text-[#1a7a5e]">{formatMin(novoInterne)}</span>
                  </div>
                  <div className="h-8 bg-[#fafaf8] rounded-lg overflow-hidden flex border border-[#e2e2e2]">
                    {aktivnosti.map((a, i) => a.trajanje > 0 && a.novaTip === 'interna' && (
                      <div key={i}
                        style={{ width: `${(a.trajanje / totalPrije) * 100}%`, backgroundColor: '#1a7a5e', opacity: 0.7 }}
                        title={`${a.naziv} (${a.trajanje} min)`}
                        className="h-full"
                      />
                    ))}
                    <div style={{ width: `${(novoExterne / totalPrije) * 100}%` }} className="h-full bg-[#e2e2e2] opacity-30" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aktivnosti tablica */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Snimanje aktivnosti</h3>
              <p className="text-xs text-[#9a9a9a]">Unesite sve aktivnosti izmjene, označite tip i predložite poboljšanje</p>
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Aktivnost</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-24">Trajanje (min)</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-28">Tip (sada)</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Prijedlog poboljšanja</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-28">Tip (nakon)</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {aktivnosti.map((a, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#9a9a9a] text-center font-medium">{i + 1}</td>
                      <td className="py-1 px-1">
                        <input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                          placeholder="Naziv aktivnosti..." value={a.naziv} onChange={e => updateAktivnost(i, 'naziv', e.target.value)} />
                      </td>
                      <td className="py-1 px-1">
                        <input type="number" min={0}
                          className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8] text-center"
                          value={a.trajanje || ''} onChange={e => updateAktivnost(i, 'trajanje', parseFloat(e.target.value) || 0)} />
                      </td>
                      <td className="py-1 px-1">
                        <select className={`w-full px-2 py-1.5 border rounded text-xs outline-none font-semibold ${a.tip === 'interna' ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-700'}`}
                          value={a.tip} onChange={e => updateAktivnost(i, 'tip', e.target.value)}>
                          <option value="interna">🔴 Interna</option>
                          <option value="eksterna">🟢 Eksterna</option>
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <input className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                          placeholder="Kako poboljšati / pretvoriti..." value={a.prijedlog} onChange={e => updateAktivnost(i, 'prijedlog', e.target.value)} />
                      </td>
                      <td className="py-1 px-1">
                        <select className={`w-full px-2 py-1.5 border rounded text-xs outline-none font-semibold ${a.novaTip === 'interna' ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-700'}`}
                          value={a.novaTip} onChange={e => updateAktivnost(i, 'novaTip', e.target.value)}>
                          <option value="interna">🔴 Interna</option>
                          <option value="eksterna">🟢 Eksterna</option>
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <button onClick={() => removeAktivnost(i)} className="text-[#9a9a9a] hover:text-red-500 p-1"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {aktivnosti.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[#e2e2e2] bg-[#fafaf8]">
                      <td colSpan={2} className="py-2 px-2 text-xs font-bold text-[#5a5a5a]">Ukupno</td>
                      <td className="py-2 px-2 text-center text-xs font-bold text-[#1a1a1a]">{totalPrije} min</td>
                      <td className="py-2 px-2 text-center text-xs font-semibold">
                        <span className="text-red-600">{totalInterne}min int.</span> / <span className="text-[#1a7a5e]">{totalExterne}min ext.</span>
                      </td>
                      <td></td>
                      <td className="py-2 px-2 text-center text-xs font-bold text-[#1a7a5e]">{novoInterne} min int.</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <button onClick={addAktivnost}
              className="mt-3 flex items-center gap-2 text-xs text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-4 py-2 hover:bg-[#e8f5f0] transition-all">
              <Plus size={14} /> Dodaj aktivnost
            </button>
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-xs font-bold text-blue-700 mb-2">📖 Pojašnjenje tipova aktivnosti</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-blue-800">
            <div>
              <span className="font-bold text-red-600">🔴 Interna aktivnost</span> — može se obaviti <strong>samo dok je stroj zaustavljen</strong>
              <p className="mt-0.5 text-blue-700 opacity-80">Primjer: Skidanje starog kalupa, montaža novog kalupa</p>
            </div>
            <div>
              <span className="font-bold text-green-600">🟢 Eksterna aktivnost</span> — može se obaviti <strong>dok stroj još radi</strong>
              <p className="mt-0.5 text-blue-700 opacity-80">Primjer: Priprema novog kalupa, donošenje alata, dokumentacija</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-700 font-semibold">💡 Cilj SMED-a: Pretvoriti što više internih aktivnosti u eksterne — stroj radi duže!</p>
        </div>

        {/* Akcijski plan */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
            <h3 className="text-sm font-semibold">Akcijski plan</h3>
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

        {/* Napomena */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
          <label className="block text-sm font-semibold mb-2">Napomena / Zaključak</label>
          <textarea className={`${inputCls} resize-none`} rows={3}
            placeholder="Dodatne napomene, zaključci, preporuke..."
            value={napomena} onChange={e => setNapomena(e.target.value)} />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi SMED analizu'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ SMED analiza je uspješno spremljena! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
