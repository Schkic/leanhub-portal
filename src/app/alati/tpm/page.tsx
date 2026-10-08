"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2, Printer, Download, RotateCcw, ArrowRight } from 'lucide-react';
import LokacijaOdjelPicker from '@/components/LokacijaOdjelPicker';
import { syncAkcijeToActions } from '@/lib/actions';
import jsPDF from 'jspdf';

type TockaStatus = '' | 'ok' | 'problem' | 'na';
interface Tocka { tekst: string; status: TockaStatus; napomena: string; }
interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

type KategorijaId = 'ciscenje' | 'inspekcija' | 'podmazivanje' | 'pritezanje' | 'sigurnost';

const KATEGORIJE_DEFAULT: { id: KategorijaId; label: string; emoji: string; color: string; bg: string }[] = [
  { id: 'ciscenje',     label: 'Čišćenje (Clean)',      emoji: '🧹', color: '#2563eb', bg: '#eff6ff' },
  { id: 'inspekcija',   label: 'Inspekcija (Inspect)',  emoji: '🔍', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'podmazivanje', label: 'Podmazivanje (Lubricate)', emoji: '🛢️', color: '#ca8a04', bg: '#fefce8' },
  { id: 'pritezanje',   label: 'Pritezanje (Tighten)',  emoji: '🔧', color: '#1a7a5e', bg: '#e8f5f0' },
  { id: 'sigurnost',    label: 'Sigurnost',             emoji: '⚠️', color: '#dc2626', bg: '#fef2f2' },
];

const defaultStavke = (): Record<KategorijaId, Tocka[]> => ({
  ciscenje: [
    { tekst: 'Stroj očišćen od prašine/ulja', status: '', napomena: '' },
    { tekst: 'Okolno područje čisto i uredno', status: '', napomena: '' },
  ],
  inspekcija: [
    { tekst: 'Vizualna inspekcija curenja (ulje/zrak)', status: '', napomena: '' },
    { tekst: 'Provjera neobičnih zvukova/vibracija', status: '', napomena: '' },
    { tekst: 'Provjera indikatora/mjerača', status: '', napomena: '' },
  ],
  podmazivanje: [
    { tekst: 'Razine ulja/maziva unutar raspona', status: '', napomena: '' },
    { tekst: 'Podmazivanje prema rasporedu obavljeno', status: '', napomena: '' },
  ],
  pritezanje: [
    { tekst: 'Vijci i spojevi pritegnuti', status: '', napomena: '' },
    { tekst: 'Nema vidljive labavosti dijelova', status: '', napomena: '' },
  ],
  sigurnost: [
    { tekst: 'Sigurnosni štitnici na mjestu', status: '', napomena: '' },
    { tekst: 'Zaustavni gumbi (E-stop) funkcionalni', status: '', napomena: '' },
  ],
});

const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno'];

export default function TPMPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [stroj, setStroj] = useState('');
  const [datum, setDatum] = useState('');
  const [smjena, setSmjena] = useState('');
  const [voditelj, setVoditelj] = useState('');
  const [odjel, setOdjel] = useState('');
  const [lokacijaId, setLokacijaId] = useState('');
  const [odjelId, setOdjelId] = useState('');
  const [stavke, setStavke] = useState<Record<KategorijaId, Tocka[]>>(defaultStavke());
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const [napomena, setNapomena] = useState('');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const addTocka = (kat: KategorijaId) => setStavke(prev => ({ ...prev, [kat]: [...prev[kat], { tekst: '', status: '', napomena: '' }] }));
  const removeTocka = (kat: KategorijaId, i: number) => setStavke(prev => ({ ...prev, [kat]: prev[kat].filter((_, idx) => idx !== i) }));
  const updateTocka = (kat: KategorijaId, i: number, field: keyof Tocka, value: string) => {
    setStavke(prev => {
      const list = [...prev[kat]];
      list[i] = { ...list[i], [field]: value };
      return { ...prev, [kat]: list };
    });
  };

  const addAkcija = () => setAkcije(prev => [...prev, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(prev => prev.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    setAkcije(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; });
  };

  const prebaciUAkciju = (kat: KategorijaId, tocka: Tocka) => {
    const katLabel = KATEGORIJE_DEFAULT.find(k => k.id === kat)?.label || kat;
    setAkcije(prev => {
      const prazna = prev.findIndex(a => !a.akcija.trim());
      const novi = { akcija: `${katLabel}: ${tocka.tekst}${tocka.napomena ? ' — ' + tocka.napomena : ''}`, odgovorna: '', rok: '', status: 'Otvoreno' };
      if (prazna !== -1) { const u = [...prev]; u[prazna] = novi; return u; }
      return [...prev, novi];
    });
  };

  // Rezultat
  const sveTocke = Object.values(stavke).flat().filter(t => t.tekst.trim());
  const ocijenjene = sveTocke.filter(t => t.status === 'ok' || t.status === 'problem');
  const okBroj = sveTocke.filter(t => t.status === 'ok').length;
  const problemBroj = sveTocke.filter(t => t.status === 'problem').length;
  const ocjena = ocijenjene.length > 0 ? Math.round((okBroj / ocijenjene.length) * 100) : null;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from('tpm_checklist').insert({
      user_id: user.id,
      stroj, datum, smjena, voditelj, odjel,
      location_id: lokacijaId || null, department_id: odjelId || null,
      stavke, akcije, napomena,
    }).select('id').single();
    setSaving(false);
    if (!error) {
      setSaved(true);
      if (data) syncAkcijeToActions('tpm_checklist', data.id, akcije, { locationId: lokacijaId, departmentId: odjelId });
    }
  };

  const resetForm = () => {
    if (!confirm('Resetirati cijelu checklistu?')) return;
    setStroj(''); setSmjena(''); setVoditelj(''); setOdjel('');
    setStavke(defaultStavke());
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
    doc.text('TPM — Autonomno održavanje', M, 16);
    doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
    y = 28;

    const checkPage = (needed = 15) => { if (y + needed > 280) { doc.addPage(); y = 20; } };

    doc.setTextColor(0, 0, 0); doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text('Stroj:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(stroj || '—', M + 20, y);
    doc.setFont('helvetica', 'bold'); doc.text('Datum:', M + 90, y);
    doc.setFont('helvetica', 'normal'); doc.text(datum || '—', M + 108, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.text('Smjena:', M, y);
    doc.setFont('helvetica', 'normal'); doc.text(smjena || '—', M + 20, y);
    doc.setFont('helvetica', 'bold'); doc.text('Voditelj:', M + 90, y);
    doc.setFont('helvetica', 'normal'); doc.text(voditelj || '—', M + 108, y);
    y += 10;

    if (ocjena !== null) {
      doc.setFillColor(232, 245, 240); doc.roundedRect(M, y, CW, 14, 3, 3, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 122, 94);
      doc.text(`Stanje stroja: ${ocjena}% (${okBroj} OK / ${problemBroj} problema)`, M + 6, y + 9);
      y += 20;
    }

    KATEGORIJE_DEFAULT.forEach(kat => {
      const tocke = stavke[kat.id].filter(t => t.tekst.trim());
      if (tocke.length === 0) return;
      checkPage(10 + tocke.length * 5);
      doc.setFillColor(240, 240, 240); doc.rect(M, y - 4, CW, 7, 'F');
      doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text(`${kat.label}`, M + 2, y + 1); y += 8;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      tocke.forEach(t => {
        checkPage(6);
        const mark = t.status === 'ok' ? '[OK]' : t.status === 'problem' ? '[PROBLEM]' : t.status === 'na' ? '[N/P]' : '[—]';
        doc.text(`${mark} ${t.tekst}${t.napomena ? ' — ' + t.napomena : ''}`, M + 4, y); y += 5;
      });
      y += 3;
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
    doc.save('TPM-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  const statusBtn = (active: boolean, color: string) =>
    `w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${active ? 'text-white' : 'bg-white border-[#e2e2e2] text-[#9a9a9a] hover:border-[#c0c0c0]'}`;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#dc2626] bg-[#fef2f2] px-3 py-1 rounded-full mb-3">🛠️ TPM</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">TPM — Autonomno održavanje</h1>
          <p className="text-sm text-[#5a5a5a]">CILT checklista (Čišćenje, Inspekcija, Podmazivanje, Pritezanje) koju operater provodi na vlastitom stroju.</p>
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
              <div><label className={labelCls}>Stroj / Oprema</label><input type="text" className={inputCls} placeholder="npr. Injekcijska preša #3" value={stroj} onChange={e => setStroj(e.target.value)} /></div>
              <div><label className={labelCls}>Datum</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
              <div><label className={labelCls}>Smjena</label><input type="text" className={inputCls} placeholder="npr. Prva smjena" value={smjena} onChange={e => setSmjena(e.target.value)} /></div>
              <div><label className={labelCls}>Voditelj / Operater</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={voditelj} onChange={e => setVoditelj(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Odjel / Pogon (slobodan tekst)</label><input type="text" className={inputCls} placeholder="npr. Prerada plastike" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
              <LokacijaOdjelPicker
                locationId={lokacijaId}
                departmentId={odjelId}
                onChange={({ locationId, departmentId }) => { setLokacijaId(locationId); setOdjelId(departmentId); }}
              />
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 flex flex-col justify-between">
            <h3 className="text-sm font-semibold mb-3">Stanje stroja</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-[#f0f0f0]">
                <span className="text-xs text-[#1a7a5e]">✅ U redu</span>
                <span className="text-sm font-bold text-[#1a7a5e]">{okBroj}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-[#dc2626]">⚠️ Problem</span>
                <span className="text-sm font-bold text-[#dc2626]">{problemBroj}</span>
              </div>
            </div>
            <div className={`mt-3 text-center py-3 rounded-xl ${ocjena === null ? 'bg-[#fafaf8] text-[#9a9a9a]' : ocjena >= 90 ? 'bg-[#e8f5f0] text-[#1a7a5e]' : ocjena >= 70 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
              <div className="text-3xl font-bold">{ocjena !== null ? `${ocjena}%` : '—'}</div>
              <div className="text-xs font-semibold">ispravnost</div>
            </div>
          </div>
        </div>

        {/* CILT kategorije */}
        {KATEGORIJE_DEFAULT.map(kat => (
          <div key={kat.id} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: kat.bg, borderBottom: `2px solid ${kat.color}` }}>
              <span className="text-lg">{kat.emoji}</span>
              <h3 className="text-sm font-bold" style={{ color: kat.color }}>{kat.label}</h3>
            </div>
            <div className="p-3 space-y-2">
              {stavke[kat.id].map((t, i) => (
                <div key={i} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm bg-white outline-none focus:border-[#1a7a5e]"
                      placeholder="Točka provjere..." value={t.tekst}
                      onChange={e => updateTocka(kat.id, i, 'tekst', e.target.value)}
                    />
                    <button onClick={() => updateTocka(kat.id, i, 'status', 'ok')} className={statusBtn(t.status === 'ok', kat.color)} style={t.status === 'ok' ? { background: '#1a7a5e', borderColor: '#1a7a5e' } : {}} title="U redu">✅</button>
                    <button onClick={() => updateTocka(kat.id, i, 'status', 'problem')} className={statusBtn(t.status === 'problem', '#dc2626')} style={t.status === 'problem' ? { background: '#dc2626', borderColor: '#dc2626' } : {}} title="Problem">⚠️</button>
                    <button onClick={() => updateTocka(kat.id, i, 'status', 'na')} className={statusBtn(t.status === 'na', '#9a9a9a')} style={t.status === 'na' ? { background: '#9a9a9a', borderColor: '#9a9a9a' } : {}} title="Nije primjenjivo">➖</button>
                    <button onClick={() => removeTocka(kat.id, i)} className="text-[#9a9a9a] hover:text-red-500 p-1 shrink-0"><Trash2 size={14} /></button>
                  </div>
                  {t.status === 'problem' && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        className="flex-1 px-2 py-1.5 border border-red-200 rounded-lg text-xs bg-white outline-none focus:border-red-400"
                        placeholder="Opišite problem..." value={t.napomena}
                        onChange={e => updateTocka(kat.id, i, 'napomena', e.target.value)}
                      />
                      <button onClick={() => prebaciUAkciju(kat.id, t)} className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[#1a7a5e] border border-dashed border-[#1a7a5e] rounded-lg px-2 py-1.5 hover:bg-[#e8f5f0] whitespace-nowrap">
                        <ArrowRight size={11} /> U akcijski plan
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => addTocka(kat.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed transition-all w-full justify-center" style={{ borderColor: kat.color, color: kat.color }}>
                <Plus size={12} /> Dodaj točku provjere
              </button>
            </div>
          </div>
        ))}

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
          {saving ? 'Spremam...' : 'Spremi TPM checklistu'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ TPM checklista je uspješno spremljena! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
