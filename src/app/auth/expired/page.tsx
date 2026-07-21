"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ExpiredPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/prijava'; return; }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/prijava';
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center">

        {/* Logo */}
        <div className="w-16 h-16 bg-[#e8f5f0] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-2xl text-[#1a7a5e] font-bold">L°</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          ⏰ Vaš besplatni trial je istekao
        </div>

        <h1 className="font-serif text-3xl text-[#1a1a1a] mb-3">
          Nastavite s Leanopedija PRO
        </h1>
        <p className="text-[#5a5a5a] text-base leading-relaxed mb-6">
          Vaši podaci su sigurni i sačuvani. Aktivirajte PRO plan da nastavite koristiti sve alate i pristupite svojoj povijesti.
        </p>

        {/* Što dobiješ */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 mb-6 text-left">
          <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-3">PRO plan uključuje</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              '✅ Neograničeno spremanje',
              '✅ PDF izvještaji',
              '✅ KPI grafovi i trendovi',
              '✅ Svih 9 Lean alata',
              '✅ Povijest i pretraživanje',
              '✅ Akcijski planovi',
            ].map(f => (
              <p key={f} className="text-xs text-[#5a5a5a]">{f}</p>
            ))}
          </div>
        </div>

        {/* Cijena */}
        <div className="bg-[#1a7a5e] rounded-2xl p-6 mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-bold text-white">€29,99</span>
            <span className="text-[#a8d5c5] text-sm">/mjesec</span>
          </div>
          <p className="text-[#a8d5c5] text-xs">Otkažite kad god želite. Bez ugovora.</p>
        </div>

        {/* Gumbi */}
        <div className="space-y-3">
          <button onClick={handleCheckout} disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin"/> : null}
            {loading ? 'Preusmjeravam...' : 'Aktiviraj PRO — €29,99/mj →'}
          </button>
          <Link href="/profil"
            className="block w-full py-3 border-2 border-[#e2e2e2] text-[#5a5a5a] font-semibold rounded-xl hover:border-[#1a7a5e] hover:text-[#1a7a5e] transition-all text-center text-sm">
            Pogledaj profil i pretplatu
          </Link>
          <button onClick={handleSignOut}
            className="block w-full py-2 text-xs text-[#9a9a9a] hover:text-[#dc2626] transition-colors text-center">
            Odjavi se
          </button>
        </div>

        <p className="text-xs text-[#9a9a9a] mt-6">
          Imate pitanja? Pišite nam na{' '}
          <a href="mailto:info@leanopedija.hr" className="text-[#1a7a5e] hover:underline">info@leanopedija.hr</a>
        </p>
      </div>
    </div>
  );
}
