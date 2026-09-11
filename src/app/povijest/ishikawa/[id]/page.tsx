"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const KATEGORIJE_DEFAULT = [
  { id: 'covjek', label: 'Čovjek', emoji: '👷', color: '#1a7a5e', bg: '#e8f5f0' },
  { id: 'stroj', label: 'Stroj', emoji: '⚙️', color: '#2563eb', bg: '#eff6ff' },
  { id: 'metoda', label: 'Metoda', emoji: '📋', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'materijal', label: 'Materijal', emoji: '📦', color: '#ca8a04', bg: '#fefce8' },
  { id: 'mjerenje', label: 'Mjerenje', emoji: '📏', color: '#dc2626', bg: '#fef2f2' },
  { id: 'okolis', label: 'Okoliš', emoji: '🌱', color: '#0891b2', bg: '#ecfeff' },
];

export default function IshikawaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('ishikawa').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const kategorije: Record<string, string[]> = record.kategorije || {};

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🐟" badge="Ishikawa dijagram" badgeColor="#dc2626" badgeBg="#fef2f2"
        title={record.problem || 'Ishikawa dijagram'}
        subtitleParts={[record.tim, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null, record.odjel]}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Tim / Sudionici', value: record.tim },
            { label: 'Odjel / Pogon', value: record.odjel },
          ]} />
        </DetailCard>

        <div className="grid sm:grid-cols-2 gap-4">
          {KATEGORIJE_DEFAULT.map((kat) => {
            const uzroci = (kategorije[kat.id] || []).filter((u) => u?.trim());
            if (uzroci.length === 0) return null;
            return (
              <div key={kat.id} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: kat.bg }}>
                  <span>{kat.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: kat.color }}>{kat.label}</span>
                </div>
                <ul className="p-3 space-y-1.5">
                  {uzroci.map((u, i) => (
                    <li key={i} className="text-sm text-[#1a1a1a] flex gap-2"><span className="text-[#9a9a9a]">{i + 1}.</span>{u}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <DetailCard icon="✅" title="Zaključak analize">
          <TextBlock label="Korijenski uzrok (zaključak)" value={record.korijenski_uzrok} tone="green" />
          <div className="mt-4"><TextBlock label="Napomena / Sljedeći koraci" value={record.napomena} /></div>
        </DetailCard>
      </div>
    </div>
  );
}
