import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicStandardiziraniRadPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-3">📐 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">Standardizirani rad (SWCT)</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Temelj kontinuiranog poboljšanja — raščlanite proces, usporedite s takt vremenom.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">Srednja razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 7 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je standardizirani rad?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">Standardizirani rad definira <strong className="text-[#1a1a1a]">najbolji poznati način</strong> da operater izvede zadatak — redoslijed koraka, vrijeme potrebno za svaki korak, i količinu materijala koja treba biti pri ruci. Nije riječ o kruto propisanim pravilima, nego o polazišnoj točki na kojoj svi rade jednako, dok netko ne pronađe bolji način.</p>
        </section>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-indigo-800 mb-1">Ne možeš poboljšati ono što nije standardizirano</p>
              <p className="text-sm text-indigo-700 leading-relaxed">Ako tri operatera rade isti zadatak na tri različita načina, nemoguće je reći je li neka promjena stvarno poboljšanje ili samo varijacija. Standard je polazna crta za PDCA — bez nje, Kaizen nema što mjeriti.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Tri elementa standardiziranog rada</h2>
          <div className="space-y-2">
            {[
              { n: 'Takt vrijeme', o: 'Brzina kojom proces mora proizvoditi da zadovolji potražnju kupca — svi koraci moraju stati unutar njega.' },
              { n: 'Radni redoslijed (Work Sequence)', o: 'Točan redoslijed kretanja i radnji operatera unutar jednog ciklusa.' },
              { n: 'Standardne zalihe u procesu (Standard WIP)', o: 'Minimalna količina nedovršene proizvodnje potrebna da proces teče glatko, bez čekanja i gomilanja.' },
            ].map((s) => (
              <div key={s.n} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-3">
                <span className="text-indigo-600 font-bold shrink-0">✓</span>
                <div>
                  <span className="text-sm font-semibold text-[#1a1a1a]">{s.n}</span>
                  <span className="text-sm text-[#5a5a5a]"> — {s.o}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Kako napraviti SWCT tablicu</h2>
          <div className="space-y-4">
            {[
              { k: '1', n: 'Izmjerite vremena na terenu', t: 'Odite na Gembu sa štopericom i izmjerite stvarno vrijeme za svaki korak — ne procjenjujte iz ureda.' },
              { k: '2', n: 'Raščlanite na korake', t: 'Za svaki korak zabilježite ručno vrijeme, strojno vrijeme i vrijeme hoda.' },
              { k: '3', n: 'Izračunajte ciklus operatera', t: 'Ciklus = ručno vrijeme + vrijeme hoda. Strojno vrijeme se ne zbraja jer teče paralelno.' },
              { k: '4', n: 'Usporedite s takt vremenom', t: 'Ako je ciklus manji od takta, proces drži korak s potražnjom. Ako je veći — imate usko grlo.' },
              { k: '5', n: 'Balansirajte i standardizirajte', t: 'Prerasporedite korake, uklonite nepotrebne pokrete, i dokumentirajte redoslijed kao novi standard.' },
            ].map(k => (
              <div key={k.k} className="flex gap-4 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{k.k}</div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{k.n}</h3>
                  <p className="text-sm text-[#5a5a5a]">{k.t}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">Ciklus veći od takta?</p>
              <p className="text-sm text-amber-700 leading-relaxed">To je usko grlo. Prerasporedite rad na susjednog operatera s rezervom, uklonite gubitke unutar koraka, pokrenite Kaizen, ili tek na kraju — dodajte resurs.</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-700 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Napravite SWCT tablicu</h3>
          <p className="text-indigo-200 text-sm mb-6">Unesite operacije, automatski izračun ciklusa operatera naspram takt vremena, akcijski plan i PDF izvoz.</p>
          <Link href="/alati/standardizirani-rad" className="inline-block bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all">Pokreni SWCT alat →</Link>
        </div>
      </div>
    </div>
  );
}
