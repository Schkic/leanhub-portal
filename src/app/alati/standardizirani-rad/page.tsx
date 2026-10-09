"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import LokacijaOdjelPicker from '@/components/LokacijaOdjelPicker';
import { syncAkcijeToActions } from '@/lib/actions';
import jsPDF from 'jspdf';

interface Operacija { opis: string; rucno: string; strojno: string; hod: string; wip: string; napomena: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const defaultOperacije = (): Operacija[] => [
  { opis: '', rucno: '', strojno: '', hod: '', wip: '', napomena: '' },
  { opis: '', rucno: '', strojno: '', hod: '', wip: '', napomena: '' },
  { opis: '', rucno: '', strojno: '', hod: '', wip: '', napomena: '' },
];

const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];

const n = (v: string) => parseFloat(v.replace(',', '.')) || 0;

export default function StandardiziraniRadPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [proces, setProces] = useState('');
  const [datum, setDatum] = useState('');
  const [operater, setOperater] = useState('');
  const [odjel, setOdjel] = useState('');
  const [lokacijaId, setLokacijaId] = useState('');
  const [odjelId, setOdjelId] = useState('');
  const [taktVrijeme, setTaktVrijeme] = useState('');
  const [operacije, setOperacije] = useState<Operacija[]>(defaultOperacije());
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addOperacija = () => setOperacije(prev => [...prev, { opis: '', rucno: '', strojno: '', hod: '', wip: '', napomena: '' }]);
  const removeOperacija = (i: number) => setOperacije(prev => prev.filter((_, idx) => idx !== i));
  const updateOperacija = (i: number, field: keyof Operacija, value: string) => {
    setOperacije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const addAkcija = () => setAkcije(prev => [...prev, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  // Izračuni
  const relevantneOperacije = operacije.filter(o => o.opis.trim());
  const ukupnoRucno = relevantneOperacije.reduce((s, o) => s + n(o.rucno), 0);
  const ukupnoStrojno = relevantneOperacije.reduce((s, o) => s + n(o.strojno), 0);
  const ukupnoHod = relevantneOperacije.reduce((s, o) => s + n(o.hod), 0);
  const ciklusOperatera = ukupnoRucno + ukupnoHod;
  const takt = n(taktVrijeme) > 0 ? n(taktVrijeme) : null;
  const iskoristenost = takt ? Math.round((ciklusOperatera / takt) * 100) : null;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from('standard_work').insert({
      user_id: user.id,
      proces, datum, operater, odjel,
      location_id: lokacijaId || null, department_id: odjelId || null,
      takt_vrijeme: takt,
      operacije, akcije, napomena,
    }).select('id').single();
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (data) syncAkcijeToActions('standard_work', data.id, akcije, { locationId: lokacijaId, departmentId: odjelId });
    }
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijeli obrazac?')) return;
    setProces(''); setOperater(''); setOdjel(''); setTaktVrijeme('');
    setOperacije(defaultOperacije());
    setAkcije([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
    setNapomena('');
    setDatum(new Date().toISOString().split('T')[0]);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, M = 14, CW = W - M * 2;
    let y = 0;

    doc.setFillColor(14, 95, 70); doc.rect(0, 0, W, 20, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Leanopedija App', M, 9);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Standardizirani rad', M, 16);
    doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
    y = 28;

    const checkPage = (needed = 15) => { if (y + needed > 190) { doc.addPage(); y = 20; } };

    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text('Proces:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(proces || '—', M + 22, y);
    doc.setFont('helvetica', 'bold'); doc.text('Datum:', M + 110, y);
    doc.setFont('helvetica', 'normal'); doc.text(datum || '—', M + 128, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Operater:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(operater || '—', M + 22, y);
    doc.setFont('helvetica', 'bold'); doc.text('Takt vrijeme:', M + 110, y);
    doc.setFont('helvetica', 'normal'); doc.text(takt ? `${takt} s` : '—', M + 140, y);
    y += 10;

    doc.setFillColor(232, 245, 240); doc.roundedRect(M, y, CW, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 122, 94);
    doc.text(`Ciklus operatera: ${ciklusOperatera}s (ručno ${ukupnoRucno}s + hod ${ukupnoHod}s) · Strojno: ${ukupnoStrojno}s` + (iskoristenost !== null ? ` · ${iskoristenost}% takta` : ''), M + 6, y + 9);
    y += 20;

    if (relevantneOperacije.length > 0) {
      checkPage(10 + relevantneOperacije.length * 6);
      const hdr = ['#', 'Opis koraka', 'Ručno (s)', 'Strojno (s)', 'Hod (s)', 'Std. WIP', 'Napomena'];
      const cw = [8, 90, 22, 24, 18, 20, 87]; let x = M;
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, CW, 7, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
      hdr.forEach((h, i) => { doc.text(h, x + 1, y); x += cw[i]; }); y += 5;
      doc.setFont('helvetica', 'normal');
      relevantneOperacije.forEach((o, idx) => {
        checkPage(7);
        const vals = [String(idx + 1), o.opis, o.rucno || '—', o.strojno || '—', o.hod || '—', o.wip || '—', o.napomena || ''];
        x = M; if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, CW, 6, 'F'); }
        vals.forEach((v, i) => { doc.text(String(v).substring(0, Math.floor(cw[i] / 1.7)), x + 1, y); x += cw[i]; }); y += 6;
      });
      y += 6;
    }

    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      checkPage(12);
      doc.setFillColor(26, 122, 94); doc.rect(M, y - 4, CW, 8, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('AKCIJSKI PLAN', M + 2, y + 1); y += 10;
      const hdr = ['Akcija', 'Odgovorna osoba', 'Rok', 'Status']; const cw = [140, 60, 40, 30]; let x = M;
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, CW, 6, 'F');
      doc.setTextColor(0, 0, 0); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      hdr.forEach((h, i) => { doc.text(h, x + 1, y); x += cw[i]; }); y += 4;
      doc.setFont('helvetica', 'normal');
      relevantneAkcije.forEach((a, idx) => {
        checkPage(8);
        const vals = [a.akcija, a.odgovorna, a.rok, a.status];
        x = M; if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, CW, 6, 'F'); }
        vals.forEach((v, i) => { doc.text(String(v).substring(0, Math.floor(cw[i] / 1.8)), x + 1, y); x += cw[i]; }); y += 6;
      });
      y += 6;
    }

    if (napomena) {
      checkPage(15);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(0, 0, 0);
      doc.text('Napomena:', M, y); y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(napomena, CW);
      doc.text(lines, M, y);
    }

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 203);
    doc.save('Standardizirani-rad-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const cellInputCls = "w-full px-2 py-1.5 border border-[#e2e2e2] rounded text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";

  const rezultatBoja = iskoristenost === null ? 'bg-[#fafaf8] text-[#9a9a9a]' : iskoristenost > 100 ? 'bg-red-50 text-red-600' : iskoristenost >= 95 ? 'bg-yellow-50 text-yellow-700' : 'bg-[#e8f5f0] text-[#1a7a5e]';

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-3">📐 Standardizirani rad</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Standardizirani rad (SWCT)</h1>
          <p className="text-sm text-[#5a5a5a]">Tablica kombinacije standardnog rada — raščlanite operacije po koracima, ručnom, strojnom i hodnom vremenu, i usporedite ciklus operatera s takt vremenom.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex gap-3 flex-wrap items-center">
          <button onClick={resetForm} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <RotateCcw size={16} /> Resetiraj
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <Printer size={16} /> Ispis
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <Download size={16} /> Preuzmi PDF
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70 ml-auto">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta + Rezultat */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Opći podaci</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Proces / Linija</label><input type="text" className={inputCls} placeholder="npr. Montaža kućišta" value={proces} onChange={e => setProces(e.target.value)} /></div>
              <div><label className={labelCls}>Datum</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div><label className={labelCls}>Operater</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={operater} onChange={e => setOperater(e.target.value)} /></div>
              <div><label className={labelCls}>Takt vrijeme (s)</label><input type="text" inputMode="decimal" className={inputCls} placeholder="npr. 45" value={taktVrijeme} onChange={e => setTaktVrijeme(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Odjel / Pogon (slobodan tekst)</label><input type="text" className={inputCls} placeholder="npr. Montažna linija B" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
              <LokacijaOdjelPicker
                locationId={lokacijaId}
                departmentId={odjelId}
                onChange={({ locationId, departmentId }) => { setLokacijaId(locationId); setOdjelId(departmentId); }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 flex flex-col justify-between">
            <h3 className="text-sm font-semibold mb-3">Ciklus vs. Takt</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#5a5a5a]">Ciklus operatera</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{ciklusOperatera}s</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-[#5a5a5a]">Strojno (paralelno)</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{ukupnoStrojno}s</span>
              </div>
            </div>
            <div className={`mt-3 text-center py-3 rounded-xl ${rezultatBoja}`}>
              <div className="text-3xl font-bold">{iskoristenost !== null ? `${iskoristenost}%` : '—'}</div>
              <div className="text-xs font-semibold">{iskoristenost === null ? 'unesite takt vrijeme' : iskoristenost > 100 ? 'preko takta — usko grlo' : iskoristenost >= 95 ? 'granično uravnoteženo' : 'iskorištenost takta'}</div>
            </div>
          </div>
        </div>

        {/* Operacije */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
            <h3 className="text-sm font-semibold">Operacije (tablica kombinacije standardnog rada)</h3>
            <p className="text-xs text-[#9a9a9a] mt-0.5">Jedan red = jedan korak procesa. Ručno i hod vrijeme čine ciklus operatera; strojno vrijeme teče paralelno.</p>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Opis koraka</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-20">Ručno (s)</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-20">Strojno (s)</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-20">Hod (s)</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-20">Std. WIP</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Napomena / kritična točka</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {operacije.map((o, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#9a9a9a] text-center">{i + 1}</td>
                      <td className="py-1 px-1"><input className={cellInputCls} placeholder="Opis koraka..." value={o.opis} onChange={e => updateOperacija(i, 'opis', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className={cellInputCls} inputMode="decimal" placeholder="0" value={o.rucno} onChange={e => updateOperacija(i, 'rucno', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className={cellInputCls} inputMode="decimal" placeholder="0" value={o.strojno} onChange={e => updateOperacija(i, 'strojno', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className={cellInputCls} inputMode="decimal" placeholder="0" value={o.hod} onChange={e => updateOperacija(i, 'hod', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className={cellInputCls} inputMode="decimal" placeholder="0" value={o.wip} onChange={e => updateOperacija(i, 'wip', e.target.value)} /></td>
                      <td className="py-1 px-1"><input className={cellInputCls} placeholder="npr. sigurnosna točka" value={o.napomena} onChange={e => updateOperacija(i, 'napomena', e.target.value)} /></td>
                      <td className="py-1 px-1"><button onClick={() => removeOperacija(i)} className="text-[#9a9a9a] hover:text-red-500 p-1"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold text-[#1a1a1a]">
                    <td></td>
                    <td className="py-2 px-2">Ukupno</td>
                    <td className="py-2 px-2">{ukupnoRucno}s</td>
                    <td className="py-2 px-2">{ukupnoStrojno}s</td>
                    <td className="py-2 px-2">{ukupnoHod}s</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button onClick={addOperacija} className="mt-3 flex items-center gap-2 text-xs text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-4 py-2 hover:bg-[#e8f5f0] transition-all">
              <Plus size={14} /> Dodaj operaciju
            </button>
          </div>
        </div>

        {/* Akcijski plan */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
            <h3 className="text-sm font-semibold">Akcijski plan</h3>
            <p className="text-xs text-[#9a9a9a] mt-0.5">Akcije za balansiranje procesa ili rješavanje uskih grla.</p>
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
                      <td className="py-1 px-1"><input className={cellInputCls} placeholder="Ime..." value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                      <td className="py-1 px-1"><input type="date" className={cellInputCls} value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                      <td className="py-1 px-1">
                        <select className={cellInputCls} value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
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
          {saving ? 'Spremam...' : 'Spremi standardizirani rad'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Standardizirani rad je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
