"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Loader2, TrendingUp, Target, AlertCircle, Calendar } from 'lucide-react';

export default function KPIDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, count: 0, trend: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: audits, error } = await supabase
        .from('audits_5s')
        .select('datum, total_score, firma, lokacija')
        .order('datum', { ascending: true });

      if (error) {
        console.error('Error fetching data:', error);
      } else if (audits) {
        // Group by month for the line chart
        const grouped = audits.reduce((acc: any, curr) => {
          const month = new Date(curr.datum).toLocaleString('hr-HR', { month: 'short' });
          if (!acc[month]) acc[month] = { month, score: 0, count: 0 };
          acc[month].score += curr.total_score;
          acc[month].count += 1;
          return acc;
        }, {});

        const chartData = Object.values(grouped).map((m: any) => ({
          name: m.month,
          rezultat: Math.round(m.score / m.count)
        }));

        setData(chartData);

        // Calculate Stats
        const avg = audits.reduce((a, b) => a + b.total_score, 0) / audits.length;
        setStats({
          avg: Math.round(avg),
          count: audits.length,
          trend: chartData.length > 1 
            ? chartData[chartData.length - 1].rezultat - chartData[chartData.length - 2].rezultat
            : 0
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-[#9a9a9a]">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p>Generiram vizualni izvještaj...</p>
    </div>
  );

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">📊 Analytics</div>
          <h1>KPI Dashboard — Trendovi Kvalitete</h1>
          <p>Pratite kretanje Lean kulture kroz mjesece i identificirajte odstupanja u performansama.</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#e2e2e2] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-[#5a5a5a] mb-2">
              <TrendingUp size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Prosječni Rezultat</span>
            </div>
            <div className="text-3xl font-black text-[#1a1a1a]">{stats.avg} <span className="text-sm font-normal text-[#9a9a9a]">/ 100</span></div>
          </div>
          
          <div className="bg-white border border-[#e2e2e2] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-[#5a5a5a] mb-2">
              <Target size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Ukupno Audita</span>
            </div>
            <div className="text-3xl font-black text-[#1a1a1a]">{stats.count}</div>
          </div>

          <div className="bg-white border border-[#e2e2e2] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-[#5a5a5a] mb-2">
              <Calendar size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Mjesečni Trend</span>
            </div>
            <div className={`text-3xl font-black ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trend >= 0 ? '+' : ''}{stats.trend}%
              <span className="text-[10px] font-bold uppercase ml-2 opacity-50">vs prošli mj.</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-8">Kretanje 5S rezultata kroz vrijeme</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9a9a9a'}} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9a9a9a'}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rezultat" 
                  stroke="#1a7a5e" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#1a7a5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Automatsko slanje izvještaja upravi</h3>
              <p className="text-blue-100 text-sm max-w-[600px] mb-6">Kao Premium korisnik, svakog 1. u mjesecu dobivate zbirni KPI izvještaj u PDF formatu spreman za prezentaciju na Board sastanku.</p>
              <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">Konfiguriraj izvještaj</button>
           </div>
           <div className="absolute right-[-20px] bottom-[-20px] text-white/10 rotate-12">
              <TrendingUp size={200} />
           </div>
        </div>
      </div>
    </div>
  );
}
