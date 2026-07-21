"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface Smjena {
  naziv: string;
  planirano: number;
  zastoji: number;
  idealniTakt: number;
  ukupnoKomada: number;
  dobriKomadi: number;
}

interface Stroj {
  naziv: string;
  smjene: Smjena[];
}

const novaSmjena = (): Smjena => ({
  naziv: '', planirano: 0, zastoji: 0, idealniTakt: 0, ukupnoKomada: 0, dobriKomadi: 0
});

const noviStroj = (): Stroj => ({
  naziv: '', smjene: [novaSmjena()]
});

const calcOEE = (smjena: Smjena) => {
  const { planirano, zastoji, idealniTakt, ukupnoKomada, dobriKomadi } = smjena;
  const operativno = planirano - zastoji;
  if (planirano <= 0 || operativno <= 0 || idealniTakt <= 0) return { A: 0, P: 0, Q: 0, OEE: 0 };
  const A = Math.min((operativno / planirano) * 100, 100);
  const maxKomada = operativno / idealniTakt;
  const P = Math.min(maxKomada > 0 ? (ukupnoKomada / maxKomada) * 100 : 0, 100);
  const Q = Math.min(ukupnoKomada > 0 ? (dobriKomadi / ukupnoKomada) * 100 : 0, 100);
  const OEE = (A / 100) * (P / 100) * (Q / 100) * 100;
  return { A: +A.toFixed(1), P: +P.toFixed(1), Q: +Q.toFixed(1), OEE: +OEE.toFixed(1) };
};

const getOEEColor = (oee: number) => {
  if (oee >= 85) return { bg: 'bg-[#e8f5f0]', text: 'text-[#1a7a5e]', label: 'World Class ⭐' };
  if (oee >= 75) return { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', label: 'Dobro 👍' };
  if (oee >= 60) return { bg: 'bg-[#fef9c3]', text: 'text-[#ca8a04]', label: 'Prosječno ⚠️' };
  if (oee >= 40) return { bg: 'bg-[#ffedd5]', text: 'text-[#ea580c]', label: 'Loše 🔴' };
  return { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]', label: 'Kritično 🚨' };
};

const calcStrojAvg = (stroj: Stroj) => {
  const results = stroj.smjene.map(calcOEE);
  const valid = results.filter(r => r.OEE > 0);
  if (valid.length === 0) return { A: 0, P: 0, Q: 0, OEE: 0 };
  const avg = (arr: number[]) => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  return {
    A: avg(valid.map(r => r.A)),
    P: avg(valid.map(r => r.P)),
    Q: avg(valid.map(r => r.Q)),
    OEE: avg(valid.map(r => r.OEE)),
  };
};

export default function OEEPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [pogon, setPogon] = useState('');
  const [period, setPeriod] = useState('');
  const [odgovornaOsoba, setOdgovornaOsoba] = useState('');
  const [strojevi, setStrojevi] = useState<Stroj[]>([noviStroj()]);

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
  }, [router]);

  const addStroj = () => setStrojevi([...strojevi, noviStroj()]);
  const removeStroj = (i: number) => setStrojevi(strojevi.filter((_, idx) => idx !== i));

  const updateStroj = (si: number, naziv: string) => {
    const updated = [...strojevi];
    updated[si] = { ...updated[si], naziv };
    setStrojevi(updated);
  };

  const addSmjena = (si: number) => {
    const updated = [...strojevi];
    updated[si] = { ...updated[si], smjene: [...updated[si].smjene, novaSmjena()] };
    setStrojevi(updated);
  };

  const removeSmjena = (si: number, smi: number) => {
    const updated = [...strojevi];
    updated[si] = { ...updated[si], smjene: updated[si].smjene.filter((_, idx) => idx !== smi) };
    setStrojevi(updated);
  };

  const updateSmjena = (si: number, smi: number, field: keyof Smjena, value: string) => {
    const updated = [...strojevi];
    const smjene = [...updated[si].smjene];
    smjene[smi] = { ...smjene[smi], [field]: field === 'naziv' ? value : parseFloat(value) || 0 };
    updated[si] = { ...updated[si], smjene };
    setStrojevi(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('oee_kalkulator').insert({
      user_id: user.id,
      pogon, period, odgovorna_osoba: odgovornaOsoba,
      strojevi,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const cellInputCls = "w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";

  // Ukupni prosjek
  const sviAvg = strojevi.map(calcStrojAvg);
  const validAvg = sviAvg.filter(r => r.OEE > 0);
  const ukupniOEE = validAvg.length > 0
    ? +(validAvg.reduce((a, b) => a + b.OEE, 0) / validAvg.length).toFixed(1)
    : 0;
  const ukupniColor = getOEEColor(ukupniOEE);

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-3">📊 OEE Kalkulator</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">OEE Kalkulator</h1>
          <p className="text-sm text-[#5a5a5a]">Izračunajte ukupnu učinkovitost opreme za više strojeva i smjena.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex gap-3 flex-wrap">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          <button onClick={addStroj} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <Plus size={16} /> Dodaj stroj
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta + Ukupni OEE */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Opći podaci</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className={labelCls}>Pogon / Linija</label><input type="text" className={inputCls} placeholder="npr. Montažna linija A" value={pogon} onChange={e => setPogon(e.target.value)} /></div>
              <div><label className={labelCls}>Period mjerenja</label><input type="text" className={inputCls} placeholder="npr. Svibanj 2026." value={period} onChange={e => setPeriod(e.target.value)} /></div>
              <div><label className={labelCls}>Odgovorna osoba</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={odgovornaOsoba} onChange={e => setOdgovornaOsoba(e.target.value)} /></div>
            </div>
          </div>

          {/* Ukupni OEE gauge */}
          <div className={`${ukupniColor.bg} border border-[#e2e2e2] rounded-xl p-4 flex flex-col items-center justify-center`}>
            <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-2">Ukupni OEE</p>
            <div className={`text-5xl font-bold ${ukupniColor.text} mb-1`}>
              {ukupniOEE > 0 ? `${ukupniOEE}%` : '—'}
            </div>
            <div className={`text-sm font-semibold ${ukupniColor.text}`}>{ukupniOEE > 0 ? ukupniColor.label : 'Unesite podatke'}</div>
          </div>
        </div>

        {/* Strojevi */}
        {strojevi.map((stroj, si) => {
          const avg = calcStrojAvg(stroj);
          const color = getOEEColor(avg.OEE);
          return (
            <div key={si} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
              <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">{si + 1}</div>
                  <input
                    type="text"
                    className="text-sm font-semibold bg-transparent border-none outline-none text-[#1a7a5e] placeholder-[#5a9e85] w-48"
                    placeholder="Naziv stroja / linije"
                    value={stroj.naziv}
                    onChange={e => updateStroj(si, e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  {avg.OEE > 0 && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                      OEE: {avg.OEE}% — {color.label}
                    </span>
                  )}
                  {strojevi.length > 1 && (
                    <button onClick={() => removeStroj(si)} className="text-[#9a9a9a] hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>

              <div className="p-4">
                {/* Smjene tablica */}
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#e2e2e2]">
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Smjena</th>
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Plan. vr. (min)</th>
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Zastoji (min)</th>
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Id. takt (min/kom)</th>
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Ukupno kom.</th>
                        <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Dobri kom.</th>
                        <th className="text-center py-2 px-2 text-blue-600 font-medium">A%</th>
                        <th className="text-center py-2 px-2 text-purple-600 font-medium">P%</th>
                        <th className="text-center py-2 px-2 text-green-600 font-medium">Q%</th>
                        <th className="text-center py-2 px-2 text-[#1a7a5e] font-bold">OEE%</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stroj.smjene.map((smjena, smi) => {
                        const r = calcOEE(smjena);
                        const c = getOEEColor(r.OEE);
                        return (
                          <tr key={smi} className="border-b border-[#f0f0f0]">
                            <td className="py-1 px-1"><input className={cellInputCls} style={{width: 80}} placeholder={`Smjena ${smi + 1}`} value={smjena.naziv} onChange={e => updateSmjena(si, smi, 'naziv', e.target.value)} /></td>
                            <td className="py-1 px-1"><input type="number" className={cellInputCls} placeholder="480" value={smjena.planirano || ''} onChange={e => updateSmjena(si, smi, 'planirano', e.target.value)} /></td>
                            <td className="py-1 px-1"><input type="number" className={cellInputCls} placeholder="0" value={smjena.zastoji || ''} onChange={e => updateSmjena(si, smi, 'zastoji', e.target.value)} /></td>
                            <td className="py-1 px-1"><input type="number" className={cellInputCls} placeholder="1.5" step="0.01" value={smjena.idealniTakt || ''} onChange={e => updateSmjena(si, smi, 'idealniTakt', e.target.value)} /></td>
                            <td className="py-1 px-1"><input type="number" className={cellInputCls} placeholder="0" value={smjena.ukupnoKomada || ''} onChange={e => updateSmjena(si, smi, 'ukupnoKomada', e.target.value)} /></td>
                            <td className="py-1 px-1"><input type="number" className={cellInputCls} placeholder="0" value={smjena.dobriKomadi || ''} onChange={e => updateSmjena(si, smi, 'dobriKomadi', e.target.value)} /></td>
                            <td className="py-1 px-2 text-center text-xs font-semibold text-blue-600">{r.A > 0 ? `${r.A}%` : '—'}</td>
                            <td className="py-1 px-2 text-center text-xs font-semibold text-purple-600">{r.P > 0 ? `${r.P}%` : '—'}</td>
                            <td className="py-1 px-2 text-center text-xs font-semibold text-green-600">{r.Q > 0 ? `${r.Q}%` : '—'}</td>
                            <td className="py-1 px-2 text-center">
                              {r.OEE > 0 ? (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{r.OEE}%</span>
                              ) : '—'}
                            </td>
                            <td className="py-1 px-1">
                              {stroj.smjene.length > 1 && (
                                <button onClick={() => removeSmjena(si, smi)} className="text-[#9a9a9a] hover:text-red-500 p-1"><Trash2 size={12} /></button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {stroj.smjene.length > 1 && avg.OEE > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-[#e2e2e2] bg-[#fafaf8]">
                          <td colSpan={6} className="py-2 px-2 text-xs font-bold text-[#5a5a5a]">Prosjek stroja</td>
                          <td className="py-2 px-2 text-center text-xs font-bold text-blue-600">{avg.A}%</td>
                          <td className="py-2 px-2 text-center text-xs font-bold text-purple-600">{avg.P}%</td>
                          <td className="py-2 px-2 text-center text-xs font-bold text-green-600">{avg.Q}%</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${color.bg} ${color.text}`}>{avg.OEE}%</span>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <button onClick={() => addSmjena(si)} className="flex items-center gap-2 text-xs text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-3 py-1.5 hover:bg-[#e8f5f0] transition-all">
                  <Plus size={12} /> Dodaj smjenu
                </button>
              </div>

              {/* Komponente bara */}
              {avg.OEE > 0 && (
                <div className="border-t border-[#e2e2e2] px-4 py-3 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Dostupnost (A)', value: avg.A, color: 'bg-blue-500' },
                    { label: 'Performansa (P)', value: avg.P, color: 'bg-purple-500' },
                    { label: 'Kvaliteta (Q)', value: avg.Q, color: 'bg-green-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#5a5a5a]">{label}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                      <div className="h-2 bg-[#e2e2e2] rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Usporedba strojeva */}
        {strojevi.length > 1 && validAvg.length > 1 && (
          <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
            <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
              <h3 className="text-sm font-semibold">Usporedba strojeva</h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-3 text-[#9a9a9a] font-medium">Stroj</th>
                    <th className="text-center py-2 px-3 text-blue-600 font-medium">A%</th>
                    <th className="text-center py-2 px-3 text-purple-600 font-medium">P%</th>
                    <th className="text-center py-2 px-3 text-green-600 font-medium">Q%</th>
                    <th className="text-center py-2 px-3 text-[#1a7a5e] font-bold">OEE%</th>
                    <th className="text-center py-2 px-3 text-[#9a9a9a] font-medium">Ocjena</th>
                  </tr>
                </thead>
                <tbody>
                  {strojevi.map((stroj, si) => {
                    const avg = calcStrojAvg(stroj);
                    const c = getOEEColor(avg.OEE);
                    return (
                      <tr key={si} className="border-b border-[#f0f0f0]">
                        <td className="py-2 px-3 font-semibold">{stroj.naziv || `Stroj ${si + 1}`}</td>
                        <td className="py-2 px-3 text-center text-blue-600 font-semibold">{avg.A > 0 ? `${avg.A}%` : '—'}</td>
                        <td className="py-2 px-3 text-center text-purple-600 font-semibold">{avg.P > 0 ? `${avg.P}%` : '—'}</td>
                        <td className="py-2 px-3 text-center text-green-600 font-semibold">{avg.Q > 0 ? `${avg.Q}%` : '—'}</td>
                        <td className="py-2 px-3 text-center">
                          {avg.OEE > 0 ? <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{avg.OEE}%</span> : '—'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {avg.OEE > 0 ? <span className={`text-xs font-semibold ${c.text}`}>{c.label}</span> : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi OEE izračun'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ OEE izračun je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
