import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicKaizenPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">Kaizen — Kontinuirano poboljšanje</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Filozofija i metodologija malih, stalnih poboljšanja koja pokrivaju cijelu organizaciju.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Početna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 8 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što znači Kaizen?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">Kaizen (改善) je japanska složenica od dviju riječi: <strong className="text-[#1a1a1a]">kai</strong> (promjena) i <strong className="text-[#1a1a1a]">zen</strong> (dobro, bolje). Doslovan prijevod: "promjena na bolje" ili "kontinuirano poboljšanje".</p>
          <p className="text-[#5a5a5a] leading-relaxed">Osnovna ideja je jednostavna: <strong className="text-[#1a1a1a]">nema procesa koji ne može biti bolji</strong>, i svaki zaposlenik — od direktora do operatera — može i treba doprinijeti poboljšanju.</p>
        </section>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-sm text-teal-800 leading-relaxed">Inovacija = veliki skok unaprijed (nova tehnologija, novi stroj). Kaizen = stalan mali napredak. <strong>Kaizen čuva postignutu razinu i stalno je podiže.</strong> Bez Kaizena, svaki veliki skok s vremenom klizi natrag.</p>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Dvije razine Kaizena</h2>
          <div className="space-y-4">
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5">
              <h3 className="text-base font-bold text-[#1a1a1a] mb-2">1. Kaizen filozofija (svakodnevno poboljšanje)</h3>
              <p className="text-sm text-[#5a5a5a] mb-3">Svaki radnik svaki dan traži male prilike za poboljšanje svog radnog mjesta i procesa. Nema formalnog projekta — samo kultura: <strong>"Vidim problem → predlažem rješenje → implementiram odmah ili prijavljujem voditelju."</strong></p>
              <div className="space-y-1">
                {['Operater premješta alat bliže radnom stolu da smanji hodanje', 'Voditelj smjene reorganizira redoslijed operacija da eliminira čekanje', 'Skladištar označava police bojama za brže pronalaženje'].map((p, i) => (
                  <p key={i} className="text-xs text-[#5a5a5a] flex gap-2"><span className="text-teal-600">•</span>{p}</p>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5">
              <h3 className="text-base font-bold text-[#1a1a1a] mb-2">2. Kaizen Event (radionica poboljšanja)</h3>
              <p className="text-sm text-[#5a5a5a]">Strukturirana radionica trajanja <strong>3 do 5 radnih dana</strong> u kojoj multifunkcionalni tim intenzivno radi na poboljšanju jednog specifičnog procesa. Poznata i kao "Kaizen blitz" ili "Rapid Improvement Event (RIE)".</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">PDCA ciklus — srce Kaizena</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { f: 'Plan', b: 'Definirajte problem i ciljeve, analizirajte uzroke, planirajte rješenja', c: 'bg-blue-50 border-blue-200 text-blue-700' },
              { f: 'Do', b: 'Implementirajte planirane akcije — pilot ili puno uvođenje', c: 'bg-[#e8f5f0] border-[#1a7a5e]/20 text-[#1a7a5e]' },
              { f: 'Check', b: 'Provjerite rezultate — jeste li postigli planirani cilj?', c: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { f: 'Act', b: 'Standardizirajte uspješna rješenja i proširite na druge procese', c: 'bg-teal-50 border-teal-200 text-teal-700' },
            ].map(p => (
              <div key={p.f} className={`border rounded-xl p-4 ${p.c}`}>
                <p className="text-lg font-bold mb-1">{p.f}</p>
                <p className="text-xs">{p.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Kako organizirati Kaizen Event</h2>
          <div className="space-y-3">
            {[
              { d: '1 tjedan prije', n: 'Priprema', stavke: ['Definirajte scope — što točno poboljšavate? Jedna linija, jedna operacija, jedan problem', 'Odaberite tim — 5-8 ljudi: voditelj, 2-3 operatera, inženjer, voditelj smjene', 'Prikupite podatke — OEE, zastoji, škart, reklamacije', 'Osigurajte sponzora — menadžer koji odobrava i uklanja prepreke'] },
              { d: 'Dan 1', n: 'Razumijevanje trenutnog stanja', stavke: ['Kick-off — upoznavanje, ciljevi, pravila', 'Gemba Walk — svi na lice mjesta, promatraju, bilježe, mjere', 'Mapiranje trenutnog toka — VSM ili process map', 'Analiza uzroka — 5x Zašto ili Ishikawa'] },
              { d: 'Dan 2', n: 'Dizajn rješenja', stavke: ['Brainstorming — sve ideje dobrodošle, bez kritike', 'Evaluacija ideja — koje rješavaju korijenski uzrok?', 'Dizajn budućeg stanja', 'Plan implementacije'] },
              { d: 'Dan 3–4', n: 'Implementacija', stavke: ['Implementirajte promjene na licu mjesta', 'Testirajte i mjerite rezultate', 'Prilagodite po potrebi'] },
              { d: 'Dan 5', n: 'Standardizacija i prezentacija', stavke: ['Dokumentirajte nova rješenja — procedure, vizualna pomagala', 'Prezentacija menadžmentu — rezultati, uštede, sljedeći koraci', 'Plan širenja na druge procese'] },
            ].map(d => (
              <div key={d.d} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded">{d.d}</span>
                  <h3 className="text-sm font-bold text-[#1a1a1a]">{d.n}</h3>
                </div>
                <div className="space-y-1.5">
                  {d.stavke.map((s, i) => <p key={i} className="text-xs text-[#5a5a5a] flex gap-2"><span className="text-teal-600 shrink-0">✓</span>{s}</p>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-teal-700 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Podnesite Kaizen prijedlog</h3>
          <p className="text-teal-100 text-sm mb-6">Koristite naš digitalni obrazac za prijedloge poboljšanja s praćenjem statusa.</p>
          <Link href="/alati/kaizen-prijedlog" className="inline-block bg-white text-teal-700 px-8 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all">Pokreni Kaizen Prijedlog →</Link>
        </div>
      </div>
    </div>
  );
}
