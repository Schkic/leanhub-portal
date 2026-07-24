"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';

function isAppPath(pathname: string) {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true;
  if (pathname === '/alati' || (pathname.startsWith('/alati/') && !pathname.startsWith('/alati/vodici'))) return true;
  if (pathname === '/povijest' || pathname.startsWith('/povijest/')) return true;
  if (pathname === '/profil') return true;
  return false;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showSidebar = checked && !!user && isAppPath(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-start">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
