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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { plan } = await req.json()

  // 'annual' bira godišnji Price, sve ostalo (uklj. nedostajući plan) pada na mjesečni
  const priceId = plan === 'annual'
    ? (process.env.STRIPE_PRICE_ANNUAL || 'price_1Te9KAV05VSFlO3aD0yD5439')
    : (process.env.STRIPE_PRICE_MONTHLY || 'price_1Te9KAV05VSFlO3aD0yD5439')

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { user_id: user.id, plan: plan === 'annual' ? 'annual' : 'monthly' },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Stripe checkout greška' }, { status: 500 })
  }
}
