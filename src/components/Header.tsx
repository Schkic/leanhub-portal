"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="/" className="logo">
          <div className="logo-mark">L°</div>
          Leanopedija <span className="text-xs bg-[#e8f5f0] text-[#1a7a5e] px-2 py-0.5 rounded ml-1 font-sans font-medium uppercase tracking-wider">Portal</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-8">
          {user ? (
            <>
              <a href="/dashboard" className="text-sm text-[#5a5a5a] px-3 py-1.5 rounded-md hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-colors">Dashboard</a>
              <a href="/alati/5s-audit" className="text-sm text-[#5a5a5a] px-3 py-1.5 rounded-md hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-colors font-medium">Alati</a>
              <a href="/povijest" className="text-sm text-[#5a5a5a] px-3 py-1.5 rounded-md hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-colors">Moja povijest</a>
            </>
          ) : (
            <a href="/alati/5s-audit" className="text-sm text-[#5a5a5a] px-3 py-1.5 rounded-md hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-colors">Isprobaj Alate</a>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
           {user ? (
             <a href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-[#1a7a5e]">
                <div className="w-8 h-8 bg-[#e8f5f0] rounded-full flex items-center justify-center"><User size={16} /></div>
                <span className="hidden sm:inline">{user.user_metadata?.full_name || 'Profil'}</span>
             </a>
           ) : (
             <>
               <a href="/prijava" className="text-sm font-medium text-[#1a7a5e]">Prijava</a>
               <a href="/registracija" className="btn btn-primary px-4 py-2 text-sm">Registracija</a>
             </>
           )}
        </div>
      </div>
    </header>
  );
}
