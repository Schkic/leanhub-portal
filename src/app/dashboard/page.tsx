"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';

// OEE kalkulacija
const calcStrojAvg = (strojevi: any[]) => {
  if (!Array.isArray(strojevi)) return 0;
  const results = strojevi.map(stroj => {
    if (!Array.isArray(stroj.smjene)) return 0;
    const smjeneOEE = stroj.smjene.map((s: any) => {
      const op = s.planirano - s.zastoji;
      if (s.planirano <= 0 || op <= 0 || s.idealniTakt <= 0) return 0;
      const A = Math.min((op / s.planirano) * 100, 100);
      const P = Math.min(s.idealniTakt > 0 ? ((s.ukupnoKomada / (op / s.idealniTakt)) * 100) : 0, 100);
      const Q = Math.min(s.ukupnoKomada > 0 ? ((s.dobriKomadi / s.ukupnoKomada) * 100) : 0, 100);
      return (A / 100) * (P / 100) * (Q / 100) * 100;
    }).filter((v: number) => v > 0);
    return smjeneOEE.length > 0 ? smjeneOEE.reduce((a: number, b: number) => a + b, 0) / smjeneOEE.length : 0;
  }).filter(v => v > 0);
  return results.length > 0 ? +(results.reduce((a, b) => a + b, 0) / results.length).toFixed(1) : 0;
};

const getOEEColor = (oee: number) => {
  if (oee >= 85) return '#1a7a5e';
  if (oee >= 75) return '#16a34a';
  if (oee >= 60) return '#ca8a04';
  return '#dc2626';
};

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

  // KPI grafovi podaci
  const [oeeHistory, setOeeHistory] = useState<any[]>([]);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [kaizenStats, setKaizenStats] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const user = await requireAuth(router);
      if (!user) return;
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const [a, g, a3, z, o, k, v, ish, smed, oeeAll, auditAll, kaizenAll] = await Promise.all([
        supabase.from('audits_5s').select('id, created_at, firma, lokacija, total_score, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('gemba_walk').select('id, created_at, voditelj, lokacija, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('a3_obrazac').select('id, created_at, naslov, vlasnik, datum_otvaranja, odjel').order('created_at', { ascending: false }).limit(2),
        supabase.from('pet_zasto').select('id, created_at, voditelj, odjel, datum, kategorija').order('created_at', { ascending: false }).limit(2),
        supabase.from('oee_kalkulator').select('id, created_at, pogon, period, strojevi').order('created_at', { ascending: false }).limit(2),
        supabase.from('kaizen_prijedlog').select('id, created_at, odjel, datum, kategorija, prioritet, status').order('created_at', { ascending: false }).limit(2),
        supabase.from('vsm_dijagram').select('id, created_at, naziv, elementi').order('created_at', { ascending: false }).limit(2),
        supabase.from('ishikawa').select('id, created_at, problem, odjel, datum').order('created_at', { ascending: false }).limit(2),
        supabase.from('smed').select('id, created_at, stroj, proces, datum, aktivnosti').order('created_at', { ascending: false }).limit(2),
        supabase.from('oee_kalkulator').select('id, period, created_at, strojevi').eq('user_id', user.id).order('created_at', { ascending: true }).limit(12),
        supabase.from('audits_5s').select('id, total_score, datum, created_at').eq('user_id', user.id).order('created_at', { ascending: true }).limit(12),
        supabase.from('kaizen_prijedlog').select('status').eq('user_id', user.id),
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

      const oeeGraf = (oeeAll.data || []).map((r: any) => ({
        period: r.period || new Date(r.created_at).toLocaleDateString('hr-HR', { month: 'short', year: '2-digit' }),
        OEE: calcStrojAvg(r.strojevi || []),
        cilj: 85,
      }));
      setOeeHistory(oeeGraf);

      const auditGraf = (auditAll.data || []).map((r: any) => ({
        datum: r.datum ? new Date(r.datum).toLocaleDateString('hr-HR', { month: 'short', year: '2-digit' }) : new Date(r.created_at).toLocaleDateString('hr-HR', { month: 'short', year: '2-digit' }),
        rezultat: r.total_score,
        cilj: 80,
      }));
      setAuditHistory(auditGraf);

      const statusCounts: Record<string, number> = {};
      (kaizenAll.data || []).forEach((r: any) => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      const COLORS: Record<string, string> = {
        'Otvoreno': '#9a9a9a', 'U razmatranju': '#ca8a04', 'Odobreno': '#2563eb',
        'U provedbi': '#7c3aed', 'Završeno': '#1a7a5e', 'Odbijeno': '#dc2626'
      };
      setKaizenStats(Object.entries(statusCounts).map(([name, value]) => ({ name, value, color: COLORS[name] || '#9a9a9a' })));

      setLoading(false);
    };
    getData();
  }, [router]);

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email, plan: selectedPlan }),
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
  const latestOEE = oeeHistory.length > 0 ? oeeHistory[oeeHistory.length - 1].OEE : null;
  const latestAudit = auditHistory.length > 0 ? auditHistory[auditHistory.length - 1].rezultat : null;

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
          <div className="text-sm font-bold truncate">{ish.problem || 'Bez opisa'}</div>
          <div className="text-xs text-[#9a9a9a]">{ish.odjel || '—'}</div>
        </div>
      </div>
    )},
    { data: recentSMED, title: 'Nedavne SMED analize', render: (s: any) => (
      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafaf8] transition-all">
        <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg">⚡</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{s.stroj || 'Nenavedeni stroj'}</div>
          <div className="text-xs text-[#9a9a9a]">{s.proces || '—'} · {Array.isArray(s.aktivnosti) ? s.aktivnosti.length : 0} aktivnosti</div>
        </div>
      </div>
    )},
  ];

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-1">
            Dobrodošli, {user?.user_metadata?.full_name || 'Korisniče'}
          </h1>
          <p className="text-[#5a5a5a]">Vaš Lean upravljački centar</p>
        </div>

        {(oeeHistory.length > 0 || auditHistory.length > 0 || kaizenStats.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-[#9a9a9a] uppercase tracking-wider">📈 KPI Pregled</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">

              {oeeHistory.length > 0 && (
                <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-[#5a5a5a] uppercase tracking-wider">OEE Trend</h3>
                    {latestOEE !== null && (
                      <span className="text-lg font-bold" style={{ color: getOEEColor(latestOEE) }}>{latestOEE}%</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9a9a9a] mb-3">Ukupna učinkovitost opreme</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={oeeHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                      <XAxis dataKey="period" fontSize={9} tick={{ fill: '#9a9a9a' }} tickLine={false} axisLine={false}/>
                      <YAxis domain={[0, 100]} fontSize={9} tick={{ fill: '#9a9a9a' }} tickLine={false} axisLine={false}/>
                      <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ borderRadius: 8, border: '1px solid #e2e2e2', fontSize: 11 }}/>
                      <ReferenceLine y={85} stroke="#1a7a5e" strokeDasharray="4 2" strokeWidth={1.5}/>
                      <Bar dataKey="OEE" radius={[3,3,0,0]}>
                        {oeeHistory.map((entry, i) => (
                          <Cell key={i} fill={getOEEColor(entry.OEE)}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-6 h-px border-t border-dashed border-[#1a7a5e]"></div>
                    <span className="text-[10px] text-[#9a9a9a]">Cilj 85%</span>
                  </div>
                </div>
              )}

              {auditHistory.length > 0 && (
                <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-[#5a5a5a] uppercase tracking-wider">5S Audit Trend</h3>
                    {latestAudit !== null && (
                      <span className="text-lg font-bold text-[#1a7a5e]">{latestAudit}/100</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9a9a9a] mb-3">Rezultati audita kroz vrijeme</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={auditHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                      <XAxis dataKey="datum" fontSize={9} tick={{ fill: '#9a9a9a' }} tickLine={false} axisLine={false}/>
                      <YAxis domain={[0, 100]} fontSize={9} tick={{ fill: '#9a9a9a' }} tickLine={false} axisLine={false}/>
                      <Tooltip formatter={(v: any) => [`${v}/100`]} contentStyle={{ borderRadius: 8, border: '1px solid #e2e2e2', fontSize: 11 }}/>
                      <ReferenceLine y={80} stroke="#1a7a5e" strokeDasharray="4 2" strokeWidth={1.5}/>
                      <Line type="monotone" dataKey="rezultat" stroke="#1a7a5e" strokeWidth={2.5} dot={{ r: 4, fill: '#1a7a5e' }} activeDot={{ r: 6 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-6 h-px border-t border-dashed border-[#1a7a5e]"></div>
                    <span className="text-[10px] text-[#9a9a9a]">Cilj 80/100</span>
                  </div>
                </div>
              )}

              {kaizenStats.length > 0 && (
                <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-[#5a5a5a] uppercase tracking-wider">Kaizen Prijedlozi</h3>
                    <span className="text-lg font-bold text-[#1a7a5e]">{kaizenStats.reduce((a, b) => a + b.value, 0)}</span>
                  </div>
                  <p className="text-[10px] text-[#9a9a9a] mb-3">Status prijedloga poboljšanja</p>
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie data={kaizenStats} cx="50%" cy="50%" outerRadius={50} dataKey="value" paddingAngle={2}>
                        {kaizenStats.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e2e2', fontSize: 11 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {kaizenStats.map(k => (
                      <div key={k.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: k.color }}></div>
                        <span className="text-[10px] text-[#9a9a9a]">{k.name} ({k.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                    Isprobajte sve PRO funkcije <strong>besplatno 14 dana</strong>. Otkažite kad god želite.
                  </p>
                  <div className="flex gap-1 p-1 bg-[#fafaf8] border border-[#e2e2e2] rounded-lg">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${selectedPlan === 'monthly' ? 'bg-white shadow text-[#1a7a5e]' : 'text-[#5a5a5a]'}`}
                    >
                      Mjesečno
                    </button>
                    <button
                      onClick={() => setSelectedPlan('annual')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${selectedPlan === 'annual' ? 'bg-white shadow text-[#1a7a5e]' : 'text-[#5a5a5a]'}`}
                    >
                      Godišnje
                    </button>
                  </div>
                  <button onClick={handleUpgrade} className="w-full py-2.5 bg-[#1a7a5e] text-white text-sm font-bold rounded-xl hover:bg-[#155f49] transition-all">
                    Aktiviraj PRO — 14 dana besplatno →
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
