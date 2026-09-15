"use client";

import React, { useEffect, useState } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Loader2, Save, Check, Link2, Phone, Mail, Globe, Linkedin, AlertTriangle,
} from 'lucide-react';

interface Card {
  id: string;
  slug: string;
  full_name: string;
  title: string | null;
  company: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedin_url: string | null;
  bio: string | null;
  is_public: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inputCls = "w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]";
const labelCls = "block text-xs font-medium text-[#5a5a5a] mb-1";

export default function VizitkaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    requireAuth(router).then(async (u) => {
      if (!u) return;
      setUser(u);
      const { data } = await supabase.from('business_cards').select('*').eq('user_id', u.id).maybeSingle();
      if (data) {
        const c = data as Card;
        setCardId(c.id);
        setSlug(c.slug);
        setSlugTouched(true);
        setFullName(c.full_name || '');
        setTitle(c.title || '');
        setCompany(c.company || '');
        setPhotoUrl(c.photo_url || '');
        setPhone(c.phone || '');
        setEmail(c.email || '');
        setWebsite(c.website || '');
        setLinkedinUrl(c.linkedin_url || '');
        setBio(c.bio || '');
        setIsPublic(c.is_public);
      } else {
        setFullName(u.user_metadata?.full_name || '');
        setEmail(u.email || '');
      }
      setLoading(false);
    });
  }, [router]);

  const onFullNameChange = (value: string) => {
    setFullName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const save = async () => {
    if (!user || !fullName.trim() || !slug.trim()) return;
    setSaving(true);
    setSlugError(null);
    const payload = {
      user_id: user.id,
      slug: slug.trim(),
      full_name: fullName.trim(),
      title: title.trim() || null,
      company: company.trim() || null,
      photo_url: photoUrl.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      bio: bio.trim() || null,
      is_public: isPublic,
    };
    const { data, error } = cardId
      ? await supabase.from('business_cards').update(payload).eq('id', cardId).select().single()
      : await supabase.from('business_cards').insert(payload).select().single();
    setSaving(false);
    if (error) {
      if ((error as any).code === '23505') {
        setSlugError('Ovaj link je već zauzet — odaberi drugu adresu.');
      } else {
        alert('Greška pri spremanju: ' + error.message);
      }
      return;
    }
    setCardId(data.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-[#9a9a9a]">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = slug ? `${appUrl}/v/${slug}` : '';

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-3">🪪 Vizitka</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-1">Moja digitalna vizitka</h1>
          <p className="text-sm text-[#5a5a5a]">Vaš javni kontakt kojeg možete dijeliti linkom, QR kodom ili spremiti kao vCard. Uključeno u vaš PRO plan.</p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-6 grid md:grid-cols-3 gap-6">

        {/* Forma */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Osnovni podaci</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Ime i prezime</label>
                <input className={inputCls} value={fullName} onChange={(e) => onFullNameChange(e.target.value)} placeholder="Marko Marković" />
              </div>
              <div><label className={labelCls}>Titula / funkcija</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lean koordinator" /></div>
              <div><label className={labelCls}>Tvrtka</label><input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="npr. OptiCora d.o.o." /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Fotografija (URL)</label><input className={inputCls} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." /></div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Kratka bio rečenica</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="npr. Vodim Lean transformaciju u proizvodnji." />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Kontakt</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Telefon</label><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+385 91 234 5678" /></div>
              <div><label className={labelCls}>Email</label><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marko@firma.hr" /></div>
              <div><label className={labelCls}>Web stranica</label><input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://firma.hr" /></div>
              <div><label className={labelCls}>LinkedIn</label><input className={inputCls} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Javna poveznica</h3>
            <label className={labelCls}>Adresa vizitke</label>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-[#9a9a9a] whitespace-nowrap">{appUrl}/v/</span>
              <input
                className={inputCls}
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                placeholder="marko-markovic"
              />
            </div>
            {slugError && <p className="text-xs text-red-600 mb-2">{slugError}</p>}

            <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-[#1a1a1a]">
                Objavi vizitku javno
                <span className="block text-xs text-[#9a9a9a] mt-0.5 flex items-start gap-1">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  Bilo tko s poveznicom moći će vidjeti kontakt podatke koje unesete iznad. Uključite samo ono što želite javno dijeliti.
                </span>
              </span>
            </label>
          </div>

          <button onClick={save} disabled={saving || !fullName.trim() || !slug.trim()} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Spremam...' : 'Spremi vizitku'}
          </button>
          {saved && (
            <div className="bg-[#e8f5f0] text-[#1a7a5e] text-sm font-semibold px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2">
              <Check size={16} /> Vizitka je spremljena!
            </div>
          )}

          {cardId && isPublic && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">Vaša javna vizitka je uživo</h3>
              <div className="flex items-center gap-2 bg-[#fafaf8] border border-[#e2e2e2] rounded-lg px-3 py-2">
                <Link2 size={14} className="text-[#9a9a9a] shrink-0" />
                <input readOnly value={publicUrl} className="flex-1 bg-transparent text-xs text-[#5a5a5a] outline-none truncate" />
                <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="text-xs font-semibold text-[#1a7a5e] hover:underline shrink-0">Kopiraj</button>
              </div>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1a7a5e] font-semibold hover:underline mt-2 inline-block">Otvori javnu stranicu (s QR kodom i vCard downloadom) →</a>
            </div>
          )}
        </div>

        {/* Pregled */}
        <div>
          <p className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider mb-2">Pregled</p>
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 text-center sticky top-6">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-[#e8f5f0]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#e8f5f0] text-[#1a7a5e] flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {fullName.trim() ? fullName.trim().charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="font-serif text-lg text-[#1a1a1a]">{fullName || 'Ime i prezime'}</div>
            {(title || company) && <div className="text-xs text-[#9a9a9a] mt-0.5">{[title, company].filter(Boolean).join(' · ')}</div>}
            {bio && <p className="text-xs text-[#5a5a5a] mt-3 leading-relaxed">{bio}</p>}
            <div className="space-y-1.5 mt-4 text-left">
              {phone && <div className="flex items-center gap-2 text-xs text-[#5a5a5a]"><Phone size={12} className="text-[#1a7a5e] shrink-0" />{phone}</div>}
              {email && <div className="flex items-center gap-2 text-xs text-[#5a5a5a]"><Mail size={12} className="text-[#1a7a5e] shrink-0" />{email}</div>}
              {website && <div className="flex items-center gap-2 text-xs text-[#5a5a5a] truncate"><Globe size={12} className="text-[#1a7a5e] shrink-0" />{website}</div>}
              {linkedinUrl && <div className="flex items-center gap-2 text-xs text-[#5a5a5a] truncate"><Linkedin size={12} className="text-[#1a7a5e] shrink-0" />LinkedIn</div>}
            </div>
            {!isPublic && <p className="text-[10px] text-[#c0c0c0] mt-4">Nije javno objavljeno</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
