"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const getStatusColor = (status: string) => {
  if (status === 'Završeno') return { color: '#16a34a', bg: '#f0fdf4' };
  if (status === 'Odobreno' || status === 'U provedbi') return { color: '#2563eb', bg: '#eff6ff' };
  if (status === 'Odbijeno') return { color: '#dc2626', bg: '#fef2f2' };
  if (status === 'U razmatranju') return { color: '#ca8a04', bg: '#fefce8' };
  return { color: '#6b7280', bg: '#f9fafb' };
};

export default function KaizenDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('kaizen_prijedlog').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const statusColor = getStatusColor(record.status);

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="♾️" badge="Kaizen prijedlog" badgeColor="#1a7a5e" badgeBg="#e8f5f0"
        title={record.prob_gdje || record.odjel || 'Kaizen prijedlog'}
        subtitleParts={[record.ime || 'Anonimno', record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null, record.kategorija]}
        right={record.status && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: statusColor.color, background: statusColor.bg }}>
            {record.status}
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="👤" title="Podnositelj prijedloga">
          <FieldGrid fields={[
            { label: 'Ime i prezime', value: record.ime || 'Anonimno' },
            { label: 'Odjel / Pogon', value: record.odjel },
            { label: 'Radno mjesto', value: record.radno_mjesto },
            { label: 'Kategorija', value: record.kategorija },
            { label: 'Prioritet', value: record.prioritet },
          ]} />
        </DetailCard>

        <DetailCard icon="⚠️" title="Problem / prilika">
          <TextBlock label="Gdje se problem pojavljuje?" value={record.prob_gdje} />
          <div className="mt-4"><TextBlock label="Opis problema / prilike" value={record.prob_opis} tone="red" /></div>
          {(record.ba_prije || record.ba_poslije) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <TextBlock label="Stanje prije" value={record.ba_prije} />
              <TextBlock label="Stanje poslije (očekivano)" value={record.ba_poslije} tone="green" />
            </div>
          )}
        </DetailCard>

        <DetailCard icon="💡" title="Predloženo rješenje">
          <TextBlock label="Rješenje" value={record.rjes_opis} tone="green" />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <TextBlock label="Što je potrebno za implementaciju?" value={record.rjes_potrebno} />
            <TextBlock label="Procijenjeni trošak" value={record.rjes_trosak} />
          </div>
        </DetailCard>

        {record.closed_at && (
          <DetailCard icon="✅" title="Zatvaranje">
            <FieldGrid fields={[{ label: 'Zatvoreno', value: new Date(record.closed_at).toLocaleDateString('hr-HR') }]} />
          </DetailCard>
        )}
      </div>
    </div>
  );
}
