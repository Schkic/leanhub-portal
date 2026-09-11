"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

export default function ZastoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('pet_zasto').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const analize: { problem: string; zasto: string[]; korijen: string }[] = record.analize || [];

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="❓" badge="5×Zašto" badgeColor="#dc2626" badgeBg="#fef2f2"
        title={record.odjel || '5×Zašto analiza'}
        subtitleParts={[record.voditelj, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null, record.kategorija]}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Voditelj analize', value: record.voditelj },
            { label: 'Tim / Sudionici', value: record.tim },
            { label: 'Odjel / Linija / Proces', value: record.odjel },
            { label: 'Broj izvještaja', value: record.broj },
            { label: 'Kategorija problema', value: record.kategorija },
          ]} />
        </DetailCard>

        {analize.filter((a) => a.problem?.trim()).map((a, ai) => (
          <DetailCard key={ai} icon="🔍" title={`Analiza ${ai + 1}`}>
            <TextBlock label="Problem" value={a.problem} tone="red" />
            <div className="mt-4 space-y-2">
              {(a.zasto || []).map((z, wi) => z?.trim() && (
                <div key={wi} className="flex gap-3 text-sm">
                  <span className="font-bold text-[#1a7a5e] shrink-0">Zašto {wi + 1}?</span>
                  <span className="text-[#1a1a1a]">{z}</span>
                </div>
              ))}
            </div>
            <div className="mt-4"><TextBlock label="Korijenski uzrok (zaključak)" value={a.korijen} tone="green" /></div>
          </DetailCard>
        ))}

        <DetailCard icon="🎯" title="Korektivne i preventivne akcije">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        <DetailCard icon="📝" title="Sažetak i zaključci">
          <TextBlock label="Sažetak korijenskih uzroka" value={record.sum_uzroci} />
          <div className="mt-4"><TextBlock label="Očekivani rezultat" value={record.sum_ocekivano} /></div>
          {record.sum_provjera && <div className="mt-4"><TextBlock label="Datum provjere" value={record.sum_provjera} /></div>}
          <div className="mt-4"><TextBlock label="Postignuti rezultat" value={record.sum_rezultat} tone="green" /></div>
          {record.sum_potpis && <div className="mt-4"><FieldGrid fields={[{ label: 'Potpis', value: record.sum_potpis }]} /></div>}
        </DetailCard>
      </div>
    </div>
  );
}
