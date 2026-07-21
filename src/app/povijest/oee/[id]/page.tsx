"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Smjena {
  naziv: string;
  planirano: number;
  zastoji: number;
  idealniTakt: number;
  ukupnoKomada: number;
  dobriKomadi: number;
}

interface Stroj {
  naziv: string;
  smjene: Smjena[];
}

const calcOEE = (smjena: Smjena) => {
  const { planirano, zastoji, idealniTakt, ukupnoKomada, dobriKomadi } = smjena;
  const operativno = planirano - zastoji;
  if (planirano <= 0 || operativno <= 0 || idealniTakt <= 0) return { A: 0, P: 0, Q: 0, OEE: 0 };
  const A = Math.min((operativno / planirano) * 100, 100);
  const maxKomada = operativno / idealniTakt;
  const P = Math.min(maxKomada > 0 ? (ukupnoKomada / maxKomada) * 100 : 0, 100);
  const Q = Math.min(ukupnoKomada > 0 ? (dobriKomadi / ukupnoKomada) * 100 : 0, 100);
  const OEE = (A / 100) * (P / 100) * (Q / 100) * 100;
  return { A: +A.toFixed(1), P: +P.toFixed(1), Q: +Q.toFixed(1), OEE: +OEE.toFixed(1) };
};

const calcStrojAvg = (stroj: Stroj) => {
  const results = stroj.smjene.map(calcOEE);
  const valid = results.filter(r => r.OEE > 0);
  if (valid.length === 0) return { A: 0, P: 0, Q: 0, OEE: 0 };
  const avg = (arr: number[]) => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  return {
    A: avg(valid.map(r => r.A)),
    P: avg(valid.map(r => r.P)),
    Q: avg(valid.map(r => r.Q)),
    OEE: avg(valid.map(r => r.OEE)),
  };
};

const getOEEColor = (oee: number) => {
  if (oee >= 85) return { bg: 'bg-[#e8f5f0]', text: 'text-[#1a7a5e]', label: 'World Class ⭐', hex: '#1a7a5e' };
  if (oee >= 75) return { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', label: 'Dobro 👍', hex: '#16a34a' };
  if (oee >= 60) return { bg: 'bg-[#fef9c3]', text: 'text-[#ca8a04]', label: 'Prosječno ⚠️', hex: '#ca8a04' };
  if (oee >= 40) return { bg: 'bg-[#ffedd5]', text: 'text-[#ea580c]', label: 'Loše 🔴', hex: '#ea580c' };
  return { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]', label: 'Kritično 🚨', hex: '#dc2626' };
};

export default function OEEDetailPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const user = await requireAuth(router);
      if (!user) return;

      // Dohvati ovaj zapis
      const { data } = await supabase.from('oee_kalkulator')
        .select('*').eq('id', params.id).single();
      setRecord(data);

      // Dohvati povijest za grafove
      const { data: hist } = await supabase.from('oee_kalkulator')
        .select('id, period, created_at, strojevi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(24);
      setHistory(hist || []);
      setLoading(false);
    };
    fetch();
  }, [params.id, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin" size={32}/>
    </div>
  );

  if (!record) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-[#9a9a9a]">Zapis nije pronađen.</p>
      <button onClick={() => router.back()} className="text-[#1a7a5e] font-semibold hover:underline">← Natrag</button>
    </div>
  );

  const strojevi: Stroj[] = record.strojevi || [];
  const strojAvgs = strojevi.map(calcStrojAvg);
  const validAvgs = strojAvgs.filter(r => r.OEE > 0);
  const ukupniOEE = validAvgs.length > 0
    ? +(validAvgs.reduce((a, b) => a + b.OEE, 0) / validAvgs.length).toFixed(1)
    : 0;
  const ukupniColor = getOEEColor(ukupniOEE);

  // Graf podaci — OEE po periodu
  const grafData = history.map(h => {
    const st: Stroj[] = h.strojevi || [];
    const avgs = st.map(calcStrojAvg).filter(r => r.OEE > 0);
    const oee = avgs.length > 0 ? +(avgs.reduce((a, b) => a + b.OEE, 0) / avgs.length).toFixed(1) : 0;
    const a = avgs.length > 0 ? +(avgs.reduce((sum, b) => sum + b.A, 0) / avgs.length).toFixed(1) : 0;
    const p = avgs.length > 0 ? +(avgs.reduce((sum, b) => sum + b.P, 0) / avgs.length).toFixed(1) : 0;
    const q = avgs.length > 0 ? +(avgs.reduce((sum, b) => sum + b.Q, 0) / avgs.length).toFixed(1) : 0;
    return {
      period: h.period || new Date(h.created_at).toLocaleDateString('hr-HR', { month: 'short', year: '2-digit' }),
      OEE: oee, A: a, P: p, Q: q,
      active: h.id === params.id,
    };
  });

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-5">
        <div className="max-w-[1000px] mx-auto">
          <button onClick={() => router.push('/povijest')} className="flex items-center gap-2 text-sm text-[#5a5a5a] hover:text-[#1a7a5e] transition-colors mb-3">
            <ArrowLeft size={16}/> Natrag na povijest
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-2">📊 OEE Izračun</div>
              <h1 className="font-serif text-2xl text-[#1a1a1a]">{record.pogon || 'OEE Izračun'}</h1>
              <p className="text-sm text-[#5a5a5a] mt-1">{record.period} · {record.odgovorna_osoba}</p>
            </div>
            <div className={`${ukupniColor.bg} px-6 py-3 rounded-2xl text-center shrink-0`}>
              <div className={`text-4xl font-bold ${ukupniColor.text}`}>{ukupniOEE > 0 ? `${ukupniOEE}%` : '—'}</div>
              <div className={`text-xs font-semibold ${ukupniColor.text}`}>{ukupniOEE > 0 ? ukupniColor.label : '—'}</div>
              <div className="text-[10px] text-[#9a9a9a] mt-0.5">Ukupni OEE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-6 space-y-4">

        {/* Graf napretka */}
        {grafData.length > 1 && (
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-1">OEE napredak kroz vrijeme</h3>
            <p className="text-xs text-[#9a9a9a] mb-4">Trendovi OEE, Dostupnosti, Performanse i Kvalitete</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={grafData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="period" fontSize={11} tick={{ fill: '#9a9a9a' }}/>
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={11} tick={{ fill: '#9a9a9a' }}/>
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e2e2', fontSize: 12 }}/>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
                <ReferenceLine y={85} stroke="#1a7a5e" strokeDasharray="4 2" label={{ value: 'World Class 85%', fontSize: 10, fill: '#1a7a5e' }}/>
                <Line type="monotone" dataKey="OEE" stroke="#1a7a5e" strokeWidth={2.5} dot={{ r: 4, fill: '#1a7a5e' }} activeDot={{ r: 6 }} name="OEE"/>
                <Line type="monotone" dataKey="A" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" name="Dostupnost (A)"/>
                <Line type="monotone" dataKey="P" stroke="#7c3aed" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" name="Performansa (P)"/>
                <Line type="monotone" dataKey="Q" stroke="#16a34a" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" name="Kvaliteta (Q)"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Strojevi */}
        {strojevi.map((stroj, si) => {
          const avg = calcStrojAvg(stroj);
          const color = getOEEColor(avg.OEE);
          return (
            <div key={si} className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
              <div className="bg-[#fafaf8] border-b border-[#e2e2e2] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">{si + 1}</div>
                  <h3 className="text-sm font-semibold">{stroj.naziv || `Stroj ${si + 1}`}</h3>
                </div>
                {avg.OEE > 0 && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                    OEE: {avg.OEE}% — {color.label}
                  </span>
                )}
              </div>

              {/* Komponente */}
              {avg.OEE > 0 && (
                <div className="px-4 py-3 grid grid-cols-3 gap-4 border-b border-[#f0f0f0]">
                  {[
                    { label: 'Dostupnost (A)', value: avg.A, color: 'bg-blue-500' },
                    { label: 'Performansa (P)', value: avg.P, color: 'bg-purple-500' },
                    { label: 'Kvaliteta (Q)', value: avg.Q, color: 'bg-green-500' },
                  ].map(({ label, value, color: barColor }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#5a5a5a]">{label}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                      <div className="h-2 bg-[#e2e2e2] rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${value}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Smjene */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#e2e2e2]">
                      <th className="text-left py-2 px-2 text-[#9a9a9a] font-medium">Smjena</th>
                      <th className="text-center py-2 px-2 text-[#9a9a9a] font-medium">Plan. vr.</th>
                      <th className="text-center py-2 px-2 text-[#9a9a9a] font-medium">Zastoji</th>
                      <th className="text-center py-2 px-2 text-[#9a9a9a] font-medium">Id. takt</th>
                      <th className="text-center py-2 px-2 text-[#9a9a9a] font-medium">Uk. kom.</th>
                      <th className="text-center py-2 px-2 text-[#9a9a9a] font-medium">Dobri</th>
                      <th className="text-center py-2 px-2 text-blue-600 font-medium">A%</th>
                      <th className="text-center py-2 px-2 text-purple-600 font-medium">P%</th>
                      <th className="text-center py-2 px-2 text-green-600 font-medium">Q%</th>
                      <th className="text-center py-2 px-2 text-[#1a7a5e] font-bold">OEE%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stroj.smjene.map((smjena, smi) => {
                      const r = calcOEE(smjena);
                      const c = getOEEColor(r.OEE);
                      return (
                        <tr key={smi} className="border-b border-[#f0f0f0]">
                          <td className="py-2 px-2 font-medium">{smjena.naziv || `Smjena ${smi + 1}`}</td>
                          <td className="py-2 px-2 text-center text-[#5a5a5a]">{smjena.planirano} min</td>
                          <td className="py-2 px-2 text-center text-red-500">{smjena.zastoji} min</td>
                          <td className="py-2 px-2 text-center text-[#5a5a5a]">{smjena.idealniTakt}</td>
                          <td className="py-2 px-2 text-center text-[#5a5a5a]">{smjena.ukupnoKomada}</td>
                          <td className="py-2 px-2 text-center text-[#1a7a5e]">{smjena.dobriKomadi}</td>
                          <td className="py-2 px-2 text-center font-semibold text-blue-600">{r.A > 0 ? `${r.A}%` : '—'}</td>
                          <td className="py-2 px-2 text-center font-semibold text-purple-600">{r.P > 0 ? `${r.P}%` : '—'}</td>
                          <td className="py-2 px-2 text-center font-semibold text-green-600">{r.Q > 0 ? `${r.Q}%` : '—'}</td>
                          <td className="py-2 px-2 text-center">
                            {r.OEE > 0 ? <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{r.OEE}%</span> : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Benchmark */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">OEE Benchmark</h3>
          <div className="space-y-2">
            {[
              { label: 'World Class', min: 85, color: 'bg-[#1a7a5e]' },
              { label: 'Dobro', min: 75, color: 'bg-green-500' },
              { label: 'Prosječno', min: 60, color: 'bg-yellow-400' },
              { label: 'Loše', min: 40, color: 'bg-orange-400' },
              { label: 'Kritično', min: 0, color: 'bg-red-500' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3 text-xs">
                <div className={`w-3 h-3 rounded-full ${b.color} shrink-0`}/>
                <span className="text-[#5a5a5a] w-24">{b.label}</span>
                <span className="text-[#9a9a9a]">≥ {b.min}%</span>
                {ukupniOEE >= b.min && ukupniOEE < (b.min === 85 ? 101 : b.min === 75 ? 85 : b.min === 60 ? 75 : b.min === 40 ? 60 : 40) && (
                  <span className="ml-auto font-bold text-[#1a7a5e]">← Vaš trenutni OEE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
