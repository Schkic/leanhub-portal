"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const getCiljColor = (cilj: string) => {
  if (cilj === 'Da — cilj postignut') return { color: '#16a34a', bg: '#f0fdf4' };
  if (cilj === 'Djelomično') return { color: '#ca8a04', bg: '#fefce8' };
  return { color: '#dc2626', bg: '#fef2f2' };
};

export default function A3DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('a3_obrazac').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const zasto: string[] = record.zasto || [];
  const ciljColor = record.cilj_postignut ? getCiljColor(record.cilj_postignut) : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="📄" badge="A3 Obrazac" badgeColor="#ea580c" badgeBg="#fff7ed"
        title={record.naslov || 'A3 obrazac'}
        subtitleParts={[record.vlasnik, record.datum_otvaranja ? new Date(record.datum_otvaranja).toLocaleDateString('hr-HR') : null, record.broj_a3]}
        right={ciljColor && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: ciljColor.color, background: ciljColor.bg }}>
            {record.cilj_postignut}
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Zaglavlje">
          <FieldGrid fields={[
            { label: 'Vlasnik A3', value: record.vlasnik },
            { label: 'Odjel / Pogon / Linija', value: record.odjel },
            { label: 'Tim / Sudionici', value: record.tim },
            { label: 'Ciljni datum rješenja', value: record.datum_ciljni ? new Date(record.datum_ciljni).toLocaleDateString('hr-HR') : null },
          ]} />
        </DetailCard>

        <DetailCard icon="1️⃣" title="Pozadina i definicija problema (5W)">
          <TextBlock label="Pozadina" value={record.pozadina} />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <TextBlock label="Što?" value={record.sto} />
            <TextBlock label="Gdje?" value={record.gdje} />
            <TextBlock label="Kada?" value={record.kada} />
            <TextBlock label="Koliko?" value={record.koliko} />
          </div>
          {record.vizual && <div className="mt-4"><TextBlock label="Vizualni prikaz problema" value={record.vizual} /></div>}
        </DetailCard>

        <DetailCard icon="2️⃣" title="Analiza korijenskog uzroka (5×Zašto)">
          <TextBlock label="Simptom" value={record.simptom} tone="red" />
          {zasto.filter(Boolean).length > 0 && (
            <div className="mt-4 space-y-2">
              {zasto.map((z, i) => z?.trim() && (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-bold text-[#1a7a5e] shrink-0">Zašto {i + 1}?</span>
                  <span className="text-[#1a1a1a]">{z}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4"><TextBlock label="Korijenski uzrok" value={record.korijen} tone="green" /></div>
        </DetailCard>

        <DetailCard icon="3️⃣" title="Ciljno stanje i KPI">
          <TextBlock label="Ciljno stanje" value={record.ciljno} />
          <div className="mt-4">
            <FieldGrid fields={[
              { label: 'KPI', value: record.kpi_naziv },
              { label: 'Trenutno', value: record.kpi_trenutno },
              { label: 'Ciljano', value: record.kpi_ciljano },
            ]} />
          </div>
        </DetailCard>

        <DetailCard icon="🎯" title="Akcijski plan">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        <DetailCard icon="4️⃣" title="Provjera rezultata">
          <FieldGrid fields={[
            { label: 'Datum provjere', value: record.datum_provjere ? new Date(record.datum_provjere).toLocaleDateString('hr-HR') : null },
            { label: 'KPI postignuto', value: record.kpi_postignuto },
          ]} />
          {record.rezultati && <div className="mt-4"><TextBlock label="Rezultati" value={record.rezultati} /></div>}
        </DetailCard>

        {(record.standardizacija || record.sirenje || record.lekcije) && (
          <DetailCard icon="5️⃣" title="Standardizacija i pouke">
            <TextBlock label="Standardizacija" value={record.standardizacija} />
            <div className="mt-4"><TextBlock label="Širenje na druga područja" value={record.sirenje} /></div>
            <div className="mt-4"><TextBlock label="Naučene lekcije" value={record.lekcije} /></div>
          </DetailCard>
        )}

        {(record.potpis || record.odobrio) && (
          <DetailCard icon="✍️" title="Potpisi">
            <FieldGrid fields={[
              { label: 'Potpis vlasnika', value: record.potpis },
              { label: 'Odobrio', value: record.odobrio },
            ]} />
          </DetailCard>
        )}
      </div>
    </div>
  );
}
