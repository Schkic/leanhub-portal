import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicGembaPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">Gemba Walk</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Strukturirani obilazak mjesta rada — idi i vidi osobno.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">Srednja razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 8 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je Gemba Walk?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">Gemba Walk je strukturirani obilazak mjesta gdje se odvija stvarni rad — proizvodnog pogona, skladišta, montažne linije. Cilj nije nadzor radnika, nego <strong className="text-[#1a1a1a]">razumijevanje stvarnog stanja procesa i identificiranje gubitaka</strong> koje iz ureda nije moguće vidjeti.</p>
          <p className="text-[#5a5a5a] leading-relaxed">Gemba Walk potječe iz Toyota Production Systema i jednog od temeljnih Lean principa: <strong className="text-[#1a1a1a]">"Genchi Genbutsu"</strong> — idi i vidi osobno.</p>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">Najčešća greška</p>
              <p className="text-sm text-amber-700 leading-relaxed">Menadžeri dolaze na Gembu i počinju ispravljati, naređivati, kritizirati. To je <strong>pogrešno</strong>. Gemba Walk je o promatranju i učenju, ne o menadžerskom obilasku.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Svrha Gemba Walka</h2>
          <div className="space-y-2">
            {[
              'Vidjeti gubitke (Muda) direktno — čekanje, nepotrebno kretanje, prekomjerne zalihe',
              'Razumjeti stvarni tok procesa — ne kako mislimo da radi, nego kako stvarno radi',
              'Slušati radnike — oni su najbliže problemu i znaju rješenja koja mi ne vidimo',
              'Provjeriti standarde — rade li radnici prema standardiziranom radu?',
              'Pokazati da menadžmentu stalo — prisutnost na terenu gradi povjerenje',
            ].map((s, i) => (
              <div key={i} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-3">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <p className="text-sm text-[#5a5a5a]">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Kako organizirati Gemba Walk</h2>
          <div className="space-y-4">
            {[
              { k: '1', n: 'Definirajte fokus', t: 'Svaki Gemba Walk treba imati jasnu temu — sigurnost, 5S stanje, tok materijala, kvaliteta, OEE. Ako gledate sve odjednom, nećete vidjeti ništa.' },
              { k: '2', n: 'Pripremite se', t: 'Pregledajte podatke prije odlaska — OEE rezultate, reklamacije, zastoje. To vam daje kontekst za što tražiti. Ali idite s otvorenim umom.' },
              { k: '3', n: 'Idite u pravo vrijeme', t: 'Idealno je otići za vrijeme normalnog rada, ne kad je sve pripremljeno za vaš posjet. Nenajavljeni obilasci daju realniju sliku.' },
              { k: '4', n: 'Promatrajte, pitajte, slušajte', t: 'Stanite na jednom mjestu i promatrajte 5–10 minuta. Zatim pitajte: "Što vam otežava rad? Što bi promijenili?"' },
              { k: '5', n: 'Dokumentirajte', t: 'Bilježite sve — zapažanja, gubitke, prijedloge radnika. Koristite strukturirani obrazac da ništa ne propustite.' },
              { k: '6', n: 'Definirajte akcije', t: 'Na temelju zapažanja, definirajte konkretne akcije s odgovornom osobom i rokom. Bez akcijskog plana, Gemba Walk je samo šetnja.' },
            ].map(k => (
              <div key={k.k} className="flex gap-4 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{k.k}</div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{k.n}</h3>
                  <p className="text-sm text-[#5a5a5a]">{k.t}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">8 vrsta gubitaka (Muda)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { n: 'Prekomjerna proizvodnja', o: 'Proizvodi se više nego što kupac traži' },
              { n: 'Čekanje', o: 'Radnici čekaju materijal, stroj, informaciju' },
              { n: 'Transport', o: 'Nepotrebno premještanje materijala' },
              { n: 'Prekomjerna obrada', o: 'Više koraka nego što je potrebno' },
              { n: 'Zalihe (WIP)', o: 'Gomilanje nedovršene proizvodnje' },
              { n: 'Nepotrebno kretanje', o: 'Radnici hodaju, traže alate, savijaju se' },
              { n: 'Greške i škart', o: 'Loši komadi koji zahtijevaju rework' },
              { n: 'Neiskorišten talent', o: 'Ideje i znanje radnika se ne koriste' },
            ].map(g => (
              <div key={g.n} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{g.n}</p>
                <p className="text-xs text-[#5a5a5a]">{g.o}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-blue-700 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremi za Gemba Walk?</h3>
          <p className="text-blue-200 text-sm mb-6">Koristite naš digitalni obrazac za dokumentiranje zapažanja i akcijskog plana.</p>
          <Link href="/alati/gemba-walk" className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">Pokreni Gemba Walk →</Link>
        </div>
      </div>
    </div>
  );
}
