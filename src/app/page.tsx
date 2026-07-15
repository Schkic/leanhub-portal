import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fafaf8', color: '#1a1a1a' }}>

      {/* HERO */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a7a5e', marginBottom: 14 }}>
          Leanopedija App
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, lineHeight: 1.15, color: '#1a1a1a', marginBottom: 16 }}>
          Vaši Lean alati,{' '}
          <em style={{ fontStyle: 'italic', color: '#1a7a5e' }}>sada pametni</em>
        </h1>
        <p style={{ fontSize: 16, color: '#5a5a5a', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
          Spremajte rezultate audita, pratite napredak kroz vrijeme i generirajte profesionalne izvještaje — sve na jednom mjestu.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <Link href="/registracija" style={{ background: '#1a7a5e', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Registriraj se besplatno →
          </Link>
          <Link href="/prijava" style={{ background: 'white', color: '#1a1a1a', border: '1px solid #e2e2e2', padding: '10px 24px', borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
            Prijava
          </Link>
        </div>
        <p style={{ fontSize: 13, color: '#9a9a9a', fontStyle: 'italic' }}>
          Besplatni Lean alati i dalje su dostupni na{' '}
          <a href="https://leanopedija.hr" style={{ color: '#1a7a5e' }}>leanopedija.hr</a>
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e8f5f0', color: '#1a7a5e', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginTop: 16 }}>
          🎁 1 mjesec besplatno, zatim €29,99/mj — otkažite unutar 30 dana
        </div>
      </section>

      <hr style={{ maxWidth: 1100, margin: '0 auto', border: 'none', borderTop: '1px solid #e2e2e2' }} />

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: 6 }}>Što donosi App</p>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1a1a1a', marginBottom: 32 }}>
          Više od besplatnih alata
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { icon: '💾', title: 'Trajna pohrana', desc: 'Svi vaši auditi sigurno su spremljeni u oblaku i dostupni s bilo kojeg uređaja.' },
            { icon: '📊', title: 'KPI Dashboard', desc: 'Grafovi koji pokazuju napredak pogona i kako se Lean kultura razvija kroz vrijeme.' },
            { icon: '📄', title: 'PDF izvještaji', desc: 'Generirajte profesionalne izvještaje jednim klikom i dijelite ih s managementom.' },
            { icon: '🔁', title: 'Neograničeni auditi', desc: 'Bez ograničenja — radite onoliko audita i analiza koliko vam je potrebno.' },
            { icon: '🛠️', title: 'Svi Lean alati', desc: '5S audit, Gemba Walk, 5x Zašto, OEE, A3, Kaizen — sve s pohranom podataka.' },
            { icon: '🎯', title: 'Prioritetna podrška', desc: 'Izravna podrška za sve upite, prijedloge i tehničke probleme.' },
          ].map((f) => (
            <div key={f.title} style={{ background: 'white', border: '1px solid #e2e2e2', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ maxWidth: 1100, margin: '0 auto', border: 'none', borderTop: '1px solid #e2e2e2' }} />

      {/* PRICING */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: 6 }}>Planovi</p>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1a1a1a', marginBottom: 8 }}>
          Jednostavni i transparentni
        </h2>
        <p style={{ fontSize: 14, color: '#5a5a5a', marginBottom: 32 }}>Počnite besplatno, nadogradite kad budete spremni.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ background: 'white', border: '1px solid #e2e2e2', borderRadius: 14, padding: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: 8 }}>Free</p>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1a1a1a', marginBottom: 4 }}>€0</p>
            <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 24 }}>zauvijek besplatno</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Svi alati na leanopedija.hr', 'Vodiči i obrasci', 'PDF izvoz bez pohrane', 'Bez registracije'].map(item => (
                <li key={item} style={{ fontSize: 13, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1a7a5e', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <a href="https://leanopedija.hr" style={{ display: 'block', textAlign: 'center', background: '#fafaf8', color: '#1a1a1a', border: '1px solid #e2e2e2', padding: '10px 20px', borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              Idi na leanopedija.hr
            </a>
          </div>

          <div style={{ background: '#1a7a5e', borderRadius: 14, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'white', color: '#1a7a5e', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
              PREPORUČENO
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a8d5c5', marginBottom: 8 }}>PRO</p>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: 'white', marginBottom: 4 }}>€49,99</p>
            <p style={{ fontSize: 13, color: '#a8d5c5', marginBottom: 24 }}>mjesečno</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Neograničeni auditi s pohranom', 'KPI dashboard s grafovima', 'Napredni PDF izvještaji', 'Svi Lean alati', 'Prioritetna podrška'].map(item => (
                <li key={item} style={{ fontSize: 13, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#a8d5c5', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/registracija" style={{ display: 'block', textAlign: 'center', background: 'white', color: '#1a7a5e', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Isprobaj PRO →
            </Link>
          </div>
        </div>
      </section>

      <hr style={{ maxWidth: 1100, margin: '0 auto', border: 'none', borderTop: '1px solid #e2e2e2' }} />

      {/* CTA */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: '#1a1a1a', marginBottom: 12 }}>
          Spremni za početak?
        </h2>
        <p style={{ fontSize: 15, color: '#5a5a5a', marginBottom: 28 }}>
          Pridružite se Lean profesionalcima koji već koriste Leanopedija App.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <Link href="/registracija" style={{ background: '#1a7a5e', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Registriraj se besplatno →
          </Link>
          <Link href="/prijava" style={{ background: 'white', color: '#1a1a1a', border: '1px solid #e2e2e2', padding: '10px 24px', borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
            Prijava
          </Link>
        </div>
      </section>

    </div>
  )
}
