"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, MapPin, ChevronRight, Loader2, Building2, Info } from 'lucide-react';

interface AuditRecord {
  id: string;
  created_at: string;
  firma: string;
  lokacija: string;
  total_score: number;
  datum: string;
}

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/prijava');
        return;
      }

      setUser(currentUser);
      
      const { data, error } = await supabase
        .from('audits_5s')
        .select('id, created_at, firma, lokacija, total_score, datum')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audits:', error);
      } else {
        setAudits(data || []);
      }
      setIsLoading(false);
    };

    checkUserAndFetch();
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-[#dcfce7] text-[#16a34a]';
    if (score >= 60) return 'bg-[#fef9c3] text-[#ca8a04]';
    return 'bg-[#fee2e2] text-[#dc2626]';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] text-[#9a9a9a]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Učitavam vašu povijest...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">🗄️ Arhiva</div>
          <h1>Moja povijest audita</h1>
          <p>Pregledajte sve vaše spremljene 5S audite, pratite napredak i ponovno učitajte izvještaje.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-8">
        {audits.length === 0 ? (
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#e8f5f0] text-[#1a7a5e] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📋</div>
            <h3 className="text-xl font-bold mb-2">Još nemate spremljenih audita</h3>
            <p className="text-[#5a5a5a] mb-8">Započnite svoj prvi 5S audit i spremite ga u portal kako bi se ovdje pojavio.</p>
            <a href="/alati/5s-audit" className="btn btn-primary px-8">
              Započni novi audit →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-[#5a5a5a] uppercase tracking-wider">Moji izvještaji ({audits.length})</h3>
            </div>
            
            {audits.map((audit) => (
              <a 
                key={audit.id} 
                href={`/povijest/${audit.id}`}
                className="bg-white border border-[#e2e2e2] rounded-xl p-4 hover:border-[#1a7a5e] hover:shadow-md transition-all cursor-pointer group block"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getScoreColor(audit.total_score)}`}>
                    {audit.total_score}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#1a1a1a] truncate">{audit.firma || 'Nenavedena firma'}</span>
                      <span className="text-[10px] uppercase font-bold text-[#1a7a5e] bg-[#e8f5f0] px-2 py-0.5 rounded">5S Audit</span>
                    </div>
                    <div className="flex flex-wrap gap-y-1 gap-x-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#5a5a5a]">
                        <MapPin size={12} className="text-[#9a9a9a]" />
                        {audit.lokacija || 'Nenavedena lokacija'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5a5a5a]">
                        <Calendar size={12} className="text-[#9a9a9a]" />
                        {new Date(audit.datum).toLocaleDateString('hr-HR')}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="text-[#e2e2e2] group-hover:text-[#1a7a5e] transition-colors" size={20} />
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-12 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-6">
           <div className="flex gap-4 text-[#1e40af]">
              <Info size={24} className="shrink-0" />
              <div>
                 <h4 className="font-bold mb-1">Row Level Security (RLS) je aktivan</h4>
                 <p className="text-sm opacity-90">Vaši podaci su sigurni. Zahvaljujući postavljenim pravilima u bazi, čak i drugi korisnici portala ne mogu vidjeti vaše zapise. Svaki korisnik ima pristup isključivo svojoj povijesti.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
