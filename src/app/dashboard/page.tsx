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
  const [recentKaizen, setRecentKaizen] = useState<any[]>([]);
  const [recentVSM, setRecentVSM] = useState<any[]>([]);
  const [recentIshikawa, setRecentIshikawa] = useState<any[]>([]);
  const [recentSMED, setRecentSMED] = useState<any[]>([]);
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

      const [a, g, a3, z, o, k, v, ish, smed] = await Promise.all([
        supabase.from('audits_5s').select('id, created_at, firma, lokacija, total_score, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('gemba_walk').select('id, created_at, voditelj, lokacija, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('a3_obrazac').select('id, created_at, naslov, vlasnik, datum_otvaranja, odjel').order('created_at', { ascending: false }).limit(2),
        supabase.from('pet_zasto').select('id, created_at, voditelj, odjel, datum, kategorija').order('created_at', { ascending: false }).limit(2),
        supabase.from('oee_kalkulator').select('id, created_at, pogon, period, strojevi').order('created_at', { ascending: false }).limit(2),
        supabase.from('kaizen_prijedlog').select('id, created_at, odjel, datum, kategorija, prioritet, status').order('created_at', { ascending: false }).limit(2),
        supabase.from('vsm_dijagram').select('id, created_at, naziv, elementi').order('created_at', { ascending: false }).limit(2),
        supabase.from('ishikawa').select('id, created_at, problem, odjel, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('smed').select('id, created_at, stroj, proces, datum, aktivnosti').order('created_at', { ascending: false }).limit(2),
      ]);

      setRecentAudits(a.data || []);
      setRecentGemba(g.data || []);
      setRecentA3(a3.data || []);
      setRecentZasto(z.data || []);
      setRecentOEE(o.data || []);
      setRecentKaizen(k.data || []);
      setRecentVSM(v.data || []);
      setRecentIshikawa(ish.data || []);
      setRecentSMED(smed.data || []);
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

  const alati = [
    { href: '/alati/5s-audit',        icon: '📋', label: 'Novi 5S Audit',        opis: 'Provjera čistoće i organizacije.',    bg: 'bg-[#e8f5f0] text-[#1a7a5e]' },
    { href: '/alati/gemba-walk',       icon: '🚶', label: 'Novi Gemba Walk',       opis: 'Zapažanja i akcijski plan.',          bg: 'bg-blue-50 text-blue-600' },
    { href: '/alati/a3-obrazac',       icon: '📄', label: 'Novi A3 Obrazac',       opis: 'Strukturirano rješavanje problema.',  bg: 'bg-orange-50 text-orange-600' },
    { href: '/alati/5-zasto',          icon: '❓', label: 'Nova 5x Zašto',         opis: 'Pronađite korijenski uzrok.',         bg: 'bg-red-50 text-red-600' },
    { href: '/alati/oee-kalkulator',   icon: '📊', label: 'Novi OEE Izračun',      opis: 'Učinkovitost opreme i strojeva.',     bg: 'bg-purple-50 text-purple-600' },
    { href: '/alati/kaizen-prijedlog', icon: '♾️', label: 'Novi Kaizen Prijedlog', opis: 'Predložite poboljšanje procesa.',     bg: 'bg-[#e8f5f0] text-[#1a7a5e]' },
    { href: '/alati/vsm-builder',      icon: '🗺️', label: 'Novi VSM Dijagram',     opis: 'Mapiranje toka vrijednosti.',         bg: 'bg-blue-50 text-blue-700' },
    { href: '/alati/ishikawa',         icon: '🐟', label: 'Novi Ishikawa',         opis: 'Dijagram uzroka i posljedica.',       bg: 'bg-red-50 text-red-600' },
    { href: '/alati/smed',             icon: '⚡', label: 'Nova SMED analiza',     opis: 'Smanjite vrijeme izmjene alata.',     bg: 'bg-yellow-50 text-yellow-600' },
  ];

  const recentSections = [
    { data: recentAudits, title: 'Nedavni 5S auditi', render: (audit: any) => (
      <a key={audit.id} href={`/povijest/${audit.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all group">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreColor(audit.total_score)}`}>{audit.total_score}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{audit.firma || 'Nenavedena firma'}</div>
          <div className="text-xs text-[#9a9a9a]">{audit.lokacija} · {new Date(audit.datum).toLocaleDateString('hr-HR')}</div>
        </div>
        <span className="text-xs text-[#9a9a9a] group-hover:text-[#1a7a5e]">→</span>
      </a>
    )},
    { data: recentGemba, title: 'Nedavni Gemba Walkovi', render: (g: any) => (
      <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🚶</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{g.lokacija || 'Nenavedena lokacija'}</div>
          <div className="text-xs text-[#9a9a9a]">{g.voditelj} · {g.datum ? new Date(g.datum).toLocaleDateString('hr-HR') : ''}</div>
        </div>
      </div>
    )},
    { data: recentA3, title: 'Nedavni A3 obrasci', render: (a: any) => (
      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-lg">📄</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{a.naslov || 'Bez naslova'}</div>
          <div className="text-xs text-[#9a9a9a]">{a.odjel || '—'} · {a.datum_otvaranja ? new Date(a.datum_otvaranja).toLocaleDateString('hr-HR') : ''}</div>
        </div>
      </div>
    )},
    { data: recentZasto, title: 'Nedavne 5x Zašto analize', render: (z: any) => (
      <div key={z.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg">❓</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{z.odjel || 'Nenavedeni odjel'}</div>
          <div className="text-xs text-[#9a9a9a]">{z.kategorija} · {z.datum ? new Date(z.datum).toLocaleDateString('hr-HR') : ''}</div>
        </div>
      </div>
    )},
    { data: recentOEE, title: 'Nedavni OEE izračuni', render: (o: any) => (
      <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg">📊</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{o.pogon || 'Nenavedeni pogon'}</div>
          <div className="text-xs text-[#9a9a9a]">{o.period || '—'} · {Array.isArray(o.strojevi) ? o.strojevi.length : 0} strojeva</div>
        </div>
      </div>
    )},
    { data: recentKaizen, title: 'Nedavni Kaizen prijedlozi', render: (k: any) => (
      <div key={k.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-[#e8f5f0] text-[#1a7a5e] flex items-center justify-center text-lg">♾️</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{k.odjel || 'Nenavedeni odjel'}</div>
          <div className="text-xs text-[#9a9a9a]">{k.kategorija || '—'} · {k.status}</div>
        </div>
      </div>
    )},
    { data: recentVSM, title: 'Nedavni VSM dijagrami', render: (v: any) => (
      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-lg">🗺️</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{v.naziv || 'Bez naziva'}</div>
          <div className="text-xs text-[#9a9a9a]">{Array.isArray(v.elementi) ? v.elementi.length : 0} elemenata</div>
        </div>
      </div>
    )},
    { data: recentIshikawa, title: 'Nedavni Ishikawa dijagrami', render: (ish: any) => (
      <div key={ish.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg">🐟</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{ish.problem || 'Bez opisa problema'}</div>
          <div className="text-xs text-[#9a9a9a]">{ish.odjel || '—'} · {ish.datum ? new Date(ish.datum).toLocaleDateString('hr-HR') : ''}</div>
        </div>
      </div>
    )},
    { data: recentSMED, title: 'Nedavne SMED analize', render: (s: any) => (
      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg">⚡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{s.stroj || 'Nenavedeni stroj'}</div>
          <div className="text-xs text-[#9a9a9a]">{s.proces || '—'} · {s.datum ? new Date(s.datum).toLocaleDateString('hr-HR') : ''} · {Array.isArray(s.aktivnosti) ? s.aktivnosti.length : 0} aktivnosti</div>
        </div>
      </div>
    )},
  ];

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-2">
            Dobrodošli, {user?.user_metadata?.full_name || 'Korisniče'}
          </h1>
          <p className="text-[#5a5a5a]">Vaš Lean upravljački centar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {alati.map(a => (
                <a key={a.href} href={a.href} className="bg-white border border-[#e2e2e2] p-4 rounded-2xl hover:border-[#1a7a5e] hover:shadow-lg transition-all group">
                  <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center mb-3 text-lg group-hover:scale-110 transition-transform`}>{a.icon}</div>
                  <h3 className="text-xs font-bold mb-1">{a.label}</h3>
                  <p className="text-[10px] text-[#5a5a5a]">{a.opis}</p>
                </a>
              ))}
            </div>

            {recentSections.filter(s => s.data.length > 0).map(section => (
              <div key={section.title} className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#1a1a1a]">{section.title}</h3>
                  <a href="/povijest" className="text-xs text-[#1a7a5e] font-semibold hover:underline">Svi →</a>
                </div>
                <div className="space-y-2">{section.data.map(section.render)}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
              <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">Vaš status</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#fafaf8] border border-[#e2e2e2] rounded-full flex items-center justify-center text-[#1a7a5e]">
                  <User size={20}/>
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
                <div className="bg-[#e8f5f0] text-[#1a7a5e] text-xs font-semibold px-4 py-3 rounded-xl text-center">✅ PRO plan aktivan</div>
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
