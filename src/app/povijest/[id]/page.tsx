"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Calendar, Building2, MapPin, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      const user = await requireAuth(router);
      if (!user) return;

      const { data, error } = await supabase
        .from('audits_5s')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching details:', error);
        router.push('/povijest');
      } else {
        setAudit(data);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id, router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#16a34a] bg-[#dcfce7]';
    if (score >= 60) return 'text-[#ca8a04] bg-[#fef9c3]';
    return 'text-[#dc2626] bg-[#fee2e2]';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Dohvaćam detalje audita...</p>
    </div>
  );

  if (!audit) return null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header Dashboard Style */}
      <div className="bg-white border-b border-[#e2e2e2] py-6 px-6 sticky top-[58px] z-40">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/povijest')} className="p-2 hover:bg-[#fafaf8] rounded-full transition-colors text-[#5a5a5a]">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-bold text-[#1a1a1a] text-xl">{audit.firma}</h1>
                <span className="text-[10px] uppercase font-bold text-[#1a7a5e] bg-[#e8f5f0] px-2 py-0.5 rounded tracking-wider">5S Audit</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#9a9a9a]">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(audit.datum).toLocaleDateString('hr-HR')}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14}/> {audit.lokacija}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px] ${getScoreColor(audit.total_score)}`}>
               <span className="text-2xl font-black leading-none">{audit.total_score}</span>
               <span className="text-[10px] font-bold uppercase opacity-70">Rezultat</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Score Breakdown Bar */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
               <h3 className="text-sm font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
                 <CheckCircle2 className="text-[#1a7a5e]" size={18} /> Pregled po kategorijama
               </h3>
               <div className="space-y-4">
                 {['s1', 's2', 's3', 's4', 's5'].map((key) => {
                   const sTitles: any = {
                     s1: 'Sortiranje', s2: 'Sređivanje', s3: 'Čišćenje', s4: 'Standardizacija', s5: 'Disciplina'
                   };
                   const sColors: any = {
                     s1: '#3b82f6', s2: '#8b5cf6', s3: '#f59e0b', s4: '#10b981', s5: '#ef4444'
                   };
                   
                   // Calculate section score from JSON object
                   const sectionScore = Object.entries(audit.scores || {})
                     .filter(([id]) => id.startsWith(key))
                     .reduce((acc, [_, val]: any) => acc + val, 0);
                   
                   const pct = (sectionScore / 20) * 100;

                   return (
                     <div key={key}>
                       <div className="flex justify-between text-xs font-bold mb-1.5">
                         <span className="text-[#5a5a5a]">{sTitles[key]}</span>
                         <span style={{color: sColors[key]}}>{sectionScore} / 20</span>
                       </div>
                       <div className="w-full bg-[#fafaf8] h-2 rounded-full overflow-hidden border border-[#f0f0f0]">
                         <div 
                           className="h-full transition-all duration-1000" 
                           style={{ width: `${pct}%`, backgroundColor: sColors[key] }}
                         ></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Observations */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
               <h3 className="text-sm font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
                 <AlertCircle className="text-[#f5c842]" size={18} /> Zapažanja i Akcijski plan
               </h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] uppercase font-bold text-[#9a9a9a] block mb-2 tracking-widest">Što je dobro (Pozitivno)</label>
                   <p className="text-sm text-[#1a1a1a] leading-relaxed bg-[#f0f9f5] p-4 rounded-xl border border-[#dcfce7]">
                     {audit.observations?.pozitivno || 'Nema upisanih zapažanja.'}
                   </p>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold text-[#9a9a9a] block mb-2 tracking-widest">Područja za poboljšanje</label>
                   <p className="text-sm text-[#1a1a1a] leading-relaxed bg-[#fff5f5] p-4 rounded-xl border border-[#fee2e2]">
                     {audit.observations?.poboljsanje || 'Nema upisanih područja.'}
                   </p>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold text-[#9a9a9a] block mb-2 tracking-widest">Prioritetne akcije</label>
                   <div className="bg-[#fffdf5] p-4 rounded-xl border border-[#fef9c3] whitespace-pre-wrap text-sm text-[#1a1a1a] font-medium leading-relaxed">
                     {audit.observations?.akcije || 'Nema definiranih akcija.'}
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">Administracija</h3>
              <div className="space-y-4">
                 <div>
                   <div className="text-[10px] text-[#9a9a9a] font-bold mb-1">Auditor</div>
                   <div className="text-sm font-bold text-[#1a1a1a]">{audit.osoba || 'Nepoznato'}</div>
                 </div>
                 <div>
                   <div className="text-[10px] text-[#9a9a9a] font-bold mb-1">Audit Broj</div>
                   <div className="text-sm font-bold text-[#1a1a1a]">{audit.broj || '—'}</div>
                 </div>
                 <div>
                   <div className="text-[10px] text-[#9a9a9a] font-bold mb-1">Smjena</div>
                   <div className="text-sm font-bold text-[#1a1a1a]">{audit.smjena || '—'}</div>
                 </div>
              </div>
              <button className="w-full mt-8 btn btn-primary flex justify-center gap-2 text-xs py-3">
                <FileText size={14} /> Izvezi Izvještaj (PDF)
              </button>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#1a7a5e] to-[#2d9e7a] rounded-2xl text-white shadow-lg shadow-[#1a7a5e]/20">
               <h4 className="font-bold mb-2">Treba vam savjet?</h4>
               <p className="text-xs opacity-90 leading-relaxed mb-4">Naši stručnjaci mogu proanalizirati vaše rezultate i pomoći vam u definiranju Kaizen akcija.</p>
               <a href="mailto:info@opticora.hr" className="block text-center bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition-all border border-white/20">Kontaktiraj stručnjaka</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
