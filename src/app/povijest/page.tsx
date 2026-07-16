"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Loader2, Info } from 'lucide-react';

export default function HistoryPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [gembaWalks, setGembaWalks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'5s' | 'gemba'>('5s');
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }

      const { data: auditData } = await supabase
        .from('audits_5s')
        .select('id, created_at, firma, lokacija, total_score, datum')
        .order('created_at', { ascending: false });
      setAudits(auditData || []);

      const { data: gembaData } = await supabase
        .from('gemba_walk')
        .select('id, created_at, voditelj, lokacija, datum, cilj, zapazanja, akcije')
        .order('created_at', { ascending: false });
      setGembaWalks(gembaData || []);

      setIsLoading(false);
    };
    checkUserAndFetch();
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-[#dcfce7] text-[#16a34a]';
    if (score >= 60) return 'bg-[#fef9c3] text-[#ca8a04]';
    return 'bg-[#fee2e2] text-[#dc2626]';
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Učitavam vašu povijest...</p>
    </div>
  );

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
        <div className="flex gap-2 mb-6 bg-white border border-[#e2e2e2] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('5s')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === '5s' ? 'bg-[#1a7a5e] text-white' : 'text-[#5a5a5a] hover:bg-[#fafaf8]'}`}
          >
            📋 5S Auditi ({audits.length})
          </button>
          <button
            onClick={() => setActiveTab('gemba')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'gemba' ? 'bg-[#1a7a5e] text-white' : 'text-[#5a5a5a] hover:bg-[#fafaf8]'}`}
          >
            🚶 Gemba Walkovi ({gembaWalks.length})
          </button>
        </div>

        {/* 5S Auditi */}
        {activeTab === '5s' && (
          <div className="space-y-4">
            {audits.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih 5S audita</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi audit i spremite ga u portal.</p>
                <a href="/alati/5s-audit" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">
                  Novi 5S Audit →
                </a>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#9a9a9a] uppercase tracking-wider font-semibold">Moji auditi ({audits.length})</p>
                {audits.map((audit) => (
                  <a key={audit.id} href={`/povijest/${audit.id}`} className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all block group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getScoreColor(audit.total_score)}`}>
                        {audit.total_score}
                      </div>
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
              </>
            )}
          </div>
        )}

        {/* Gemba Walkovi */}
        {activeTab === 'gemba' && (
          <div className="space-y-4">
            {gembaWalks.length === 0 ? (
              <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">🚶</div>
                <h3 className="text-xl font-bold mb-2">Još nemate spremljenih Gemba Walkova</h3>
                <p className="text-[#5a5a5a] mb-6">Pokrenite prvi Gemba Walk i spremite ga u portal.</p>
                <a href="/alati/gemba-walk" className="bg-[#1a7a5e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155f49] transition-all">
                  Novi Gemba Walk →
                </a>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#9a9a9a] uppercase tracking-wider font-semibold">Moji Gemba Walkovi ({gembaWalks.length})</p>
                {gembaWalks.map((g) => (
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
              </>
            )}
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
