"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function DetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Dohvaćam zapis...</p>
    </div>
  );
}

export function DetailNotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-58px)] gap-4">
      <p className="text-[#9a9a9a]">Zapis nije pronađen.</p>
      <button onClick={() => router.push('/povijest')} className="text-[#1a7a5e] font-semibold hover:underline">← Natrag na povijest</button>
    </div>
  );
}

export function DetailHeader({
  emoji, badge, badgeColor, badgeBg, title, subtitleParts, right,
}: {
  emoji: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  subtitleParts: (string | null | undefined)[];
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const subtitle = subtitleParts.filter(Boolean).join(' · ');
  return (
    <div className="bg-white border-b border-[#e2e2e2] py-6 px-6">
      <div className="max-w-[900px] mx-auto flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <button onClick={() => router.push('/povijest')} className="p-2 hover:bg-[#fafaf8] rounded-full transition-colors text-[#5a5a5a] shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-2" style={{ color: badgeColor, background: badgeBg }}>
              {emoji} {badge}
            </div>
            <h1 className="font-serif text-2xl text-[#1a1a1a]">{title}</h1>
            {subtitle && <p className="text-sm text-[#9a9a9a] mt-1">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

export function DetailCard({
  icon, title, subtitle, children,
}: { icon?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">{icon && <span>{icon}</span>} {title}</h3>
        {subtitle && <p className="text-xs text-[#9a9a9a] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function FieldGrid({ fields }: { fields: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f, i) => (
        <div key={i}>
          <div className="text-[10px] uppercase font-bold text-[#9a9a9a] tracking-widest mb-1">{f.label}</div>
          <div className="text-sm text-[#1a1a1a]">{f.value ?? <span className="text-[#c0c0c0]">—</span>}</div>
        </div>
      ))}
    </div>
  );
}

export function TextBlock({ label, value, tone = 'neutral' }: { label: string; value?: string | null; tone?: 'neutral' | 'green' | 'red' | 'yellow' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-[#fafaf8] border-[#e2e2e2]',
    green: 'bg-[#f0f9f5] border-[#dcfce7]',
    red: 'bg-[#fff5f5] border-[#fee2e2]',
    yellow: 'bg-[#fffdf5] border-[#fef9c3]',
  };
  return (
    <div>
      <div className="text-[10px] uppercase font-bold text-[#9a9a9a] tracking-widest mb-2">{label}</div>
      <p className={`text-sm text-[#1a1a1a] leading-relaxed p-4 rounded-xl border whitespace-pre-wrap ${tones[tone]}`}>
        {value?.trim() ? value : <span className="text-[#c0c0c0]">Nema unosa.</span>}
      </p>
    </div>
  );
}

interface AkcijaLike { akcija?: string; odgovorna?: string; rok?: string; status?: string; prioritet?: string; }

export function AkcijeTable({ akcije }: { akcije: AkcijaLike[] | null | undefined }) {
  const rows = (akcije || []).filter((a) => a.akcija?.trim());
  if (rows.length === 0) return <p className="text-sm text-[#c0c0c0]">Nema definiranih akcija.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e2e2e2] text-left text-[#9a9a9a]">
            <th className="py-2 px-2 font-medium">Akcija</th>
            <th className="py-2 px-2 font-medium">Odgovorna osoba</th>
            <th className="py-2 px-2 font-medium">Rok</th>
            <th className="py-2 px-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a, i) => (
            <tr key={i} className="border-b border-[#f0f0f0]">
              <td className="py-2 px-2 text-[#1a1a1a]">{a.akcija}</td>
              <td className="py-2 px-2 text-[#5a5a5a]">{a.odgovorna || '—'}</td>
              <td className="py-2 px-2 text-[#5a5a5a]">{a.rok || '—'}</td>
              <td className="py-2 px-2 text-[#5a5a5a]">{a.status || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
