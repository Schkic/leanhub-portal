"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { DetailHeader, DetailCard, FieldGrid, TextBlock, AkcijeTable, DetailLoading, DetailNotFound } from '@/components/povijest/DetailShell';

type KategorijaId = 'ciscenje' | 'inspekcija' | 'podmazivanje' | 'pritezanje' | 'sigurnost';
interface Tocka { tekst: string; status: '' | 'ok' | 'problem' | 'na'; napomena: string; }

const KATEGORIJE_DEFAULT: { id: KategorijaId; label: string; emoji: string; color: string; bg: string }[] = [
  { id: 'ciscenje',     label: 'Čišćenje (Clean)',      emoji: '🧹', color: '#2563eb', bg: '#eff6ff' },
  { id: 'inspekcija',   label: 'Inspekcija (Inspect)',  emoji: '🔍', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'podmazivanje', label: 'Podmazivanje (Lubricate)', emoji: '🛢️', color: '#ca8a04', bg: '#fefce8' },
  { id: 'pritezanje',   label: 'Pritezanje (Tighten)',  emoji: '🔧', color: '#1a7a5e', bg: '#e8f5f0' },
  { id: 'sigurnost',    label: 'Sigurnost',             emoji: '⚠️', color: '#dc2626', bg: '#fef2f2' },
];

const STATUS_LABEL: Record<string, string> = { ok: '✅ U redu', problem: '⚠️ Problem', na: '➖ N/P', '': '— Neocijenjeno' };

export default function TPMDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await requireAuth(router);
      if (!user) return;
      const { data } = await supabase.from('tpm_checklist').select('*').eq('id', id).single();
      setRecord(data);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <DetailLoading />;
  if (!record) return <DetailNotFound />;

  const stavke: Record<KategorijaId, Tocka[]> = record.stavke || {};
  const sveTocke = Object.values(stavke).flat().filter((t: Tocka) => t.tekst?.trim());
  const ocijenjene = sveTocke.filter((t: Tocka) => t.status === 'ok' || t.status === 'problem');
  const okBroj = sveTocke.filter((t: Tocka) => t.status === 'ok').length;
  const problemBroj = sveTocke.filter((t: Tocka) => t.status === 'problem').length;
  const ocjena = ocijenjene.length > 0 ? Math.round((okBroj / ocijenjene.length) * 100) : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <DetailHeader
        emoji="🛠️" badge="TPM — Autonomno održavanje" badgeColor="#dc2626" badgeBg="#fef2f2"
        title={record.stroj || 'TPM checklista'}
        subtitleParts={[record.voditelj, record.smjena, record.datum ? new Date(record.datum).toLocaleDateString('hr-HR') : null]}
        right={ocjena !== null && (
          <span className="text-xs font-bold px-4 py-2 rounded-full" style={{ color: ocjena >= 90 ? '#1a7a5e' : ocjena >= 70 ? '#ca8a04' : '#dc2626', background: ocjena >= 90 ? '#e8f5f0' : ocjena >= 70 ? '#fefce8' : '#fef2f2' }}>
            {ocjena}% ispravnost ({okBroj} OK / {problemBroj} problema)
          </span>
        )}
      />

      <div className="max-w-[900px] mx-auto px-6 mt-6 space-y-4">
        <DetailCard icon="📋" title="Osnovni podaci">
          <FieldGrid fields={[
            { label: 'Stroj / Oprema', value: record.stroj },
            { label: 'Smjena', value: record.smjena },
            { label: 'Voditelj / Operater', value: record.voditelj },
            { label: 'Odjel / Pogon', value: record.odjel },
          ]} />
        </DetailCard>

        {KATEGORIJE_DEFAULT.map((kat) => {
          const tocke = (stavke[kat.id] || []).filter((t) => t.tekst?.trim());
          if (tocke.length === 0) return null;
          return (
            <DetailCard key={kat.id} icon={kat.emoji} title={kat.label}>
              <div className="space-y-2">
                {tocke.map((t, i) => (
                  <div key={i} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-[#1a1a1a]">{t.tekst}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          color: t.status === 'ok' ? '#1a7a5e' : t.status === 'problem' ? '#dc2626' : '#5a5a5a',
                          background: t.status === 'ok' ? '#e8f5f0' : t.status === 'problem' ? '#fef2f2' : '#f0f0f0',
                        }}
                      >
                        {STATUS_LABEL[t.status] || STATUS_LABEL['']}
                      </span>
                    </div>
                    {t.napomena && <p className="text-xs text-[#9a9a9a] mt-1">{t.napomena}</p>}
                  </div>
                ))}
              </div>
            </DetailCard>
          );
        })}

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
