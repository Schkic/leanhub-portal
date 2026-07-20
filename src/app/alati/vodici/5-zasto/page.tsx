import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Vodic5ZastoPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">5x Zašto metoda</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Jednostavna tehnika pronalaska korijenskog uzroka postavljanjem pet uzastopnih pitanja.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Početna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 7 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je 5x Zašto metoda?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">5x Zašto je tehnika iterativne analize uzroka i posljedica. Postavljanjem pitanja <strong className="text-[#1a1a1a]">"Zašto?"</strong> uzastopno — obično pet puta — dolazite dublje od površinskih simptoma do <strong className="text-[#1a1a1a]">korijenskog uzroka</strong> problema.</p>
          <p className="text-[#5a5a5a] leading-relaxed">Metodu je razvio Sakichi Toyoda i ona je temelj Toyota Production Systema za rješavanje problema.</p>
        </section>

        <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-[#1a7a5e] mb-1">Broj 5 nije magičan</p>
              <p className="text-sm text-[#5a5a5a] leading-relaxed">Ponekad su 3 pitanja dovoljna, ponekad treba 7. Bit je da <strong>ne stanete prerano</strong>. Prvo "zašto" uvijek daje simptom. Pravo rješenje je skoro uvijek na 4.–6. razini.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Kada koristiti 5x Zašto</h2>
          <div className="space-y-2">
            {['Kada se problem ponavlja usprkos "rješavanju"', 'Za analizu kvarova strojeva i zastoja', 'Za analizu reklamacija kupaca', 'Kada tim ne zna odakle problem dolazi', 'Kao brza analiza na Gemba Walku'].map((s, i) => (
              <div key={i} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-3">
                <span className="text-red-600 font-bold shrink-0">→</span>
                <p className="text-sm text-[#5a5a5a]">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Korak po korak</h2>
          <div className="space-y-4">
            {[
              { k: '1', n: 'Definirajte problem precizno', t: 'Loše definiran problem vodi do loše analize.', primjer: { los: 'Stroj stalno staje', dobar: 'Stroj P3 imao je 4 neplanirane zaustave u tjednu 20.–24.5., ukupno 87 minuta gubitka' } },
              { k: '2', n: 'Pitajte "Zašto?" i zabilježite odgovor', t: 'Za svaki odgovor, odmah pitajte novi "Zašto?". Nastavljajte dok ne dođete do uzroka koji se može eliminirati.', primjer: null },
              { k: '3', n: 'Provjerite lanac uzročnosti', t: 'Čitajte analizu unatrag — od korijenskog uzroka prema problemu: "Zbog X, nastalo je Y, što je uzrokovalo Z..." Ako logika drži, pronašli ste pravi uzrok.', primjer: null },
              { k: '4', n: 'Definirajte korektivne akcije', t: 'Za svaki korijenski uzrok: konkretna akcija, odgovorna osoba, rok. Akcije moraju biti usmjerene na eliminaciju uzroka — ne simptoma.', primjer: null },
            ].map(k => (
              <div key={k.k} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{k.k}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{k.n}</h3>
                    <p className="text-sm text-[#5a5a5a] mb-2">{k.t}</p>
                    {k.primjer && (
                      <div className="grid sm:grid-cols-2 gap-2 mt-2">
                        <div className="bg-red-50 rounded-lg p-2 text-xs text-red-700"><span className="font-bold">❌ Loše:</span> {k.primjer.los}</div>
                        <div className="bg-green-50 rounded-lg p-2 text-xs text-green-700"><span className="font-bold">✅ Dobro:</span> {k.primjer.dobar}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Česte greške</h2>
          <div className="space-y-3">
            {[
              { g: 'Stajanje prerano', o: '"Pumpa se pokvarila" nije korijenski uzrok. Zašto se pokvarila?' },
              { g: 'Traženje krivca umjesto uzroka', o: '"Operater nije zamijenio filter" → Zašto nije? Možda procedure nije bilo. Fokus na sustav, ne na osobu.' },
              { g: 'Jedan put analize za kompleksne probleme', o: 'Nekad postoji više paralelnih uzroka. Koristite Ishikawa za pregled svih mogućih uzroka, pa 5x Zašto za prioritetni.' },
              { g: 'Bez provjere s podacima', o: 'Svaki odgovor treba biti potkrijepljen dokazima, ne pretpostavkama.' },
            ].map(g => (
              <div key={g.g} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <span className="text-red-500 font-bold text-lg shrink-0">✕</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-0.5">{g.g}</p>
                  <p className="text-sm text-[#5a5a5a]">{g.o}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-sm text-[#5a5a5a] leading-relaxed">Provedite 5x Zašto analizu <strong>s timom na Gembi</strong> — na samom mjestu problema, s dokumentacijom i opremom pred sobom. Analiza u sali za sastanke daje teorijske odgovore — analiza na licu mjesta daje prave uzroke.</p>
          </div>
        </div>

        <div className="bg-red-600 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremi za analizu?</h3>
          <p className="text-red-100 text-sm mb-6">Koristite naš digitalni obrazac s vizualnim lancem pitanja i pohranom u portal.</p>
          <Link href="/alati/5-zasto" className="inline-block bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-all">Pokreni 5x Zašto →</Link>
        </div>
      </div>
    </div>
  );
}
