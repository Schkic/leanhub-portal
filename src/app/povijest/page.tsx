"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Loader2, Info } from 'lucide-react';

export default function HistoryPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [gembaWalks, setGembaWalks] = useState<any[]>([]);
  const [a3Obrasci, setA3Obrasci] = useState<any[]>([]);
  const [zastoAnalize, setZastoAnalize] = useState<any[]>([]);
  const [oeeIzracuni, setOeeIzracuni] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'5s' | 'gemba' | 'a3' | 'zasto' | 'oee'>('5s');
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }

      const { data: auditData } = await supabase.from('audits_5s')
        .select('id, created_at, firma, lokacija, total_score, datum')
        .order('created_at', { ascending: false });
      setAudits(auditData || []);

      const { data: gembaData } = await supabase.from('gemba_walk')
        .select('id, created_at, voditelj, lokacija, datum, zapazanja, akcije')
        .order('created_at', { ascending: false });
      setGembaWalks(gembaData || []);

      const { data: a3Data } = await supabase.from('a3_obrazac')
        .select('id, created_at, naslov, vlasnik, datum_otvaranja, odjel, cilj_postignut')
        .order('created_at', { ascending: false });
      setA3Obrasci(a3Data || []);

      const { data: zastoData } = await supabase.from('pet_zasto')
        .select('id, created_at, voditelj, odjel, datum, kategorija, analize')
        .order('created_at', { ascending: false });
      setZastoAnalize(zastoData || []);

      const { data: oeeData } = await supabase.from('oee_kalkulator')
        .select('id, created_at, pogon, period, odgovorna_osoba, strojevi')
        .order('created_at', { ascending: false });
      setOeeIzracuni(oeeData || []);

      setIsLoading(false);
    };
    checkUserAndFetch();
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-[#dcfce7] text-[#16a34a]';
    if (score >= 60) return 'bg-[#fef9c3] text-[#ca8a04]';
    return 'bg-[#fee2e2] text-[#dc2626]';
  };

  const getCiljColor = (cilj: string) => {
    if (cilj === 'Da — cilj postignut') return 'text-green-600 bg-green-50';
    if (cilj === 'Djelomično') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Učitavam vašu povijest...</p>
    </div>
  );

  const tabs = [
    { key: '5s', label: '📋 5S', count: audits.length },
    { key: 'gemba', label: '🚶 Gemba', count: gembaWalks.length },
    { key: 'a3', label: '📄 A3', count: a3Obrasci.length },
    { key: 'zasto', label: '❓ 5x Zašto', count: zastoAnalize.length },
    { key: 'oee', label: '📊 OEE', count: oeeIzracuni.length },
  ];

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">🗄️ Arhiva</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Moja povijest</h1>
          <p className="text-sm text-[#5a5a5a]">Pregledajte sve vaše spremljene alate, pratite napredak i ponovno učitajte izvještaje.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-6">
        {/* Tabovi */}
        <div className="flex gap-2 mb-6 bg-white border border-[#e2e2e2] rounded-xl p-1 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-[#1a7a5e] text-white' : 'text-[#5a5a5a] hover:bg-[#fafaf8]'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 5S Auditi */}
        {activeTab === '5s' && (
          <div className="space-y-4">
            {audits.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih 5S audita</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi audit i spremite ga u portal.</p>
                <a href="/alati/5s-audit" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">Novi 5S Audit →</a>
              </div>
            ) : audits.map((audit) => (
              <a key={audit.id} href={`/povijest/${audit.id}`} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all block group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getScoreColor(audit.total_score)}`}>{audit.total_score}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{audit.firma || 'Nenavedena firma'}</span>
                      <span className="text-[10px] uppercase font-bold text-[#1a7a5e] bg-[#e8f5f0] px-2 py-0.5 rounded">5S Audit</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><MapPin size={12} className="text-[#9a9a9a]" />{audit.lokacija || '—'}</span>
                      <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><Calendar size={12} className="text-[#9a9a9a]" />{new Date(audit.datum).toLocaleDateString('hr-HR')}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-[#e2e2e2] group-hover:text-[#1a7a5e] transition-colors" size={20} />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Gemba */}
        {activeTab === 'gemba' && (
          <div className="space-y-4">
            {gembaWalks.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">🚶</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih Gemba Walkova</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi Gemba Walk.</p>
                <a href="/alati/gemba-walk" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">Novi Gemba Walk →</a>
              </div>
            ) : gembaWalks.map((g) => (
              <div key={g.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">🚶</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{g.lokacija || 'Nenavedena lokacija'}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Gemba Walk</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-[#5a5a5a]">Voditelj: {g.voditelj || '—'}</span>
                      <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><Calendar size={12} className="text-[#9a9a9a]" />{g.datum ? new Date(g.datum).toLocaleDateString('hr-HR') : '—'}</span>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-[#9a9a9a]">📍 {Array.isArray(g.zapazanja) ? g.zapazanja.length : 0} zapažanja</span>
                      <span className="text-xs text-[#9a9a9a]">🎯 {Array.isArray(g.akcije) ? g.akcije.length : 0} akcija</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* A3 */}
        {activeTab === 'a3' && (
          <div className="space-y-4">
            {a3Obrasci.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih A3 obrazaca</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi A3 obrazac.</p>
                <a href="/alati/a3-obrazac" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">Novi A3 Obrazac →</a>
              </div>
            ) : a3Obrasci.map((a) => (
              <div key={a.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xl">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{a.naslov || 'Bez naslova'}</span>
                      <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">A3</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-[#5a5a5a]">Vlasnik: {a.vlasnik || '—'}</span>
                      <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><Calendar size={12} className="text-[#9a9a9a]" />{a.datum_otvaranja ? new Date(a.datum_otvaranja).toLocaleDateString('hr-HR') : '—'}</span>
                    </div>
                    {a.cilj_postignut && <div className="mt-2"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${getCiljColor(a.cilj_postignut)}`}>{a.cilj_postignut}</span></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5x Zašto */}
        {activeTab === 'zasto' && (
          <div className="space-y-4">
            {zastoAnalize.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih analiza</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvu 5x Zašto analizu.</p>
                <a href="/alati/5-zasto" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">Nova 5x Zašto analiza →</a>
              </div>
            ) : zastoAnalize.map((z) => (
              <div key={z.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl">❓</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{z.odjel || 'Nenavedeni odjel'}</span>
                      <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">5x Zašto</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-[#5a5a5a]">Kategorija: {z.kategorija || '—'}</span>
                      <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><Calendar size={12} className="text-[#9a9a9a]" />{z.datum ? new Date(z.datum).toLocaleDateString('hr-HR') : '—'}</span>
                    </div>
                    <div className="mt-2"><span className="text-xs text-[#9a9a9a]">🔍 {Array.isArray(z.analize) ? z.analize.length : 0} analiza</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OEE */}
        {activeTab === 'oee' && (
          <div className="space-y-4">
            {oeeIzracuni.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih OEE izračuna</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi OEE izračun.</p>
                <a href="/alati/oee-kalkulator" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">Novi OEE Izračun →</a>
              </div>
            ) : oeeIzracuni.map((o) => (
              <div key={o.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">📊</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{o.pogon || 'Nenavedeni pogon'}</span>
                      <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">OEE</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-xs text-[#5a5a5a]">Period: {o.period || '—'}</span>
                      <span className="text-xs text-[#5a5a5a]">Odgovoran: {o.odgovorna_osoba || '—'}</span>
                    </div>
                    <div className="mt-2"><span className="text-xs text-[#9a9a9a]">⚙️ {Array.isArray(o.strojevi) ? o.strojevi.length : 0} {Array.isArray(o.strojevi) && o.strojevi.length === 1 ? 'stroj' : 'strojeva'}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5">
          <div className="flex gap-3 text-[#1e40af]">
            <Info size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm opacity-90"><strong>RLS je aktivan</strong> — samo vi vidite svoje podatke.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
