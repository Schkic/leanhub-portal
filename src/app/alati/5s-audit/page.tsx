"use client";

import React, { useState, useEffect } from 'react';
import { Save, Info, Loader2, CheckCircle2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const auditData = [
  {
    id: 's1', title: 'Sortiranje (Seiri) — Ukloni nepotrebno',
    description: 'Identificirati i ukloniti sve nepotrebne predmete s radnog mjesta',
    criteria: [
      { id: 's1_1', text: 'Nepotrebni materijali i alati su uklonjeni', note: 'Nema nepotrebnih predmeta na radnoj površini ili u blizini' },
      { id: 's1_2', text: 'Nepotrebna oprema i strojevi su označeni ili premješteni', note: 'Crvene kartice (red tags) koriste se za označavanje' },
      { id: 's1_3', text: 'Nema viška zaliha ili materijala koji blokiraju prolaz', note: 'Prolazi su slobodni i označeni' },
      { id: 's1_4', text: 'Dokumenti i obrasci — samo aktualni su na radnom mjestu', note: 'Zastarjeli dokumenti su arhivirani ili uništeni' },
      { id: 's1_5', text: 'Osobni predmeti radnika ne ometaju radni proces', note: 'Postoje označena mjesta za osobne stvari' },
    ]
  },
  {
    id: 's2', title: 'Sređivanje (Seiton) — Mjesto za sve, sve na svom mjestu',
    description: 'Organizirati i označiti sve predmete tako da ih je lako pronaći i vratiti',
    criteria: [
      { id: 's2_1', text: 'Svaki alat i predmet ima točno određeno i označeno mjesto', note: 'Vizualne oznake, konture, oznake boja' },
      { id: 's2_2', text: 'Oznake na podu razgraničavaju radna područja, prolaze i zone skladištenja', note: 'Linije su vidljive i neoštećene' },
      { id: 's2_3', text: 'Alati i materijali su dostupni na točci upotrebe (point of use)', note: 'Minimalno pomicanje radnika za dohvat alata' },
      { id: 's2_4', text: 'Vizualni management je implementiran (što, gdje, koliko)', note: 'Oznake razina min/max, naljepi, kanban kartice' },
      { id: 's2_5', text: 'Sve police i ormarići su označeni i uredno složeni', note: 'Sadržaj je vidljiv ili jasno označen izvana' },
    ]
  },
  {
    id: 's3', title: 'Čišćenje (Seiso) — Održavaj čistoću',
    description: 'Redovito čišćenje i inspekcija radnog mjesta i opreme',
    criteria: [
      { id: 's3_1', text: 'Pod, radne površine i oprema su čisti i bez prljavštine', note: 'Nema ulja, prašine, otpadaka na vidljivim mjestima' },
      { id: 's3_2', text: 'Plan čišćenja postoji i provodi se redovito', note: 'Raspored čišćenja je vidljiv i potpisan' },
      { id: 's3_3', text: 'Strojevi i oprema se čiste kao dio rutinskog održavanja', note: 'Čišćenje = inspekcija (TPM princip)' },
      { id: 's3_4', text: 'Izvori prljavštine su identificirani i sanirani ili označeni', note: 'Curi ulje, prašina od brušenja i sl. su pod kontrolom' },
      { id: 's3_5', text: 'Alati za čišćenje su dostupni, označeni i na svom mjestu', note: 'Metla, lopatica, krpe i sl. imaju određeno mjesto' },
    ]
  },
  {
    id: 's4', title: 'Standardizacija (Seiketsu) — Standardiziraj i vizualiziraj',
    description: 'Uspostaviti standarde koji osiguravaju trajno provođenje S1, S2 i S3',
    criteria: [
      { id: 's4_1', text: '5S standardi su dokumentirani i vidljivi na radnom mjestu', note: 'Fotografije "idealnog stanja" su istaknute' },
      { id: 's4_2', text: 'Odgovornosti za 5S aktivnosti su jasno dodijeljene', note: 'Svaki radnik zna što je njegova odgovornost' },
      { id: 's4_3', text: 'Vizualni standardi (boje, oznake) su konzistentni u cijelom pogonu', note: 'Isti sustav boja i oznaka u svim zonama' },
      { id: 's4_4', text: 'Rezultati prethodnih audita su vidljivi i prate se trendovi', note: 'Graf rezultata audita je istaknut' },
      { id: 's4_5', text: 'Novi radnici dobivaju 5S obuku kao dio uvođenja', note: 'Postoji standardizirani onboarding za 5S' },
    ]
  },
  {
    id: 's5', title: 'Samodisciplina (Shitsuke) — Održavaj i poboljšavaj',
    description: 'Kultura kontinuiranog poboljšanja i poštivanja standarda',
    criteria: [
      { id: 's5_1', text: 'Radnici poštuju 5S standarde bez podsjetnika', note: '5S je dio svakodnevne rutine, ne posebne aktivnosti' },
      { id: 's5_2', text: '5S audit se provodi redovito prema rasporedu', note: 'Minimalno jednom mjesečno, rezultati se bilježe' },
      { id: 's5_3', text: 'Prijedlozi poboljšanja od radnika se aktivno prikupljaju', note: 'Postoji sustav za Kaizen prijedloge' },
      { id: 's5_4', text: 'Menadžment aktivno sudjeluje i podržava 5S aktivnosti', note: 'Voditelji su vidljivi i daju primjer' },
      { id: 's5_5', text: 'Postignuća i napredak se slave i komuniciraju timu', note: 'Vizualni prikaz napretka, zahvale, nagrade' },
    ]
  }
];

const t = (s: string) => s
  .replace(/č/g,'c').replace(/Č/g,'C').replace(/ć/g,'c').replace(/Ć/g,'C')
  .replace(/š/g,'s').replace(/Š/g,'S').replace(/ž/g,'z').replace(/Ž/g,'Z')
  .replace(/đ/g,'d').replace(/Đ/g,'D');

export default function Smart5SAudit() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [meta, setMeta] = useState({ firma: '', osoba: '', datum: new Date().toISOString().split('T')[0], lokacija: '', smjena: '', broj: '' });
  const [obs, setObs] = useState({ pozitivno: '', poboljsanje: '', akcije: '', sljedeci: '', potpis: '' });

  useEffect(() => {
    requireAuth(router).then(user => { if (!user) return; setUser(user); });
  }, []);

  const handleRate = (id: string, val: number) => setScores(prev => ({ ...prev, [id]: val }));
  const toggleComment = (id: string) => setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  const calculateSectionScore = (sectionId: string) => auditData.find(s => s.id === sectionId)?.criteria.reduce((acc, c) => acc + (scores[c.id] || 0), 0) || 0;
  const totalScore = auditData.reduce((acc, s) => acc + calculateSectionScore(s.id), 0);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return { bg: '#dcfce7', color: '#16a34a' };
    if (pct >= 60) return { bg: '#fef9c3', color: '#ca8a04' };
    if (pct >= 40) return { bg: '#ffedd5', color: '#ea580c' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  const colors = getScoreColor(totalScore);

  const saveToPortal = async () => {
    if (!user) { router.push('/auth/wall'); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('audits_5s').insert([{
        user_id: user.id, firma: meta.firma, osoba: meta.osoba, datum: meta.datum,
        lokacija: meta.lokacija, smjena: meta.smjena, broj: meta.broj,
        scores, comments, total_score: totalScore, observations: obs
      }]);
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Greška: ' + (err.message || 'Nepoznata greška.'));
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;
    let y = 0;

    const GREEN   = [26, 122, 94] as [number,number,number];
    const GREEN_D = [14, 95, 70]  as [number,number,number];
    const GREEN_L = [232, 245, 240] as [number,number,number];
    const DARK    = [26, 26, 26]  as [number,number,number];
    const GRAY    = [130, 130, 130] as [number,number,number];
    const GRAY_L  = [245, 245, 245] as [number,number,number];
    const WHITE   = [255, 255, 255] as [number,number,number];
    const BORDER  = [220, 220, 220] as [number,number,number];

    const H = 297;
    const checkY = (need: number) => { if (y + need > H - 16) { doc.addPage(); y = 16; return true; } return false; };

    const scoreColor = (pct: number): [number,number,number] => {
      if (pct >= 80) return [22, 163, 74];
      if (pct >= 60) return [202, 138, 4];
      if (pct >= 40) return [234, 88, 12];
      return [220, 38, 38];
    };

    const grade = (s: number) => s >= 90 ? 'A — Izvrsno' : s >= 80 ? 'B — Dobro' : s >= 60 ? 'C — Zadovoljava' : 'D — Poboljsanje potrebno';

    // ── HEADER ──
    doc.setFillColor(...GREEN_D);
    doc.rect(0, 0, W, 22, 'F');
    doc.setFillColor(60, 150, 115);
    doc.roundedRect(M, 5, 12, 12, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('L', M + 4, 13.5);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('Leanopedija App', M + 16, 10);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('app.leanopedija.hr', M + 16, 15);
    doc.setFontSize(8);
    doc.text('5S AUDIT IZVJESTAJ', W - M, 10, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 15, { align: 'right' });
    y = 30;

    // ── NASLOV ──
    doc.setTextColor(...DARK);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('5S Audit Obrazac', M, y);
    y += 8;

    // ── META PODACI ──
    doc.setFillColor(...GRAY_L);
    doc.roundedRect(M, y, W - 2*M, 28, 3, 3, 'F');
    doc.setDrawColor(...BORDER);
    doc.roundedRect(M, y, W - 2*M, 28, 3, 3, 'S');

    const metaItems = [
      ['Firma / Pogon:', meta.firma || '—', 'Lokacija:', meta.lokacija || '—'],
      ['Auditor:', meta.osoba || '—', 'Smjena:', meta.smjena || '—'],
      ['Datum:', meta.datum ? new Date(meta.datum).toLocaleDateString('hr-HR') : '—', 'Broj audita:', meta.broj || '—'],
    ];

    let my = y + 7;
    metaItems.forEach(row => {
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
      doc.text(t(row[0]), M + 4, my);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
      doc.text(t(row[1]), M + 35, my);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
      doc.text(t(row[2]), M + 95, my);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
      doc.text(t(row[3]), M + 122, my);
      my += 7;
    });
    y += 34;

    // ── UKUPNI REZULTAT ──
    const oeeC = scoreColor(totalScore);
    doc.setFillColor(...oeeC);
    doc.roundedRect(M, y, W - 2*M, 18, 3, 3, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text(`${totalScore} / 100`, W/2, y + 9, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(t(grade(totalScore)), W/2, y + 14.5, { align: 'center' });
    y += 24;

    // ── SEKCIJE ──
    const sColors: Record<string, [number,number,number]> = {
      s1: [59, 130, 246], s2: [139, 92, 246], s3: [245, 158, 11],
      s4: [16, 185, 129], s5: [239, 68, 68]
    };

    auditData.forEach(section => {
      const sScore = calculateSectionScore(section.id);
      const sPct = (sScore / 20) * 100;
      const sCol = sColors[section.id];

      checkY(20);

      // Sekcija header
      doc.setFillColor(...sCol);
      doc.roundedRect(M, y, W - 2*M, 10, 2, 2, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(t(section.title), M + 4, y + 6.5);
      doc.text(`${sScore}/20`, W - M - 4, y + 6.5, { align: 'right' });
      y += 12;

      // Progress bar
      const barW = W - 2*M - 8;
      doc.setFillColor(...BORDER);
      doc.roundedRect(M + 4, y, barW, 3, 1, 1, 'F');
      doc.setFillColor(...sCol);
      doc.roundedRect(M + 4, y, barW * (sPct / 100), 3, 1, 1, 'F');
      y += 6;

      // Kriteriji
      section.criteria.forEach((c, ci) => {
        checkY(8);
        if (ci % 2 === 0) {
          doc.setFillColor(...GRAY_L);
          doc.rect(M, y - 1, W - 2*M, 8, 'F');
        }
        const score = scores[c.id] ?? null;
        const scoreC: [number,number,number] = score === null ? GRAY : score >= 3 ? [22, 163, 74] : score >= 2 ? [202, 138, 4] : [220, 38, 38];

        doc.setTextColor(...DARK);
        doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(t(c.text), 120);
        doc.text(lines, M + 4, y + 3);

        // Ocjena kružić
        if (score !== null) {
          doc.setFillColor(...scoreC);
          doc.circle(W - M - 10, y + 3, 4, 'F');
          doc.setTextColor(...WHITE);
          doc.setFontSize(9); doc.setFont('helvetica', 'bold');
          doc.text(String(score), W - M - 10, y + 3.8, { align: 'center' });
        } else {
          doc.setDrawColor(...BORDER);
          doc.circle(W - M - 10, y + 3, 4, 'S');
          doc.setTextColor(...GRAY);
          doc.setFontSize(7); doc.setFont('helvetica', 'normal');
          doc.text('—', W - M - 10, y + 3.8, { align: 'center' });
        }

        // Komentar
        if (comments[c.id]) {
          doc.setTextColor(...GRAY);
          doc.setFontSize(6.5); doc.setFont('helvetica', 'italic');
          doc.text(t('Komentar: ' + comments[c.id]), M + 4, y + 7);
          y += 3;
        }

        doc.setDrawColor(...BORDER);
        doc.line(M, y + 7, W - M, y + 7);
        y += 8;
      });
      y += 4;
    });

    // ── SUMMARY BAR CHART ──
    checkY(50);
    doc.setFillColor(...GREEN_L);
    doc.roundedRect(M, y, W - 2*M, 48, 3, 3, 'F');
    doc.setTextColor(...DARK);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Rezultati po kategorijama', M + 4, y + 7);
    y += 12;

    auditData.forEach(section => {
      const sScore = calculateSectionScore(section.id);
      const sPct = (sScore / 20) * 100;
      const sCol = sColors[section.id];

      doc.setTextColor(...sCol);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text(section.id.toUpperCase(), M + 4, y + 3);

      const barW = W - 2*M - 30;
      doc.setFillColor(...BORDER);
      doc.roundedRect(M + 14, y, barW, 5, 1, 1, 'F');
      doc.setFillColor(...sCol);
      doc.roundedRect(M + 14, y, barW * (sPct / 100), 5, 1, 1, 'F');

      doc.setTextColor(...DARK);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text(`${sScore}/20`, W - M - 4, y + 4, { align: 'right' });
      y += 8;
    });
    y += 4;

    // ── ZAPAŽANJA ──
    if (obs.pozitivno || obs.poboljsanje || obs.akcije) {
      checkY(10);
      doc.setFillColor(...GREEN_D);
      doc.roundedRect(M, y, W - 2*M, 8, 2, 2, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Zapazanja i akcijski plan', M + 4, y + 5.5);
      y += 12;

      const obsItems = [
        { label: 'Pozitivna zapazanja:', val: obs.pozitivno },
        { label: 'Podrucja za poboljsanje:', val: obs.poboljsanje },
        { label: 'Prioritetne akcije:', val: obs.akcije },
      ].filter(o => o.val);

      obsItems.forEach(o => {
        checkY(12);
        doc.setTextColor(...DARK);
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(o.label, M + 4, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(t(o.val), W - 2*M - 8);
        doc.text(lines, M + 4, y + 5);
        y += 5 + lines.length * 4.5 + 4;
      });
    }

    // ── POTPIS ──
    checkY(20);
    doc.setDrawColor(...BORDER);
    doc.line(M, y + 14, M + 60, y + 14);
    doc.setTextColor(...GRAY);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(t('Potpis auditora: ' + (obs.potpis || '')), M, y + 18);
    if (obs.sljedeci) doc.text(t('Sljedeci audit: ' + new Date(obs.sljedeci).toLocaleDateString('hr-HR')), W - M, y + 18, { align: 'right' });

    // ── FOOTER ──
    const pages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(...GREEN_D);
      doc.rect(0, H - 8, W, 8, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(7);
      doc.text('Leanopedija App — app.leanopedija.hr', M, H - 3);
      doc.text(`Stranica ${i} od ${pages}`, W - M, H - 3, { align: 'right' });
    }

    doc.save(`5S-Audit-${meta.firma ? t(meta.firma) + '-' : ''}${meta.datum || new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">📋 Pametni alat</div>
          <h1>5S Audit Obrazac</h1>
          <p>Digitalni sustav za provođenje i spremanje 5S audita. Ispunite obrazac, automatski se računa rezultat, a zatim ga spremite u svoj profil.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-inner">
          <button onClick={() => window.location.reload()} className="btn btn-outline">🔄 Resetiraj</button>
          <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Ispis</button>
          <button className="btn btn-outline" onClick={exportPDF}>
            <FileDown size={16} /> Preuzmi PDF
          </button>
          <button
            className={`btn ${saveSuccess ? 'bg-green-600 text-white' : 'btn-primary'}`}
            onClick={saveToPortal} disabled={isSaving}>
            {isSaving ? <><Loader2 className="animate-spin" size={16} /> Spremanje...</>
              : saveSuccess ? <><CheckCircle2 size={16} /> Spremljeno!</>
              : <><Save size={16} /> Spremi u Portal</>}
          </button>
          <div className="score-display">
            <span className="score-label">Ukupni rezultat:</span>
            <span className="score-pill" style={{ background: colors.bg, color: colors.color }}>{totalScore} / 100</span>
          </div>
        </div>
      </div>

      <div className="form-wrap">


        <div className="meta-section">
          <h3>Podaci o auditu</h3>
          <div className="meta-grid">
            <div className="field"><label>Naziv firme / pogona</label><input type="text" value={meta.firma} onChange={e => setMeta({...meta, firma: e.target.value})} placeholder="npr. OptiCora d.o.o. — Pogon 1" /></div>
            <div className="field"><label>Odgovorna osoba</label><input type="text" value={meta.osoba} onChange={e => setMeta({...meta, osoba: e.target.value})} placeholder="Ime i prezime auditora" /></div>
            <div className="field"><label>Datum audita</label><input type="date" value={meta.datum} onChange={e => setMeta({...meta, datum: e.target.value})} /></div>
            <div className="field"><label>Lokacija / radno mjesto</label><input type="text" value={meta.lokacija} onChange={e => setMeta({...meta, lokacija: e.target.value})} placeholder="npr. Montažna linija A" /></div>
            <div className="field"><label>Smjena</label>
              <select value={meta.smjena} onChange={e => setMeta({...meta, smjena: e.target.value})}>
                <option value="">— odaberi —</option>
                <option>Prva smjena (06-14h)</option>
                <option>Druga smjena (14-22h)</option>
                <option>Treća smjena (22-06h)</option>
                <option>Jednokratni audit</option>
              </select>
            </div>
            <div className="field"><label>Broj audita</label><input type="text" value={meta.broj} onChange={e => setMeta({...meta, broj: e.target.value})} placeholder="npr. 2024-001" /></div>
          </div>
        </div>

        <div className="legend">
          <span style={{fontSize:'11px',fontWeight:500,color:'var(--text-muted)',marginRight:'4px'}}>Ocjena:</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}></span> 0 — Ne postoji</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#f97316'}}></span> 1 — Loše</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#eab308'}}></span> 2 — Zadovoljava</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#22c55e'}}></span> 3 — Dobro</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#16a34a'}}></span> 4 — Izvrsno</span>
        </div>

        {auditData.map(section => (
          <div key={section.id} className="audit-section">
            <div className="audit-section-header">
              <div className={`s-number ${section.id}`}>{section.id.toUpperCase()}</div>
              <div className="section-title-block">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <span className="section-score-badge" style={{background: getScoreColor((calculateSectionScore(section.id)/20)*100).bg, color: getScoreColor((calculateSectionScore(section.id)/20)*100).color}}>
                {calculateSectionScore(section.id)} / 20
              </span>
            </div>
            <table className="criteria-table">
              <thead>
                <tr>
                  <th style={{width:'40%'}}>Kriterij</th>
                  <th style={{width:'30%'}}>Napomena / opis</th>
                  <th style={{width:'30%', textAlign:'center'}}>Ocjena (0–4)</th>
                </tr>
              </thead>
              <tbody>
                {section.criteria.map(c => (
                  <tr key={c.id} className="criteria-row">
                    <td>
                      <div className="criteria-text">{c.text}</div>
                      <div className="criteria-note">{c.note}</div>
                    </td>
                    <td>
                      <button className="comment-btn" onClick={() => toggleComment(c.id)}>
                        {openComments[c.id] ? '− sakrij komentar' : '+ dodaj komentar'}
                      </button>
                      <div className={`inline-comment ${openComments[c.id] ? 'show' : ''}`}>
                        <input type="text" placeholder="Komentar..." value={comments[c.id] || ''} onChange={e => setComments({...comments, [c.id]: e.target.value})} />
                      </div>
                    </td>
                    <td>
                      <div className="rating-group">
                        {[0,1,2,3,4].map(v => (
                          <button key={v} className={`rating-btn ${scores[c.id] === v ? `selected-${v}` : ''}`} onClick={() => handleRate(c.id, v)}>{v}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="summary-section">
          <h3>📊 Rezultati audita</h3>
          <div className="summary-bars">
            {auditData.map(s => {
              const sc = calculateSectionScore(s.id);
              const pct = (sc / 20) * 100;
              const color = s.id === 's1' ? '#3b82f6' : s.id === 's2' ? '#8b5cf6' : s.id === 's3' ? '#f59e0b' : s.id === 's4' ? '#10b981' : '#ef4444';
              return (
                <div key={s.id} className="summary-bar-row">
                  <span className="summary-bar-label" style={{color}}>{s.id.toUpperCase()}</span>
                  <div className="summary-bar-track"><div className="summary-bar-fill" style={{width: `${pct}%`, background: color}}></div></div>
                  <span className="summary-bar-val">{sc}/20</span>
                </div>
              );
            })}
          </div>
          <div className="total-score-display" style={{background: colors.bg}}>
            <div>
              <div style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'4px'}}>Ukupni rezultat</div>
              <div className="big-score" style={{color: colors.color}}>{totalScore} / 100</div>
            </div>
            <div className="score-info">
              <div className="score-grade" style={{color: colors.color}}>
                {totalScore >= 90 ? 'A — Izvrsno ⭐' : totalScore >= 80 ? 'B — Dobro 👍' : totalScore >= 60 ? 'C — Zadovoljavajuće ⚠️' : 'D — Potrebno poboljšanje 🚨'}
              </div>
            </div>
          </div>
        </div>

        <div className="audit-section" style={{padding:'20px'}}>
          <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'14px',paddingBottom:'10px',borderBottom:'1px solid var(--border)'}}>📝 Zapažanja i akcijski plan</h3>
          <div className="obs-grid">
            <div className="obs-field"><label>Pozitivna zapažanja</label><textarea value={obs.pozitivno} onChange={e => setObs({...obs, pozitivno: e.target.value})} placeholder="Npr. Svi prolazi su jasno označeni..."></textarea></div>
            <div className="obs-field"><label>Područja za poboljšanje</label><textarea value={obs.poboljsanje} onChange={e => setObs({...obs, poboljsanje: e.target.value})} placeholder="Npr. Alati se ne vraćaju na mjesto..."></textarea></div>
            <div className="obs-field"><label>Prioritetne akcije</label><textarea value={obs.akcije} onChange={e => setObs({...obs, akcije: e.target.value})} placeholder="Npr. 1. Označiti alate bojom..."></textarea></div>
            <div className="obs-field">
              <label>Datum sljedećeg audita</label>
              <input type="date" value={obs.sljedeci} onChange={e => setObs({...obs, sljedeci: e.target.value})} />
              <label style={{marginTop:'10px'}}>Potpis auditora</label>
              <input type="text" value={obs.potpis} onChange={e => setObs({...obs, potpis: e.target.value})} placeholder="Ime i prezime" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
