"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wrench, History, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', desc: 'Pregled obaveza, KPI-jeva i napretka', icon: LayoutDashboard },
  { href: '/alati', label: 'Alati', desc: 'Svi Lean alati i kalkulatori', icon: Wrench },
  { href: '/povijest', label: 'Povijest', desc: 'Spremljeni auditi i analize', icon: History },
  { href: '/profil', label: 'Account', desc: 'Profil, pretplata i postavke', icon: UserCircle },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  if (href === '/alati') return pathname === '/alati' || (pathname.startsWith('/alati/') && !pathname.startsWith('/alati/vodici'));
  if (href === '/povijest') return pathname === '/povijest' || pathname.startsWith('/povijest/');
  if (href === '/profil') return pathname === '/profil';
  return false;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: fiksni okomiti stupac */}
      <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 bg-white border-r border-[#e2e2e2] min-h-[calc(100vh-54px)] sticky top-[54px] py-4 px-3">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active
                    ? 'bg-[#e8f5f0] text-[#1a7a5e]'
                    : 'text-[#5a5a5a] hover:bg-[#fafaf8] hover:text-[#1a1a1a]'
                }`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className={`block text-sm ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                  <span className={`block text-[11px] leading-snug mt-0.5 ${active ? 'text-[#5a9e85]' : 'text-[#9a9a9a]'}`}>{item.desc}</span>
                </span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobitel: vodoravna traka ispod headera */}
      <nav className="flex md:hidden items-center gap-1 bg-white border-b border-[#e2e2e2] px-2 py-1.5 overflow-x-auto sticky top-[54px] z-40">
        {NAV_ITEMS.map(item => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                active ? 'bg-[#e8f5f0] text-[#1a7a5e] font-bold' : 'text-[#5a5a5a]'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
