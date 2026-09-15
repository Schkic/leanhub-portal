import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// vCard tekstualna polja ne smiju sadržavati sirove zareze/točka-zareze/novi red —
// escapamo ih po RFC 6350 (backslash-escape).
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: card } = await supabase
    .from('business_cards')
    .select('slug, full_name, title, company, phone, email, website, bio')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .maybeSingle()

  if (!card) {
    return NextResponse.json({ error: 'Vizitka nije pronađena' }, { status: 404 })
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${esc(card.full_name)}`,
    card.company ? `ORG:${esc(card.company)}` : null,
    card.title ? `TITLE:${esc(card.title)}` : null,
    card.phone ? `TEL;TYPE=WORK,VOICE:${esc(card.phone)}` : null,
    card.email ? `EMAIL:${esc(card.email)}` : null,
    card.website ? `URL:${esc(card.website)}` : null,
    card.bio ? `NOTE:${esc(card.bio)}` : null,
    'END:VCARD',
  ].filter(Boolean)

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${card.slug}.vcf"`,
    },
  })
}
