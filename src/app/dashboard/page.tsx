"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/prijava');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
      setLoading(false);
    };
    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a7a5e]"></div>
    </div>
  );

  const isPro = profile?.is_pro;

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl text-[#1a1a1a] mb-2">
              Dobrodošli, {user?.user_metadata?.full_name || 'Korisniče'}
            </h1>
            <p className="text-[#5a5a5a]">Vaš Lean upravljački centar</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all self-start md:self-center"
          >
            <LogOut size={18} /> Odjava
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Alati */}
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            <a href="/alati/5s-audit" className="bg-white border border-[#e2e2e2] p-8 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-[#e8f5f0] text-[#1a7a5e] rounded-xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform">📋</div>
              <h3 className="text-xl font-bold mb-2">Novi 5S Audit</h3>
              <p className="text-sm text-[#5a5a5a]">Provedite novu provjeru čistoće i organizacije radnog mjesta.</p>
            </a>
            <a href="/povijest" className="bg-white border border-[#e2e2e2] p-8 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold mb-2">Pregled povijesti</h3>
              <p className="text-sm text-[#5a5a5a]">Vratite se na stare audite i pratite napredak kroz vrijeme.</p>
            </a>
          </div>

          {/* Status sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
              <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">Vaš status</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#fafaf8] border border-[#e2e2e2] rounded-full flex items-center justify-center text-[#1a7a5e]">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1a1a1a]">{user?.email}</div>
                  {isPro ? (
                    <div className="text-[11px] text-[#1a7a5e] font-bold">PRO PLAN ✨</div>
                  ) : (
                    <div className="text-[11px] text-[#9a9a9a] font-bold">PROBNI PERIOD</div>
                  )}
                </div>
              </div>

              {isPro ? (
                <div className="bg-[#e8f5f0] text-[#1a7a5e] text-xs font-semibold px-4 py-3 rounded-xl text-center">
                  ✅ PRO plan aktivan
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#5a5a5a] leading-relaxed">
                    Isprobajte sve PRO funkcije <strong>besplatno 1 mjesec</strong>. Nakon toga €29,99/mj. Otkažite kad god želite.
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="w-full py-2.5 bg-[#1a7a5e] text-white text-sm font-bold rounded-xl hover:bg-[#155f49] transition-all"
                  >
                    Aktiviraj PRO — 1 mj. besplatno →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
