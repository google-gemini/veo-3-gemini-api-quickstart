'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-800">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome to Photoverse
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Sign in to start creating amazing AI images.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/50">
                        <h3 className="font-semibold text-rose-900 dark:text-rose-200 mb-1">
                            🎉 Free Trial Included
                        </h3>
                        <p className="text-sm text-rose-700 dark:text-rose-300">
                            New users get <span className="font-bold">14 days</span> of free access with <span className="font-bold">100 credits</span>.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        )}
                        Continue with Google
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}
