import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Vodic5SPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] transition-colors mb-4">
            <ArrowLeft size={16}/> Natrag na alate
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">5S metodologija</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">
            Kompletni vodič za razumijevanje i implementaciju 5S metodologije u vašem pogonu.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Početna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 10 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">

        {/* Što je 5S */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je 5S?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">
            5S je metodologija organizacije radnog mjesta koja potječe iz Japana i Toyota Production Systema. Naziv dolazi od pet japanskih riječi koje opisuju korake implementacije — a svaka počinje slovom S.
          </p>
          <p className="text-[#5a5a5a] leading-relaxed">
            Cilj 5S-a nije samo urednost — cilj je <strong className="text-[#1a1a1a]">stvoriti radno okruženje u kojem su problemi vidljivi, gubici eliminirani i standardi poštovani</strong>. 5S je temelj vizualnog managementa i preduvjet za sve ostale Lean alate.
          </p>
        </section>

        {/* Callout */}
        <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-[#1a7a5e] mb-1">Zašto početi s 5S?</p>
              <p className="text-sm text-[#5a5a5a] leading-relaxed">
                Svaki Lean stručnjak će vam reći: počnite s 5S. Razlog je jednostavan — neuređeno radno mjesto krije probleme, usporava rad i demotivira radnike. 5S čini sve ostale gubitke <strong>vidljivima</strong> pa ih možete rješavati.
              </p>
            </div>
          </div>
        </div>

        {/* Pet koraka */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Pet S koraka</h2>
          <div className="space-y-4">
            {[
              {
                s: 'S1', naziv: 'Sortiranje (Seiri)', podnaziv: 'Ukloni nepotrebno',
                opis: 'Prvim korakom prolazite kroz sve predmete na radnom mjestu i odlučujete: treba li nam ovo ili ne? Sve što nije potrebno za obavljanje posla — uklanjate, arhivirate ili bacate.',
                prakticno: 'Koristite "crvene kartice" (red tags) — zalijepite crvenu karticu na sve što je upitno i odložite u posebnu zonu. Tim zatim odlučuje što s tim predmetima.',
                color: 'bg-red-50 border-red-200', numColor: 'bg-red-500',
              },
              {
                s: 'S2', naziv: 'Sređivanje (Seiton)', podnaziv: 'Mjesto za sve, sve na svom mjestu',
                opis: 'Nakon sortiranja, svaki preostali predmet dobiva točno određeno i označeno mjesto. Alati moraju biti dostupni na točci upotrebe, a njihov položaj jasno vizualno označen.',
                prakticno: 'Koristite konture alata (shadow boards), oznake boja, etikete. Ako alat nije na svom mjestu — odmah je vidljivo da nešto nedostaje.',
                color: 'bg-orange-50 border-orange-200', numColor: 'bg-orange-500',
              },
              {
                s: 'S3', naziv: 'Čišćenje (Seiso)', podnaziv: 'Čisti i inspiciraš',
                opis: 'Čišćenje nije samo estetika — čišćenje je inspekcija. Dok čistite stroj, otkrivate curenja ulja, labave vijke, oštećenja koja bi inače ostala skrivena do kvara.',
                prakticno: 'Napravite raspored čišćenja s jasnim odgovornostima. Operateri su odgovorni za čišćenje svog radnog mjesta — to je početak autonomnog održavanja (TPM).',
                color: 'bg-yellow-50 border-yellow-200', numColor: 'bg-yellow-500',
              },
              {
                s: 'S4', naziv: 'Standardizacija (Seiketsu)', podnaziv: 'Standardiziraj i vizualiziraj',
                opis: 'Bez standarda, 5S se raspadne za tjedan dana. Standardizacija znači dokumentiranje "idealnog stanja" — fotografije, upute, rasporedi — i osiguravanje da svi znaju što se od njih očekuje.',
                prakticno: 'Fotografirajte idealno stanje radnog mjesta i istaknite fotku na vidljivo mjesto. To je vaš standard — svako odstupanje je odmah vidljivo.',
                color: 'bg-blue-50 border-blue-200', numColor: 'bg-blue-500',
              },
              {
                s: 'S5', naziv: 'Samodisciplina (Shitsuke)', podnaziv: 'Održavaj i poboljšavaj',
                opis: 'Peti S je najteži — kultura. Cilj je da 5S postane navika, a ne posebna aktivnost. Radnici sami održavaju standarde bez podsjetnika, a redoviti auditi potvrđuju razinu.',
                prakticno: 'Provodite redovite 5S audite (minimalno jednom mjesečno), rezultate javno objavite i slavite napredak.',
                color: 'bg-[#e8f5f0] border-[#1a7a5e]/30', numColor: 'bg-[#1a7a5e]',
              },
            ].map(korak => (
              <div key={korak.s} className={`border rounded-xl p-5 ${korak.color}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${korak.numColor} text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0`}>{korak.s}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-0.5">{korak.naziv}</h3>
                    <p className="text-xs font-semibold text-[#5a5a5a] mb-2 italic">{korak.podnaziv}</p>
                    <p className="text-sm text-[#5a5a5a] leading-relaxed mb-3">{korak.opis}</p>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs font-bold text-[#1a1a1a] mb-1">💡 Praktično:</p>
                      <p className="text-xs text-[#5a5a5a] leading-relaxed">{korak.prakticno}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Česte greške */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Česte greške pri uvođenju 5S</h2>
          <div className="space-y-3">
            {[
              { greška: '5S kao prolazni projekt', opis: '5S nije jednokratna akcija čišćenja. To je trajna promjena načina rada. Ako vodstvo ne podrži kontinuirano, sve se vraća na staro.' },
              { greška: 'Preskakanje S4 i S5', opis: 'Većina pogona napravi S1–S3 (očisti), ali ne standardizira ni ne gradi kulturu. Bez S4 i S5, 5S ne traje.' },
              { greška: 'Top-down bez uključivanja radnika', opis: '5S mora biti inicijativa operatera, ne samo menadžmenta. Radnici koji su uključeni u dizajn rješenja ih i poštuju.' },
              { greška: 'Fokus na izgled, ne na funkciju', opis: '5S nije o tome da izgleda lijepo za posjete — nego o tome da se radi učinkovitije i sigurnije.' },
            ].map(g => (
              <div key={g.greška} className="flex gap-3 bg-white border border-[#e2e2e2] rounded-xl p-4">
                <span className="text-red-500 font-bold text-lg shrink-0">✕</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-0.5">{g.greška}</p>
                  <p className="text-sm text-[#5a5a5a]">{g.opis}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mjerenje */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Kako mjeriti uspješnost 5S?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">
            Koristite strukturirani 5S audit obrazac koji ocjenjuje svaki od pet S-ova na skali 0–4. Ukupni rezultat na 100 bodova daje vam objektivnu sliku stanja:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { raspon: '0–40', ocjena: 'Kritično', boja: 'bg-red-50 border-red-200 text-red-700' },
              { raspon: '41–60', ocjena: 'Osnovno', boja: 'bg-orange-50 border-orange-200 text-orange-700' },
              { raspon: '61–80', ocjena: 'Dobro', boja: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { raspon: '81–100', ocjena: 'Izvrsno (World Class)', boja: 'bg-[#e8f5f0] border-[#1a7a5e]/20 text-[#1a7a5e]' },
            ].map(b => (
              <div key={b.raspon} className={`border rounded-xl p-4 ${b.boja}`}>
                <p className="text-lg font-bold">{b.raspon}</p>
                <p className="text-sm font-semibold">{b.ocjena}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#1a7a5e] rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremi za provedbu 5S audita?</h3>
          <p className="text-[#a8d5c5] text-sm mb-6">Koristite naš digitalni obrazac s automatskim izračunom rezultata i PDF izvozom.</p>
          <Link href="/alati/5s-audit"
            className="inline-block bg-white text-[#1a7a5e] px-8 py-3 rounded-xl font-bold hover:bg-[#f0f9f5] transition-all">
            Pokreni 5S Audit →
          </Link>
        </div>

      </div>
    </div>
  );
}
