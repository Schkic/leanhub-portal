"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

const CHECKLIST_ITEMS = [
  { id: 'sigurnost', text: 'Sigurnost radnika' },
  { id: '5s', text: '5S stanje radnog mjesta' },
  { id: 'tok', text: 'Tok materijala i WIP' },
  { id: 'standard', text: 'Standardizirani rad' },
  { id: 'kvaliteta', text: 'Kvaliteta i greške' },
  { id: 'oee', text: 'Učinkovitost strojeva (OEE)' },
  { id: 'vizual', text: 'Vizualni management' },
  { id: 'razgovor', text: 'Razgovor s radnicima' },
];

const RATING_CATEGORIJE = [
  { id: 'sig', label: 'Sigurnost' },
  { id: '5s', label: '5S i red' },
  { id: 'tok', label: 'Tok i produktivnost' },
  { id: 'kval', label: 'Kvaliteta' },
  { id: 'std', label: 'Standardizirani rad' },
  { id: 'rad', label: 'Angažiranost radnika' },
];

export default function GembaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('gemba_walk').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const checklist: Record<string, boolean> = record.checklist || {};
  const ocjene: Record<string, number> = record.ocjene || {};
  const zapazanja: any[] = record.zapazanja || [];

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🚶" badge="Gemba Walk" badgeColor="#2563eb" badgeBg="#eff6ff"
        title={record.lokacija || 'Gemba Walk'}
        subtitleParts={[record.voditelj, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null, record.cilj]}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Datum', value: record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null },
            { label: 'Vrijeme', value: record.pocetak && record.kraj ? `${record.pocetak}–${record.kraj}` : null },
            { label: 'Voditelj', value: record.voditelj },
            { label: 'Sudionici', value: record.sudionici },
            { label: 'Odjel / Pogon / Linija', value: record.lokacija },
            { label: 'Fokus obilaska', value: record.cilj },
          ]} />
        </DetailCard>

        {Object.keys(checklist).length > 0 && (
          <DetailCard icon="✅" title="Checklista">
            <div className="grid sm:grid-cols-2 gap-2">
              {CHECKLIST_ITEMS.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <span>{checklist[c.id] ? '✅' : '⬜'}</span>
                  <span className={checklist[c.id] ? 'text-[#1a1a1a]' : 'text-[#9a9a9a]'}>{c.text}</span>
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        {Object.keys(ocjene).length > 0 && (
          <DetailCard icon="⭐" title="Ocjena zatečenog stanja">
            <div className="space-y-2">
              {RATING_CATEGORIJE.map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="w-40 text-[#5a5a5a]">{c.label}</span>
                  <span>{'★'.repeat(ocjene[c.id] || 0)}{'☆'.repeat(5 - (ocjene[c.id] || 0))}</span>
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        <DetailCard icon="👁️" title="Zapažanja i gubici (Muda)" subtitle={`${zapazanja.filter((z) => z.opis?.trim()).length} zapažanja`}>
          {zapazanja.filter((z) => z.opis?.trim() || z.lokacija?.trim()).length === 0 ? (
            <p className="text-sm text-[#c0c0c0]">Nema unesenih zapažanja.</p>
          ) : (
            <div className="space-y-3">
              {zapazanja.filter((z) => z.opis?.trim() || z.lokacija?.trim()).map((z, i) => (
                <div key={i} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-xl p-3">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {z.lokacija && <span className="text-xs font-semibold text-[#1a1a1a]">{z.lokacija}</span>}
                    {z.vrsta && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">{z.vrsta}</span>}
                    {z.prioritet && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#fef9c3] text-[#ca8a04]">{z.prioritet}</span>}
                  </div>
                  {z.opis && <p className="text-sm text-[#1a1a1a]">{z.opis}</p>}
                  {z.uzrok && <p className="text-xs text-[#9a9a9a] mt-1">Mogući uzrok: {z.uzrok}</p>}
                </div>
              ))}
            </div>
          )}
        </DetailCard>

        <DetailCard icon="🎯" title="Akcijski plan">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        <DetailCard icon="📝" title="Sažetak obilaska">
          <div className="space-y-4">
            <TextBlock label="Ono što je dobro" value={record.sum_poz} tone="green" />
            <TextBlock label="Uočeni problemi" value={record.sum_prob} tone="red" />
            <TextBlock label="Hitno za riješiti" value={record.sum_hitno} tone="yellow" />
            {record.sum_sljedeci && <TextBlock label="Sljedeći obilazak" value={record.sum_sljedeci} />}
            {record.sum_potpis && <FieldGrid fields={[{ label: 'Potpis', value: record.sum_potpis }]} />}
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
