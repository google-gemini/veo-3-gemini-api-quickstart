import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2024-12-18.acacia' as any,
    })
    : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    if (!stripe) {
        console.error('Stripe is not initialized. Missing STRIPE_SECRET_KEY.');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0', 10);

        if (userId && credits > 0) {
            try {
                await prisma.userProfile.update({
                    where: { id: userId },
                    data: {
                        credits: {
                            increment: credits,
                        },
                    },
                });
                console.log(`Added ${credits} credits to user ${userId}`);
            } catch (error) {
                console.error('Error updating user credits:', error);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
