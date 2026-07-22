"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Send } from 'lucide-react';

const KATEGORIJE = [
  { value: 'Sigurnost', emoji: '🦺' },
  { value: 'Kvaliteta', emoji: '✅' },
  { value: 'Produktivnost', emoji: '⚡' },
  { value: 'Troškovi', emoji: '💰' },
  { value: 'Ergonomija', emoji: '🧑‍🔧' },
  { value: 'Okoliš', emoji: '🌱' },
  { value: 'Dostava', emoji: '🚚' },
  { value: 'Ostalo', emoji: '💡' },
];
const PRIORITETI = ['Nizak', 'Srednji', 'Visoki', 'Kritičan'];

export default function JavnaPrijavaKaizenPage() {
  const params = useParams();
  const token = params?.token as string;

  const [ime, setIme] = useState('');
  const [odjel, setOdjel] = useState('');
  const [radnoMjesto, setRadnoMjesto] = useState('');
  const [probGdje, setProbGdje] = useState('');
  const [probOpis, setProbOpis] = useState('');
  const [rjesOpis, setRjesOpis] = useState('');
  const [kategorija, setKategorija] = useState('');
  const [prioritet, setPrioritet] = useState('Srednji');

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!probOpis.trim()) return;
    setSending(true);
    setError('');
    const { error } = await supabase.rpc('submit_kaizen_prijedlog', {
      p_token: token,
      p_ime: ime,
      p_odjel: odjel,
      p_radno_mjesto: radnoMjesto,
      p_prob_gdje: probGdje,
      p_prob_opis: probOpis,
      p_rjes_opis: rjesOpis,
      p_kategorija: kategorija,
      p_prioritet: prioritet,
    });
    setSending(false);
    if (error) {
      setError('Ovaj link nije ispravan ili više nije aktivan. Provjerite s voditeljem.');
      return;
    }
    setSent(true);
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
  const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

  if (sent) {
    return (
      <div className="bg-[#fafaf8] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[440px] w-full text-center bg-white border border-[#e2e2e2] rounded-2xl p-8">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Hvala na prijedlogu!</h1>
          <p className="text-sm text-[#5a5a5a] mb-6">Vaš Kaizen prijedlog je zaprimljen i proslijeđen voditelju na razmatranje.</p>
          <button
            onClick={() => { setSent(false); setProbGdje(''); setProbOpis(''); setRjesOpis(''); setKategorija(''); setPrioritet('Srednji'); }}
            className="text-sm font-semibold text-[#1a7a5e] hover:underline"
          >
            + Predaj još jedan prijedlog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-16">
      <div className="max-w-[560px] mx-auto px-6 pt-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-4">💡 Kaizen prijedlog</div>
        <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Predložite poboljšanje</h1>
        <p className="text-sm text-[#5a5a5a] mb-8">Ne treba prijava ni lozinka — samo ispunite obrazac. Prijedlog ide izravno vašem voditelju.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-[#e2e2e2] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Ime (opcionalno)</label><input type="text" className={inputCls} placeholder="Može ostati anonimno" value={ime} onChange={e => setIme(e.target.value)} /></div>
            <div><label className={labelCls}>Odjel</label><input type="text" className={inputCls} placeholder="npr. Montaža" value={odjel} onChange={e => setOdjel(e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>Radno mjesto</label><input type="text" className={inputCls} placeholder="npr. Operater, Voditelj smjene..." value={radnoMjesto} onChange={e => setRadnoMjesto(e.target.value)} /></div>
          <div><label className={labelCls}>Gdje se problem događa?</label><input type="text" className={inputCls} placeholder="npr. Linija 3 — operacija zavarivanja" value={probGdje} onChange={e => setProbGdje(e.target.value)} /></div>
          <div>
            <label className={labelCls}>Opis problema ili prilike *</label>
            <textarea required className={`${inputCls} resize-none`} rows={4} placeholder="Što se događa i zašto je to problem?" value={probOpis} onChange={e => setProbOpis(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Vaš prijedlog rješenja</label>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Kako biste to riješili?" value={rjesOpis} onChange={e => setRjesOpis(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Kategorija</label>
            <div className="grid grid-cols-4 gap-2">
              {KATEGORIJE.map(k => (
                <button key={k.value} type="button" onClick={() => setKategorija(k.value === kategorija ? '' : k.value)}
                  className={`p-2 rounded-lg border text-center transition-all ${kategorija === k.value ? 'border-[#1a7a5e] bg-[#e8f5f0]' : 'border-[#e2e2e2] bg-white hover:bg-[#fafaf8]'}`}>
                  <div className="text-lg">{k.emoji}</div>
                  <div className="text-[9px] font-semibold mt-0.5">{k.value}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Koliko je hitno?</label>
            <select className={inputCls} value={prioritet} onChange={e => setPrioritet(e.target.value)}>
              {PRIORITETI.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={sending} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {sending ? 'Šaljem...' : 'Pošalji prijedlog'}
          </button>
        </form>
      </div>
    </div>
  );
}
