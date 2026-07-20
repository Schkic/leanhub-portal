import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VodicVSMPage() {
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[800px] mx-auto">
          <Link href="/alati" className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] mb-4">
            <ArrowLeft size={16}/> Natrag na alate
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">📖 Vodič</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">VSM — Value Stream Mapping</h1>
          <p className="text-[#5a5a5a] text-base leading-relaxed">Kompletni vodič za razumijevanje i crtanje mape toka vrijednosti — od dobavljača do kupca.</p>
          <div className="flex gap-3 mt-4">
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">Napredna razina</span>
            <span className="text-xs font-semibold text-[#5a5a5a] bg-[#f0f0f0] px-3 py-1 rounded-full">⏱️ 15 min čitanja</span>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">

        {/* Što je VSM */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Što je Value Stream Mapping?</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">
            VSM (Value Stream Mapping) je vizualna tehnika koja prikazuje <strong className="text-[#1a1a1a]">cijeli tok materijala i informacija</strong> kroz proizvodni proces — od dobavljača sirovina do isporuke gotovog proizvoda kupcu.
          </p>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">
            Razvila ga je Toyota kao dio Toyota Production Systema. U knjizi <em>"Learning to See"</em> (Rother & Shook, 1998.) VSM je populariziran kao temeljni Lean alat za identificiranje gubitaka u cijelom toku vrijednosti — ne samo na jednoj operaciji.
          </p>
          <p className="text-[#5a5a5a] leading-relaxed">
            Ključna razlika od procesnog mapiranja: VSM prikazuje <strong className="text-[#1a1a1a]">i materijalni i informacijski tok</strong>, uključuje podatke o vremenu, zalihama i učinkovitosti, te jasno razdvaja aktivnosti koje dodaju vrijednost (VA) od onih koje ne dodaju (NVA).
          </p>
        </section>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">Ključna spoznaja VSM-a</p>
              <p className="text-sm text-blue-700 leading-relaxed">Tipični proizvod u batch proizvodnji provede <strong>95% vremena čekajući</strong> — u zalihama, redovima, transportu. Samo 5% vremena se stvarno radi na njemu. VSM to čini vidljivim i mjerljivim.</p>
            </div>
          </div>
        </div>

        {/* Kada koristiti */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Kada koristiti VSM?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: '✅ Koristite VSM kada...', stavke: ['Dugo lead time u usporedbi s vremenom obrade', 'Visoke zalihe međuproizvoda (WIP)', 'Česta čekanja između operacija', 'Kupac se žali na isporučne rokove', 'Pokrenuti Lean transformaciju', 'Identificirati prioritetna poboljšanja'], c: 'bg-green-50 border-green-200' },
              { t: '❌ VSM nije pravo rješenje za...', stavke: ['Poboljšanje jedne operacije (koristite SMED, 5S)', 'Analizu kvalitete (koristite Ishikawa, A3)', 'Brzo rješavanje problema (koristite 5x Zašto)', 'Visoko varijabilne procese s puno SKU-ova'], c: 'bg-red-50 border-red-200' },
            ].map(b => (
              <div key={b.t} className={`border rounded-xl p-4 ${b.c}`}>
                <p className="text-sm font-bold text-[#1a1a1a] mb-3">{b.t}</p>
                {b.stavke.map((s, i) => <p key={i} className="text-xs text-[#5a5a5a] flex gap-2 mb-1"><span className="shrink-0">•</span>{s}</p>)}
              </div>
            ))}
          </div>
        </section>

        {/* Dva stanja */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Dvije mape — Current State i Future State</h2>
          <div className="space-y-3">
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5">
              <h3 className="text-base font-bold text-[#1a1a1a] mb-2">1. Current State Map (Trenutno stanje)</h3>
              <p className="text-sm text-[#5a5a5a] leading-relaxed">Prikazuje <strong>kako proces funkcionira danas</strong> — sa svim gubicima, zalihama, čekanjima. Crta se na temelju stvarnih mjerenja na Gembi, ne prema procedurama ili pretpostavkama. Ovo je vaša polazna točka.</p>
            </div>
            <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#1a1a1a] mb-2">2. Future State Map (Buduće stanje)</h3>
              <p className="text-sm text-[#5a5a5a] leading-relaxed">Prikazuje <strong>kako bi proces trebao izgledati</strong> nakon eliminacije identificiranih gubitaka. Ovo nije utopija — nego realistični cilj koji se može postići u 6–12 mjeseci kroz Kaizen aktivnosti.</p>
            </div>
          </div>
        </section>

        {/* Simboli */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">VSM simboli — standardni jezik</h2>
          <p className="text-[#5a5a5a] leading-relaxed mb-4">VSM koristi standardizirani skup simbola koji svi Lean stručnjaci razumiju. Naš VSM Builder uključuje sve standardne simbole:</p>

          <div className="space-y-4">
            {[
              {
                g: 'Proces simboli',
                simboli: [
                  { s: '🏭', n: 'Dobavljač', o: 'Vanjski dobavljač sirovina ili komponenti. Uvijek na lijevom kraju mape.' },
                  { s: '👤', n: 'Kupac', o: 'Krajnji kupac ili sljedeći korak u lancu. Uvijek na desnom kraju mape.' },
                  { s: '⬜', n: 'Proces', o: 'Svaki korak u procesu koji transformira materijal. Sadrži podatke: C/T, C/O, smjene, dostupnost.' },
                  { s: '👷', n: 'Radnik/Operator', o: 'Broj operatera na procesu.' },
                  { s: '📋', n: 'Planiranje (PPC)', o: 'Odjel za planiranje i kontrolu proizvodnje — upravljački centar informacijskog toka.' },
                ]
              },
              {
                g: 'Materijalni tok',
                simboli: [
                  { s: '▲', n: 'Zaliha', o: 'Zalihe između procesa — WIP (Work In Progress). Prikazuje količinu i dane zaliha.' },
                  { s: '📦', n: 'Supermarket', o: 'Kontrolirani pull sustav zaliha. Materijal se povlači po potrebi, ne gura prema naprijed.' },
                  { s: '➡️', n: 'FIFO traka', o: 'First In, First Out — kontrolirani tok materijala bez nakupljanja zaliha.' },
                  { s: '🚚', n: 'Transport', o: 'Fizički transport materijala između lokacija — kamion, viličar, konvejer.' },
                ]
              },
              {
                g: 'Kanban simboli',
                simboli: [
                  { s: '🎴', n: 'Proizvodni kanban', o: 'Signal za pokretanje proizvodnje određene količine.' },
                  { s: '🔄', n: 'Povlačeći kanban', o: 'Signal za povlačenje materijala iz supermarketa.' },
                  { s: '🔺', n: 'Signalni kanban', o: 'Kanban koji se koristi s batch production — signal za ponovnu narudžbu.' },
                  { s: '📫', n: 'Kanban kutija', o: 'Mjesto gdje se sakupljaju kanban kartice.' },
                ]
              },
              {
                g: 'Kaizen i ostalo',
                simboli: [
                  { s: '⚡', n: 'Kaizen blic', o: 'Označava prilike za poboljšanje na Future State mapi. Gdje trebamo Kaizen event?' },
                  { s: '📏', n: 'Vremenska linija', o: 'Na dnu mape prikazuje VA (dodaje vrijednost) i NVA (ne dodaje vrijednost) segmente ukupnog lead timea.' },
                ]
              },
            ].map(grp => (
              <div key={grp.g} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
                <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-2">
                  <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider">{grp.g}</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0]">
                  {grp.simboli.map(s => (
                    <div key={s.n} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-2xl shrink-0 w-8 text-center">{s.s}</span>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a] mb-0.5">{s.n}</p>
                        <p className="text-xs text-[#5a5a5a]">{s.o}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tokovi */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Tipovi tokova (konekcija)</h2>
          <div className="space-y-2">
            {[
              { t: '→ Materijalni tok', o: 'Fizički tok materijala od dobavljača prema kupcu. Crna puna strijela.', c: 'border-l-4 border-[#1a1a1a]' },
              { t: '→ Push strijela', o: 'Materijal se gura prema sljedećem procesu bez obzira na potražnju. Narančasta strijela s kvadratićima.', c: 'border-l-4 border-yellow-500' },
              { t: '→ Pull (kanban)', o: 'Materijal se povlači na temelju potrošnje — signal kanban. Crvena isprekidana strijela.', c: 'border-l-4 border-red-500' },
              { t: '→ Informacijski tok', o: 'Ručni tok informacija — nalozi, rasporedi, faksovi. Zelena isprekidana strijela.', c: 'border-l-4 border-[#1a7a5e]' },
              { t: '⚡→ Elektronički tok', o: 'Elektronički tok informacija — ERP, email, EDI. Plava strijela s munjom.', c: 'border-l-4 border-blue-500' },
            ].map(k => (
              <div key={k.t} className={`bg-white border border-[#e2e2e2] rounded-xl p-4 ${k.c}`}>
                <p className="text-sm font-bold text-[#1a1a1a] mb-0.5">{k.t}</p>
                <p className="text-xs text-[#5a5a5a]">{k.o}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Korak po korak */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-6">Kako nacrtati VSM — korak po korak</h2>
          <div className="space-y-3">
            {[
              { k: '1', n: 'Odaberite obitelj proizvoda', t: 'VSM se radi za jednu obitelj proizvoda koja prolazi kroz slične procese. Nemojte mapirati cijeli pogon odjednom — odaberite jedan tok.', savjet: 'Koristite matricu obitelji proizvoda (proces × SKU) da identificirate grupe.' },
              { k: '2', n: 'Idite na Gembu i mjerite', t: 'Ne crtajte iz memorije ili iz dokumentacije. Hodajte procesom s papirom i štopericom. Mjerite stvarne C/T, C/O, prebrojite zalihe.', savjet: 'Počnite od kupca i idite unatrag prema dobavljaču — tako lakše vidite pull vs push.' },
              { k: '3', n: 'Nacrtajte Current State', t: 'Počnite s kupcem (desno) i dobavljačem (lijevo). Dodajte procese, zalihe između njih, informacijske tokove odozgo.', savjet: 'Koristite olovku — VSM se uvijek crtka, nikad ne ide iz prve.' },
              { k: '4', n: 'Dodajte vremensku liniju', t: 'Na dnu mape dodajte VA i NVA segmente. VA = vrijeme obrade na procesu. NVA = čekanje u zalihama. Zbrojite ukupni lead time.', savjet: 'Tipični omjer: VA < 5% ukupnog lead timea. To je vaša prilika.' },
              { k: '5', n: 'Analizirajte gubitke', t: 'Gdje su najveće zalihe? Gdje je push a treba biti pull? Koji procesi imaju loš OEE? Dodajte Kaizen bliceve na mjesta poboljšanja.', savjet: 'Fokusirajte se na bottleneck — proces koji ograničava cijeli tok.' },
              { k: '6', n: 'Nacrtajte Future State', t: 'Dizajnirajte idealno stanje bez identificiranih gubitaka. Koristite Lean principe: kontinuirani tok, pull sustav, takt time.', savjet: 'Future State treba biti dostižan u 6–12 mjeseci — ne utopija.' },
              { k: '7', n: 'Kreirajte plan implementacije', t: 'Future State je cilj — sada definirajte konkretne Kaizen projekte, prioritete i rokove koji će vas dovesti tamo.', savjet: 'Svaki Kaizen blic na Future State mapi postaje jedan Kaizen event.' },
            ].map(k => (
              <div key={k.k} className="bg-white border border-[#e2e2e2] rounded-xl p-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{k.k}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{k.n}</h3>
                    <p className="text-sm text-[#5a5a5a] mb-2">{k.t}</p>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-700"><span className="font-bold">💡 Savjet:</span> {k.savjet}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Takt time */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Takt time — ritam kupca</h2>
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-5">
            <p className="text-sm text-[#5a5a5a] leading-relaxed mb-4">Takt time je tempo kojim kupac troši vaš proizvod — koliko sekundi je između svake narudžbe. Ovo je "otkucaj srca" vašeg procesa.</p>
            <div className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-4 font-mono text-center">
              <p className="text-sm font-bold text-[#1a1a1a]">Takt time = Raspoloživo radno vrijeme / Potražnja kupca</p>
              <p className="text-xs text-[#9a9a9a] mt-2">Primjer: 27.600 s / dan ÷ 460 kom / dan = 60 s / kom</p>
            </div>
            <p className="text-sm text-[#5a5a5a] mt-4 leading-relaxed">Ako je C/T procesa manji od takt timea — sve je dobro. Ako je veći — imate bottleneck koji usporava cijeli tok.</p>
          </div>
        </section>

        {/* Česte greške */}
        <section>
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Česte greške pri VSM-u</h2>
          <div className="space-y-3">
            {[
              { g: 'Crtanje iz dokumentacije, ne s Gembe', o: 'VSM mora prikazivati stvarno stanje, ne kako mislimo da proces radi. Uvijek idite mjeriti.' },
              { g: 'Preveliki scope', o: 'Mapiranje cijelog pogona ili tvornice odjednom je prezahtjevno. Počnite s jednom obitelji proizvoda.' },
              { g: 'Fokus na detalje pojedinih operacija', o: 'VSM je mapa toka, ne detaljni procesni dijagram. Svaki proces je jedna kutija — ne trebate svaki korak unutar procesa.' },
              { g: 'Zanemarivanje informacijskog toka', o: 'Gornji dio mape (informacijski tok) jednako je važan kao i materijalni. Loš informacijski tok uzrokuje prekomjernu proizvodnju i zalihe.' },
              { g: 'Future State kao utopija', o: 'Future State mora biti realistično dostižan u 6–12 mjeseci. Preveliki skok se nikad ne realizira.' },
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

        {/* CTA */}
        <div className="bg-blue-700 rounded-2xl p-6 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Spremi za crtanje VSM-a?</h3>
          <p className="text-blue-200 text-sm mb-6">Naš VSM Builder ima sve standardne simbole i tipove tokova — online, bez instalacije.</p>
          <Link href="/alati/vsm-builder" className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
            Otvori VSM Builder →
          </Link>
        </div>

      </div>
    </div>
  );
}
