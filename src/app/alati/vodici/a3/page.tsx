import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicA3Page() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">A3 Obrazac</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Toyotin strukturirani pristup rješavanju problema — od opisa do standardizacije.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">Napredna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 10 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Zašto baš A3?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">U većini firmi problemi se "rješavaju" ovako: netko prijavi problem, šef kaže "popravi to", netko nešto napravi, problem se vrati za tjedan dana. Zašto? Jer nije identificiran korijenski uzrok. Rješavao se simptom, ne uzrok.</p>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">A3 metoda vas prisiljava da:</p>
          <div className="space-y-2">
            {['Razumijete problem prije nego počnete s rješenjima', 'Pronađete korijenski uzrok — ne samo simptom', 'Dokumentirate cijeli proces — za učenje i dijeljenje', 'Pratite rezultate — je li rješenje zaista funkcioniralo?'].map((s, i) => (
              <div key={i} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-3">
                <span className="text-orange-600 font-bold shrink-0">✓</span>
                <p className="text-sm text-[#5a5a5a]">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-orange-800 mb-1">Toyota pravilo</p>
              <p className="text-sm text-orange-700 leading-relaxed">"Nemoj mi donositi rješenja. Donesi mi A3." — Svaki problem koji traži odobrenje ili resurse mora biti dokumentiran na A3. Ovo osigurava da su rješenja temeljena na podacima, ne na pretpostavkama.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">A3 nije samo papir — to je način razmišljanja</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">Iza A3 stoji PDCA ciklus koji je temelj Lean i kontinuiranog poboljšanja:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { f: 'Plan', b: 'Koraci 1–5: Razumij problem, analiziraj uzroke, planiraj rješenje', c: 'bg-blue-50 border-blue-200 text-blue-700' },
              { f: 'Do', b: 'Korak 6: Implementiraj akcije', c: 'bg-[#e8f5f0] border-[#1a7a5e]/20 text-[#1a7a5e]' },
              { f: 'Check', b: 'Korak 7: Provjeri rezultate', c: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { f: 'Act', b: 'Korak 8: Standardiziraj i proširi', c: 'bg-orange-50 border-orange-200 text-orange-700' },
            ].map(p => (
              <div key={p.f} className={`border rounded-xl p-4 ${p.c}`}>
                <p className="text-lg font-bold mb-1">{p.f}</p>
                <p className="text-xs">{p.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">8 koraka A3 procesa</h2>
          <div className="space-y-3">
            {[
              { n: 'Zaglavlje i vlasnik', t: 'Tko je vlasnik problema, koji je odjel zahvaćen, koji je rok? Dobar naslov opisuje problem, ne rješenje.' },
              { n: 'Pozadina', t: 'Zašto je ovaj problem važan? Koji je poslovni utjecaj — troškovi, reklamacije, sigurnost?' },
              { n: 'Trenutno stanje', t: 'Što se točno događa, gdje, kada i koliko često? Koristite 5W1H: What, Where, When, Who, How much.' },
              { n: 'Analiza uzroka', t: 'Srce A3 metode. Pitajte "Zašto?" pet puta. Ako na kraju imate "greška radnika" — niste otišli dovoljno duboko.' },
              { n: 'Ciljno stanje', t: 'Definirajte konkretno i mjerljivo ciljno stanje. Ne "smanjiti škart" nego "smanjiti s 4,7% na ispod 1%".' },
              { n: 'Akcijski plan', t: 'Za svaki korijenski uzrok: konkretna akcija, odgovorna osoba, rok. Ovo su radnje koje adresiraju uzrok, ne simptom.' },
              { n: 'Provjera rezultata', t: 'Jesu li akcije dale željene rezultate? Usporedite postignuto s ciljnim. Ako cilj nije postignut — vraćate se na korak 4.' },
              { n: 'Standardizacija', t: 'Ako je rješenje funkcioniralo — standardizirajte ga. Ažurirajte upute, vizualna pomagala, dokumentirajte lekcije.' },
            ].map((k, i) => (
              <div key={i} className="flex gap-4 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{k.n}</h3>
                  <p className="text-sm text-[#5a5a5a]">{k.t}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-orange-600 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremi za A3 analizu?</h3>
          <p className="text-orange-100 text-sm mb-6">Koristite naš digitalni A3 obrazac s pohranom u portal.</p>
          <Link href="/alati/a3-obrazac" className="inline-block bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">Pokreni A3 Obrazac →</Link>
        </div>
      </div>
    </div>
  );
}
