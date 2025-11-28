"use client";

import React, { useState } from "react";
import { X, Check, CreditCard, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credits: 100,
                    priceId: "price_fixed_100_credits", // Not used in backend yet, but good practice
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
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
                        Get more credits to create amazing images and videos.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="relative group border-2 border-indigo-500 rounded-xl p-5 bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                            Best Value
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    100 Credits
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    ~100 Standard Images
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    $2.00
                                </div>
                                <div className="text-xs text-slate-400 line-through">
                                    $5.00
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Generate ~100 standard images</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Create ~10 short videos</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Priority processing</span>
                            </li>
                        </ul>

                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Purchase Now
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Secure payment via Stripe. Credits never expire.
                    </p>
                </div>
            </div>
        </div>
    );
}
