"use client";

import React, { useState, useEffect } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

const STATUSI = ['Otvoreno', 'U tijeku', 'Završeno', 'Odgođeno'];
const CILJ_OPCIJE = ['Da — cilj postignut', 'Djelomično', 'Ne — potrebna revizija'];

interface AkcijaRow { akcija: string; odgovorna: string; rok: string; status: string; }

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
  const [akcije, setAkcije] = useState<AkcijaRow[]>([{ akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
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

  const addAkcija = () => setAkcije([...akcije, { akcija: '', odgovorna: '', rok: '', status: 'Otvoreno' }]);
  const removeAkcija = (i: number) => setAkcije(akcije.filter((_, idx) => idx !== i));
  const updateAkcija = (i: number, field: keyof AkcijaRow, value: string) => {
    const updated = [...akcije]; updated[i][field] = value; setAkcije(updated);
  };
  const updateZasto = (i: number, value: string) => {
    const updated = [...zasto]; updated[i] = value; setZasto(updated);
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

  const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";
  const textareaCls = `${inputCls} resize-none`;

  const Section = ({ icon, title, subtitle, color, children }: any) => (
    <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
      <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center gap-3">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm`}>{icon}</div>
        <div><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs text-[#9a9a9a]">{subtitle}</p></div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-3">📄 A3 Obrazac</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">A3 obrazac za rješavanje problema</h1>
          <p className="text-sm text-[#5a5a5a]">Strukturirano rješavanje problema metodom Toyote — od opisa do standardizacije.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-3">
        <div className="max-w-[1000px] mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Spremam...' : 'Spremi u portal'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅ Spremljeno!</span>}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-6 space-y-4">

        {/* 1. Zaglavlje */}
        <Section icon="📋" title="Zaglavlje" subtitle="Osnovni podaci o A3 dokumentu" color="bg-orange-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelCls}>Naslov / Naziv problema</label><input type="text" className={inputCls} placeholder="npr. Povećan broj reklamacija na sklopu X — Linija 3" value={naslov} onChange={e => setNaslov(e.target.value)} /></div>
            <div><label className={labelCls}>Datum otvaranja</label><input type="date" className={inputCls} value={datumOtvaranja} onChange={e => setDatumOtvaranja(e.target.value)} /></div>
            <div><label className={labelCls}>Ciljni datum rješenja</label><input type="date" className={inputCls} value={datumCiljni} onChange={e => setDatumCiljni(e.target.value)} /></div>
            <div><label className={labelCls}>Broj A3 dokumenta</label><input type="text" className={inputCls} placeholder="npr. A3-2025-001" value={brojA3} onChange={e => setBrojA3(e.target.value)} /></div>
            <div><label className={labelCls}>Vlasnik A3 (odgovorna osoba)</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={vlasnik} onChange={e => setVlasnik(e.target.value)} /></div>
            <div><label className={labelCls}>Odjel / Pogon / Linija</label><input type="text" className={inputCls} placeholder="npr. Montaža, Linija 3" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
            <div><label className={labelCls}>Tim / Sudionici</label><input type="text" className={inputCls} placeholder="npr. Kvaliteta, Proizvodnja, Održavanje" value={tim} onChange={e => setTim(e.target.value)} /></div>
          </div>
        </Section>

        {/* 2. Pozadina */}
        <Section icon="📖" title="Pozadina problema" subtitle="Kontekst i razlog pokretanja A3" color="bg-blue-50">
          <label className={labelCls}>Opišite kontekst i razlog pokretanja A3</label>
          <textarea className={textareaCls} rows={4} placeholder="npr. U posljednjih 30 dana zabilježeno je 47 reklamacija kupca zbog neispravnog sklopa X..." value={pozadina} onChange={e => setPozadina(e.target.value)} />
        </Section>

        {/* 3. Trenutno stanje */}
        <Section icon="🔍" title="Trenutno stanje" subtitle="Opis problema — što, gdje, kada, koliko" color="bg-red-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Što nije u redu?</label><textarea className={textareaCls} rows={3} placeholder="Konkretno što nije u redu..." value={sto} onChange={e => setSto(e.target.value)} /></div>
            <div><label className={labelCls}>Gdje se pojavljuje?</label><textarea className={textareaCls} rows={3} placeholder="Na kojoj liniji, operaciji, stroju..." value={gdje} onChange={e => setGdje(e.target.value)} /></div>
            <div><label className={labelCls}>Kada se pojavljuje?</label><textarea className={textareaCls} rows={3} placeholder="Učestalost, smjena, uvjeti..." value={kada} onChange={e => setKada(e.target.value)} /></div>
            <div><label className={labelCls}>Koliko (veličina problema)?</label><textarea className={textareaCls} rows={3} placeholder="Brojčani prikaz — defekti, troškovi, zastoji..." value={koliko} onChange={e => setKoliko(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Vizualni prikaz / skica toka</label><textarea className={textareaCls} rows={3} placeholder="Opišite tijek procesa ili tok materijala..." value={vizual} onChange={e => setVizual(e.target.value)} /></div>
          </div>
        </Section>

        {/* 4. Analiza uzroka */}
        <Section icon="🔎" title="Analiza uzroka — 5x Zašto" subtitle="Pronađite korijenski uzrok problema" color="bg-yellow-50">
          <div className="mb-4">
            <label className={labelCls}>Simptom (polazna točka)</label>
            <input type="text" className={inputCls} placeholder="npr. Sklop X ima povećan postotak reklamacija" value={simptom} onChange={e => setSimptom(e.target.value)} />
          </div>
          <div className="space-y-3 mb-4">
            {zasto.map((z, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 4 ? 'bg-red-100 text-red-600' : 'bg-[#e8f5f0] text-[#1a7a5e]'}`}>
                  {i + 1}
                </div>
                <input type="text" className={inputCls} placeholder={i === 4 ? 'Korijenski uzrok...' : `Zašto ${i + 1}...`} value={z} onChange={e => updateZasto(i, e.target.value)} />
              </div>
            ))}
          </div>
          <div>
            <label className={labelCls}>Sažetak korijenskog uzroka</label>
            <textarea className={textareaCls} rows={3} placeholder="Sažetak korijenskog uzroka na temelju 5x Zašto analize..." value={korijen} onChange={e => setKorijen(e.target.value)} />
          </div>
        </Section>

        {/* 5. Ciljno stanje */}
        <Section icon="🎯" title="Ciljno stanje" subtitle="Što želimo postići i kako ćemo mjeriti uspjeh" color="bg-green-50">
          <div className="mb-4">
            <label className={labelCls}>Opis ciljnog stanja</label>
            <textarea className={textareaCls} rows={4} placeholder="npr. Smanjiti broj reklamacija sklopa X s 47 na maksimalno 5 u 30 dana..." value={ciljno} onChange={e => setCiljno(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>KPI naziv</label><input type="text" className={inputCls} placeholder="npr. Broj reklamacija / mj." value={kpiNaziv} onChange={e => setKpiNaziv(e.target.value)} /></div>
            <div><label className={labelCls}>Trenutna vrijednost</label><input type="text" className={inputCls} placeholder="npr. 47" value={kpiTrenutno} onChange={e => setKpiTrenutno(e.target.value)} /></div>
            <div><label className={labelCls}>Ciljana vrijednost</label><input type="text" className={inputCls} placeholder="npr. ≤ 5" value={kpiCiljano} onChange={e => setKpiCiljano(e.target.value)} /></div>
          </div>
        </Section>

        {/* 6. Akcijski plan */}
        <Section icon="📌" title="Akcijski plan" subtitle="Konkretne akcije s odgovornom osobom i rokom" color="bg-purple-50">
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
        </Section>

        {/* 7. Provjera rezultata */}
        <Section icon="✅" title="Provjera rezultata" subtitle="Jeste li postigli ciljno stanje?" color="bg-teal-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className={labelCls}>Datum provjere</label><input type="date" className={inputCls} value={datumProva} onChange={e => setDatumProva(e.target.value)} /></div>
            <div><label className={labelCls}>Postignuta vrijednost KPI-ja</label><input type="text" className={inputCls} placeholder="npr. 3 reklamacije" value={kpiPostignuto} onChange={e => setKpiPostignuto(e.target.value)} /></div>
          </div>
          <div className="mb-4"><label className={labelCls}>Opis rezultata</label><textarea className={textareaCls} rows={4} placeholder="Opišite mjerljive rezultate — usporedite ciljno i postignuto stanje..." value={rezultati} onChange={e => setRezultati(e.target.value)} /></div>
          <div>
            <label className={labelCls}>Je li cilj postignut?</label>
            <select className={inputCls} value={ciljPostignut} onChange={e => setCiljPostignut(e.target.value)}>
              {CILJ_OPCIJE.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </Section>

        {/* 8. Standardizacija */}
        <Section icon="📚" title="Standardizacija i širenje" subtitle="Osigurajte trajnost rješenja" color="bg-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Standardizacija rješenja</label><textarea className={textareaCls} rows={3} placeholder="npr. Ažurirane radne upute, nova vizualna pomagala..." value={standardizacija} onChange={e => setStandardizacija(e.target.value)} /></div>
            <div><label className={labelCls}>Širenje na druge procese</label><textarea className={textareaCls} rows={3} placeholder="npr. Primijeniti na Liniji 4 i 5..." value={sirenje} onChange={e => setSirenje(e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelCls}>Naučene lekcije</label><textarea className={textareaCls} rows={3} placeholder="Što smo naučili iz ovog problema?" value={lekcije} onChange={e => setLekcije(e.target.value)} /></div>
            <div><label className={labelCls}>Datum standardizacije</label><input type="date" className={inputCls} value={datumStand} onChange={e => setDatumStand(e.target.value)} /></div>
            <div><label className={labelCls}>Vlasnik A3 — potpis</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={potpis} onChange={e => setPotpis(e.target.value)} /></div>
            <div><label className={labelCls}>Odobrio (nadređeni)</label><input type="text" className={inputCls} placeholder="Ime i prezime nadređenog" value={odobrio} onChange={e => setOdobrio(e.target.value)} /></div>
            <div><label className={labelCls}>Potpis nadređenog</label><input type="text" className={inputCls} placeholder="Ime i prezime" value={potpisOdobrio} onChange={e => setPotpisOdobrio(e.target.value)} /></div>
          </div>
        </Section>

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
