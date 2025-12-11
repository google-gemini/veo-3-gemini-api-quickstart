# Stripe Payment Setup Guide

This guide explains how to set up your Stripe account to receive payments and configure the application to process them.

## 1. Create a Stripe Account
If you haven't already, sign up for a Stripe account at [dashboard.stripe.com/register](https://dashboard.stripe.com/register).

## 2. Connect Your Bank Account (For Payouts)
To receive money in your bank account, you must configure payouts:
1.  Log in to the [Stripe Dashboard](https://dashboard.stripe.com).
2.  Go to **Settings** (gear icon) > **Business Settings**.
3.  Under **Payouts**, select **Bank accounts and scheduling**.
4.  Click **Add bank account** and enter your bank details.
    *   Stripe will automatically deposit your earnings into this account according to your payout schedule (usually daily or weekly).
5.  **Verify your bank account** (Stripe will send a small deposit to confirm).

## 3. Get API Keys
You need API keys to connect the app to Stripe.
1.  Go to **Developers** > **API keys** in the dashboard.
2.  Toggle **Test mode** ON (top right) for development.
3.  Copy the **Publishable key** (starts with `pk_test_...`).
4.  Copy the **Secret key** (starts with `sk_test_...`).
5.  Add these to your `.env` file:
    ```env
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    ```

## 4. Configure Webhooks
Webhooks allow Stripe to notify your app when a payment is successful, so you can add credits to the user's account.

### A. For Local Development (Testing)
1.  Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Login: `stripe login`
3.  Listen for events:
    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    ```
4.  The CLI will print a **Webhook Signing Secret** (starts with `whsec_...`).
5.  Add this to your `.env` file:
    ```env
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

### B. For Production (Going Live)
1.  Go to **Developers** > **Webhooks** in the Stripe Dashboard.
2.  Click **Add endpoint**.
3.  Enter your production URL: `https://your-domain.com/api/stripe/webhook`.
4.  Select events to listen for: `checkout.session.completed`.
5.  Click **Add endpoint**.
6.  Reveal the **Signing secret** (top right of the webhook details page).
7.  Add this to your production environment variables (e.g., in Vercel or Google Cloud).

## 5. Going Live
When you are ready to accept real money:
1.  Toggle **Test mode** OFF in the Stripe Dashboard.
2.  **Complete Stripe's activation requirements**:
    *   Verify your identity (provide business details, tax information).
    *   Verify your bank account.
3.  Get your **Live** Publishable and Secret keys from **Developers** > **API keys**.
4.  Update your production environment variables with the Live keys.
5.  Create a **Live Webhook** endpoint (step 4B above, but in Live mode).

## 6. How Payouts Work
- **Automatic payouts**: Stripe automatically sends your earnings to your connected bank account.
- **Default schedule**: Usually **daily** (or weekly for new accounts).
- **Payout time**: Typically **2 business days** after the transaction.
- **Viewing payouts**: Go to **Balance** > **Payouts** in the Stripe Dashboard to see your payout history.

## 7. Testing
Before going live, use Stripe's [Test Cards](https://stripe.com/docs/testing) to verify the flow:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any valid ZIP (e.g., `12345`)

**Test a purchase**:
1.  Run the app locally: `npm run dev`
2.  Click "Buy Credits" and complete checkout with the test card.
3.  Verify credits are added to the user's account.

## 8. Important Notes
- **Fees**: Stripe charges a fee per transaction (usually 2.9% + $0.30 for US cards).
- **Currency**: The current implementation is set to **USD**. Change `currency: 'usd'` in `app/api/stripe/checkout/route.ts` if needed.
- **Disputes**: Monitor the Stripe Dashboard for chargebacks or disputes.
- **Security**: Never expose your Secret Key (`STRIPE_SECRET_KEY`) in the frontend or public repositories.
