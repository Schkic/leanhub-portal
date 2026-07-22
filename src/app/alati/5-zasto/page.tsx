"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const KATEGORIJE = [
  'Kvaliteta — škart / rework',
  'Kvaliteta — reklamacija kupca',
  'Sigurnost — incident / near-miss',
  'Zastoj stroja / opreme',
  'Kašnjenje isporuke',
  'Povećani troškovi',
  'Procesni problem',
  'Ostalo',
];
const STATUSI = ['📋 Otvoreno', '🔄 U tijeku', '✅ Završeno', '⏸️ Na čekanju'];
const WHY_LABELS = ['Zašto? (1. razina)', 'Zašto? (2. razina)', 'Zašto? (3. razina)', 'Zašto? (4. razina)', 'Zašto? — Korijenski uzrok (5. razina)'];
const WHY_HINTS = [
  'Koji je neposredni uzrok problema?',
  'Zašto se taj uzrok pojavio?',
  'Zašto je do toga došlo?',
  'Što je uzrokovalo prethodni uzrok?',
  'Ovo je korijenski uzrok — što treba trajno eliminirati?',
];
const WHY_COLORS = ['#e8612a', '#d97706', '#ca8a04', '#4d7c0f', '#1a7a5e'];

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
  const [kategorija, setKategorija] = useState('');
  const [analize, setAnalize] = useState<Analiza[]>([novaAnaliza()]);
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: '📋 Otvoreno' }]);
  const [sumUzroci, setSumUzroci] = useState('');
  const [sumOcekivano, setSumOcekivano] = useState('');
  const [sumProva, setSumProva] = useState('');
  const [sumRezultat, setSumRezultat] = useState('');
  const [sumPotpis, setSumPotpis] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
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

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;
    let y = 0;

    doc.setFillColor(14, 95, 70);
    doc.rect(0, 0, W, 22, 'F');
    doc.setFillColor(60, 150, 115);
    doc.roundedRect(M, 5, 12, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('L', M + 4, 13.5);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('Leanopedija App', M + 16, 10);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('app.leanopedija.hr', M + 16, 15);
    doc.setFontSize(8);
    doc.text('5X ZAŠTO IZVJEŠTAJ', W - M, 10, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 15, { align: 'right' });
    y = 32;

    doc.setTextColor(26, 26, 26);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('5x Zašto — Analiza korijenskog uzroka', M, y);
    y += 10;

    const mflds: [string, string][] = [
      ['Datum:', datum], ['Voditelj:', voditelj || '—'], ['Odjel:', odjel || '—'],
      ['Kategorija:', kategorija || '—'], ['Broj:', broj || '—'], ['Tim:', tim || '—'],
    ];
    doc.setFontSize(9);
    mflds.forEach(([l, v], i) => {
      const x = M + (i % 2) * 90;
      if (i % 2 === 0 && i > 0) y += 7;
      doc.setFont('helvetica', 'bold'); doc.text(l, x, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(v).substring(0, 40), x + 24, y);
    });
    y += 12;

    const checkY = (need: number) => { if (y + need > 280) { doc.addPage(); y = 20; } };

    analize.forEach((a, idx) => {
      if (!a.problem && !a.korijen && a.zasto.every(z => !z)) return;
      checkY(20);
      doc.setFillColor(232, 97, 42); doc.rect(M, y - 4, W - M * 2, 8, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('ANALIZA #' + (idx + 1), M + 2, y + 1); y += 10;

      doc.setTextColor(0, 0, 0); doc.setFontSize(9);
      if (a.problem) {
        const lines = doc.splitTextToSize(a.problem, W - M * 2 - 22);
        doc.setFillColor(255, 247, 237); doc.rect(M, y - 4, W - M * 2, lines.length * 4 + 5, 'F');
        doc.setFont('helvetica', 'bold'); doc.text('PROBLEM:', M + 2, y);
        doc.setFont('helvetica', 'normal'); doc.text(lines, M + 26, y);
        y += lines.length * 4 + 5;
      }

      a.zasto.forEach((val, i) => {
        if (!val) return;
        checkY(12);
        doc.setFont('helvetica', 'bold'); doc.text(`Zašto ${i + 1}:`, M + 2, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(val, W - M * 2 - 26);
        doc.text(lines, M + 26, y);
        y += lines.length * 4 + 4;
      });

      if (a.korijen) {
        checkY(14);
        const lines = doc.splitTextToSize(a.korijen, W - M * 2 - 40);
        doc.setFillColor(232, 245, 240); doc.rect(M, y - 4, W - M * 2, lines.length * 4 + 5, 'F');
        doc.setFont('helvetica', 'bold'); doc.text('KORIJENSKI UZROK:', M + 2, y);
        doc.setFont('helvetica', 'normal'); doc.text(lines, M + 44, y);
        y += lines.length * 4 + 8;
      }
      checkY(0);
    });

    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      checkY(20);
      doc.setFillColor(26, 122, 94); doc.rect(M, y - 4, W - M * 2, 8, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('KOREKTIVNE AKCIJE', M + 2, y + 1); y += 10;
      const hdr = ['Akcija', 'Odgovorna osoba', 'Rok', 'Status']; const cw = [80, 40, 30, 30]; let x = M;
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, W - M * 2, 6, 'F');
      doc.setTextColor(0, 0, 0); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      hdr.forEach((h, i) => { doc.text(h, x + 1, y); x += cw[i]; }); y += 4;
      doc.setFont('helvetica', 'normal');
      relevantneAkcije.forEach((row, idx) => {
        checkY(6);
        x = M;
        if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, W - M * 2, 6, 'F'); }
        const vals = [row.akcija, row.odgovorna, row.rok, row.status];
        vals.forEach((v, i) => { doc.text(String(v || '').substring(0, cw[i] / 2), x + 1, y); x += cw[i]; });
        y += 6;
      });
      y += 6;
    }

    if (sumUzroci || sumOcekivano) {
      checkY(20);
      doc.setTextColor(0, 0, 0); doc.setFontSize(9);
      if (sumUzroci) {
        doc.setFont('helvetica', 'bold'); doc.text('Sažetak uzroka:', M, y); y += 5;
        doc.setFont('helvetica', 'normal');
        const l = doc.splitTextToSize(sumUzroci, W - M * 2); doc.text(l, M, y); y += l.length * 4 + 4;
      }
      if (sumOcekivano) {
        checkY(14);
        doc.setFont('helvetica', 'bold'); doc.text('Očekivani rezultat:', M, y); y += 5;
        doc.setFont('helvetica', 'normal');
        const l = doc.splitTextToSize(sumOcekivano, W - M * 2); doc.text(l, M, y); y += l.length * 4 + 4;
      }
    }
    if (sumPotpis) {
      checkY(8); y += 2;
      doc.setFont('helvetica', 'bold'); doc.text('Potpis:', M, y);
      doc.setFont('helvetica', 'normal'); doc.text(sumPotpis, M + 16, y);
    }

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 290);
    doc.save('5x-Zasto-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge" style={{ color: 'var(--orange)', background: '#fff7ed' }}>🔍 5x Zašto</div>
          <h1>5x Zašto — analiza uzroka</h1>
          <p>Pronađite korijenski uzrok problema postavljanjem pet uzastopnih pitanja &quot;Zašto?&quot;</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-inner">
          <button className="btn btn-outline" onClick={addAnaliza}><Plus size={14} /> Dodaj analizu</button>
          <button className="btn btn-outline" onClick={() => window.print()}><Printer size={14} /> Ispis</button>
          <button className="btn btn-outline" onClick={exportPDF}><Download size={14} /> Preuzmi PDF</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
        </div>
      </div>
      {saved && (
        <div className="max-w-[900px] mx-auto px-6 pt-4">
          <span className="text-sm text-[#1a7a5e] font-semibold">✅ Spremljeno!</span>
        </div>
      )}

      <div className="form-wrap">

        {/* Meta podaci */}
        <div className="meta-section">
          <h3>Opći podaci</h3>
          <div className="meta-grid">
            <div className="field"><label>Datum analize</label><input type="date" value={datum} onChange={e => setDatum(e.target.value)} /></div>
            <div className="field"><label>Voditelj analize</label><input type="text" placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
            <div className="field"><label>Tim / Sudionici</label><input type="text" placeholder="npr. Voditelj kvalitete, Lean koordinator" value={tim} onChange={e => setTim(e.target.value)} /></div>
            <div className="field"><label>Odjel / Linija / Proces</label><input type="text" placeholder="npr. Montažna linija A" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
            <div className="field"><label>Broj izvještaja / Reference</label><input type="text" placeholder="npr. NC-2024-042" value={broj} onChange={e => setBroj(e.target.value)} /></div>
            <div className="field">
              <label>Kategorija problema</label>
              <select value={kategorija} onChange={e => setKategorija(e.target.value)}>
                <option value="">— odaberi —</option>
                {KATEGORIJE.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Analize */}
        {analize.map((a, ai) => (
          <div key={ai} className="analysis-block">
            <div className="analysis-header">
              <span className="analysis-num">🔍 Analiza #{ai + 1}</span>
              {analize.length > 1 && (
                <button className="del-analysis-btn" onClick={() => removeAnaliza(ai)}>✕ Ukloni</button>
              )}
            </div>
            <div className="analysis-body">
              <div className="problem-box">
                <label>🔴 Problem / Simptom</label>
                <textarea
                  rows={2}
                  placeholder="Što se točno dogodilo? Budite specifični — kada, gdje, koliko često, koliki je utjecaj?"
                  value={a.problem}
                  onChange={e => updateAnaliza(ai, 'problem', e.target.value)}
                />
              </div>

              <div className="why-chain">
                {a.zasto.map((z, wi) => (
                  <div key={wi} className="why-item">
                    <div className="why-number" style={{ background: WHY_COLORS[wi] }}>{wi + 1}</div>
                    <div className="why-label">{WHY_LABELS[wi]}</div>
                    <textarea
                      className="why-input"
                      rows={2}
                      placeholder={WHY_HINTS[wi]}
                      value={z}
                      onChange={e => updateZasto(ai, wi, e.target.value)}
                    />
                    {wi < 4 && <div className="why-arrow">↓</div>}
                  </div>
                ))}
              </div>

              <div className="root-cause-box">
                <label>✅ Korijenski uzrok (zaključak)</label>
                <textarea
                  rows={2}
                  placeholder="Sažmite korijenski uzrok u jednu-dvije rečenice. Ovo je uzrok koji treba eliminirati."
                  value={a.korijen}
                  onChange={e => updateAnaliza(ai, 'korijen', e.target.value)}
                />
              </div>

              <div className="tip-box">
                <strong>💡 Savjet:</strong>
                Kada pronađete korijenski uzrok, zapitajte se: &quot;Da uklonimo ovaj uzrok, hoće li se problem ponoviti?&quot; Ako je odgovor NE — pronašli ste pravi korijenski uzrok.
              </div>
            </div>
          </div>
        ))}

        {/* Akcijski plan */}
        <div className="meta-section">
          <h3>🎯 Korektivne i preventivne akcije</h3>
          <div className="action-header">
            <span>Akcija</span><span>Odgovorna osoba</span><span>Rok</span><span>Status</span><span></span>
          </div>
          {akcije.map((a, i) => (
            <div key={i} className="action-row">
              <input type="text" placeholder="Opis korektivne / preventivne akcije..." value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} />
              <input type="text" placeholder="Ime i prezime" value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} />
              <input type="date" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} />
              <select value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
                {STATUSI.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="del-btn" onClick={() => removeAkcija(i)}>✕</button>
            </div>
          ))}
          <button className="add-action-btn" onClick={addAkcija}><Plus size={14} /> Dodaj akciju</button>
        </div>

        {/* Sažetak */}
        <div className="meta-section">
          <h3>📝 Sažetak i provjera učinkovitosti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="field"><label>Sažetak korijenskih uzroka</label><textarea rows={3} placeholder="Ukratko opišite što ste otkrili kao korijenski uzrok..." value={sumUzroci} onChange={e => setSumUzroci(e.target.value)} /></div>
            <div className="field"><label>Očekivani rezultat nakon provedbe akcija</label><textarea rows={3} placeholder="Što se očekuje poboljšati / koje metrike pratiti?" value={sumOcekivano} onChange={e => setSumOcekivano(e.target.value)} /></div>
            <div className="field"><label>Datum provjere učinkovitosti</label><input type="date" value={sumProva} onChange={e => setSumProva(e.target.value)} /></div>
            <div className="field"><label>Rezultat provjere</label><input type="text" placeholder="Ispuniti nakon provjere..." value={sumRezultat} onChange={e => setSumRezultat(e.target.value)} /></div>
            <div className="field md:col-span-2"><label>Potpis voditelja analize</label><input type="text" placeholder="Ime i prezime" value={sumPotpis} onChange={e => setSumPotpis(e.target.value)} /></div>
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
