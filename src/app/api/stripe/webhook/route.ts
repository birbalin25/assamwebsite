import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/server';
import { adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { donorName, donorEmail, isAnonymous, message } = session.metadata || {};

    try {
      await adminDb.collection('donations').add({
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'completed',
        isAnonymous: isAnonymous === 'true',
        message: message || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to save donation:', err);
    }
  }

  return NextResponse.json({ received: true });
}
