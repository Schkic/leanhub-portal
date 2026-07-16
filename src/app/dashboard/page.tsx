"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [recentGemba, setRecentGemba] = useState<any[]>([]);
  const [recentA3, setRecentA3] = useState<any[]>([]);
  const [recentZasto, setRecentZasto] = useState<any[]>([]);
  const [recentOEE, setRecentOEE] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const { data: audits } = await supabase.from('audits_5s')
        .select('id, created_at, firma, lokacija, total_score, datum')
        .order('created_at', { ascending: false }).limit(2);
      setRecentAudits(audits || []);

      const { data: gemba } = await supabase.from('gemba_walk')
        .select('id, created_at, voditelj, lokacija, datum')
        .order('created_at', { ascending: false }).limit(2);
      setRecentGemba(gemba || []);

      const { data: a3 } = await supabase.from('a3_obrazac')
        .select('id, created_at, naslov, vlasnik, datum_otvaranja, odjel')
        .order('created_at', { ascending: false }).limit(2);
      setRecentA3(a3 || []);

      const { data: zasto } = await supabase.from('pet_zasto')
        .select('id, created_at, voditelj, odjel, datum, kategorija')
        .order('created_at', { ascending: false }).limit(2);
      setRecentZasto(zasto || []);

      const { data: oee } = await supabase.from('oee_kalkulator')
        .select('id, created_at, pogon, period, odgovorna_osoba, strojevi')
        .order('created_at', { ascending: false }).limit(2);
      setRecentOEE(oee || []);

      setLoading(false);
    };
    getData();
  }, [router]);

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-[#dcfce7] text-[#16a34a]';
    if (score >= 60) return 'bg-[#fef9c3] text-[#ca8a04]';
    return 'bg-[#fee2e2] text-[#dc2626]';
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

        <div className="mb-12">
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-2">
            Dobrodošli, {user?.user_metadata?.full_name || 'Korisniče'}
          </h1>
          <p className="text-[#5a5a5a]">Vaš Lean upravljački centar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">

            {/* Alati — 2x3 grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <a href="/alati/5s-audit" className="bg-white border border-[#e2e2e2] p-5 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-[#e8f5f0] text-[#1a7a5e] rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform">📋</div>
                <h3 className="text-sm font-bold mb-1">Novi 5S Audit</h3>
                <p className="text-xs text-[#5a5a5a]">Provjera čistoće i organizacije.</p>
              </a>
              <a href="/alati/gemba-walk" className="bg-white border border-[#e2e2e2] p-5 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform">🚶</div>
                <h3 className="text-sm font-bold mb-1">Novi Gemba Walk</h3>
                <p className="text-xs text-[#5a5a5a]">Zapažanja i akcijski plan.</p>
              </a>
              <a href="/alati/a3-obrazac" className="bg-white border border-[#e2e2e2] p-5 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform">📄</div>
                <h3 className="text-sm font-bold mb-1">Novi A3 Obrazac</h3>
                <p className="text-xs text-[#5a5a5a]">Strukturirano rješavanje problema.</p>
              </a>
              <a href="/alati/5-zasto" className="bg-white border border-[#e2e2e2] p-5 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform">❓</div>
                <h3 className="text-sm font-bold mb-1">Nova 5x Zašto</h3>
                <p className="text-xs text-[#5a5a5a]">Pronađite korijenski uzrok.</p>
              </a>
              <a href="/alati/oee-kalkulator" className="bg-white border border-[#e2e2e2] p-5 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-sm font-bold mb-1">Novi OEE Izračun</h3>
                <p className="text-xs text-[#5a5a5a]">Učinkovitost opreme i strojeva.</p>
              </a>
            </div>

            {recentAudits.length > 0 && (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">Nedavni 5S auditi</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-3">
                  {recentAudits.map((audit) => (
                    <a key={audit.id} href={`/povijest/${audit.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all group">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreColor(audit.total_score)}`}>{audit.total_score}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1a1a] truncate">{audit.firma || 'Nenavedena firma'}</div>
                        <div className="text-xs text-[#9a9a9a]">{audit.lokacija} · {new Date(audit.datum).toLocaleDateString('hr-HR')}</div>
                      </div>
                      <span className="text-xs text-[#9a9a9a] group-hover:text-[#1a7a5e]">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {recentGemba.length > 0 && (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">Nedavni Gemba Walkovi</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-3">
                  {recentGemba.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🚶</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1a1a] truncate">{g.lokacija || 'Nenavedena lokacija'}</div>
                        <div className="text-xs text-[#9a9a9a]">{g.voditelj} · {g.datum ? new Date(g.datum).toLocaleDateString('hr-HR') : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentA3.length > 0 && (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">Nedavni A3 obrasci</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-3">
                  {recentA3.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-lg">📄</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1a1a] truncate">{a.naslov || 'Bez naslova'}</div>
                        <div className="text-xs text-[#9a9a9a]">{a.odjel || '—'} · {a.datum_otvaranja ? new Date(a.datum_otvaranja).toLocaleDateString('hr-HR') : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentZasto.length > 0 && (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">Nedavne 5x Zašto analize</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-3">
                  {recentZasto.map((z) => (
                    <div key={z.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg">❓</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1a1a] truncate">{z.odjel || 'Nenavedeni odjel'}</div>
                        <div className="text-xs text-[#9a9a9a]">{z.kategorija} · {z.datum ? new Date(z.datum).toLocaleDateString('hr-HR') : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentOEE.length > 0 && (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">Nedavni OEE izračuni</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-3">
                  {recentOEE.map((o) => (
                    <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg">📊</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1a1a1a] truncate">{o.pogon || 'Nenavedeni pogon'}</div>
                        <div className="text-xs text-[#9a9a9a]">{o.period || '—'} · {Array.isArray(o.strojevi) ? o.strojevi.length : 0} {Array.isArray(o.strojevi) && o.strojevi.length === 1 ? 'stroj' : 'strojeva'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status sidebar */}
          <div>
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
                  <button onClick={handleUpgrade} className="w-full py-2.5 bg-[#1a7a5e] text-white text-sm font-bold rounded-xl hover:bg-[#155f49] transition-all">
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
