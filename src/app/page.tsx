export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="max-w-[1100px] mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#e8f5f0] text-[#1a7a5e] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          Novi način upravljanja Lean procesima
        </div>
        <h1 className="font-serif text-5xl text-[#1a1a1a] mb-6 leading-[1.1]">
          Dobrodošli na <em className="text-[#1a7a5e] not-italic">Leanopedija Portal</em>
        </h1>
        <p className="text-lg text-[#5a5a5a] max-w-[700px] mx-auto mb-10 leading-relaxed">
          Vaši omiljeni Lean alati sada su pametniji. Spremajte podatke, pratite napredak kroz vrijeme i generirajte profesionalne izvještaje jednim klikom.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/alati/5s-audit" className="bg-[#1a7a5e] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#1a7a5e]/20 hover:bg-[#155f49] transition-all">
            Isprobaj 5S Audit →
          </a>
          <a href="/registracija" className="bg-white text-[#1a1a1a] border border-[#e2e2e2] px-8 py-3.5 rounded-xl font-semibold hover:bg-[#fafaf8] transition-all">
            Besplatna registracija
          </a>
        </div>
      </section>

      <section className="bg-[#fafaf8] py-20 border-y border-[#e2e2e2]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e2e2e2]">
              <div className="text-3xl mb-4">💾</div>
              <h3 className="text-lg font-bold mb-2">Trajna pohrana</h3>
              <p className="text-sm text-[#5a5a5a]">Zaboravite na gubitak podataka. Svi vaši auditi su sigurno spremljeni u oblaku i dostupni s bilo kojeg uređaja.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e2e2]">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-bold mb-2">Praćenje trendova</h3>
              <p className="text-sm text-[#5a5a5a]">Vizualizirajte napredak vašeg pogona. Automatski grafovi pokazuju kako se vaša Lean kultura razvija.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e2e2]">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-bold mb-2">Timski rad</h3>
              <p className="text-sm text-[#5a5a5a]">Podijelite pristup s kolegama, dodjeljujte zadatke i pratite rokove za korektivne akcije na jednom mjestu.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
