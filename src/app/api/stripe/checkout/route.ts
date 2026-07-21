import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { user_id, email, plan } = await req.json()

  if (!user_id) {
    return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  }

  // 'annual' bira godišnji Price, sve ostalo (uklj. nedostajući plan) pada na mjesečni
  const priceId = plan === 'annual'
    ? (process.env.STRIPE_PRICE_ANNUAL || 'price_1Te9KAV05VSFlO3aD0yD5439')
    : (process.env.STRIPE_PRICE_MONTHLY || 'price_1Te9KAV05VSFlO3aD0yD5439')

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: { user_id, plan: plan === 'annual' ? 'annual' : 'monthly' },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}
