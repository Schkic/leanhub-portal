"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Loader2, TrendingUp, Target, Gauge, ListChecks, MapPin, Boxes } from 'lucide-react';
import { calcStrojAvg, getOEEColor } from '@/lib/oee';

interface Audit5S { id: string; datum: string; total_score: number; location_id: string | null; department_id: string | null; }
interface OeeRow { id: string; created_at: string; period: string | null; strojevi: any[]; location_id: string | null; department_id: string | null; }
interface KaizenRow { id: string; status: string; location_id: string | null; department_id: string | null; }
interface ActionRow { id: string; status: string; rok: string | null; location_id: string | null; department_id: string | null; }
interface Group { id: string; naziv: string; }

const isActiveStatus = (s: string) => s === 'otvoreno' || s === 'u_tijeku';

export default function KPIDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [locations, setLocations] = useState<Group[]>([]);
  const [departments, setDepartments] = useState<Group[]>([]);
  const [audits, setAudits] = useState<Audit5S[]>([]);
  const [oeeRows, setOeeRows] = useState<OeeRow[]>([]);
  const [kaizen, setKaizen] = useState<KaizenRow[]>([]);
  const [actionsData, setActionsData] = useState<ActionRow[]>([]);

  const [filterLoc, setFilterLoc] = useState('');
  const [filterDep, setFilterDep] = useState('');

  useEffect(() => {
    requireAuth(router).then(async (u) => {
      if (!u) return;
      const [loc, dep, aud, oee, kai, act] = await Promise.all([
        supabase.from('locations').select('id, naziv'),
        supabase.from('departments').select('id, naziv'),
        supabase.from('audits_5s').select('id, datum, total_score, location_id, department_id').order('datum', { ascending: true }),
        supabase.from('oee_kalkulator').select('id, created_at, period, strojevi, location_id, department_id').order('created_at', { ascending: true }),
        supabase.from('kaizen_prijedlog').select('id, status, location_id, department_id'),
        supabase.from('actions').select('id, status, rok, location_id, department_id'),
      ]);
      setLocations(loc.data || []);
      setDepartments(dep.data || []);
      setAudits((aud.data as Audit5S[]) || []);
      setOeeRows((oee.data as OeeRow[]) || []);
      setKaizen((kai.data as KaizenRow[]) || []);
      setActionsData((act.data as ActionRow[]) || []);
      setLoading(false);
    });
  }, [router]);

  const matchesFilter = (r: { location_id: string | null; department_id: string | null }) =>
    (!filterLoc || r.location_id === filterLoc) && (!filterDep || r.department_id === filterDep);

  const fAudits = useMemo(() => audits.filter(matchesFilter), [audits, filterLoc, filterDep]);
  const fOee = useMemo(() => oeeRows.filter(matchesFilter), [oeeRows, filterLoc, filterDep]);
  const fKaizen = useMemo(() => kaizen.filter(matchesFilter), [kaizen, filterLoc, filterDep]);
  const fActions = useMemo(() => actionsData.filter(matchesFilter), [actionsData, filterLoc, filterDep]);

  const avg5s = fAudits.length ? Math.round(fAudits.reduce((s, a) => s + a.total_score, 0) / fAudits.length) : null;

  const oeeChartData = useMemo(
    () => fOee.slice(-12).map((o) => ({ period: o.period || new Date(o.created_at).toLocaleDateString('hr-HR', { month: 'short' }), OEE: calcStrojAvg(o.strojevi) })),
    [fOee]
  );
  const avgOee = useMemo(() => {
    const vals = fOee.map((o) => calcStrojAvg(o.strojevi)).filter((v) => v > 0);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }, [fOee]);

  const openKaizen = fKaizen.filter((k) => k.status !== 'Završeno' && k.status !== 'Odbijeno').length;

  const activeActions = fActions.filter((a) => isActiveStatus(a.status)).length;
  const overdueActions = fActions.filter(
    (a) => a.rok && isActiveStatus(a.status) && new Date(a.rok) < new Date(new Date().toDateString())
  ).length;

  const auditChartData = useMemo(() => {
    const grouped = fAudits.reduce((acc: Record<string, { month: string; score: number; count: number }>, curr) => {
      const month = new Date(curr.datum).toLocaleString('hr-HR', { month: 'short' });
      if (!acc[month]) acc[month] = { month, score: 0, count: 0 };
      acc[month].score += curr.total_score;
      acc[month].count += 1;
      return acc;
    }, {});
    return Object.values(grouped).map((m) => ({ name: m.month, rezultat: Math.round(m.score / m.count) }));
  }, [fAudits]);

  const aggregate = (keyField: 'location_id' | 'department_id', groups: Group[]) =>
    groups.map((g) => {
      const inGroup = (r: { location_id: string | null; department_id: string | null }) => r[keyField] === g.id;
      const auditsG = audits.filter(inGroup);
      const oeeG = oeeRows.filter(inGroup);
      const kaizenG = kaizen.filter(inGroup);
      const actionsG = actionsData.filter(inGroup);
      const oeeVals = oeeG.map((o) => calcStrojAvg(o.strojevi)).filter((v) => v > 0);
      return {
        ...g,
        avg5s: auditsG.length ? Math.round(auditsG.reduce((s, a) => s + a.total_score, 0) / auditsG.length) : null,
        avgOee: oeeVals.length ? Math.round(oeeVals.reduce((a, b) => a + b, 0) / oeeVals.length) : null,
        openKaizen: kaizenG.filter((k) => k.status !== 'Završeno' && k.status !== 'Odbijeno').length,
        activeActions: actionsG.filter((a) => isActiveStatus(a.status)).length,
        overdueActions: actionsG.filter((a) => a.rok && isActiveStatus(a.status) && new Date(a.rok) < new Date(new Date().toDateString())).length,
      };
    });

  const byLocation = useMemo(() => aggregate('location_id', locations), [locations, audits, oeeRows, kaizen, actionsData]);
  const byDepartment = useMemo(() => aggregate('department_id', departments), [departments, audits, oeeRows, kaizen, actionsData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Generiram izvještaj...</p>
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">📊 Izvještaj</div>
          <h1>KPI izvještaj po lokaciji i odjelu</h1>
          <p>Pratite rezultate 5S, OEE, Kaizen prijedloge i akcije — cijela organizacija ili po odabranoj lokaciji/odjelu.</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-8">

        {/* Filter */}
        {(locations.length > 0 || departments.length > 0) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {locations.length > 0 && (
              <select
                className="px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm bg-white focus:border-[#1a7a5e] outline-none"
                value={filterLoc}
                onChange={(e) => setFilterLoc(e.target.value)}
              >
                <option value="">Sve lokacije</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.naziv}</option>)}
              </select>
            )}
            {departments.length > 0 && (
              <select
                className="px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm bg-white focus:border-[#1a7a5e] outline-none"
                value={filterDep}
                onChange={(e) => setFilterDep(e.target.value)}
              >
                <option value="">Svi odjeli</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.naziv}</option>)}
              </select>
            )}
            {(filterLoc || filterDep) && (
              <button onClick={() => { setFilterLoc(''); setFilterDep(''); }} className="text-sm font-semibold text-[#5a5a5a] hover:text-[#1a7a5e] px-2">
                Poništi filter
              </button>
            )}
          </div>
        )}

        {/* Stat kartice */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#e2e2e2] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#5a5a5a] mb-2"><TrendingUp size={16} /><span className="text-[11px] font-bold uppercase tracking-wider">Prosj. 5S rezultat</span></div>
            <div className="text-2xl font-black text-[#1a1a1a]">{avg5s !== null ? `${avg5s}/100` : '—'}</div>
          </div>
          <div className="bg-white border border-[#e2e2e2] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#5a5a5a] mb-2"><Gauge size={16} /><span className="text-[11px] font-bold uppercase tracking-wider">Prosj. OEE</span></div>
            <div className="text-2xl font-black" style={{ color: avgOee !== null ? getOEEColor(avgOee) : '#1a1a1a' }}>{avgOee !== null ? `${avgOee}%` : '—'}</div>
          </div>
          <div className="bg-white border border-[#e2e2e2] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#5a5a5a] mb-2"><Target size={16} /><span className="text-[11px] font-bold uppercase tracking-wider">Otvoreni Kaizen</span></div>
            <div className="text-2xl font-black text-[#1a1a1a]">{openKaizen}</div>
          </div>
          <div className="bg-white border border-[#e2e2e2] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-[#5a5a5a] mb-2"><ListChecks size={16} /><span className="text-[11px] font-bold uppercase tracking-wider">Aktivne akcije</span></div>
            <div className="text-2xl font-black text-[#1a1a1a]">
              {activeActions}
              {overdueActions > 0 && <span className="text-sm font-bold text-[#dc2626] ml-2">{overdueActions} zakašnjelo</span>}
            </div>
          </div>
        </div>

        {/* Grafovi */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {auditChartData.length > 0 && (
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Kretanje 5S rezultata</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={auditChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9a9a9a' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9a9a9a' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e2e2', fontSize: 12 }} />
                    <Line type="monotone" dataKey="rezultat" stroke="#1a7a5e" strokeWidth={3} dot={{ r: 4, fill: '#1a7a5e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {oeeChartData.length > 0 && (
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Kretanje OEE</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9a9a9a' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9a9a9a' }} />
                    <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ borderRadius: 10, border: '1px solid #e2e2e2', fontSize: 12 }} />
                    <ReferenceLine y={85} stroke="#1a7a5e" strokeDasharray="4 2" />
                    <Bar dataKey="OEE" radius={[3, 3, 0, 0]}>
                      {oeeChartData.map((d, i) => <Cell key={i} fill={getOEEColor(d.OEE)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {auditChartData.length === 0 && oeeChartData.length === 0 && (
            <div className="md:col-span-2 text-center py-10 bg-white border border-[#e2e2e2] rounded-2xl text-sm text-[#9a9a9a]">
              Nema još 5S ili OEE zapisa za odabrani filter.
            </div>
          )}
        </div>

        {/* Raspodjela po lokaciji */}
        {byLocation.length > 0 && (
          <div className="bg-white border border-[#e2e2e2] rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-[#e2e2e2] flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-[#1a1a1a]">Raspodjela po lokaciji</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-[#9a9a9a] uppercase tracking-wider">
                    <th className="px-5 py-2 font-semibold">Lokacija</th>
                    <th className="px-3 py-2 font-semibold">5S</th>
                    <th className="px-3 py-2 font-semibold">OEE</th>
                    <th className="px-3 py-2 font-semibold">Otv. Kaizen</th>
                    <th className="px-3 py-2 font-semibold">Aktivne akcije</th>
                    <th className="px-3 py-2 font-semibold">Zakašnjelo</th>
                  </tr>
                </thead>
                <tbody>
                  {byLocation.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setFilterLoc(filterLoc === r.id ? '' : r.id)}
                      className={`border-t border-[#f0f0f0] cursor-pointer hover:bg-[#fafaf8] transition-colors ${filterLoc === r.id ? 'bg-[#e8f5f0]' : ''}`}
                    >
                      <td className="px-5 py-2.5 font-semibold text-[#1a1a1a]">{r.naziv}</td>
                      <td className="px-3 py-2.5">{r.avg5s !== null ? `${r.avg5s}/100` : '—'}</td>
                      <td className="px-3 py-2.5" style={{ color: r.avgOee !== null ? getOEEColor(r.avgOee) : undefined }}>{r.avgOee !== null ? `${r.avgOee}%` : '—'}</td>
                      <td className="px-3 py-2.5">{r.openKaizen}</td>
                      <td className="px-3 py-2.5">{r.activeActions}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: r.overdueActions > 0 ? '#dc2626' : undefined }}>{r.overdueActions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raspodjela po odjelu */}
        {byDepartment.length > 0 && (
          <div className="bg-white border border-[#e2e2e2] rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-[#e2e2e2] flex items-center gap-2">
              <Boxes size={16} className="text-purple-600" />
              <h3 className="text-sm font-bold text-[#1a1a1a]">Raspodjela po odjelu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-[#9a9a9a] uppercase tracking-wider">
                    <th className="px-5 py-2 font-semibold">Odjel</th>
                    <th className="px-3 py-2 font-semibold">5S</th>
                    <th className="px-3 py-2 font-semibold">OEE</th>
                    <th className="px-3 py-2 font-semibold">Otv. Kaizen</th>
                    <th className="px-3 py-2 font-semibold">Aktivne akcije</th>
                    <th className="px-3 py-2 font-semibold">Zakašnjelo</th>
                  </tr>
                </thead>
                <tbody>
                  {byDepartment.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setFilterDep(filterDep === r.id ? '' : r.id)}
                      className={`border-t border-[#f0f0f0] cursor-pointer hover:bg-[#fafaf8] transition-colors ${filterDep === r.id ? 'bg-[#e8f5f0]' : ''}`}
                    >
                      <td className="px-5 py-2.5 font-semibold text-[#1a1a1a]">{r.naziv}</td>
                      <td className="px-3 py-2.5">{r.avg5s !== null ? `${r.avg5s}/100` : '—'}</td>
                      <td className="px-3 py-2.5" style={{ color: r.avgOee !== null ? getOEEColor(r.avgOee) : undefined }}>{r.avgOee !== null ? `${r.avgOee}%` : '—'}</td>
                      <td className="px-3 py-2.5">{r.openKaizen}</td>
                      <td className="px-3 py-2.5">{r.activeActions}</td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: r.overdueActions > 0 ? '#dc2626' : undefined }}>{r.overdueActions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {locations.length === 0 && departments.length === 0 && (
          <div className="text-center py-10 bg-white border border-dashed border-[#e2e2e2] rounded-2xl text-sm text-[#5a5a5a]">
            Dodajte lokacije i odjele na <a href="/organizacija" className="text-[#1a7a5e] font-semibold hover:underline">stranici organizacije</a> da vidite raspodjelu rezultata.
          </div>
        )}
      </div>
    </div>
  );
}
