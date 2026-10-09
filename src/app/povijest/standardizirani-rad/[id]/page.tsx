"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

interface Operacija { opis: string; rucno: string; strojno: string; hod: string; wip: string; napomena: string; }

const n = (v: string) => parseFloat((v || '').replace(',', '.')) || 0;

export default function StandardiziraniRadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('standard_work').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const operacije: Operacija[] = (record.operacije || []).filter((o: Operacija) => o.opis?.trim());
  const ukupnoRucno = operacije.reduce((s, o) => s + n(o.rucno), 0);
  const ukupnoStrojno = operacije.reduce((s, o) => s + n(o.strojno), 0);
  const ukupnoHod = operacije.reduce((s, o) => s + n(o.hod), 0);
  const ciklusOperatera = ukupnoRucno + ukupnoHod;
  const takt = record.takt_vrijeme ? Number(record.takt_vrijeme) : null;
  const iskoristenost = takt ? Math.round((ciklusOperatera / takt) * 100) : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="📐" badge="Standardizirani rad" badgeColor="#4338ca" badgeBg="#eef2ff"
        title={record.proces || 'Standardizirani rad'}
        subtitleParts={[record.operater, record.odjel, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null]}
        right={iskoristenost !== null && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: iskoristenost > 100 ? '#dc2626' : iskoristenost >= 95 ? '#ca8a04' : '#1a7a5e', background: iskoristenost > 100 ? '#fef2f2' : iskoristenost >= 95 ? '#fefce8' : '#e8f5f0' }}>
            {iskoristenost}% takta ({ciklusOperatera}s ciklus / {takt}s takt)
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Proces / Linija', value: record.proces },
            { label: 'Operater', value: record.operater },
            { label: 'Odjel / Pogon', value: record.odjel },
            { label: 'Takt vrijeme', value: takt ? `${takt} s` : null },
          ]} />
        </DetailCard>

        {operacije.length > 0 && (
          <DetailCard icon="⏱️" title="Operacije (SWCT)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2]">
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Opis koraka</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Ručno</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Strojno</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Hod</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Std. WIP</th>
                    <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Napomena</th>
                  </tr>
                </thead>
                <tbody>
                  {operacije.map((o, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#9a9a9a] text-center">{i + 1}</td>
                      <td className="py-2 px-2 text-[#1a1a1a]">{o.opis}</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{o.rucno || '—'}s</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{o.strojno || '—'}s</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{o.hod || '—'}s</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{o.wip || '—'}</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{o.napomena || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold text-[#1a1a1a]">
                    <td></td>
                    <td className="py-2 px-2">Ukupno</td>
                    <td className="py-2 px-2">{ukupnoRucno}s</td>
                    <td className="py-2 px-2">{ukupnoStrojno}s</td>
                    <td className="py-2 px-2">{ukupnoHod}s</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
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
