import Link from 'next/link';

export default function WallPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center">

        {/* Logo */}
        <div className="w-16 h-16 bg-[#e8f5f0] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-2xl text-[#1a7a5e] font-bold">L°</span>
        </div>

        <h1 className="font-serif text-3xl text-[#1a1a1a] mb-3">
          Leanopedija PRO
        </h1>
        <p className="text-[#5a5a5a] text-base leading-relaxed mb-8">
          Za korištenje Leanopedija aplikacije potrebno je prijaviti se.
          Besplatne alate možete koristiti na{' '}
          <a href="https://leanopedija.hr" className="text-[#1a7a5e] font-semibold hover:underline">
            leanopedija.hr
          </a>
          .
        </p>

        {/* Što dobiješ */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 mb-6 text-left">
          <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">Što uključuje PRO trial</p>
          <div className="space-y-3">
            {[
              { i: '💾', t: 'Spremanje rezultata', o: 'Svi vaši auditi, analize i prijedlozi pohranjeni na jednom mjestu' },
              { i: '📈', t: 'KPI Dashboard i trendovi', o: 'Pratite napredak kroz vrijeme s grafovima' },
              { i: '📄', t: 'PDF izvještaji', o: 'Profesionalni PDF izvoz svakog alata' },
              { i: '🗄️', t: 'Povijest i pretraživanje', o: 'Pristup svim prošlim zapisima' },
              { i: '🛠️', t: 'Svih 9 Lean alata', o: '5S, Gemba, A3, OEE, VSM, Ishikawa i više' },
            ].map(f => (
              <div key={f.t} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{f.i}</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{f.t}</p>
                  <p className="text-xs text-[#9a9a9a]">{f.o}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trial badge */}
        <div className="bg-[#e8f5f0] border border-[#1a7a5e]/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm font-bold text-[#1a7a5e]">🎁 14 dana besplatno — bez kartice</p>
          <p className="text-xs text-[#5a5a5a] mt-0.5">Nakon triala €29,99/mj. Otkažite kad god želite.</p>
        </div>

        {/* Gumbi */}
        <div className="space-y-3">
          <Link href="/registracija"
            className="block w-full py-3.5 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all text-center">
            Registriraj se — 14 dana besplatno →
          </Link>
          <Link href="/prijava"
            className="block w-full py-3.5 border-2 border-[#e2e2e2] text-[#1a1a1a] font-semibold rounded-xl hover:border-[#1a7a5e] hover:text-[#1a7a5e] transition-all text-center">
            Već imam račun — Prijavi se
          </Link>
          <a href="https://leanopedija.hr/alati"
            className="block w-full py-3 text-sm text-[#9a9a9a] hover:text-[#1a7a5e] transition-colors text-center">
            Besplatno isprobaj alate na leanopedija.hr →
          </a>
        </div>

        <p className="text-xs text-[#9a9a9a] mt-8">
          Leanopedija.hr pomaže vam isprobati Lean alate.<br/>
          Leanopedija PRO pomaže vam upravljati Lean sustavom.
        </p>
      </div>
    </div>
  );
}
