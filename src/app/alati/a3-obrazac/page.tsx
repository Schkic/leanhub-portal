"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trash2, Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const STATUSI = ['📋 Otvoreno', '🔄 U tijeku', '✅ Završeno', '⏸️ Na čekanju'];
const PRIORITETI = [
  { value: 'V', label: '🔴 Visoki' },
  { value: 'S', label: '🟡 Srednji' },
  { value: 'N', label: '🟢 Niski' },
];
// Vrijednosti moraju ostati identične starima — /povijest stranica boji značku
// prema točnom tekstu (getCiljColor), pa mijenjamo samo prikaz (emoji), ne i values.
const CILJ_OPCIJE = ['Da — cilj postignut', 'Djelomično', 'Ne — potrebna revizija'];

interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; prioritet: string; }
const novaAkcija = (): AkcijaRow => ({ akcija: '', odgovorna: '', rok: '', status: '📋 Otvoreno', prioritet: 'S' });

export default function A3Page() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  // Zaglavlje
  const [naslov, setNaslov] = useState('');
  const [datumOtvaranja, setDatumOtvaranja] = useState('');
  const [datumCiljni, setDatumCiljni] = useState('');
  const [brojA3, setBrojA3] = useState('');
  const [vlasnik, setVlasnik] = useState('');
  const [odjel, setOdjel] = useState('');
  const [tim, setTim] = useState('');

  // Sekcije
  const [pozadina, setPozadina] = useState('');
  const [sto, setSto] = useState('');
  const [gdje, setGdje] = useState('');
  const [kada, setKada] = useState('');
  const [koliko, setKoliko] = useState('');
  const [vizual, setVizual] = useState('');
  const [simptom, setSimptom] = useState('');
  const [zasto, setZasto] = useState(['', '', '', '', '']);
  const [korijen, setKorijen] = useState('');
  const [ciljno, setCiljno] = useState('');
  const [kpiNaziv, setKpiNaziv] = useState('');
  const [kpiTrenutno, setKpiTrenutno] = useState('');
  const [kpiCiljano, setKpiCiljano] = useState('');
  const [akcije, setAkcije] = useState<AkcijaRow[]>([novaAkcija(), novaAkcija(), novaAkcija()]);
  const [datumProva, setDatumProva] = useState('');
  const [kpiPostignuto, setKpiPostignuto] = useState('');
  const [rezultati, setRezultati] = useState('');
  const [ciljPostignut, setCiljPostignut] = useState('Da — cilj postignut');
  const [standardizacija, setStandardizacija] = useState('');
  const [sirenje, setSirenje] = useState('');
  const [lekcije, setLekcije] = useState('');
  const [datumStand, setDatumStand] = useState('');
  const [potpis, setPotpis] = useState('');
  const [odobrio, setOdobrio] = useState('');
  const [potpisOdobrio, setPotpisOdobrio] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatumOtvaranja(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addAkcija = () => setAkcije([...akcije, novaAkcija()]);
  const removeAkcija = (i: number) => setAkcije(akcije.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    const updated = [...akcije]; updated[i] = { ...updated[i], [field]: value }; setAkcije(updated);
  };
  const updateZasto = (i: number, value: string) => {
    const updated = [...zasto]; updated[i] = value; setZasto(updated);
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijeli obrazac?')) return;
    setNaslov(''); setDatumCiljni(''); setBrojA3(''); setVlasnik(''); setOdjel(''); setTim('');
    setPozadina(''); setSto(''); setGdje(''); setKada(''); setKoliko(''); setVizual('');
    setSimptom(''); setZasto(['', '', '', '', '']); setKorijen('');
    setCiljno(''); setKpiNaziv(''); setKpiTrenutno(''); setKpiCiljano('');
    setAkcije([novaAkcija(), novaAkcija(), novaAkcija()]);
    setDatumProva(''); setKpiPostignuto(''); setRezultati(''); setCiljPostignut('Da — cilj postignut');
    setStandardizacija(''); setSirenje(''); setLekcije(''); setDatumStand('');
    setPotpis(''); setOdobrio(''); setPotpisOdobrio('');
    setDatumOtvaranja(new Date().toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('a3_obrazac').insert({
      user_id: user.id,
      naslov, datum_otvaranja: datumOtvaranja, datum_ciljni: datumCiljni,
      broj_a3: brojA3, vlasnik, odjel, tim,
      pozadina, sto, gdje, kada, koliko, vizual,
      simptom, zasto, korijen, ciljno,
      kpi_naziv: kpiNaziv, kpi_trenutno: kpiTrenutno, kpi_ciljano: kpiCiljano,
      akcije, datum_provjere: datumProva || null,
      kpi_postignuto: kpiPostignuto, rezultati,
      cilj_postignut: ciljPostignut,
      standardizacija, sirenje, lekcije,
      datum_standardizacije: datumStand || null,
      potpis, odobrio, potpis_odobrio: potpisOdobrio,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14, CW = W - M * 2;
    let y = 0;

    const header = () => {
      doc.setFillColor(14, 95, 70); doc.rect(0, 0, W, 20, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Leanopedija App', M, 9);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('A3 Obrazac za rješavanje problema', M, 16);
      doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
      doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
      y = 26;
    };

    const checkPage = (needed = 15) => { if (y + needed > 280) { doc.addPage(); header(); } };

    const sectionTitle = (title: string) => {
      checkPage(12);
      doc.setFillColor(232, 245, 240); doc.rect(M, y - 4, CW, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(26, 122, 94);
      doc.text(title, M + 2, y);
      doc.setTextColor(0, 0, 0); y += 6;
    };

    const fieldRow = (label: string, value: string) => {
      checkPage(12);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
      doc.text(label, M, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(value || '—', CW);
      doc.text(lines, M, y + 5);
      y += 5 + lines.length * 4 + 3;
    };

    const twoFields = (l1: string, v1: string, l2: string, v2: string) => {
      checkPage(16);
      const hw = (CW - 6) / 2;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
      doc.text(l1, M, y); doc.text(l2, M + hw + 6, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      doc.text(String(v1 || '—').substring(0, 40), M, y + 5);
      doc.text(String(v2 || '—').substring(0, 40), M + hw + 6, y + 5);
      y += 12;
    };

    header();

    sectionTitle('1. OSNOVNI PODACI');
    fieldRow('Naziv problema:', naslov);
    twoFields('Vlasnik A3:', vlasnik, 'Odjel / Linija:', odjel);
    twoFields('Datum otvaranja:', datumOtvaranja, 'Ciljni datum:', datumCiljni);
    twoFields('Broj A3:', brojA3, 'Tim:', tim);

    sectionTitle('2. POZADINA I KONTEKST');
    fieldRow('', pozadina);

    sectionTitle('3. TRENUTNO STANJE');
    twoFields('Što:', sto, 'Gdje:', gdje);
    twoFields('Kada:', kada, 'Koliko:', koliko);
    fieldRow('Vizualni prikaz:', vizual);

    sectionTitle('4. ANALIZA UZROKA — 5x ZAŠTO');
    checkPage(10);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
    doc.text('Simptom:', M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
    doc.text(simptom || '—', M + 20, y); y += 7;
    zasto.forEach((val, i) => {
      checkPage(8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(26, 122, 94);
      doc.text(`Zašto ${i + 1}:`, M, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      doc.text(val || '—', M + 18, y); y += 7;
    });
    fieldRow('Korijenski uzrok:', korijen);

    sectionTitle('5. CILJNO STANJE');
    fieldRow('', ciljno);
    if (kpiNaziv) {
      checkPage(8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 100, 100);
      doc.text(`KPI: ${kpiNaziv}`, M, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      doc.text(`Trenutno: ${kpiTrenutno || '—'}   →   Ciljano: ${kpiCiljano || '—'}`, M + 50, y); y += 8;
    }

    sectionTitle('6. PLAN AKCIJA');
    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      checkPage(12);
      const cols = [8, 80, 38, 28, 28, 20];
      const hdrs = ['#', 'Akcija', 'Odgovorna osoba', 'Rok', 'Status', 'Prioritet'];
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, CW, 6, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(80, 80, 80);
      let x = M;
      hdrs.forEach((h, i) => { doc.text(h, x + 1, y); x += cols[i]; }); y += 4;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      relevantneAkcije.forEach((row, idx) => {
        checkPage(8);
        const prioritetLabel = PRIORITETI.find(p => p.value === row.prioritet)?.label || row.prioritet;
        const vals = [String(idx + 1), row.akcija, row.odgovorna, row.rok, row.status, prioritetLabel];
        if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, CW, 7, 'F'); }
        x = M;
        vals.forEach((v, i) => { doc.setFontSize(7); doc.text(String(v).substring(0, Math.floor(cols[i] * 1.8)), x + 1, y); x += cols[i]; });
        y += 7;
      });
      y += 4;
    }

    sectionTitle('7. PROVJERA REZULTATA');
    twoFields('Datum provjere:', datumProva, 'Postignuti KPI:', kpiPostignuto);
    fieldRow('Rezultati:', rezultati);
    fieldRow('Cilj postignut:', ciljPostignut || '—');

    sectionTitle('8. STANDARDIZACIJA');
    twoFields('Što standardiziramo:', standardizacija, 'Gdje širimo:', sirenje);
    fieldRow('Lekcije naučene:', lekcije);
    twoFields('Vlasnik A3 (potpis):', potpis, 'Odobrio:', odobrio);

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 290);

    doc.save('A3-Obrazac-' + (naslov || 'dokument').substring(0, 30).replace(/\s/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge" style={{ color: 'var(--orange)', background: '#fff4ef' }}>📄 A3 Obrazac</div>
          <h1>A3 obrazac za rješavanje problema</h1>
          <p>Strukturirani obrazac za rješavanje problema A3 metodom — od opisa problema do provjere rezultata. Ispunite sve korake i spremite ili preuzmite kao PDF.</p>
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
        <div className="max-w-[1000px] mx-auto px-6 pt-4">
          <span className="text-sm text-[#1a7a5e] font-semibold">✅ Spremljeno!</span>
        </div>
      )}

      <div className="form-wrap" style={{ maxWidth: '1000px' }}>

        {/* 1. Zaglavlje */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff' }}>📋</div>
            <div><h3>Osnovni podaci</h3><p>Tko, što, kada i gdje</p></div>
            <span className="card-step">Korak 1</span>
          </div>
          <div className="card-body">
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Naziv / naslov problema</label>
              <input type="text" placeholder="npr. Povećan broj reklamacija na sklopu X — Linija 3" value={naslov} onChange={e => setNaslov(e.target.value)} />
            </div>
            <div className="grid-3" style={{ marginBottom: 12 }}>
              <div className="field"><label>Datum otvaranja</label><input type="date" value={datumOtvaranja} onChange={e => setDatumOtvaranja(e.target.value)} /></div>
              <div className="field"><label>Ciljni datum rješenja</label><input type="date" value={datumCiljni} onChange={e => setDatumCiljni(e.target.value)} /></div>
              <div className="field"><label>Broj A3 dokumenta</label><input type="text" placeholder="npr. A3-2025-001" value={brojA3} onChange={e => setBrojA3(e.target.value)} /></div>
            </div>
            <div className="grid-3">
              <div className="field"><label>Vlasnik A3 (odgovorna osoba)</label><input type="text" placeholder="Ime i prezime" value={vlasnik} onChange={e => setVlasnik(e.target.value)} /></div>
              <div className="field"><label>Odjel / Pogon / Linija</label><input type="text" placeholder="npr. Montaža, Linija 3" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
              <div className="field"><label>Tim / Sudionici</label><input type="text" placeholder="npr. Kvaliteta, Proizvodnja, Održavanje" value={tim} onChange={e => setTim(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* 2. Pozadina */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fff4ef' }}>🎯</div>
            <div><h3>Pozadina i kontekst problema</h3><p>Zašto je ovaj problem važan?</p></div>
            <span className="card-step">Korak 2</span>
          </div>
          <div className="card-body">
            <div className="info-box">
              <strong>Savjet:</strong> Opišite poslovni kontekst — zašto je ovaj problem važan za firmu, kupca ili proces. Navedite kvantitativne podatke ako ih imate (troškovi, količine, frekvencija).
            </div>
            <div className="field">
              <label>Opis pozadine i važnosti problema</label>
              <textarea rows={4} placeholder="npr. U posljednjih 30 dana zabilježeno je 47 reklamacija kupca zbog neispravnog sklopa X. Troškovi reworka iznose cca. 2.400 € / mj..." value={pozadina} onChange={e => setPozadina(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 3. Trenutno stanje */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fffbeb' }}>📊</div>
            <div><h3>Trenutno stanje (Current State)</h3><p>Što se točno događa? Podaci i mjerenja.</p></div>
            <span className="card-step">Korak 3</span>
          </div>
          <div className="card-body">
            <div className="info-box">
              <strong>Savjet:</strong> Opišite trenutno stanje s konkretnim podacima — brojevi, postotci, frekvencije. Koristite &quot;5W1H&quot;: Što, Gdje, Kada, Tko, Koliko.
            </div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Što se događa? (opis problema)</label><textarea rows={3} placeholder="Konkretno što nije u redu..." value={sto} onChange={e => setSto(e.target.value)} /></div>
              <div className="field"><label>Gdje se pojavljuje? (lokacija, stroj, linija)</label><textarea rows={3} placeholder="Na kojoj liniji, operaciji, stroju..." value={gdje} onChange={e => setGdje(e.target.value)} /></div>
            </div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Kada se pojavljuje? (kada, kako često)</label><textarea rows={3} placeholder="Učestalost, smjena, uvjeti..." value={kada} onChange={e => setKada(e.target.value)} /></div>
              <div className="field"><label>Koliko je velik problem? (KPI, troškovi, količina)</label><textarea rows={3} placeholder="Brojčani prikaz problema — defekti, troškovi, zastoji..." value={koliko} onChange={e => setKoliko(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Vizualni prikaz / napomena (skica, grafikon, tijek procesa)</label>
              <textarea rows={3} placeholder="Opišite ili skicirajte tijek procesa... (za pravi vizual koristite Ispis i ručno dodajte skicu)" value={vizual} onChange={e => setVizual(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 4. Analiza uzroka */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f0fdf4' }}>🔍</div>
            <div><h3>Analiza uzroka (Root Cause Analysis)</h3><p>Zašto se problem pojavljuje? — 5x Zašto</p></div>
            <span className="card-step">Korak 4</span>
          </div>
          <div className="card-body">
            <div className="info-box">
              <strong>Metoda 5x Zašto:</strong> Počnite od simptoma i pitajte &quot;Zašto?&quot; pet puta. Svaki odgovor postaje sljedeće pitanje. Cilj je doći do <strong>korijenskog uzroka</strong> — ne simptoma.
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label>Problem / simptom (polazišna točka)</label>
              <input type="text" placeholder="npr. Sklop X ima povećan postotak reklamacija" value={simptom} onChange={e => setSimptom(e.target.value)} />
            </div>
            <div className="zasto-chain">
              {zasto.map((z, i) => (
                <div key={i} className="zasto-item">
                  {i > 0 && <div className="zasto-arrow">↓</div>}
                  <div className="zasto-num">{i + 1}</div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>{i === 4 ? 'Zašto se to događa? → Korijenski uzrok' : 'Zašto se to događa?'}</label>
                    <input type="text" placeholder={i === 4 ? 'Korijenski uzrok...' : `Zašto ${i + 1}...`} value={z} onChange={e => updateZasto(i, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Zaključak — korijenski uzrok</label>
              <textarea placeholder="Sažetak korijenskog uzroka na temelju 5x Zašto analize..." value={korijen} onChange={e => setKorijen(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 5. Ciljno stanje */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f0fdf4' }}>🎯</div>
            <div><h3>Ciljno stanje (Target State)</h3><p>Gdje želimo biti? Konkretni i mjerljivi ciljevi.</p></div>
            <span className="card-step">Korak 5</span>
          </div>
          <div className="card-body">
            <div className="info-box">
              <strong>SMART ciljevi:</strong> Specifični, Mjerljivi, Ostvarivi, Relevantni, Vremenski ograničeni. Svaki cilj mora imati broj i rok.
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Opis ciljnog stanja</label>
              <textarea rows={4} placeholder="npr. Smanjiti broj reklamacija sklopa X s 47 na maksimalno 5 u 30 dana..." value={ciljno} onChange={e => setCiljno(e.target.value)} />
            </div>
            <div className="grid-3">
              <div className="field"><label>Ciljni KPI (što mjerimo)</label><input type="text" placeholder="npr. Broj reklamacija / mj." value={kpiNaziv} onChange={e => setKpiNaziv(e.target.value)} /></div>
              <div className="field"><label>Trenutna vrijednost</label><input type="text" placeholder="npr. 47" value={kpiTrenutno} onChange={e => setKpiTrenutno(e.target.value)} /></div>
              <div className="field"><label>Ciljana vrijednost</label><input type="text" placeholder="npr. ≤ 5" value={kpiCiljano} onChange={e => setKpiCiljano(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* 6. Akcijski plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#e8f5f0' }}>✅</div>
            <div><h3>Plan akcija (Countermeasures)</h3><p>Što konkretno radimo, tko i do kada?</p></div>
            <span className="card-step">Korak 6</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="action-table">
                <thead>
                  <tr>
                    <th style={{ width: 22 }}>#</th>
                    <th style={{ width: '35%' }}>Akcija (što točno napraviti)</th>
                    <th style={{ width: '18%' }}>Odgovorna osoba</th>
                    <th style={{ width: '13%' }}>Rok</th>
                    <th style={{ width: '16%' }}>Status</th>
                    <th style={{ width: '12%' }}>Prioritet</th>
                    <th style={{ width: 22 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {akcije.map((a, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)' }}>{i + 1}</td>
                      <td><textarea rows={2} placeholder="Opis akcije..." value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} /></td>
                      <td><input type="text" placeholder="Ime i prezime" value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                      <td><input type="date" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                      <td>
                        <select value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
                          {STATUSI.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={a.prioritet} onChange={e => updateAkcija(i, 'prioritet', e.target.value)}>
                          {PRIORITETI.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </td>
                      <td><button className="del-btn" onClick={() => removeAkcija(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 18px' }}>
              <button className="add-row-btn" onClick={addAkcija}>+ Dodaj akciju</button>
            </div>
          </div>
        </div>

        {/* 7. Provjera rezultata */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fffbeb' }}>📈</div>
            <div><h3>Provjera rezultata (Check)</h3><p>Jesu li akcije dale željene rezultate?</p></div>
            <span className="card-step">Korak 7</span>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Datum provjere</label><input type="date" value={datumProva} onChange={e => setDatumProva(e.target.value)} /></div>
              <div className="field"><label>Postignuta vrijednost KPI-a</label><input type="text" placeholder="npr. 3 reklamacije" value={kpiPostignuto} onChange={e => setKpiPostignuto(e.target.value)} /></div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}><label>Rezultati — što smo postigli?</label><textarea rows={4} placeholder="Opišite mjerljive rezultate — usporedite ciljno i postignuto stanje..." value={rezultati} onChange={e => setRezultati(e.target.value)} /></div>
            <div className="field">
              <label>Je li cilj postignut?</label>
              <select value={ciljPostignut} onChange={e => setCiljPostignut(e.target.value)}>
                {CILJ_OPCIJE.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 8. Standardizacija */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f0fdf4' }}>📌</div>
            <div><h3>Standardizacija i širenje (Standardize &amp; Share)</h3><p>Kako osigurati da se problem ne ponovi?</p></div>
            <span className="card-step">Korak 8</span>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Što standardiziramo? (upute, procedure, checklist)</label><textarea placeholder="npr. Ažurirane radne upute za operaciju 7, nova vizualna pomagala..." value={standardizacija} onChange={e => setStandardizacija(e.target.value)} /></div>
              <div className="field"><label>Gdje još možemo primijeniti ovo rješenje?</label><textarea placeholder="npr. Isto rješenje primijeniti na Liniji 4 i 5..." value={sirenje} onChange={e => setSirenje(e.target.value)} /></div>
            </div>
            <div className="grid-3">
              <div className="field"><label>Lekcije naučene (Lessons Learned)</label><textarea placeholder="Što smo naučili iz ovog problema?" value={lekcije} onChange={e => setLekcije(e.target.value)} /></div>
              <div className="field">
                <label>Datum standardizacije</label>
                <input type="date" value={datumStand} onChange={e => setDatumStand(e.target.value)} />
                <label style={{ marginTop: 10, display: 'block' }}>Potpis vlasnika A3</label>
                <input type="text" placeholder="Ime i prezime" style={{ marginTop: 6 }} value={potpis} onChange={e => setPotpis(e.target.value)} />
              </div>
              <div className="field">
                <label>Odobrio / Pregledao</label>
                <input type="text" placeholder="Ime i prezime nadređenog" value={odobrio} onChange={e => setOdobrio(e.target.value)} />
                <label style={{ marginTop: 10, display: 'block' }}>Potpis odobrenja</label>
                <input type="text" placeholder="Ime i prezime" style={{ marginTop: 6 }} value={potpisOdobrio} onChange={e => setPotpisOdobrio(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi A3 obrazac'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ A3 obrazac je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
