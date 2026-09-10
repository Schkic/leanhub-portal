import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  }

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  }

  // Uzmi customer_id iz organizacije trenutnog korisnika (RLS), ne iz tijela
  // zahtjeva, tako da netko ne može otvoriti Stripe portal tuđe pretplate.
  const { data: mem } = await supabaseAuth
    .from('memberships')
    .select('organizations(stripe_customer_id)')
    .eq('user_id', user.id)
    .maybeSingle()

  const stripeCustomerId = (mem?.organizations as any)?.stripe_customer_id as string | undefined

  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'Nema aktivne pretplate' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: err.message || 'Stripe portal greška' }, { status: 500 })
  }
}
