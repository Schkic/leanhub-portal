"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const ULOGE = ['Voditelj tima', 'Operater', 'Inženjer', 'Voditelj smjene', 'Menadžer', 'Lean koordinator', 'Kvaliteta', 'Održavanje', 'Vanjski stručnjak'];
const DOSTUPNOSTI = ['Puno radno vrijeme', 'Pola radnog vremena', 'Po potrebi'];
const STATUSI = [
  { value: 'open', label: 'Otvoreno', cls: 'status-open' },
  { value: 'progress', label: 'U tijeku', cls: 'status-progress' },
  { value: 'done', label: 'Završeno', cls: 'status-done' },
];

const DEFAULT_AGENDA: Record<number, { vrijeme: string; aktivnost: string }[]> = {
  1: [
    { vrijeme: '08:00', aktivnost: 'Kick-off — uvod, ciljevi, upoznavanje tima' },
    { vrijeme: '09:00', aktivnost: 'Gemba Walk — obilazak procesa, mjerenje trenutnog stanja' },
    { vrijeme: '11:00', aktivnost: 'Analiza podataka — 5x Zašto, Ishikawa dijagram' },
    { vrijeme: '13:00', aktivnost: 'Pauza za ručak' },
    { vrijeme: '14:00', aktivnost: 'Brainstorming rješenja — generiranje ideja' },
    { vrijeme: '16:00', aktivnost: 'Odabir rješenja i plan implementacije' },
  ],
  2: [
    { vrijeme: '08:00', aktivnost: 'Implementacija rješenja — Dan 2' },
    { vrijeme: '13:00', aktivnost: 'Pauza za ručak' },
    { vrijeme: '14:00', aktivnost: 'Nastavak implementacije' },
    { vrijeme: '17:00', aktivnost: 'Pregled napretka — dnevni standup' },
  ],
  3: [
    { vrijeme: '08:00', aktivnost: 'Finalizacija implementacije' },
    { vrijeme: '11:00', aktivnost: 'Mjerenje rezultata — usporedba s ciljevima' },
    { vrijeme: '13:00', aktivnost: 'Pauza za ručak' },
    { vrijeme: '14:00', aktivnost: 'Standardizacija i dokumentacija' },
    { vrijeme: '15:30', aktivnost: 'Prezentacija rezultata menadžmentu' },
    { vrijeme: '16:30', aktivnost: 'Retrospektiva i zaključak' },
  ],
};

interface TeamMember { ime: string; odjel: string; uloga: string; dostupnost: string; }
interface KPIRow { naziv: string; trenutno: string; cilj: string; postignuto: string; }
interface AgendaItem { vrijeme: string; aktivnost: string; odgovoran: string; }
interface AgendaDay { dan: number; stavke: AgendaItem[]; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const novaAkcija = (): AkcijaRow => ({ akcija: '', odgovorna: '', rok: '', status: 'open' });

export default function KaizenPlanerPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [naziv, setNaziv] = useState('');
  const [proces, setProces] = useState('');
  const [datumOd, setDatumOd] = useState('');
  const [datumDo, setDatumDo] = useState('');
  const [trajanje, setTrajanje] = useState('3');
  const [voditelj, setVoditelj] = useState('');
  const [sponzor, setSponzor] = useState('');
  const [opis, setOpis] = useState('');

  const [tim, setTim] = useState<TeamMember[]>([]);
  const [kpi, setKpi] = useState<KPIRow[]>([]);
  const [baPrije, setBaPrije] = useState('');
  const [baPoslije, setBaPoslije] = useState('');
  const [agenda, setAgenda] = useState<AgendaDay[]>([]);
  const [akcije, setAkcije] = useState<AkcijaRow[]>([]);
  const [zakljucakGood, setZakljucakGood] = useState('');
  const [zakljucakImprove, setZakljucakImprove] = useState('');
  const [zakljucakGeneral, setZakljucakGeneral] = useState('');

  const initDefaults = () => {
    setTim([{ ime: '', odjel: '', uloga: '', dostupnost: 'Puno radno vrijeme' }]);
    setKpi([{ naziv: '', trenutno: '', cilj: '', postignuto: '' }]);
    setAgenda([{ dan: 1, stavke: DEFAULT_AGENDA[1].map(a => ({ ...a, odgovoran: '' })) }]);
    setAkcije([novaAkcija()]);
  };

  useEffect(() => {
    requireAuth(router).then(u => { if (!u) return; setUser(u); });
    setDatumOd(new Date().toISOString().split('T')[0]);
    initDefaults();
  }, [router]);

  // Tim
  const addTim = () => setTim(prev => [...prev, { ime: '', odjel: '', uloga: '', dostupnost: 'Puno radno vrijeme' }]);
  const removeTim = (i: number) => setTim(prev => prev.filter((_, idx) => idx !== i));
  const updateTim = (i: number, field: keyof TeamMember, value: string) => {
    setTim(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  // KPI
  const addKpi = () => setKpi(prev => [...prev, { naziv: '', trenutno: '', cilj: '', postignuto: '' }]);
  const removeKpi = (i: number) => setKpi(prev => prev.filter((_, idx) => idx !== i));
  const updateKpi = (i: number, field: keyof KPIRow, value: string) => {
    setKpi(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  // Agenda
  const addAgendaDay = () => {
    const dan = agenda.length > 0 ? Math.max(...agenda.map(d => d.dan)) + 1 : 1;
    const defaults = DEFAULT_AGENDA[dan];
    setAgenda(prev => [...prev, { dan, stavke: defaults ? defaults.map(a => ({ ...a, odgovoran: '' })) : [] }]);
  };
  const removeAgendaDay = (dan: number) => setAgenda(prev => prev.filter(d => d.dan !== dan));
  const addAgendaItem = (dan: number) => {
    setAgenda(prev => prev.map(d => d.dan === dan ? { ...d, stavke: [...d.stavke, { vrijeme: '', aktivnost: '', odgovoran: '' }] } : d));
  };
  const removeAgendaItem = (dan: number, idx: number) => {
    setAgenda(prev => prev.map(d => d.dan === dan ? { ...d, stavke: d.stavke.filter((_, i) => i !== idx) } : d));
  };
  const updateAgendaItem = (dan: number, idx: number, field: keyof AgendaItem, value: string) => {
    setAgenda(prev => prev.map(d => d.dan === dan ? {
      ...d, stavke: d.stavke.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    } : d));
  };

  // Akcije
  const addAkcija = () => setAkcije(prev => [...prev, novaAkcija()]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const resetForm = () => {
    if (!confirm('Resetirati sve podatke?')) return;
    setNaziv(''); setProces(''); setVoditelj(''); setSponzor(''); setOpis('');
    setTrajanje('3'); setBaPrije(''); setBaPoslije('');
    setZakljucakGood(''); setZakljucakImprove(''); setZakljucakGeneral('');
    setDatumOd(new Date().toISOString().split('T')[0]); setDatumDo('');
    initDefaults();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('kaizen_planer').insert({
      user_id: user.id,
      naziv, proces, datum_od: datumOd || null, datum_do: datumDo || null,
      trajanje: parseInt(trajanje) || null, voditelj, sponzor, opis,
      tim, kpi, ba_prije: baPrije, ba_poslije: baPoslije,
      agenda, akcije,
      zakljucak_good: zakljucakGood, zakljucak_improve: zakljucakImprove, zakljucak_general: zakljucakGeneral,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210, M = 12;
    let y = 0;

    const drawHeader = () => {
      doc.setFillColor(14, 95, 70); doc.rect(0, 0, W, 20, 'F');
      doc.setFillColor(60, 150, 115); doc.roundedRect(M, 4, 12, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
      doc.text('L', M + 4, 12);
      doc.setFontSize(14); doc.text('Leanopedija App', M + 16, 10);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 225, 210);
      doc.text('Kaizen Event Planer — Izvještaj o radionici', M + 16, 15.5);
      doc.setFontSize(7.5);
      doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 10, { align: 'right' });
      doc.text('app.leanopedija.hr', W - M, 15.5, { align: 'right' });
    };
    const newPage = () => { doc.addPage(); drawHeader(); y = 26; };
    const checkY = (need: number) => { if (y + need > H - 12) newPage(); };
    const sectionBar = (title: string) => {
      checkY(13);
      doc.setFillColor(26, 122, 94); doc.roundedRect(M, y, W - M * 2, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(255, 255, 255);
      doc.text(title, M + 4, y + 5.5);
      y += 12;
    };

    drawHeader(); y = 26;

    doc.setFillColor(232, 245, 240); doc.roundedRect(M, y, W - M * 2, 16, 2, 2, 'F');
    doc.setDrawColor(26, 122, 94); doc.setLineWidth(0.4);
    doc.roundedRect(M, y, W - M * 2, 16, 2, 2, 'S');
    const metaCol = (W - M * 2) / 4;
    ([['NAZIV KAIZEN EVENTA', naziv || '—'], ['PROCES / PODRUČJE', proces || '—'], ['VODITELJ', voditelj || '—'], ['SPONZOR', sponzor || '—']] as [string, string][]).forEach(([lbl, v], i) => {
      const x = M + 4 + i * metaCol;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(130, 130, 130);
      doc.text(lbl, x, y + 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(26, 26, 26);
      doc.text(doc.splitTextToSize(v, metaCol - 6), x, y + 10);
    });
    y += 13;
    doc.setDrawColor(225, 225, 225); doc.setLineWidth(0.2);
    doc.line(M, y, W - M, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(130, 130, 130);
    doc.text('PERIOD:', M, y);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 26, 26);
    doc.text(`${datumOd || '—'}  —  ${datumDo || '—'}   (${trajanje || '—'} dana)`, M + 16, y);
    y += 9;

    if (opis) {
      checkY(14);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(130, 130, 130);
      doc.text('OPIS PROBLEMA / RAZLOG POKRETANJA', M, y); y += 4.5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(26, 26, 26);
      const lines = doc.splitTextToSize(opis, W - M * 2);
      doc.text(lines, M, y); y += lines.length * 4.2 + 6;
    }

    const relevantanTim = tim.filter(t => t.ime);
    if (relevantanTim.length > 0) {
      sectionBar('Kaizen tim');
      const cw = [70, 70, 70, (W - M * 2) - 210]; let x = M;
      doc.setFillColor(240, 245, 243); doc.rect(M, y, W - M * 2, 6, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(130, 130, 130);
      ['Ime i prezime', 'Odjel', 'Uloga', 'Angažman'].forEach((h, i) => { doc.text(h, x + 1.5, y + 4); x += cw[i]; });
      y += 6;
      relevantanTim.forEach((t, ri) => {
        checkY(6.5);
        if (ri % 2 === 0) { doc.setFillColor(248, 252, 250); doc.rect(M, y, W - M * 2, 6.5, 'F'); }
        const vals = [t.ime, t.odjel, t.uloga, t.dostupnost];
        x = M; doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(26, 26, 26);
        vals.forEach((v, i) => { doc.text(String(v || '—').substring(0, 32), x + 1.5, y + 4.2); x += cw[i]; }); y += 6.5;
      });
      y += 8;
    }

    const relevantniKpi = kpi.filter(k => k.naziv);
    if (relevantniKpi.length > 0) {
      sectionBar('Ciljevi i KPI mjere');
      const cw = [110, 55, 55, (W - M * 2) - 220]; let x = M;
      doc.setFillColor(240, 245, 243); doc.rect(M, y, W - M * 2, 6, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(130, 130, 130);
      ['KPI / Mjera', 'Trenutno', 'Cilj', 'Postignuto'].forEach((h, i) => { doc.text(h, x + 1.5, y + 4); x += cw[i]; });
      y += 6;
      relevantniKpi.forEach((k, ri) => {
        checkY(6.5);
        if (ri % 2 === 0) { doc.setFillColor(248, 252, 250); doc.rect(M, y, W - M * 2, 6.5, 'F'); }
        const vals = [k.naziv, k.trenutno, k.cilj, k.postignuto];
        x = M; doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(26, 26, 26);
        vals.forEach((v, i) => { doc.text(String(v || '—').substring(0, 45), x + 1.5, y + 4.2); x += cw[i]; }); y += 6.5;
      });
      y += 8;
    }

    if (baPrije || baPoslije) {
      sectionBar('Stanje prije i poslije');
      checkY(10);
      const halfW = (W - M * 2 - 6) / 2;
      [['PRIJE', baPrije, [220, 38, 38]], ['POSLIJE', baPoslije, [26, 122, 94]]].forEach(([lbl, txt, col], i) => {
        const x = M + Number(i) * (halfW + 6);
        const lines = doc.splitTextToSize(String(txt) || '—', halfW - 6);
        const boxH = Math.max(20, lines.length * 4 + 10);
        checkY(boxH);
        doc.setDrawColor(...(col as [number, number, number])); doc.setLineWidth(0.3);
        doc.roundedRect(x, y, halfW, boxH, 2, 2, 'S');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...(col as [number, number, number]));
        doc.text(String(lbl), x + 3, y + 5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(26, 26, 26);
        doc.text(lines, x + 3, y + 10);
      });
      y += 45;
    }

    const relevantnaAgenda = agenda.filter(d => d.stavke.some(s => s.aktivnost));
    if (relevantnaAgenda.length > 0) {
      sectionBar('Agenda Kaizen eventa');
      relevantnaAgenda.forEach(d => {
        checkY(10);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 122, 94);
        doc.text(`Dan ${d.dan}`, M, y); y += 5;
        d.stavke.filter(s => s.aktivnost).forEach(s => {
          checkY(5);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(130, 130, 130);
          doc.text(s.vrijeme || '—', M + 2, y);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(26, 26, 26);
          doc.text(`${s.aktivnost}${s.odgovoran ? '  (' + s.odgovoran + ')' : ''}`, M + 22, y);
          y += 5;
        });
        y += 3;
      });
      y += 4;
    }

    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      sectionBar('Akcijski plan (30-60-90 dana)');
      const cw = [110, 55, 40, (W - M * 2) - 205]; let x = M;
      doc.setFillColor(240, 245, 243); doc.rect(M, y, W - M * 2, 6, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(130, 130, 130);
      ['Akcija', 'Odgovorna osoba', 'Rok', 'Status'].forEach((h, i) => { doc.text(h, x + 1.5, y + 4); x += cw[i]; });
      y += 6;
      relevantneAkcije.forEach((a, ri) => {
        checkY(6.5);
        if (ri % 2 === 0) { doc.setFillColor(248, 252, 250); doc.rect(M, y, W - M * 2, 6.5, 'F'); }
        const statusLabel = STATUSI.find(s => s.value === a.status)?.label || a.status;
        const vals = [a.akcija, a.odgovorna, a.rok, statusLabel];
        x = M; doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(26, 26, 26);
        vals.forEach((v, i) => { doc.text(String(v || '—').substring(0, 55), x + 1.5, y + 4.2); x += cw[i]; }); y += 6.5;
      });
      y += 8;
    }

    if (zakljucakGood || zakljucakImprove || zakljucakGeneral) {
      sectionBar('Zaključci i naučene lekcije');
      if (zakljucakGood) { checkY(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 122, 94); doc.text('Keep:', M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(26, 26, 26); const l = doc.splitTextToSize(zakljucakGood, W - M * 2 - 20); doc.text(l, M + 16, y); y += l.length * 4.2 + 4; }
      if (zakljucakImprove) { checkY(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(202, 138, 4); doc.text('Improve:', M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(26, 26, 26); const l = doc.splitTextToSize(zakljucakImprove, W - M * 2 - 22); doc.text(l, M + 20, y); y += l.length * 4.2 + 4; }
      if (zakljucakGeneral) { checkY(10); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 26, 26); doc.text('Zaključak:', M, y); doc.setFont('helvetica', 'normal'); const l = doc.splitTextToSize(zakljucakGeneral, W - M * 2 - 24); doc.text(l, M + 24, y); y += l.length * 4.2 + 4; }
    }

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, H - 6);
    doc.save('Kaizen-Event-' + (naziv || 'plan').substring(0, 30).replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  return (
    <div className="pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">♾️ Kaizen Event Planer</div>
          <h1>Kaizen Event Planer</h1>
          <p>Planirajte Kaizen radionicu — definirajte tim, agendu, ciljeve i akcijski plan. Dokumentirajte stanje prije i poslije te pratite implementaciju akcija.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-inner">
          <button className="btn btn-outline" onClick={resetForm}><RotateCcw size={14} /> Resetiraj</button>
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

        {/* 1. Opći podaci */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff' }}>📋</div>
            <div><h3>Opći podaci o Kaizen eventu</h3><p>Osnovne informacije o radionici</p></div>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Naziv Kaizen eventa</label><input type="text" placeholder="npr. Kaizen 5S skladišta — Pogon B" value={naziv} onChange={e => setNaziv(e.target.value)} /></div>
              <div className="field"><label>Proces / područje poboljšanja</label><input type="text" placeholder="npr. Skladište sirovine, Montažna linija 3" value={proces} onChange={e => setProces(e.target.value)} /></div>
            </div>
            <div className="grid-3" style={{ marginBottom: 12 }}>
              <div className="field"><label>Datum početka</label><input type="date" value={datumOd} onChange={e => setDatumOd(e.target.value)} /></div>
              <div className="field"><label>Datum završetka</label><input type="date" value={datumDo} onChange={e => setDatumDo(e.target.value)} /></div>
              <div className="field"><label>Trajanje (dana)</label><input type="number" min={1} max={10} value={trajanje} onChange={e => setTrajanje(e.target.value)} /></div>
            </div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Voditelj Kaizen eventa</label><input type="text" placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
              <div className="field"><label>Sponzor / odobrenje menadžmenta</label><input type="text" placeholder="Ime direktora / voditelja pogona" value={sponzor} onChange={e => setSponzor(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Opis problema / razlog pokretanja Kaizena</label>
              <textarea placeholder="Opišite koji problem rješavate, zašto je sada pravi trenutak i koji su simptomi problema..." value={opis} onChange={e => setOpis(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 2. Tim */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fdf4ff' }}>👥</div>
            <div><h3>Kaizen tim</h3><p>Sudionici radionice i njihove uloge</p></div>
          </div>
          <div className="card-body">
            <table className="action-table">
              <thead>
                <tr>
                  <th style={{ width: 180 }}>Ime i prezime</th>
                  <th style={{ width: 160 }}>Odjel / funkcija</th>
                  <th>Uloga u Kaizenu</th>
                  <th style={{ width: 160 }}>Angažman</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {tim.map((t, i) => (
                  <tr key={i}>
                    <td><input type="text" placeholder="Ime Prezime" value={t.ime} onChange={e => updateTim(i, 'ime', e.target.value)} /></td>
                    <td><input type="text" placeholder="Odjel" value={t.odjel} onChange={e => updateTim(i, 'odjel', e.target.value)} /></td>
                    <td>
                      <select value={t.uloga} onChange={e => updateTim(i, 'uloga', e.target.value)}>
                        <option value="">— uloga —</option>
                        {ULOGE.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={t.dostupnost} onChange={e => updateTim(i, 'dostupnost', e.target.value)}>
                        {DOSTUPNOSTI.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </td>
                    <td><button className="del-btn" onClick={() => removeTim(i)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn" onClick={addTim}><Plus size={14} /> Dodaj člana tima</button>
          </div>
        </div>

        {/* 3. Ciljevi i KPI */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f0fdf4' }}>🎯</div>
            <div><h3>Ciljevi i KPI mjere</h3><p>Što želite postići — mjerljivo i vremenski određeno</p></div>
          </div>
          <div className="card-body">
            {kpi.map((k, i) => (
              <div key={i} className="kpi-row">
                <input type="text" placeholder="npr. OEE linije 3, Čekanje materijala (min), Škart (%)" value={k.naziv} onChange={e => updateKpi(i, 'naziv', e.target.value)} />
                <input type="text" placeholder="npr. 58%" value={k.trenutno} onChange={e => updateKpi(i, 'trenutno', e.target.value)} />
                <input type="text" placeholder="npr. 72%" value={k.cilj} onChange={e => updateKpi(i, 'cilj', e.target.value)} />
                <input type="text" placeholder="(popuni po završetku)" value={k.postignuto} onChange={e => updateKpi(i, 'postignuto', e.target.value)} />
                <button className="del-btn" onClick={() => removeKpi(i)}>✕</button>
              </div>
            ))}
            <button className="add-row-btn" onClick={addKpi}><Plus size={14} /> Dodaj KPI</button>
          </div>
        </div>

        {/* 4. Stanje prije/poslije */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fef9c3' }}>📸</div>
            <div><h3>Stanje prije i poslije</h3><p>Dokumentirajte što se promijenilo</p></div>
          </div>
          <div className="card-body">
            <div className="grid-2">
              <div className="ba-card ba-before">
                <div className="ba-header">❌ Stanje PRIJE Kaizena</div>
                <div className="ba-body">
                  <textarea placeholder={"Opišite trenutno stanje — problemi, gubici, neorganiziranost, mjere...\n\nPrimjer:\n- Pretrpano skladište, materijal svugdje\n- 15 min traženje alata po smjeni\n- OEE 58%, veliki škart na spoju A"} value={baPrije} onChange={e => setBaPrije(e.target.value)} />
                </div>
              </div>
              <div className="ba-card ba-after">
                <div className="ba-header">✅ Stanje POSLIJE Kaizena</div>
                <div className="ba-body">
                  <textarea placeholder={"Opišite ciljano stanje — što bi trebalo izgledati po završetku\n\nPrimjer:\n- Jasno označena mjesta za sve materijale\n- Alati dostupni na točci upotrebe (shadow board)\n- OEE cilj 72%"} value={baPoslije} onChange={e => setBaPoslije(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Agenda */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fff7ed' }}>📅</div>
            <div><h3>Agenda Kaizen eventa</h3><p>Raspored aktivnosti po danima</p></div>
          </div>
          <div className="card-body">
            {agenda.map(d => (
              <div key={d.dan} className="agenda-day">
                <div className="agenda-day-header">
                  <span className="agenda-day-title">Dan {d.dan}</span>
                  <button className="del-btn" onClick={() => removeAgendaDay(d.dan)}>✕ Ukloni dan</button>
                </div>
                <div className="agenda-items">
                  {d.stavke.map((s, i) => (
                    <div key={i} className="agenda-item">
                      <input type="time" value={s.vrijeme} onChange={e => updateAgendaItem(d.dan, i, 'vrijeme', e.target.value)} />
                      <input type="text" placeholder="Aktivnost / tema" value={s.aktivnost} onChange={e => updateAgendaItem(d.dan, i, 'aktivnost', e.target.value)} />
                      <input type="text" placeholder="Odgovoran" value={s.odgovoran} onChange={e => updateAgendaItem(d.dan, i, 'odgovoran', e.target.value)} />
                      <button className="del-btn" onClick={() => removeAgendaItem(d.dan, i)}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 8 }}>
                  <button className="add-row-btn" onClick={() => addAgendaItem(d.dan)}>+ Dodaj aktivnost</button>
                </div>
              </div>
            ))}
            <button className="add-row-btn" onClick={addAgendaDay}><Plus size={14} /> Dodaj dan</button>
          </div>
        </div>

        {/* 6. Akcijski plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff' }}>✅</div>
            <div><h3>Akcijski plan (30-60-90 dana)</h3><p>Konkretne akcije s rokovima i odgovornostima</p></div>
          </div>
          <div className="card-body">
            <table className="action-table">
              <thead>
                <tr>
                  <th style={{ width: 22 }}>#</th>
                  <th>Akcija</th>
                  <th style={{ width: 130 }}>Odgovorna osoba</th>
                  <th style={{ width: 110 }}>Rok</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {akcije.map((a, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)' }}>{i + 1}</td>
                    <td><input type="text" placeholder="Opis akcije za implementaciju" value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} /></td>
                    <td><input type="text" placeholder="Ime Prezime" value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                    <td><input type="date" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                    <td>
                      <select value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)} className={`status-badge ${STATUSI.find(s => s.value === a.status)?.cls}`}>
                        {STATUSI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td><button className="del-btn" onClick={() => removeAkcija(i)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn" onClick={addAkcija}><Plus size={14} /> Dodaj akciju</button>
          </div>
        </div>

        {/* 7. Zaključci */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#e8f5f0' }}>💡</div>
            <div><h3>Zaključci i naučene lekcije</h3><p>Što je prošlo dobro, što bi napravili drugačije</p></div>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Što je prošlo dobro (Keep)</label><textarea placeholder="Što bi ponovili na sljedećem Kaizenu..." value={zakljucakGood} onChange={e => setZakljucakGood(e.target.value)} /></div>
              <div className="field"><label>Što bi napravili drugačije (Improve)</label><textarea placeholder="Što bi promijenili ili poboljšali..." value={zakljucakImprove} onChange={e => setZakljucakImprove(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Generalni zaključak i preporuke za sljedeće korake</label>
              <textarea placeholder="Ukupna ocjena Kaizen eventa, preporuke za nastavak..." value={zakljucakGeneral} onChange={e => setZakljucakGeneral(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi Kaizen event'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Kaizen event plan je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
