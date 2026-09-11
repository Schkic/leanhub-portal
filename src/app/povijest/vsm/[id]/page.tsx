"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  supplier: { label: 'Dobavljač', emoji: '🏭' },
  customer: { label: 'Kupac', emoji: '👤' },
  process: { label: 'Proces', emoji: '⬜' },
  operator: { label: 'Radnik/Operator', emoji: '👷' },
  control: { label: 'Planiranje (PPC)', emoji: '📋' },
  inventory: { label: 'Zaliha', emoji: '▲' },
  supermarket: { label: 'Supermarket', emoji: '📦' },
  fifo: { label: 'FIFO traka', emoji: '➡️' },
  transport: { label: 'Transport', emoji: '🚚' },
  kanban_prod: { label: 'Proizvodni kanban', emoji: '🎴' },
  kanban_pull: { label: 'Povlačeći kanban', emoji: '🔄' },
  kanban_signal: { label: 'Signalni kanban', emoji: '🔺' },
  kanban_box: { label: 'Kanban kutija', emoji: '📫' },
  kaizen: { label: 'Kaizen blic', emoji: '⚡' },
  timeline: { label: 'Vremenska linija', emoji: '📏' },
};

const KONEKCIJA_LABEL: Record<string, string> = {
  material: 'Materijal (kruto)', info: 'Info (isprekidano)', push: 'Push', pull: 'Pull',
  einfo: 'Elektronska info', rinfo: 'Ručna info',
};

export default function VSMDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('vsm_dijagram').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const elementi: any[] = record.elementi || [];
  const konekcije: any[] = record.konekcije || [];
  const nazivEl = (id: string) => elementi.find((e) => e.id === id)?.naziv || TYPE_LABEL[elementi.find((e) => e.id === id)?.type]?.label || '?';

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🗺️" badge="VSM dijagram" badgeColor="#1d4ed8" badgeBg="#eff6ff"
        title={record.naziv || 'VSM dijagram'}
        subtitleParts={[`${elementi.length} elemenata`, `${konekcije.length} konekcija`, new Date(record.created_at).toLocaleDateString('hr-HR')]}
        right={
          <a href={`/alati/vsm-builder`} className="text-xs font-semibold text-[#1a7a5e] hover:underline self-start mt-2">
            Otvori u uređivaču →
          </a>
        }
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="🔷" title="Elementi dijagrama">
          {elementi.length === 0 ? (
            <p className="text-sm text-[#c0c0c0]">Dijagram još nema elemenata.</p>
          ) : (
            <div className="space-y-2">
              {elementi.map((el) => {
                const def = TYPE_LABEL[el.type] || { label: el.type, emoji: '🔷' };
                const podaci: Record<string, string> = el.podaci || {};
                const podaciFiltered = Object.entries(podaci).filter(([, v]) => v?.trim?.());
                return (
                  <div key={el.id} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{def.emoji}</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{el.naziv || def.label}</span>
                      <span className="text-[10px] font-semibold text-[#9a9a9a] bg-[#f0f0f0] px-2 py-0.5 rounded">{def.label}</span>
                    </div>
                    {podaciFiltered.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#5a5a5a] mt-1">
                        {podaciFiltered.map(([k, v]) => <span key={k}>{k}: <strong>{v}</strong></span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DetailCard>

        <DetailCard icon="🔗" title="Konekcije">
          {konekcije.length === 0 ? (
            <p className="text-sm text-[#c0c0c0]">Nema definiranih konekcija.</p>
          ) : (
            <div className="space-y-1.5">
              {konekcije.map((k) => (
                <div key={k.id} className="flex items-center gap-2 text-sm text-[#1a1a1a]">
                  <span>{nazivEl(k.fromId)}</span>
                  <span className="text-[#9a9a9a]">→</span>
                  <span>{nazivEl(k.toId)}</span>
                  <span className="ml-auto text-[10px] font-semibold text-[#9a9a9a] bg-[#f0f0f0] px-2 py-0.5 rounded">{KONEKCIJA_LABEL[k.tip] || k.tip}</span>
                </div>
              ))}
            </div>
          )}
        </DetailCard>
      </div>
    </div>
  );
}
