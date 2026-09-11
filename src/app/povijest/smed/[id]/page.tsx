"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

interface Aktivnost { naziv: string; trajanje: number; tip: string; prijedlog?: string; novaTip?: string; }

export default function SmedDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('smed').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const aktivnosti: Aktivnost[] = record.aktivnosti || [];
  const totalPrije = aktivnosti.reduce((s, a) => s + (a.trajanje || 0), 0);
  const novoInterne = aktivnosti.filter((a) => a.novaTip === 'interna').reduce((s, a) => s + (a.trajanje || 0), 0);
  const usteda = totalPrije - novoInterne;
  const poboljsanje = totalPrije > 0 ? Math.round((usteda / totalPrije) * 100) : 0;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="⚡" badge="SMED analiza" badgeColor="#ca8a04" badgeBg="#fefce8"
        title={record.stroj || 'SMED analiza'}
        subtitleParts={[record.proces, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null, record.odjel]}
        right={totalPrije > 0 && (
          <span className="text-xs font-bold px-4 py-2 rounded-full bg-[#e8f5f0] text-[#1a7a5e]">
            {poboljsanje > 0 ? `-${poboljsanje}%` : '—'} vrijeme izmjene
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Stroj / Oprema', value: record.stroj },
            { label: 'Proces / Operacija', value: record.proces },
            { label: 'Odjel', value: record.odjel },
            { label: 'Tim / Sudionici', value: record.tim },
          ]} />
        </DetailCard>

        <DetailCard icon="⏱️" title="Aktivnosti izmjene" subtitle={`Ukupno prije: ${totalPrije} min · Ušteda: ${usteda > 0 ? usteda : 0} min`}>
          {aktivnosti.filter((a) => a.naziv?.trim()).length === 0 ? (
            <p className="text-sm text-[#c0c0c0]">Nema unesenih aktivnosti.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e2e2e2] text-left text-[#9a9a9a]">
                    <th className="py-2 px-2 font-medium">Aktivnost</th>
                    <th className="py-2 px-2 font-medium">Trajanje</th>
                    <th className="py-2 px-2 font-medium">Trenutno</th>
                    <th className="py-2 px-2 font-medium">Nakon SMED-a</th>
                    <th className="py-2 px-2 font-medium">Prijedlog</th>
                  </tr>
                </thead>
                <tbody>
                  {aktivnosti.filter((a) => a.naziv?.trim()).map((a, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="py-2 px-2 text-[#1a1a1a]">{a.naziv}</td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{a.trajanje} min</td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${a.tip === 'interna' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{a.tip}</span>
                      </td>
                      <td className="py-2 px-2">
                        {a.novaTip && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${a.novaTip === 'interna' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{a.novaTip}</span>}
                      </td>
                      <td className="py-2 px-2 text-[#5a5a5a]">{a.prijedlog || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailCard>

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
