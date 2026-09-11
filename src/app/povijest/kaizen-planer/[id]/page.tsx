"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

interface TeamMember { ime: string; odjel: string; uloga: string; dostupnost: string; }
interface KPIRow { naziv: string; trenutno: string; cilj: string; postignuto: string; }
interface AgendaItem { vrijeme: string; aktivnost: string; odgovoran: string; }
interface AgendaDay { dan: number; stavke: AgendaItem[]; }

export default function KaizenPlanerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('kaizen_planer').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const tim: TeamMember[] = record.tim || [];
  const kpi: KPIRow[] = record.kpi || [];
  const agenda: AgendaDay[] = record.agenda || [];

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="📅" badge="Kaizen Event" badgeColor="#ea580c" badgeBg="#fff7ed"
        title={record.naziv || 'Kaizen Event'}
        subtitleParts={[record.proces, record.voditelj, record.datum_od ? new Date(record.datum_od).toLocaleDateString('hr-HR') : null]}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Proces / područje', value: record.proces },
            { label: 'Trajanje', value: record.trajanje ? `${record.trajanje} dana` : null },
            { label: 'Datum početka', value: record.datum_od ? new Date(record.datum_od).toLocaleDateString('hr-HR') : null },
            { label: 'Datum završetka', value: record.datum_do ? new Date(record.datum_do).toLocaleDateString('hr-HR') : null },
            { label: 'Voditelj', value: record.voditelj },
            { label: 'Sponzor', value: record.sponzor },
          ]} />
          {record.opis && <div className="mt-4"><TextBlock label="Opis problema / razlog pokretanja" value={record.opis} /></div>}
        </DetailCard>

        {tim.filter((t) => t.ime?.trim()).length > 0 && (
          <DetailCard icon="👥" title="Tim">
            <div className="space-y-1.5">
              {tim.filter((t) => t.ime?.trim()).map((t, i) => (
                <div key={i} className="flex flex-wrap items-center gap-x-3 text-sm">
                  <span className="font-semibold text-[#1a1a1a]">{t.ime}</span>
                  <span className="text-[#9a9a9a]">{t.uloga}</span>
                  <span className="text-[#9a9a9a]">{t.odjel}</span>
                  <span className="text-xs text-[#c0c0c0]">{t.dostupnost}</span>
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        {kpi.filter((k) => k.naziv?.trim()).length > 0 && (
          <DetailCard icon="🎯" title="KPI ciljevi">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2] text-left text-[#9a9a9a]">
                    <th className="py-2 px-2 font-medium">KPI</th>
                    <th className="py-2 px-2 font-medium">Trenutno</th>
                    <th className="py-2 px-2 font-medium">Cilj</th>
                    <th className="py-2 px-2 font-medium">Postignuto</th>
                  </tr>
                </thead>
                <tbody>
                  {kpi.filter((k) => k.naziv?.trim()).map((k, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#1a1a1a]">{k.naziv}</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{k.trenutno || '—'}</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{k.cilj || '—'}</td>
                      <td className="py-2 px-2 text-[#1a7a5e] font-semibold">{k.postignuto || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>
        )}

        {(record.ba_prije || record.ba_poslije) && (
          <DetailCard icon="🔄" title="Stanje prije / poslije">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextBlock label="Prije" value={record.ba_prije} tone="red" />
              <TextBlock label="Poslije" value={record.ba_poslije} tone="green" />
            </div>
          </DetailCard>
        )}

        {agenda.length > 0 && (
          <DetailCard icon="🗓️" title="Agenda">
            <div className="space-y-4">
              {agenda.map((d) => (
                <div key={d.dan}>
                  <div className="text-xs font-bold text-[#5a5a5a] mb-1.5">Dan {d.dan}</div>
                  <div className="space-y-1">
                    {(d.stavke || []).filter((s) => s.aktivnost?.trim()).map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-[#9a9a9a] w-16 shrink-0">{s.vrijeme}</span>
                        <span className="text-[#1a1a1a] flex-1">{s.aktivnost}</span>
                        <span className="text-[#9a9a9a] text-xs">{s.odgovoran}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        <DetailCard icon="✅" title="Akcijski plan (30-60-90)">
          <AkcijeTable akcije={record.akcije} />
        </DetailCard>

        {(record.zakljucak_good || record.zakljucak_improve || record.zakljucak_general) && (
          <DetailCard icon="📝" title="Zaključci i naučene lekcije">
            <TextBlock label="Što je dobro prošlo" value={record.zakljucak_good} tone="green" />
            <div className="mt-4"><TextBlock label="Što poboljšati sljedeći put" value={record.zakljucak_improve} tone="yellow" /></div>
            <div className="mt-4"><TextBlock label="Opći zaključak" value={record.zakljucak_general} /></div>
          </DetailCard>
        )}
      </div>
    </div>
  );
}
