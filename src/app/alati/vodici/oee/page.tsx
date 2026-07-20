import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicOEEPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">OEE — Ukupna učinkovitost opreme</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Standardizirana metrika za mjerenje koliko učinkovito koristite svoju opremu.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">Srednja razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 9 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je OEE?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">OEE je kratica za <strong className="text-[#1a1a1a]">Overall Equipment Effectiveness</strong> — ukupna učinkovitost opreme. To je standardizirana metrika koja mjeri koliko učinkovito koristite svoju manufacturing opremu u usporedbi s njenim teorijskim maksimalnim kapacitetom.</p>
          <p className="text-[#5a5a5a] leading-relaxed"><strong className="text-[#1a1a1a]">OEE od 100% znači savršena proizvodnja</strong> — stroj radi sve planirano vrijeme, punom brzinom, bez ijedne greške. U stvarnosti to nitko ne postiže, ali cilj je biti što bliže tome.</p>
        </section>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">📊</span>
            <p className="text-sm text-purple-800 leading-relaxed">OEE vam pomaže da vidite <strong>gdje gubite kapacitet</strong> — zbog zastoja, sporog rada ili grešaka. Bez mjerenja ne možete poboljšati. OEE je polazna točka svakog TPM ili Lean programa.</p>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Formula: OEE = A × P × Q</h2>
          <div className="space-y-4">
            {[
              { s: 'A', n: 'Dostupnost (Availability)', c: 'bg-blue-50 border-blue-200', nc: 'bg-blue-600', t: 'Mjeri koliko je stroj stvarno radio u odnosu na planirano radno vrijeme. Smanjuje je svaki neplanirani zastoj — kvar, čekanje na materijal, izmjena alata.', f: 'A = Operativno vrijeme / Planirano vrijeme × 100%' },
              { s: 'P', n: 'Performansa (Performance)', c: 'bg-purple-50 border-purple-200', nc: 'bg-purple-600', t: 'Mjeri koliko brzo stroj radi u usporedbi s idealnom (teorijskom) brzinom. Smanjuju je micro-zastoji i sporiji rad od nominalnog.', f: 'P = (Ukupno komada × Idealni takt) / Operativno vrijeme × 100%' },
              { s: 'Q', n: 'Kvaliteta (Quality)', c: 'bg-green-50 border-green-200', nc: 'bg-green-600', t: 'Mjeri udio dobrih komada u ukupnoj proizvodnji. Smanjuju je škart, rework i komadi koji ne prolaze kontrolu kvalitete.', f: 'Q = Dobri komadi / Ukupno komada × 100%' },
            ].map(k => (
              <div key={k.s} className={`border rounded-xl p-5 ${k.c}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${k.nc} text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0`}>{k.s}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2">{k.n}</h3>
                    <p className="text-sm text-[#5a5a5a] mb-3">{k.t}</p>
                    <code className="text-xs bg-white/60 px-3 py-1.5 rounded-lg font-mono text-[#1a1a1a]">{k.f}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">OEE referentne vrijednosti</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { raspon: '≥ 85%', ocjena: 'World Class ⭐', boja: 'bg-[#e8f5f0] border-[#1a7a5e]/20 text-[#1a7a5e]', opis: 'Samo 5% svjetskih tvornica postiže ovo' },
              { raspon: '75–84%', ocjena: 'Dobro 👍', boja: 'bg-green-50 border-green-200 text-green-700', opis: 'Dobar rezultat, nastavite poboljšavati' },
              { raspon: '60–74%', ocjena: 'Prosječno ⚠️', boja: 'bg-yellow-50 border-yellow-200 text-yellow-700', opis: 'Ima prostora za poboljšanje' },
              { raspon: '40–59%', ocjena: 'Loše 🔴', boja: 'bg-orange-50 border-orange-200 text-orange-700', opis: 'Značajni gubici, hitna analiza' },
              { raspon: '< 40%', ocjena: 'Kritično 🚨', boja: 'bg-red-50 border-red-200 text-red-700', opis: 'Hitna intervencija potrebna' },
            ].map(b => (
              <div key={b.raspon} className={`border rounded-xl p-4 ${b.boja}`}>
                <p className="text-lg font-bold mb-0.5">{b.raspon}</p>
                <p className="text-sm font-semibold mb-1">{b.ocjena}</p>
                <p className="text-xs opacity-80">{b.opis}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Šest velikih gubitaka</h2>
          <div className="space-y-3">
            {[
              { k: 'Dostupnost', g: [{ n: 'Kvarovi opreme', o: 'Neplanirani zastoji zbog tehničkih problema' }, { n: 'Izmjena alata i podešavanje', o: 'Planirani zastoji za setup — rješava SMED metodom' }] },
              { k: 'Performansa', g: [{ n: 'Micro-zastoji', o: 'Kratki zastoji ispod 5 min koji se ne evidentiraju ali se gomilaju' }, { n: 'Smanjena brzina', o: 'Stroj radi sporije od nominalne brzine' }] },
              { k: 'Kvaliteta', g: [{ n: 'Škart i rework', o: 'Loši komadi u stabilnoj proizvodnji' }, { n: 'Gubici pri pokretanju', o: 'Škart i rework pri pokretanju stroja ili izmjeni alata' }] },
            ].map(kat => (
              <div key={kat.k} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <h3 className="text-sm font-bold text-purple-600 mb-3">Gubici {kat.k}</h3>
                <div className="space-y-2">
                  {kat.g.map(g => (
                    <div key={g.n} className="flex gap-2">
                      <span className="text-purple-400 shrink-0 mt-0.5">▸</span>
                      <div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{g.n}</span>
                        <span className="text-sm text-[#5a5a5a]"> — {g.o}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-purple-700 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Izmjerite vaš OEE</h3>
          <p className="text-purple-200 text-sm mb-6">Kalkulator za više strojeva i smjena s automatskim izračunom A, P i Q.</p>
          <Link href="/alati/oee-kalkulator" className="inline-block bg-white text-purple-700 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all">Pokreni OEE Kalkulator →</Link>
        </div>
      </div>
    </div>
  );
}
