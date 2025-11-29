"use client";

import React, { useState } from "react";
import { X, Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside component to avoid recreation
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Pricing tiers
const PRICING_TIERS = [
    { credits: 100, price: 2, label: "Starter", popular: false },
    { credits: 300, price: 5, label: "Basic", popular: true },
    { credits: 500, price: 7, label: "Pro", popular: false },
    { credits: 1000, price: 10, label: "Premium", popular: false },
];

// Calculate price for custom amount based on tiers
function calculatePrice(credits: number): number {
    if (credits <= 0) return 0;

    // Find the appropriate tier or interpolate
    if (credits <= 100) return (credits / 100) * 2;
    if (credits <= 300) return 2 + ((credits - 100) / 200) * 3;
    if (credits <= 500) return 5 + ((credits - 300) / 200) * 2;
    if (credits <= 1000) return 7 + ((credits - 500) / 500) * 3;

    // Above 1000, use the best rate
    return 10 + ((credits - 1000) / 100);
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedTier, setSelectedTier] = useState<number | null>(1); // Default to Basic (300 credits)
    const [customCredits, setCustomCredits] = useState("");
    const [showCustom, setShowCustom] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = async (credits: number, amount: number) => {
        if (!stripePromise) {
            alert("Stripe is not configured. Please contact support.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credits,
                    amount: Math.round(amount * 100), // Convert to cents
                }),
            });

            const { sessionId, error } = await response.json();

            if (error) {
                console.error("Checkout error:", error);
                alert("Failed to start checkout. Please try again.");
                setLoading(false);
                return;
            }

            const stripe = await stripePromise;
            if (stripe) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: stripeError } = await (stripe as any).redirectToCheckout({ sessionId });
                if (stripeError) {
                    console.error("Stripe redirect error:", stripeError);
                    alert(stripeError.message);
                }
            }
        } catch (err) {
            console.error("Purchase failed:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTierPurchase = (tierIndex: number) => {
        const tier = PRICING_TIERS[tierIndex];
        handlePurchase(tier.credits, tier.price);
    };

    const handleCustomPurchase = () => {
        const credits = parseInt(customCredits);
        if (isNaN(credits) || credits < 10) {
            alert("Please enter at least 10 credits.");
            return;
        }
        const price = calculatePrice(credits);
        handlePurchase(credits, price);
    };

    const customPrice = customCredits ? calculatePrice(parseInt(customCredits) || 0) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Top Up Credits
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Choose a package or enter a custom amount
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Pricing Tiers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {PRICING_TIERS.map((tier, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setSelectedTier(index);
                                    setShowCustom(false);
                                }}
                                className={`relative group border-2 rounded-xl p-4 transition-all cursor-pointer ${selectedTier === index && !showCustom
                                    ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10"
                                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Best Value
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                            {tier.credits} Credits
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {tier.label}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            ${tier.price.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            ${(tier.price / tier.credits * 100).toFixed(2)}/100 credits
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-1.5">
                                    <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>~{tier.credits} standard images</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>~{Math.floor(tier.credits / 10)} short videos</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>Credits never expire</span>
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Custom Amount Section */}
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                setShowCustom(!showCustom);
                                setSelectedTier(null);
                            }}
                            className="w-full text-left border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 hover:border-indigo-400 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Custom Amount
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Enter your desired credit amount
                                    </p>
                                </div>
                                <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                                    {showCustom ? "Hide" : "Show"}
                                </div>
                            </div>
                        </button>

                        {showCustom && (
                            <div className="mt-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Number of Credits (min: 10)
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    value={customCredits}
                                    onChange={(e) => setCustomCredits(e.target.value)}
                                    placeholder="Enter amount..."
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {customCredits && parseInt(customCredits) >= 10 && (
                                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                Calculated Price:
                                            </span>
                                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                ${customPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Rate: ${(customPrice / parseInt(customCredits) * 100).toFixed(2)}/100 credits
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={() => {
                            if (showCustom) {
                                handleCustomPurchase();
                            } else if (selectedTier !== null) {
                                handleTierPurchase(selectedTier);
                            }
                        }}
                        disabled={loading || (showCustom && (!customCredits || parseInt(customCredits) < 10)) || (!showCustom && selectedTier === null)}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Purchase {showCustom ? `${customCredits} Credits` : selectedTier !== null ? `${PRICING_TIERS[selectedTier].credits} Credits` : ""}
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Secure payment via Stripe. Credits never expire.
                    </p>
                </div>
            </div>
        </div>
    );
}
