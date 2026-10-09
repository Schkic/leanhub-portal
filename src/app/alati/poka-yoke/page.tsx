"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import LokacijaOdjelPicker from '@/components/LokacijaOdjelPicker';
import { syncAkcijeToActions } from '@/lib/actions';
import jsPDF from 'jspdf';

interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const TIPOVI = ['Prevencija (greška se fizički ne može dogoditi)', 'Detekcija (greška se odmah uoči i zaustavi)'];
const MEHANIZMI = ['Fizički / mehanički', 'Senzor / elektronički', 'Vizualni signal', 'Checklist / proceduralni', 'Softverski'];
const STATUSI_PY = ['Ideja / prijedlog', 'U izradi', 'Testira se', 'Implementirano', 'Potvrđeno djeluje'];
const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  'Ideja / prijedlog': { bg: '#f0f0f0', color: '#5a5a5a' },
  'U izradi': { bg: '#fefce8', color: '#ca8a04' },
  'Testira se': { bg: '#eff6ff', color: '#2563eb' },
  'Implementirano': { bg: '#e8f5f0', color: '#1a7a5e' },
  'Potvrđeno djeluje': { bg: '#e8f5f0', color: '#1a7a5e' },
};

export default function PokaYokePage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [naziv, setNaziv] = useState('');
  const [proces, setProces] = useState('');
  const [tip, setTip] = useState('');
  const [mehanizam, setMehanizam] = useState('');
  const [status, setStatus] = useState('');
  const [greskaSprijecena, setGreskaSprijecena] = useState('');
  const [opis, setOpis] = useState('');
  const [ucinak, setUcinak] = useState('');
  const [datum, setDatum] = useState('');
  const [odgovorna, setOdgovorna] = useState('');
  const [lokacijaId, setLokacijaId] = useState('');
  const [odjelId, setOdjelId] = useState('');
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addAkcija = () => setAkcije(prev => [...prev, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from('poka_yoke').insert({
      user_id: user.id,
      naziv, proces, tip, mehanizam, status,
      greska_sprijecena: greskaSprijecena, opis, ucinak, datum, odgovorna,
      location_id: lokacijaId || null, department_id: odjelId || null,
      akcije, napomena,
    }).select('id').single();
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (data) syncAkcijeToActions('poka_yoke', data.id, akcije, { locationId: lokacijaId, departmentId: odjelId });
    }
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijeli zapis?')) return;
    setNaziv(''); setProces(''); setTip(''); setMehanizam(''); setStatus('');
    setGreskaSprijecena(''); setOpis(''); setUcinak(''); setOdgovorna('');
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
    doc.text('Poka-Yoke registar', M, 16);
    doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
    y = 28;

    const checkPage = (needed = 15) => { if (y + needed > 280) { doc.addPage(); y = 20; } };

    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text('Rješenje:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(naziv || '—', M + 24, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Proces / stroj:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(proces || '—', M + 30, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Tip:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text((tip || '—').substring(0, 60), M + 24, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Mehanizam:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(mehanizam || '—', M + 30, y);
    doc.setFont('helvetica', 'bold'); doc.text('Status:', M + 110, y);
    doc.setFont('helvetica', 'normal'); doc.text(status || '—', M + 128, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Datum:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(datum || '—', M + 24, y);
    doc.setFont('helvetica', 'bold'); doc.text('Odgovorna osoba:', M + 90, y);
    doc.setFont('helvetica', 'normal'); doc.text(odgovorna || '—', M + 128, y);
    y += 10;

    const blocks = [
      ['Greška koja se sprječava', greskaSprijecena],
      ['Opis rješenja', opis],
      ['Učinak / rezultat', ucinak],
    ];
    blocks.forEach(([label, val]) => {
      if (!val) return;
      checkPage(16);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text(String(label) + ':', M, y); y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(String(val), CW);
      doc.text(lines, M, y); y += lines.length * 4.5 + 4;
    });

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
    doc.save('Poka-Yoke-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const statusBoja = status ? STATUS_COLOR[status] : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-pink-700 bg-pink-50 px-3 py-1 rounded-full mb-3">🛡️ Poka-Yoke</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Poka-Yoke registar</h1>
          <p className="text-sm text-[#5a5a5a]">Evidencija rješenja za sprječavanje grešaka — gdje je ugrađeno, koju grešku sprječava, i kakav je učinak.</p>
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
            {saving ? 'Spremam...' : 'Spremi u registar'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-6 space-y-4">

        {/* Meta + Tip/Status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Osnovni podaci</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={labelCls}>Naziv rješenja</label><input type="text" className={inputCls} placeholder="npr. Senzor prisutnosti brtve prije montaže" value={naziv} onChange={e => setNaziv(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Proces / stroj / korak</label><input type="text" className={inputCls} placeholder="npr. Montažna stanica 3 — ugradnja brtve" value={proces} onChange={e => setProces(e.target.value)} /></div>
              <div><label className={labelCls}>Datum uvođenja</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div><label className={labelCls}>Odgovorna osoba</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={odgovorna} onChange={e => setOdgovorna(e.target.value)} /></div>
              <LokacijaOdjelPicker
                locationId={lokacijaId}
                departmentId={odjelId}
                onChange={({ locationId, departmentId }) => { setLokacijaId(locationId); setOdjelId(departmentId); }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Tip i status</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Tip rješenja</label>
                <select className={inputCls} value={tip} onChange={e => setTip(e.target.value)}>
                  <option value="">— odaberi —</option>
                  {TIPOVI.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Mehanizam</label>
                <select className={inputCls} value={mehanizam} onChange={e => setMehanizam(e.target.value)}>
                  <option value="">— odaberi —</option>
                  {MEHANIZMI.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status provedbe</label>
                <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="">— odaberi —</option>
                  {STATUSI_PY.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {statusBoja && (
                <div className="text-center py-2 rounded-xl" style={{ background: statusBoja.bg, color: statusBoja.color }}>
                  <span className="text-xs font-bold">{status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opis */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Opis rješenja</h3>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Koju grešku sprječava</label>
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="npr. Montaža sljedećeg dijela bez prethodno ugrađene brtve" value={greskaSprijecena} onChange={e => setGreskaSprijecena(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Kako rješenje djeluje</label>
              <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Opišite mehanizam — kako fizički ili proceduralno sprječava ili detektira grešku..." value={opis} onChange={e => setOpis(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Učinak / rezultat (ako je mjeren)</label>
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="npr. Reklamacije zbog nedostajuće brtve: 12/mj → 0/mj nakon uvođenja" value={ucinak} onChange={e => setUcinak(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Akcijski plan */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3">
            <h3 className="text-sm font-semibold">Akcijski plan</h3>
            <p className="text-xs text-[#9a9a9a] mt-0.5">Npr. proširenje rješenja na druge linije, nabava opreme, obuka.</p>
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
          <label className="block text-sm font-semibold mb-2">Napomena</label>
          <textarea className={`${inputCls} resize-none`} rows={3}
            placeholder="Dodatne napomene, ideje za daljnju primjenu..."
            value={napomena} onChange={e => setNapomena(e.target.value)} />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi u Poka-Yoke registar'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Rješenje je dodano u registar! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
