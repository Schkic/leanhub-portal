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
  const [kaizenPrijedlozi, setKaizenPrijedlozi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'5s' | 'gemba' | 'a3' | 'zasto' | 'oee' | 'kaizen'>('5s');
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }

      const [a, g, a3, z, o, k] = await Promise.all([
        supabase.from('audits_5s').select('id, created_at, firma, lokacija, total_score, datum').order('created_at', { ascending: false }),
        supabase.from('gemba_walk').select('id, created_at, voditelj, lokacija, datum, zapazanja, akcije').order('created_at', { ascending: false }),
        supabase.from('a3_obrazac').select('id, created_at, naslov, vlasnik, datum_otvaranja, odjel, cilj_postignut').order('created_at', { ascending: false }),
        supabase.from('pet_zasto').select('id, created_at, voditelj, odjel, datum, kategorija, analize').order('created_at', { ascending: false }),
        supabase.from('oee_kalkulator').select('id, created_at, pogon, period, odgovorna_osoba, strojevi').order('created_at', { ascending: false }),
        supabase.from('kaizen_prijedlog').select('id, created_at, ime, odjel, datum, kategorija, prioritet, status, prob_gdje').order('created_at', { ascending: false }),
      ]);

      setAudits(a.data || []);
      setGembaWalks(g.data || []);
      setA3Obrasci(a3.data || []);
      setZastoAnalize(z.data || []);
      setOeeIzracuni(o.data || []);
      setKaizenPrijedlozi(k.data || []);
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

  const getStatusColor = (status: string) => {
    if (status === 'Završeno') return 'text-green-600 bg-green-50';
    if (status === 'Odobreno' || status === 'U provedbi') return 'text-blue-600 bg-blue-50';
    if (status === 'Odbijeno') return 'text-red-600 bg-red-50';
    if (status === 'U razmatranju') return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
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
    { key: 'kaizen', label: '♾️ Kaizen', count: kaizenPrijedlozi.length },
  ];

  const EmptyState = ({ icon, title, href, label }: any) => (
    <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <a href={href} className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all inline-block mt-4">{label} →</a>
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-8">
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">🗄️ Arhiva</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Moja povijest</h1>
          <p className="text-sm text-[#5a5a5a]">Pregledajte sve vaše spremljene alate i pratite napredak.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-6">
        <div className="flex gap-2 mb-6 bg-white border border-[#e2e2e2] rounded-xl p-1 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-[#1a7a5e] text-white' : 'text-[#5a5a5a] hover:bg-[#fafaf8]'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activeTab === '5s' && (
          <div className="space-y-4">
            {audits.length === 0 ? <EmptyState icon="📋" title="Još nemate 5S audita" href="/alati/5s-audit" label="Novi 5S Audit" /> :
              audits.map((audit) => (
                <a key={audit.id} href={`/povijest/${audit.id}`} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all block group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getScoreColor(audit.total_score)}`}>{audit.total_score}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[#1a1a1a] truncate">{audit.firma || 'Nenavedena firma'}</span>
                        <span className="text-[10px] uppercase font-bold text-[#1a7a5e] bg-[#e8f5f0] px-2 py-0.5 rounded">5S</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><MapPin size={12} />{audit.lokacija || '—'}</span>
                        <span className="flex items-center gap-1.5 text-xs text-[#5a5a5a]"><Calendar size={12} />{new Date(audit.datum).toLocaleDateString('hr-HR')}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-[#e2e2e2] group-hover:text-[#1a7a5e]" size={20} />
                  </div>
                </a>
              ))}
          </div>
        )}

        {activeTab === 'gemba' && (
          <div className="space-y-4">
            {gembaWalks.length === 0 ? <EmptyState icon="🚶" title="Još nemate Gemba Walkova" href="/alati/gemba-walk" label="Novi Gemba Walk" /> :
              gembaWalks.map((g) => (
                <div key={g.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">🚶</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#1a1a1a] truncate block">{g.lokacija || 'Nenavedena lokacija'}</span>
                      <div className="flex flex-wrap gap-x-4 text-xs text-[#9a9a9a]">
                        <span>Voditelj: {g.voditelj || '—'}</span>
                        <span>{g.datum ? new Date(g.datum).toLocaleDateString('hr-HR') : '—'}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-[#9a9a9a]">
                        <span>📍 {Array.isArray(g.zapazanja) ? g.zapazanja.length : 0} zapažanja</span>
                        <span>🎯 {Array.isArray(g.akcije) ? g.akcije.length : 0} akcija</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'a3' && (
          <div className="space-y-4">
            {a3Obrasci.length === 0 ? <EmptyState icon="📄" title="Još nemate A3 obrazaca" href="/alati/a3-obrazac" label="Novi A3 Obrazac" /> :
              a3Obrasci.map((a) => (
                <div key={a.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xl">📄</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#1a1a1a] truncate block">{a.naslov || 'Bez naslova'}</span>
                      <div className="flex flex-wrap gap-x-4 text-xs text-[#9a9a9a]">
                        <span>{a.vlasnik || '—'}</span>
                        <span>{a.datum_otvaranja ? new Date(a.datum_otvaranja).toLocaleDateString('hr-HR') : '—'}</span>
                      </div>
                      {a.cilj_postignut && <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${getCiljColor(a.cilj_postignut)}`}>{a.cilj_postignut}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'zasto' && (
          <div className="space-y-4">
            {zastoAnalize.length === 0 ? <EmptyState icon="❓" title="Još nemate 5x Zašto analiza" href="/alati/5-zasto" label="Nova analiza" /> :
              zastoAnalize.map((z) => (
                <div key={z.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl">❓</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#1a1a1a] truncate block">{z.odjel || 'Nenavedeni odjel'}</span>
                      <div className="flex flex-wrap gap-x-4 text-xs text-[#9a9a9a]">
                        <span>{z.kategorija || '—'}</span>
                        <span>{z.datum ? new Date(z.datum).toLocaleDateString('hr-HR') : '—'}</span>
                      </div>
                      <span className="text-xs text-[#9a9a9a]">🔍 {Array.isArray(z.analize) ? z.analize.length : 0} analiza</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'oee' && (
          <div className="space-y-4">
            {oeeIzracuni.length === 0 ? <EmptyState icon="📊" title="Još nemate OEE izračuna" href="/alati/oee-kalkulator" label="Novi OEE Izračun" /> :
              oeeIzracuni.map((o) => (
                <div key={o.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">📊</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#1a1a1a] truncate block">{o.pogon || 'Nenavedeni pogon'}</span>
                      <div className="flex flex-wrap gap-x-4 text-xs text-[#9a9a9a]">
                        <span>{o.period || '—'}</span>
                        <span>{o.odgovorna_osoba || '—'}</span>
                      </div>
                      <span className="text-xs text-[#9a9a9a]">⚙️ {Array.isArray(o.strojevi) ? o.strojevi.length : 0} strojeva</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'kaizen' && (
          <div className="space-y-4">
            {kaizenPrijedlozi.length === 0 ? <EmptyState icon="♾️" title="Još nemate Kaizen prijedloga" href="/alati/kaizen-prijedlog" label="Novi Kaizen Prijedlog" /> :
              kaizenPrijedlozi.map((k) => (
                <div key={k.id} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#e8f5f0] text-[#1a7a5e] flex items-center justify-center text-xl">♾️</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#1a1a1a] truncate block">{k.prob_gdje || k.odjel || 'Bez opisa mjesta'}</span>
                      <div className="flex flex-wrap gap-x-4 text-xs text-[#9a9a9a]">
                        <span>{k.kategorija || '—'}</span>
                        <span>{k.prioritet || '—'}</span>
                        <span>{k.datum ? new Date(k.datum).toLocaleDateString('hr-HR') : '—'}</span>
                      </div>
                      {k.status && <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${getStatusColor(k.status)}`}>{k.status}</span>}
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
