import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const { customer_id } = await req.json()

  if (!customer_id) {
    return NextResponse.json({ error: 'Nedostaje customer_id' }, { status: 400 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: err.message || 'Stripe portal greška' }, { status: 500 })
  }
}
