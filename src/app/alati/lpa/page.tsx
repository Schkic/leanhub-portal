"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw, ArrowRight } from 'lucide-react';
import LokacijaOdjelPicker from '@/components/LokacijaOdjelPicker';
import { syncAkcijeToActions } from '@/lib/actions';
import jsPDF from 'jspdf';

type PitanjeStatus = '' | 'da' | 'ne' | 'na';
interface Pitanje { tekst: string; status: PitanjeStatus; napomena: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const SLOJEVI = ['Operater / Voditelj smjene', 'Voditelj proizvodnje / kvalitete', 'Direktor / Top management'];
const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];

const defaultPitanja = (): Pitanje[] => [
  { tekst: 'Operater radi prema standardiziranom radnom listu', status: '', napomena: '' },
  { tekst: 'Sigurnosna oprema i PPE se ispravno koriste', status: '', napomena: '' },
  { tekst: 'Kontrolna/mjerna oprema je kalibrirana i ispravna', status: '', napomena: '' },
  { tekst: '5S stanje radnog mjesta zadovoljava standard', status: '', napomena: '' },
  { tekst: 'Dokumentacija i vizualni standardi na radnom mjestu su ažurni', status: '', napomena: '' },
];

export default function LPAPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [proces, setProces] = useState('');
  const [sloj, setSloj] = useState('');
  const [auditor, setAuditor] = useState('');
  const [datum, setDatum] = useState('');
  const [lokacijaId, setLokacijaId] = useState('');
  const [odjelId, setOdjelId] = useState('');
  const [pitanja, setPitanja] = useState<Pitanje[]>(defaultPitanja());
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addPitanje = () => setPitanja(prev => [...prev, { tekst: '', status: '', napomena: '' }]);
  const removePitanje = (i: number) => setPitanja(prev => prev.filter((_, idx) => idx !== i));
  const updatePitanje = (i: number, field: keyof Pitanje, value: string) => {
    setPitanja(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const addAkcija = () => setAkcije(prev => [...prev, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const prebaciUAkciju = (p: Pitanje) => {
    setAkcije(prev => {
      const prazna = prev.findIndex(a => !a.akcija.trim());
      const novi = { akcija: `${p.tekst}${p.napomena ? ' — ' + p.napomena : ''}`, odgovorna: '', rok: '', status: 'Otvoreno' };
      if (prazna !== -1) { const u = [...prev]; u[prazna] = novi; return u; }
      return [...prev, novi];
    });
  };

  // Rezultat
  const relevantna = pitanja.filter(p => p.tekst.trim());
  const ocijenjena = relevantna.filter(p => p.status === 'da' || p.status === 'ne');
  const daBroj = relevantna.filter(p => p.status === 'da').length;
  const neBroj = relevantna.filter(p => p.status === 'ne').length;
  const usklađenost = ocijenjena.length > 0 ? Math.round((daBroj / ocijenjena.length) * 100) : null;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from('lpa_audit').insert({
      user_id: user.id,
      proces, sloj, auditor, datum,
      location_id: lokacijaId || null, department_id: odjelId || null,
      pitanja, akcije, napomena,
    }).select('id').single();
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (data) syncAkcijeToActions('lpa_audit', data.id, akcije, { locationId: lokacijaId, departmentId: odjelId });
    }
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijeli audit?')) return;
    setProces(''); setSloj(''); setAuditor('');
    setPitanja(defaultPitanja());
    setAkcije([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
    setNapomena('');
    setDatum(new Date().toISOString().split('T')[0]);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14, CW = W - M * 2;
    let y = 0;

    doc.setFillColor(14, 95, 70); doc.rect(0, 0, W, 20, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Leanopedija App', M, 9);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('LPA — Layered Process Audit', M, 16);
    doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
    y = 28;

    const checkPage = (needed = 15) => { if (y + needed > 280) { doc.addPage(); y = 20; } };

    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text('Proces:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(proces || '—', M + 20, y);
    doc.setFont('helvetica', 'bold'); doc.text('Datum:', M + 90, y);
    doc.setFont('helvetica', 'normal'); doc.text(datum || '—', M + 108, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Sloj:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(sloj || '—', M + 20, y);
    doc.setFont('helvetica', 'bold'); doc.text('Auditor:', M + 90, y);
    doc.setFont('helvetica', 'normal'); doc.text(auditor || '—', M + 108, y);
    y += 10;

    if (usklađenost !== null) {
      doc.setFillColor(232, 245, 240); doc.roundedRect(M, y, CW, 14, 3, 3, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 122, 94);
      doc.text(`Usklađenost: ${usklađenost}% (${daBroj} Da / ${neBroj} Ne)`, M + 6, y + 9);
      y += 20;
    }

    if (relevantna.length > 0) {
      checkPage(10 + relevantna.length * 5);
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, CW, 7, 'F');
      doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('PITANJA', M + 2, y + 1); y += 8;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      relevantna.forEach(p => {
        checkPage(6);
        const mark = p.status === 'da' ? '[DA]' : p.status === 'ne' ? '[NE]' : p.status === 'na' ? '[N/P]' : '[—]';
        doc.text(`${mark} ${p.tekst}${p.napomena ? ' — ' + p.napomena : ''}`, M + 4, y); y += 5;
      });
      y += 3;
    }

    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      checkPage(12);
      doc.setFillColor(26, 122, 94); doc.rect(M, y - 4, CW, 8, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('AKCIJSKI PLAN', M + 2, y + 1); y += 10;
      const hdr = ['Akcija', 'Odgovorna osoba', 'Rok', 'Status']; const cw = [80, 40, 30, 30]; let x = M;
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
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 290);
    doc.save('LPA-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  const statusBtn = (active: boolean) =>
    `w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${active ? 'text-white' : 'bg-white border-[#e2e2e2] text-[#9a9a9a] hover:border-[#c0c0c0]'}`;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full mb-3">🔁 LPA</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">LPA — Layered Process Audit</h1>
          <p className="text-sm text-[#5a5a5a]">Kratki, ponavljajući audit jedne točke procesa na više razina odgovornosti — potvrđuje da se standard stvarno poštuje u praksi.</p>
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
              <div className="col-span-2"><label className={labelCls}>Proces / točka audita</label><input type="text" className={inputCls} placeholder="npr. Postavljanje alata na stroj #3" value={proces} onChange={e => setProces(e.target.value)} /></div>
              <div>
                <label className={labelCls}>Sloj audita</label>
                <select className={inputCls} value={sloj} onChange={e => setSloj(e.target.value)}>
                  <option value="">— odaberi —</option>
                  {SLOJEVI.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Datum</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Auditor</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={auditor} onChange={e => setAuditor(e.target.value)} /></div>
              <LokacijaOdjelPicker
                locationId={lokacijaId}
                departmentId={odjelId}
                onChange={({ locationId, departmentId }) => { setLokacijaId(locationId); setOdjelId(departmentId); }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 flex flex-col justify-between">
            <h3 className="text-sm font-semibold mb-3">Usklađenost</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#1a7a5e]">✅ Da</span>
                <span className="text-sm font-bold text-[#1a7a5e]">{daBroj}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-[#dc2626]">⚠️ Ne</span>
                <span className="text-sm font-bold text-[#dc2626]">{neBroj}</span>
              </div>
            </div>
            <div className={`mt-3 text-center py-3 rounded-xl ${usklađenost === null ? 'bg-[#fafaf8] text-[#9a9a9a]' : usklađenost >= 90 ? 'bg-[#e8f5f0] text-[#1a7a5e]' : usklađenost >= 70 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
              <div className="text-3xl font-bold">{usklađenost !== null ? `${usklađenost}%` : '—'}</div>
              <div className="text-xs font-semibold">usklađenost</div>
            </div>
          </div>
        </div>

        {/* Pitanja */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2 bg-cyan-50" style={{ borderBottom: '2px solid #0e7490' }}>
            <span className="text-lg">🔁</span>
            <h3 className="text-sm font-bold text-cyan-800">Pitanja audita</h3>
          </div>
          <div className="p-3 space-y-2">
            {pitanja.map((p, i) => (
              <div key={i} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm bg-white outline-none focus:border-[#1a7a5e]"
                    placeholder="Pitanje audita..." value={p.tekst}
                    onChange={e => updatePitanje(i, 'tekst', e.target.value)}
                  />
                  <button onClick={() => updatePitanje(i, 'status', 'da')} className={statusBtn(p.status === 'da')} style={p.status === 'da' ? { background: '#1a7a5e', borderColor: '#1a7a5e' } : {}} title="Da">✅</button>
                  <button onClick={() => updatePitanje(i, 'status', 'ne')} className={statusBtn(p.status === 'ne')} style={p.status === 'ne' ? { background: '#dc2626', borderColor: '#dc2626' } : {}} title="Ne">⚠️</button>
                  <button onClick={() => updatePitanje(i, 'status', 'na')} className={statusBtn(p.status === 'na')} style={p.status === 'na' ? { background: '#9a9a9a', borderColor: '#9a9a9a' } : {}} title="Nije primjenjivo">➖</button>
                  <button onClick={() => removePitanje(i)} className="text-[#9a9a9a] hover:text-red-500 p-1 shrink-0"><Trash2 size={14} /></button>
                </div>
                {p.status === 'ne' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      className="flex-1 px-2 py-1.5 border border-red-200 rounded-lg text-xs bg-white outline-none focus:border-red-400"
                      placeholder="Opišite odstupanje..." value={p.napomena}
                      onChange={e => updatePitanje(i, 'napomena', e.target.value)}
                    />
                    <button onClick={() => prebaciUAkciju(p)} className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-2 py-1.5 hover:bg-[#e8f5f0] whitespace-nowrap">
                      <ArrowRight size={11} /> U akcijski plan
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addPitanje} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed border-cyan-700 text-cyan-700 transition-all w-full justify-center">
              <Plus size={12} /> Dodaj pitanje
            </button>
          </div>
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
          {saving ? 'Spremam...' : 'Spremi LPA audit'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ LPA audit je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
