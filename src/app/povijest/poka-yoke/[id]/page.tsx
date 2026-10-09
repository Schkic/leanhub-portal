"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  'Ideja / prijedlog': { bg: '#f0f0f0', color: '#5a5a5a' },
  'U izradi': { bg: '#fefce8', color: '#ca8a04' },
  'Testira se': { bg: '#eff6ff', color: '#2563eb' },
  'Implementirano': { bg: '#e8f5f0', color: '#1a7a5e' },
  'Potvrđeno djeluje': { bg: '#e8f5f0', color: '#1a7a5e' },
};

export default function PokaYokeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('poka_yoke').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const statusBoja = record.status ? STATUS_COLOR[record.status] : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🛡️" badge="Poka-Yoke registar" badgeColor="#be185d" badgeBg="#fdf2f8"
        title={record.naziv || 'Poka-Yoke rješenje'}
        subtitleParts={[record.proces, record.odgovorna, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null]}
        right={statusBoja && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: statusBoja.color, background: statusBoja.bg }}>
            {record.status}
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Naziv rješenja', value: record.naziv },
            { label: 'Proces / stroj / korak', value: record.proces },
            { label: 'Tip rješenja', value: record.tip },
            { label: 'Mehanizam', value: record.mehanizam },
            { label: 'Odgovorna osoba', value: record.odgovorna },
            { label: 'Status', value: record.status },
          ]} />
        </DetailCard>

        {(record.greska_sprijecena || record.opis || record.ucinak) && (
          <DetailCard icon="🛡️" title="Opis rješenja">
            {record.greska_sprijecena && <TextBlock label="Koju grešku sprječava" value={record.greska_sprijecena} />}
            {record.opis && <TextBlock label="Kako rješenje djeluje" value={record.opis} />}
            {record.ucinak && <TextBlock label="Učinak / rezultat" value={record.ucinak} />}
          </DetailCard>
        )}

        <DetailCard icon="🎯" title="Akcijski plan">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        {record.napomena && (
          <DetailCard icon="📝" title="Napomena">
            <TextBlock label="Napomena" value={record.napomena} />
          </DetailCard>
        )}
      </div>
    </div>
  );
}
