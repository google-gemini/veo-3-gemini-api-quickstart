import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2024-12-18.acacia' as any,
    })
    : null;

export async function POST(req: Request) {
    if (!stripe) {
        console.error('Stripe is not initialized. Missing STRIPE_SECRET_KEY.');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { credits } = body;

        // For this POC, we'll create a price on the fly or use a fixed amount
        // In production, you should use Price IDs from your Stripe Dashboard
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${credits} Credits Package`,
                            description: `Purchase ${credits} credits for Photoverse Studio`,
                        },
                        unit_amount: 200, // $2.00 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/payment/cancel`,
            metadata: {
                userId: user.id,
                credits: credits.toString(),
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
