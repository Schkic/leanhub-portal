"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

type PitanjeStatus = '' | 'da' | 'ne' | 'na';
interface Pitanje { tekst: string; status: PitanjeStatus; napomena: string; }

const STATUS_LABEL: Record<string, string> = { da: '✅ Da', ne: '⚠️ Ne', na: '➖ N/P', '': '— Neocijenjeno' };

export default function LPADetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('lpa_audit').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const pitanja: Pitanje[] = (record.pitanja || []).filter((p: Pitanje) => p.tekst?.trim());
  const ocijenjena = pitanja.filter(p => p.status === 'da' || p.status === 'ne');
  const daBroj = pitanja.filter(p => p.status === 'da').length;
  const neBroj = pitanja.filter(p => p.status === 'ne').length;
  const usklađenost = ocijenjena.length > 0 ? Math.round((daBroj / ocijenjena.length) * 100) : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🔁" badge="LPA — Layered Process Audit" badgeColor="#0e7490" badgeBg="#ecfeff"
        title={record.proces || 'LPA audit'}
        subtitleParts={[record.sloj, record.auditor, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null]}
        right={usklađenost !== null && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: usklađenost >= 90 ? '#1a7a5e' : usklađenost >= 70 ? '#ca8a04' : '#dc2626', background: usklađenost >= 90 ? '#e8f5f0' : usklađenost >= 70 ? '#fefce8' : '#fef2f2' }}>
            {usklađenost}% usklađenost ({daBroj} Da / {neBroj} Ne)
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Proces / točka audita', value: record.proces },
            { label: 'Sloj audita', value: record.sloj },
            { label: 'Auditor', value: record.auditor },
          ]} />
        </DetailCard>

        {pitanja.length > 0 && (
          <DetailCard icon="🔁" title="Pitanja audita">
            <div className="space-y-2">
              {pitanja.map((p, i) => (
                <div key={i} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[#1a1a1a]">{p.tekst}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        color: p.status === 'da' ? '#1a7a5e' : p.status === 'ne' ? '#dc2626' : '#5a5a5a',
                        background: p.status === 'da' ? '#e8f5f0' : p.status === 'ne' ? '#fef2f2' : '#f0f0f0',
                      }}
                    >
                      {STATUS_LABEL[p.status] || STATUS_LABEL['']}
                    </span>
                  </div>
                  {p.napomena && <p className="text-xs text-[#9a9a9a] mt-1">{p.napomena}</p>}
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        <DetailCard icon="🎯" title="Akcijski plan">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        {record.napomena && (
          <DetailCard icon="📝" title="Napomena">
            <TextBlock label="Napomena / Zaključak" value={record.napomena} />
          </DetailCard>
        )}
      </div>
    </div>
  );
}
