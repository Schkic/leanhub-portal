"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, ArrowUpRight, Contact, MessageCircle, ThumbsUp } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  text: string;
  category: string | null;
  likes: number | null;
  created_at: string;
  vizitka_url: string | null;
  community_comments: { count: number }[];
}

const KATEGORIJE = [
  '5S metodologija', 'OEE i mjerenje učinkovitosti', 'Kaizen i kontinuirano poboljšanje',
  'Gemba Walk', 'VSM — mapiranje toka vrijednosti', 'TPM — totalno održavanje',
  'SMED — izmjena alata', 'Standardizirani rad', 'Lean leadership i kultura',
  'WCM (World Class Manufacturing)', 'Lean Six Sigma', 'Ostalo',
];

const avatarColor = (name: string) => {
  const colors = ['#1a7a5e', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2', '#ca8a04'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
};
const initials = (name: string) => {
  if (!name?.trim()) return '?';
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
};
const timeAgo = (ts: string) => {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 3600) return `prije ${Math.max(1, Math.floor(diff / 60))} min`;
  if (diff < 86400) return `prije ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `prije ${Math.floor(diff / 86400)} dana`;
  return new Date(ts).toLocaleDateString('hr-HR');
};

// "Puls Fiskalopedije"-stil widget — prikazuje javnu Zajednicu (leanopedija.hr)
// unutar app dashboarda, i dopušta objavu izravno iz aplikacije (sa stvarnim
// imenom i, ako korisnik ima javnu vizitku, automatski povezanom vizitkom).
export default function CommunityWidget({ user }: { user: any }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const [vizitkaUrl, setVizitkaUrl] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('id, author, text, category, likes, created_at, vizitka_url, community_comments(count)')
      .order('created_at', { ascending: false })
      .limit(5);
    setPosts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (user) {
      supabase.from('business_cards').select('slug, is_public').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data?.is_public) setVizitkaUrl(`${window.location.origin}/v/${data.slug}`);
        });
    }
  }, [user]);

  const submit = async () => {
    if (!text.trim() || text.trim().length < 10) return;
    setPosting(true);
    const author = user?.user_metadata?.full_name?.trim() || 'Član Leanopedija App-a';
    await supabase.from('community_posts').insert({
      author, text: text.trim(), category: category || null, vizitka_url: vizitkaUrl,
    });
    setText('');
    setCategory('');
    setPosting(false);
    await load();
  };

  return (
    <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider">💬 Zajednica</h3>
        <a href="https://leanopedija.hr/zajednica.html" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#1a7a5e] hover:underline flex items-center gap-1">
          Otvori <ArrowUpRight size={12} />
        </a>
      </div>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Postavite pitanje ili podijelite iskustvo s Lean zajednicom..."
          rows={2}
          className="w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8] resize-none mb-2"
        />
        <div className="flex items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-xs bg-[#fafaf8] outline-none focus:border-[#1a7a5e]">
            <option value="">Kategorija (opcionalno)</option>
            {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={submit} disabled={posting || text.trim().length < 10} className="shrink-0 flex items-center gap-1.5 bg-[#1a7a5e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#155f49] transition-all disabled:opacity-50">
            {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Objavi
          </button>
        </div>
        {vizitkaUrl && <p className="text-[10px] text-[#9a9a9a] mt-1.5">🪪 Vaša vizitka će biti povezana s objavom.</p>}
      </div>

      {loading ? (
        <div className="text-center py-6"><Loader2 className="animate-spin text-[#9a9a9a] inline" size={18} /></div>
      ) : posts.length === 0 ? (
        <p className="text-xs text-[#9a9a9a] text-center py-4">Još nema objava u zajednici.</p>
      ) : (
        <div className="space-y-1">
          {posts.map((p) => (
            <div key={p.id} className="flex items-start gap-2.5 px-1 py-2 border-t border-[#f0f0f0] first:border-t-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: avatarColor(p.author) }}>
                {initials(p.author)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="text-xs font-semibold text-[#1a1a1a]">{p.author}</span>
                  {p.vizitka_url && (
                    <a href={p.vizitka_url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-0.5">
                      <Contact size={9} /> Vizitka
                    </a>
                  )}
                  <span className="text-[10px] text-[#c0c0c0]">{timeAgo(p.created_at)}</span>
                </div>
                <p className="text-xs text-[#5a5a5a] line-clamp-2">{p.text}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[#9a9a9a]">
                  <span className="flex items-center gap-1"><ThumbsUp size={10} />{p.likes || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={10} />{p.community_comments?.[0]?.count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
