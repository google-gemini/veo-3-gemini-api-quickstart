import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Payment Successful!
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Thank you for your purchase. 100 credits have been added to your account.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Return to Studio
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
