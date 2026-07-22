"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const GUBICI = ['Prekomjerna proizvodnja', 'Čekanje', 'Transport', 'Prekomjerna obrada', 'Zalihe (WIP)', 'Nepotrebno kretanje', 'Greške / škart', 'Neiskorišten talent', 'Sigurnost', 'Ostalo'];
const PRIORITETI = [
  { value: 'V', label: '🔴 Visoki' },
  { value: 'S', label: '🟡 Srednji' },
  { value: 'N', label: '🟢 Niski' },
];
const STATUSI = ['📋 Otvoreno', '🔄 U tijeku', '✅ Završeno', '⏸️ Na čekanju'];
const CILJEVI = [
  'Sigurnost (Safety)', 'Kvaliteta (Quality)', 'Produktivnost i tok (Flow)',
  '5S i red na radnom mjestu', 'OEE i učinkovitost strojeva', 'Standardizirani rad',
  'Obuka i razvoj radnika', 'Opći pregled (sve kategorije)',
];

const CHECKLIST_ITEMS = [
  { id: 'sigurnost', text: 'Sigurnost radnika', sub: 'PPE oprema, oznake opasnosti, slobodni izlazi' },
  { id: '5s', text: '5S stanje radnog mjesta', sub: 'Red, čistoća, označenost, sortiranje' },
  { id: 'tok', text: 'Tok materijala i WIP', sub: 'Nedovršena proizvodnja, čekanje, gomilanje' },
  { id: 'standard', text: 'Standardizirani rad', sub: 'Rade li radnici prema standardu?' },
  { id: 'kvaliteta', text: 'Kvaliteta i greške', sub: 'Škart, rework, uzroci grešaka' },
  { id: 'oee', text: 'Učinkovitost strojeva (OEE)', sub: 'Zastoji, podešavanja, sporiji rad' },
  { id: 'vizual', text: 'Vizualni management', sub: 'KPI ploče, andon sustavi, oznake' },
  { id: 'razgovor', text: 'Razgovor s radnicima', sub: '"Što vas sprječava u radu?" — bez krivnje' },
];

const RATING_CATEGORIJE = [
  { id: 'sig', label: 'Sigurnost' },
  { id: '5s', label: '5S i red' },
  { id: 'tok', label: 'Tok i produktivnost' },
  { id: 'kval', label: 'Kvaliteta' },
  { id: 'std', label: 'Standardizirani rad' },
  { id: 'rad', label: 'Angažiranost radnika' },
];

interface ZapazanjeRow { lokacija: string; vrsta: string; opis: string; uzrok: string; prioritet: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

const novoZapazanje = (): ZapazanjeRow => ({ lokacija: '', vrsta: '', opis: '', uzrok: '', prioritet: 'S' });
const novaAkcija = (): AkcijaRow => ({ akcija: '', odgovorna: '', rok: '', status: '📋 Otvoreno' });

export default function GembaWalkPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [datum, setDatum] = useState('');
  const [pocetak, setPocetak] = useState('');
  const [kraj, setKraj] = useState('');
  const [voditelj, setVoditelj] = useState('');
  const [sudionici, setSudionici] = useState('');
  const [lokacija, setLokacija] = useState('');
  const [cilj, setCilj] = useState('');
  const [napomena, setNapomena] = useState('');

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [ocjene, setOcjene] = useState<Record<string, number>>({});

  const [zapazanja, setZapazanja] = useState<ZapazanjeRow[]>([novoZapazanje(), novoZapazanje(), novoZapazanje()]);
  const [akcije, setAkcije] = useState<AkcijaRow[]>([novaAkcija(), novaAkcija()]);

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

  const toggleCheck = (id: string) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const setRating = (cat: string, val: number) => setOcjene(prev => ({ ...prev, [cat]: val }));

  const addZapazanje = () => setZapazanja([...zapazanja, novoZapazanje()]);
  const removeZapazanje = (i: number) => setZapazanja(zapazanja.filter((_, idx) => idx !== i));
  const updateZapazanje = (i: number, field: keyof ZapazanjeRow, value: string) => {
    const updated = [...zapazanja]; updated[i] = { ...updated[i], [field]: value }; setZapazanja(updated);
  };

  const addAkcija = () => setAkcije([...akcije, novaAkcija()]);
  const removeAkcija = (i: number) => setAkcije(akcije.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    const updated = [...akcije]; updated[i] = { ...updated[i], [field]: value }; setAkcije(updated);
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijeli obrazac?')) return;
    setPocetak(''); setKraj(''); setVoditelj(''); setSudionici(''); setLokacija(''); setCilj(''); setNapomena('');
    setChecklist({}); setOcjene({});
    setZapazanja([novoZapazanje(), novoZapazanje(), novoZapazanje()]);
    setAkcije([novaAkcija(), novaAkcija()]);
    setSumPoz(''); setSumProb(''); setSumHitno(''); setSumSljedeci(''); setSumPotpis('');
    setDatum(new Date().toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('gemba_walk').insert({
      user_id: user.id,
      datum, pocetak, kraj, voditelj, sudionici,
      lokacija, cilj, napomena,
      checklist, ocjene,
      zapazanja, akcije,
      sum_poz: sumPoz, sum_prob: sumProb,
      sum_hitno: sumHitno, sum_sljedeci: sumSljedeci || null,
      sum_potpis: sumPotpis,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, M = 14;
    let y = 0;

    doc.setFillColor(14, 95, 70); doc.rect(0, 0, W, 22, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('Leanopedija App', M, 10); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text('Gemba Walk Obrazac', M, 18); doc.setFontSize(9);
    doc.text('app.leanopedija.hr', 240, 10);
    doc.text(new Date().toLocaleDateString('hr-HR'), 240, 17);
    y = 30;

    const flds: [string, string][] = [
      ['Datum:', datum], ['Voditelj:', voditelj || '—'], ['Lokacija:', lokacija || '—'],
      ['Fokus:', cilj || '—'], ['Sudionici:', sudionici || '—'], ['Napomena:', napomena || '—'],
    ];
    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    flds.forEach(([l, v], i) => {
      const x = M + (i % 3) * 88;
      if (i % 3 === 0 && i > 0) y += 8;
      doc.setFont('helvetica', 'bold'); doc.text(l, x, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(v).substring(0, 35), x + 24, y);
    });
    y += 12;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('OCJENA STANJA', M, y); y += 6;
    doc.setFontSize(8);
    RATING_CATEGORIJE.forEach((c, i) => {
      const r = ocjene[c.id] || 0;
      doc.setFont('helvetica', 'normal');
      doc.text(c.label + ': ' + '★'.repeat(r) + '☆'.repeat(5 - r), M + i * 44, y);
    });
    y += 10;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('ZAPAŽANJA I GUBICI', M, y); y += 6;
    const relevantnaZapazanja = zapazanja.filter(z => z.lokacija || z.opis);
    if (relevantnaZapazanja.length > 0) {
      const hdr = ['#', 'Lokacija', 'Vrsta gubitka', 'Opis zapažanja', 'Mogući uzrok', 'Prioritet'];
      const cw = [8, 28, 32, 80, 60, 22]; let x = M;
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, W - M * 2, 6, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      hdr.forEach((h, i) => { doc.text(h, x + 1, y); x += cw[i]; }); y += 4;
      doc.setFont('helvetica', 'normal');
      relevantnaZapazanja.forEach((z, idx) => {
        const prioritetLabel = PRIORITETI.find(p => p.value === z.prioritet)?.label || z.prioritet;
        const vals = [String(idx + 1), z.lokacija, z.vrsta, z.opis, z.uzrok, prioritetLabel];
        x = M; if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, W - M * 2, 6, 'F'); }
        vals.forEach((v, i) => { doc.text(String(v).substring(0, Math.floor(cw[i] * 1.5)), x + 1, y); x += cw[i]; }); y += 6;
        if (y > 185) { doc.addPage(); y = 20; }
      });
    }
    y += 6;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('AKCIJSKI PLAN', M, y); y += 6;
    const relevantneAkcije = akcije.filter(a => a.akcija || a.odgovorna);
    if (relevantneAkcije.length > 0) {
      const hdr = ['#', 'Akcija', 'Odgovorna osoba', 'Rok', 'Status'];
      const cw = [8, 110, 50, 32, 35]; let x = M;
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, W - M * 2, 6, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      hdr.forEach((h, i) => { doc.text(h, x + 1, y); x += cw[i]; }); y += 4;
      doc.setFont('helvetica', 'normal');
      relevantneAkcije.forEach((a, idx) => {
        const vals = [String(idx + 1), a.akcija, a.odgovorna, a.rok, a.status];
        x = M; if (idx % 2 === 0) { doc.setFillColor(250, 250, 248); doc.rect(M, y - 3, W - M * 2, 6, 'F'); }
        vals.forEach((v, i) => { doc.text(String(v).substring(0, Math.floor(cw[i] * 1.5)), x + 1, y); x += cw[i]; }); y += 6;
      });
    }

    if (sumPoz || sumProb || sumHitno) { y += 6; doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('SAŽETAK', M, y); y += 6; doc.setFontSize(8); }
    if (sumPoz) { doc.setFont('helvetica', 'bold'); doc.text('Pozitivno:', M, y); doc.setFont('helvetica', 'normal'); doc.text(sumPoz.substring(0, 150), M + 22, y); y += 6; }
    if (sumProb) { doc.setFont('helvetica', 'bold'); doc.text('Problemi:', M, y); doc.setFont('helvetica', 'normal'); doc.text(sumProb.substring(0, 150), M + 22, y); y += 6; }
    if (sumHitno) { doc.setFont('helvetica', 'bold'); doc.text('Hitno:', M, y); doc.setFont('helvetica', 'normal'); doc.text(sumHitno.substring(0, 150), M + 14, y); y += 6; }
    if (sumPotpis) { y += 4; doc.setFont('helvetica', 'bold'); doc.text('Potpis:', M, y); doc.setFont('helvetica', 'normal'); doc.text(sumPotpis, M + 16, y); }

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 198);
    doc.save('Gemba-Walk-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  return (
    <div className="pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge" style={{ color: '#3b82f6', background: '#eff6ff' }}>🚶 Gemba Walk</div>
          <h1>Gemba Walk obrazac</h1>
          <p>Strukturirani obrazac za Gemba Walk — obilazak mjesta gdje se stvara vrijednost. Dokumentirajte zapažanja, identificirajte gubitke i definirajte akcije za poboljšanje.</p>
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

        {/* Meta podaci */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff' }}>📋</div>
            <div><h3>Podaci o Gemba Walku</h3><p>Osnovne informacije o obilasku</p></div>
          </div>
          <div className="card-body">
            <div className="grid-3" style={{ marginBottom: 12 }}>
              <div className="field"><label>Datum obilaska</label><input type="date" value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div className="field"><label>Početak</label><input type="time" value={pocetak} onChange={e => setPocetak(e.target.value)} /></div>
              <div className="field"><label>Kraj</label><input type="time" value={kraj} onChange={e => setKraj(e.target.value)} /></div>
            </div>
            <div className="grid-3" style={{ marginBottom: 12 }}>
              <div className="field"><label>Voditelj Gemba Walka</label><input type="text" placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
              <div className="field"><label>Sudionici</label><input type="text" placeholder="npr. Voditelj linije, Lean koordinator" value={sudionici} onChange={e => setSudionici(e.target.value)} /></div>
              <div className="field"><label>Odjel / Pogon / Linija</label><input type="text" placeholder="npr. Montažna linija B" value={lokacija} onChange={e => setLokacija(e.target.value)} /></div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Fokus obilaska</label>
                <select value={cilj} onChange={e => setCilj(e.target.value)}>
                  <option value="">— odaberi fokus —</option>
                  {CILJEVI.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Napomena / kontekst</label><input type="text" placeholder="npr. Povećan broj reklamacija u zadnja 2 tjedna" value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f0fdf4' }}>✅</div>
            <div><h3>Na što obratiti pažnju</h3><p>Označite što ste pregledali</p></div>
          </div>
          <div className="card-body">
            <div className="checklist">
              {CHECKLIST_ITEMS.map(item => (
                <label key={item.id} className="check-item">
                  <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggleCheck(item.id)} />
                  <div>
                    <div className="check-item-text">{item.text}</div>
                    <div className="check-item-sub">{item.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Zapažanja */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fffbeb' }}>👁️</div>
            <div><h3>Zapažanja i gubici (Muda)</h3><p>Bilježite sve što ste uočili — probleme, gubitke, prilike za poboljšanje</p></div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="obs-table">
                <thead>
                  <tr>
                    <th style={{ width: 22 }}>#</th>
                    <th style={{ width: '13%' }}>Lokacija</th>
                    <th style={{ width: '18%' }}>Vrsta gubitka</th>
                    <th style={{ width: '30%' }}>Opis zapažanja</th>
                    <th style={{ width: '22%' }}>Mogući uzrok</th>
                    <th style={{ width: '11%' }}>Prioritet</th>
                    <th style={{ width: 22 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {zapazanja.map((z, i) => (
                    <tr key={i}>
                      <td className="row-num">{i + 1}</td>
                      <td><input type="text" placeholder="Linija / zona" value={z.lokacija} onChange={e => updateZapazanje(i, 'lokacija', e.target.value)} /></td>
                      <td>
                        <select value={z.vrsta} onChange={e => updateZapazanje(i, 'vrsta', e.target.value)}>
                          <option value="">— vrsta —</option>
                          {GUBICI.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </td>
                      <td><textarea rows={2} placeholder="Opis zapažanja..." value={z.opis} onChange={e => updateZapazanje(i, 'opis', e.target.value)} /></td>
                      <td><input type="text" placeholder="Mogući uzrok..." value={z.uzrok} onChange={e => updateZapazanje(i, 'uzrok', e.target.value)} /></td>
                      <td>
                        <select value={z.prioritet} onChange={e => updateZapazanje(i, 'prioritet', e.target.value)}>
                          {PRIORITETI.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </td>
                      <td><button className="del-btn" onClick={() => removeZapazanje(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 18px' }}>
              <button className="add-row-btn" onClick={addZapazanje}><Plus size={14} /> Dodaj zapažanje</button>
            </div>
          </div>
        </div>

        {/* Ocjena stanja */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fdf4ff' }}>⭐</div>
            <div><h3>Ocjena zatečenog stanja</h3><p>Subjektivna ocjena po kategorijama (1=loše → 5=izvrsno)</p></div>
          </div>
          <div className="card-body">
            {RATING_CATEGORIJE.map(cat => (
              <div key={cat.id} className="rating-row">
                <span className="rating-label">{cat.label}</span>
                <div className="star-group">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`star-btn ${(ocjene[cat.id] || 0) >= v ? 'active' : ''}`}
                      onClick={() => setRating(cat.id, v)}
                    >★</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Akcijski plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#e8f5f0' }}>🎯</div>
            <div><h3>Akcijski plan</h3><p>Konkretne akcije s odgovornom osobom i rokom</p></div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="obs-table">
                <thead>
                  <tr>
                    <th style={{ width: 22 }}>#</th>
                    <th style={{ width: '38%' }}>Akcija (što točno napraviti)</th>
                    <th style={{ width: '20%' }}>Odgovorna osoba</th>
                    <th style={{ width: '15%' }}>Rok</th>
                    <th style={{ width: '20%' }}>Status</th>
                    <th style={{ width: 22 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {akcije.map((a, i) => (
                    <tr key={i}>
                      <td className="row-num">{i + 1}</td>
                      <td><textarea rows={2} placeholder="Opis akcije..." value={a.akcija} onChange={e => updateAkcija(i, 'akcija', e.target.value)} /></td>
                      <td><input type="text" placeholder="Ime i prezime" value={a.odgovorna} onChange={e => updateAkcija(i, 'odgovorna', e.target.value)} /></td>
                      <td><input type="date" value={a.rok} onChange={e => updateAkcija(i, 'rok', e.target.value)} /></td>
                      <td>
                        <select value={a.status} onChange={e => updateAkcija(i, 'status', e.target.value)}>
                          {STATUSI.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="del-btn" onClick={() => removeAkcija(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 18px' }}>
              <button className="add-row-btn" onClick={addAkcija}><Plus size={14} /> Dodaj akciju</button>
            </div>
          </div>
        </div>

        {/* Sažetak */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#f3e8ff' }}>📝</div>
            <div><h3>Sažetak i zaključci</h3></div>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field"><label>Ključna pozitivna zapažanja</label><textarea rows={3} placeholder="Što funkcionira dobro? Što treba pohvaliti?" value={sumPoz} onChange={e => setSumPoz(e.target.value)} /></div>
              <div className="field"><label>Ključni problemi / gubici</label><textarea rows={3} placeholder="Najveći problemi uočeni tijekom obilaska..." value={sumProb} onChange={e => setSumProb(e.target.value)} /></div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Preporuke za hitnu akciju</label><textarea rows={2} placeholder="Što treba napraviti odmah?" value={sumHitno} onChange={e => setSumHitno(e.target.value)} /></div>
              <div className="field">
                <label>Datum sljedećeg Gemba Walka</label>
                <input type="date" value={sumSljedeci} onChange={e => setSumSljedeci(e.target.value)} />
                <label style={{ marginTop: 10, display: 'block' }}>Potpis voditelja</label>
                <input type="text" placeholder="Ime i prezime" style={{ marginTop: 6 }} value={sumPotpis} onChange={e => setSumPotpis(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

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
