"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Plus, History, Settings, User } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/prijava');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a7a5e]"></div>
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl text-[#1a1a1a] mb-2">Dobrodošli, {user?.user_metadata?.full_name || 'Korisniče'}</h1>
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
          {/* Quick Actions */}
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

          {/* User Sidebar */}
          <div className="space-y-6">
             <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
                <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">Vaš status</h3>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-[#fafaf8] border border-[#e2e2e2] rounded-full flex items-center justify-center text-[#1a7a5e]"><User size={20} /></div>
                   <div>
                      <div className="text-sm font-bold text-[#1a1a1a]">{user?.email}</div>
                      <div className="text-[11px] text-[#1a7a5e] font-bold">BESPLATNI PLAN</div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="text-xs flex justify-between">
                      <span className="text-[#5a5a5a]">Mjesecni auditi:</span>
                      <span className="font-bold">2 / 5</span>
                   </div>
                   <div className="w-full bg-[#fafaf8] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1a7a5e] h-full w-[40%]"></div>
                   </div>
                   <button className="w-full py-2 bg-[#f5c842] text-[#1a1a1a] text-xs font-bold rounded-lg mt-2">NADOGRADI NA PRO ✨</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
