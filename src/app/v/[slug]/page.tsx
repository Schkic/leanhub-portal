import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { Phone, Mail, Globe, Linkedin, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Card {
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
}

async function getCard(slug: string): Promise<Card | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('business_cards')
    .select('slug, full_name, title, company, photo_url, phone, email, website, linkedin_url, bio')
    .eq('slug', slug)
    .eq('is_public', true)
    .maybeSingle();
  return (data as Card) || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const card = await getCard(params.slug);
  if (!card) return { title: 'Vizitka nije pronađena — Leanopedija' };
  const desc = [card.title, card.company].filter(Boolean).join(' · ') || card.bio || 'Digitalna vizitka';
  return {
    title: `${card.full_name} — Leanopedija vizitka`,
    description: desc,
    openGraph: {
      title: card.full_name,
      description: desc,
      images: card.photo_url ? [card.photo_url] : [],
    },
  };
}

export default async function PublicVizitkaPage({ params }: { params: { slug: string } }) {
  const card = await getCard(params.slug);

  if (!card) {
    return (
      <div className="bg-[#fafaf8] min-h-[calc(100vh-58px)] flex items-center justify-center px-6">
        <p className="text-[#9a9a9a]">Vizitka nije pronađena.</p>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const publicUrl = `${appUrl}/v/${card.slug}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 220,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  return (
    <div className="bg-[#fafaf8] min-h-[calc(100vh-58px)] flex items-center justify-center px-6 py-16">
      <div className="max-w-[420px] w-full bg-white border border-[#e2e2e2] rounded-3xl p-8 text-center shadow-sm">
        {card.photo_url ? (
          <img src={card.photo_url} alt={card.full_name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-[#e8f5f0]" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#e8f5f0] text-[#1a7a5e] flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {card.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-1">{card.full_name}</h1>
        {(card.title || card.company) && (
          <p className="text-sm text-[#5a5a5a] mb-4">{[card.title, card.company].filter(Boolean).join(' · ')}</p>
        )}
        {card.bio && <p className="text-sm text-[#5a5a5a] mb-6 leading-relaxed">{card.bio}</p>}

        <div className="space-y-2 mb-6 text-left">
          {card.phone && (
            <a href={`tel:${card.phone}`} className="flex items-center gap-3 px-4 py-2.5 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl text-sm text-[#1a1a1a] hover:border-[#1a7a5e] transition-colors">
              <Phone size={16} className="text-[#1a7a5e] shrink-0" />{card.phone}
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className="flex items-center gap-3 px-4 py-2.5 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl text-sm text-[#1a1a1a] hover:border-[#1a7a5e] transition-colors">
              <Mail size={16} className="text-[#1a7a5e] shrink-0" />{card.email}
            </a>
          )}
          {card.website && (
            <a href={card.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl text-sm text-[#1a1a1a] hover:border-[#1a7a5e] transition-colors truncate">
              <Globe size={16} className="text-[#1a7a5e] shrink-0" /><span className="truncate">{card.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {card.linkedin_url && (
            <a href={card.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl text-sm text-[#1a1a1a] hover:border-[#1a7a5e] transition-colors">
              <Linkedin size={16} className="text-[#1a7a5e] shrink-0" />LinkedIn profil
            </a>
          )}
        </div>

        <a
          href={`/api/vizitka/${card.slug}/vcard`}
          className="w-full flex items-center justify-center gap-2 bg-[#1a7a5e] text-white py-3 rounded-xl font-bold hover:bg-[#155f49] transition-all mb-6"
        >
          <Download size={16} /> Spremi kontakt
        </a>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR kod za dijeljenje vizitke" className="w-32 h-32 mx-auto" />
        <p className="text-[10px] text-[#9a9a9a] mt-2">Skenirajte za brzo dijeljenje</p>

        <p className="text-[10px] text-[#c0c0c0] mt-8">
          Izrađeno u <a href="https://app.leanopedija.hr" className="underline">Leanopedija App</a>
        </p>
      </div>
    </div>
  );
}
