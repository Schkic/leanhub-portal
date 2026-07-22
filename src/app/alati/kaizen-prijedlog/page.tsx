"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Printer, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const KATEGORIJE = [
  { value: 'Sigurnost', emoji: '🦺', color: 'border-red-300 bg-red-50 text-red-700', desc: 'Smanjuje rizik ozljeda' },
  { value: 'Kvaliteta', emoji: '✅', color: 'border-blue-300 bg-blue-50 text-blue-700', desc: 'Smanjuje greške i škart' },
  { value: 'Produktivnost', emoji: '⚡', color: 'border-yellow-300 bg-yellow-50 text-yellow-700', desc: 'Ubrzava proces' },
  { value: 'Troškovi', emoji: '💰', color: 'border-green-300 bg-green-50 text-green-700', desc: 'Smanjuje troškove' },
  { value: 'Ergonomija', emoji: '🧑‍🔧', color: 'border-purple-300 bg-purple-50 text-purple-700', desc: 'Lakši i ugodniji rad' },
  { value: 'Okoliš', emoji: '🌱', color: 'border-teal-300 bg-teal-50 text-teal-700', desc: 'Manje otpada i emisija' },
  { value: 'Dostava', emoji: '🚚', color: 'border-orange-300 bg-orange-50 text-orange-700', desc: 'Brža ili pouzdanija isporuka' },
  { value: 'Ostalo', emoji: '💡', color: 'border-gray-300 bg-gray-50 text-gray-700', desc: 'Nešto drugo' },
];

const PRIORITETI = [
  { value: 'Nizak', emoji: '🟢', opis: 'Može pričekati, nema hitnosti' },
  { value: 'Srednji', emoji: '🟡', opis: 'Treba riješiti u razumnom roku' },
  { value: 'Visoki', emoji: '🟠', opis: 'Važno, utječe na rad' },
  { value: 'Kritičan', emoji: '🔴', opis: 'Hitno, blokira ili ugrožava' },
];

const STATUSI = ['Otvoreno', 'U razmatranju', 'Odobreno', 'U provedbi', 'Završeno', 'Odbijeno'];

const Section = ({ icon, title, subtitle, color, children }: any) => (
  <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
    <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm`}>{icon}</div>
      <div><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs text-[#9a9a9a]">{subtitle}</p></div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function KaizenPrijedlogPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [ime, setIme] = useState('');
  const [datum, setDatum] = useState('');
  const [odjel, setOdjel] = useState('');
  const [radnoMjesto, setRadnoMjesto] = useState('');
  const [probGdje, setProbGdje] = useState('');
  const [probOpis, setProbOpis] = useState('');
  const [baPrije, setBaPrije] = useState('');
  const [baPoslije, setBaPoslije] = useState('');
  const [rjesOpis, setRjesOpis] = useState('');
  const [rjesPotrebno, setRjesPotrebno] = useState('');
  const [rjesTrosak, setRjesTrosak] = useState('');
  const [kategorija, setKategorija] = useState('');
  const [prioritet, setPrioritet] = useState('');
  const [status, setStatus] = useState('Otvoreno');

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
    setDatum(new Date().toISOString().split('T')[0]);
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('kaizen_prijedlog').insert({
      user_id: user.id,
      ime, datum, odjel, radno_mjesto: radnoMjesto,
      prob_gdje: probGdje, prob_opis: probOpis,
      ba_prije: baPrije, ba_poslije: baPoslije,
      rjes_opis: rjesOpis, rjes_potrebno: rjesPotrebno, rjes_trosak: rjesTrosak,
      kategorija, prioritet, status,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const resetForm = () => {
    if (!confirm('Započeti novi prijedlog? Trenutni unos će biti izgubljen.')) return;
    setIme(''); setOdjel(''); setRadnoMjesto('');
    setProbGdje(''); setProbOpis(''); setBaPrije(''); setBaPoslije('');
    setRjesOpis(''); setRjesPotrebno(''); setRjesTrosak('');
    setKategorija(''); setPrioritet(''); setStatus('Otvoreno');
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
    doc.text('Kaizen prijedlog poboljšanja', M, 16);
    doc.setFontSize(8); doc.text('app.leanopedija.hr', W - M, 9, { align: 'right' });
    doc.text(new Date().toLocaleDateString('hr-HR'), W - M, 16, { align: 'right' });
    y = 28;

    const checkPage = (needed = 15) => { if (y + needed > 280) { doc.addPage(); y = 20; } };

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

    sectionTitle('PODNOSITELJ PRIJEDLOGA');
    twoFields('Ime i prezime:', ime || 'Anonimno', 'Datum:', datum);
    twoFields('Odjel / pogon:', odjel, 'Radno mjesto:', radnoMjesto);

    sectionTitle('OPIS PROBLEMA ILI PRILIKE');
    fieldRow('Gdje se problem pojavljuje:', probGdje);
    fieldRow('Opis problema / prilike:', probOpis);
    twoFields('Trenutno stanje (prije):', baPrije, 'Željeno stanje (poslije):', baPoslije);

    sectionTitle('PREDLOŽENO RJEŠENJE');
    fieldRow('Rješenje:', rjesOpis);
    twoFields('Potrebno za implementaciju:', rjesPotrebno, 'Procijenjeni trošak:', rjesTrosak);

    sectionTitle('UTJECAJ, PRIORITET I STATUS');
    twoFields('Kategorija:', kategorija, 'Prioritet:', prioritet);
    fieldRow('Status:', status);

    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Izrađeno u Leanopedija App — app.leanopedija.hr', M, 290);

    doc.save('Kaizen-Prijedlog-' + (ime || 'anonimno').substring(0, 30).replace(/\s/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.pdf');
  };

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">♾️ Kaizen</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Kaizen prijedlog</h1>
          <p className="text-sm text-[#5a5a5a]">Predložite poboljšanje procesa, radnog mjesta ili sigurnosti. Svaki prijedlog je vrijedan!</p>
          <a href="/alati/kaizen-prijedlog/pracenje" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a7a5e] hover:underline mt-3">
            📊 Otvori sustav praćenja svih prijedloga →
          </a>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[900px] mx-auto flex items-center gap-3 flex-wrap">
          <button onClick={resetForm} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <RotateCcw size={16} /> Novi prijedlog
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <Printer size={16} /> Ispis
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 border border-[#e2e2e2] text-[#1a1a1a] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#fafaf8] transition-all">
            <Download size={16} /> Preuzmi PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70 ml-auto">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi prijedlog'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">

        {/* 1. Podnositelj */}
        <Section icon="👤" title="Podnositelj prijedloga" subtitle="Može ostati anonimno" color="bg-[#e8f5f0]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Ime i prezime (opcionalno)</label><input type="text" className={inputCls} placeholder="Ime Prezime — može ostati anonimno" value={ime} onChange={e => setIme(e.target.value)} /></div>
            <div><label className={labelCls}>Datum prijedloga</label><input type="date" className={inputCls} value={datum} onChange={e => setDatum(e.target.value)} /></div>
            <div><label className={labelCls}>Odjel / Pogon</label><input type="text" className={inputCls} placeholder="npr. Montaža, Skladište, Kvaliteta..." value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
            <div><label className={labelCls}>Radno mjesto</label><input type="text" className={inputCls} placeholder="npr. Operater, Voditelj smjene, Inženjer..." value={radnoMjesto} onChange={e => setRadnoMjesto(e.target.value)} /></div>
          </div>
        </Section>

        {/* 2. Problem */}
        <Section icon="🔍" title="Opis problema ili prilike" subtitle="Što se događa i gdje?" color="bg-red-50">
          <div className="space-y-4">
            <div><label className={labelCls}>Gdje se problem pojavljuje?</label><input type="text" className={inputCls} placeholder="npr. Linija 3 — operacija zavarivanja, Skladište sirovina — zona B" value={probGdje} onChange={e => setProbGdje(e.target.value)} /></div>
            <div><label className={labelCls}>Opis problema / prilike</label><textarea className={textareaCls} rows={4} placeholder={`Opišite konkretno što se događa, koliko često, koji su simptomi...\n\nPrimjer: Operateri troše prosječno 8 minuta po smjeni tražeći alat jer nema fiksnog mjesta.`} value={probOpis} onChange={e => setProbOpis(e.target.value)} /></div>

            {/* Prije / Poslije */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">🔴 Trenutno stanje (Prije)</label>
                <textarea className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:border-red-400 outline-none bg-white resize-none" rows={4} placeholder={`Opišite kako trenutno izgleda...\nKoliko dugo traje, koliko košta, koliko je ljudi pogođeno...`} value={baPrije} onChange={e => setBaPrije(e.target.value)} />
              </div>
              <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-4">
                <label className="block text-xs font-bold text-[#1a7a5e] uppercase tracking-wider mb-2">✅ Željeno stanje (Poslije)</label>
                <textarea className="w-full px-3 py-2 border border-[#1a7a5e]/30 rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-white resize-none" rows={4} placeholder={`Kako bi izgledalo idealno stanje...\nŠto bi se promijenilo, kako bi proces tekao...`} value={baPoslije} onChange={e => setBaPoslije(e.target.value)} />
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Rješenje */}
        <Section icon="💡" title="Predloženo rješenje" subtitle="Što konkretno predlažete?" color="bg-yellow-50">
          <div className="space-y-4">
            <div><label className={labelCls}>Predloženo rješenje</label><textarea className={textareaCls} rows={4} placeholder={`Opišite konkretno što predlažete...\n\nPrimjer: Napraviti shadow board za alate — svaki alat ima svoje označeno mjesto. Operateri odmah vide koji alat nedostaje.`} value={rjesOpis} onChange={e => setRjesOpis(e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Što je potrebno za implementaciju?</label><textarea className={textareaCls} rows={3} placeholder="Materijali, oprema, pomoć, odobrenje..." value={rjesPotrebno} onChange={e => setRjesPotrebno(e.target.value)} /></div>
              <div><label className={labelCls}>Procijenjeni trošak</label><textarea className={textareaCls} rows={3} placeholder={`npr. Bez troška (samo rad)\n100-500 €\nTreba procjena...`} value={rjesTrosak} onChange={e => setRjesTrosak(e.target.value)} /></div>
            </div>
          </div>
        </Section>

        {/* 4. Kategorija */}
        <Section icon="🏷️" title="Kategorija poboljšanja" subtitle="Odaberite jednu kategoriju" color="bg-blue-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {KATEGORIJE.map(k => (
              <button key={k.value} type="button" onClick={() => setKategorija(k.value === kategorija ? '' : k.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${kategorija === k.value ? k.color + ' border-current' : 'border-[#e2e2e2] bg-white hover:bg-[#fafaf8]'}`}>
                <div className="text-2xl mb-1">{k.emoji}</div>
                <div className="text-xs font-semibold">{k.value}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{k.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* 5. Prioritet */}
        <Section icon="🎯" title="Prioritet" subtitle="Koliko je hitno?" color="bg-orange-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRIORITETI.map(p => (
              <button key={p.value} type="button" onClick={() => setPrioritet(p.value === prioritet ? '' : p.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${prioritet === p.value ? 'border-[#1a7a5e] bg-[#e8f5f0]' : 'border-[#e2e2e2] bg-white hover:bg-[#fafaf8]'}`}>
                <div className="text-2xl mb-1">{p.emoji}</div>
                <div className="text-xs font-bold mb-0.5">{p.value}</div>
                <div className="text-[10px] text-[#9a9a9a]">{p.opis}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* 6. Status */}
        <Section icon="📌" title="Status praćenja" subtitle="Ažurirajte status provedbe" color="bg-purple-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STATUSI.map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${status === s ? 'border-[#1a7a5e] bg-[#e8f5f0] text-[#1a7a5e]' : 'border-[#e2e2e2] bg-white text-[#5a5a5a] hover:bg-[#fafaf8]'}`}>
                {s}
              </button>
            ))}
          </div>
        </Section>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Spremam...' : 'Spremi Kaizen prijedlog'}
        </button>
        {saved && (
          <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center">
            ✅ Kaizen prijedlog je uspješno spremljen! <a href="/povijest" className="underline ml-2">Pogledaj povijest →</a>
          </div>
        )}
      </div>
    </div>
  );
}
