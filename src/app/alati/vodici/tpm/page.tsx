import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicTPMPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4"><ArrowLeft size={16}/> Natrag na alate</Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full mb-3">🛠️ Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">TPM — Autonomno održavanje</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">CILT checklista za svakodnevnu brigu o stroju — nula kvarova, nula gubitaka.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Početna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 7 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je TPM (Total Productive Maintenance)?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">TPM je Lean pristup održavanju koji iz "posla održavanja" pravi zajedničku odgovornost cijele proizvodnje. Umjesto da se kvar čeka i popravlja, operateri svakodnevno brinu o svom stroju — čišćenjem, inspekcijom i osnovnim održavanjem — i tako sprječavaju kvarove prije nego što se dogode.</p>
          <p className="text-[#5a5a5a] leading-relaxed">Razvijena je u Japanu krajem 1960-ih, a cilj je sažet u tri "nule": <strong className="text-[#1a1a1a]">nula kvarova, nula gubitaka i nula nesreća</strong>.</p>
        </section>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">TPM ≠ posao samo za održavanje</p>
              <p className="text-sm text-red-700 leading-relaxed">Operater koji svaki dan radi na stroju poznaje ga bolje od bilo koga. On prvi primijeti neobičan zvuk, curenje ulja ili labav vijak — puno prije nego što to postane kvar koji zaustavlja proizvodnju.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Autonomno održavanje — temelj TPM-a</h2>
          <p className="text-[#5a5a5a] leading-relaxed">Operateri preuzimaju osnovne zadatke održavanja — čišćenje, podmazivanje, pritezanje, vizualnu inspekciju — koje ne zahtijevaju specijalističko znanje. Odjel održavanja se time oslobađa za složenije popravke i unapređenja, umjesto da gasi požare. Rezultat: manje neplaniranih zastoja, duži vijek trajanja opreme.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">CILT checklista — 5 koraka</h2>
          <div className="space-y-4">
            {[
              { e: '🧹', n: 'Čišćenje (Clean)', t: 'Čišćenje nije samo estetika — to je inspekcija kroz čišćenje. Brišući prašinu i ulje, operater primijeti curenje ili oštećenje koje bi inače ostalo skriveno.', c: '#2563eb', bg: '#eff6ff' },
              { e: '🔍', n: 'Inspekcija (Inspect)', t: 'Vizualna provjera curenja ulja i zraka, neobičnih zvukova ili vibracija, te stanja indikatora i mjerača.', c: '#7c3aed', bg: '#f5f3ff' },
              { e: '🛢️', n: 'Podmazivanje (Lubricate)', t: 'Provjera razina ulja i maziva te podmazivanje prema rasporedu proizvođača opreme.', c: '#ca8a04', bg: '#fefce8' },
              { e: '🔧', n: 'Pritezanje (Tighten)', t: 'Vibracije tijekom rada vremenom olabave vijke i spojeve. Redovita provjera sprječava labavost koja može prerasti u kvar.', c: '#1a7a5e', bg: '#e8f5f0' },
              { e: '⚠️', n: 'Sigurnost', t: 'Provjera da su sigurnosni štitnici na mjestu i da zaustavni sustavi (E-stop) funkcioniraju. Ovaj korak se nikad ne preskače.', c: '#dc2626', bg: '#fef2f2' },
            ].map((k) => (
              <div key={k.n} className="flex gap-4 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: k.bg }}>{k.e}</div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: k.c }}>{k.n}</h3>
                  <p className="text-sm text-[#5a5a5a]">{k.t}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">✅</span>
            <div>
              <p className="text-sm font-bold text-green-800 mb-1">Praktični savjet</p>
              <p className="text-sm text-green-700 leading-relaxed">Krenite s malim brojem stavki po kategoriji (2–3) i jednim strojem. CILT checklista koja traje 5 minuta i stvarno se provodi svaki dan vrijedi puno više od detaljne checkliste koju nitko ne stigne ispuniti.</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Šest velikih gubitaka opreme</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">TPM klasično povezuje gubitke opreme s <Link href="/alati/vodici/oee" className="text-red-700 font-semibold hover:underline">OEE-om</Link> kroz "šest velikih gubitaka". Dosljedno provođenje CILT checkliste direktno smanjuje prva tri uzroka.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { n: 'Kvarovi', o: 'Neplanirani zastoji zbog loma ili otkaza opreme' },
              { n: 'Podešavanja i izmjene alata', o: 'Vrijeme izgubljeno na setup i changeover' },
              { n: 'Mali zastoji i rad u prazno', o: 'Kratki zastoji ispod minute koji se često ni ne bilježe' },
              { n: 'Smanjena brzina', o: 'Stroj radi sporije od nominalnog kapaciteta' },
              { n: 'Greške u procesu', o: 'Škart i rework tijekom stabilnog rada' },
              { n: 'Gubici pri pokretanju', o: 'Smanjen prinos dok se proces stabilizira nakon pokretanja' },
            ].map(g => (
              <div key={g.n} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{g.n}</p>
                <p className="text-xs text-[#5a5a5a]">{g.o}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-red-600 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremni za CILT checklistu?</h3>
          <p className="text-red-100 text-sm mb-6">Digitalna TPM checklista s automatskim izračunom postotka ispravnosti i akcijskim planom.</p>
          <Link href="/alati/tpm" className="inline-block bg-white text-red-700 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-all">Pokreni TPM checklistu →</Link>
        </div>
      </div>
    </div>
  );
}
