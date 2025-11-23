'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import CreditDisplay from '@/components/credits/CreditDisplay'

export default function LoginButton() {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = createClient()

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        setLoading(false)
    }

    const handleLogout = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        setLoading(false)
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <CreditDisplay />
                <div className="flex items-center gap-2">
                    {user.user_metadata.avatar_url && (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span className="text-sm font-medium hidden sm:block">
                        {user.user_metadata.full_name || user.email}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-stone-900 dark:text-white rounded-full text-sm font-medium transition-colors backdrop-blur-sm border border-white/20"
                >
                    {loading ? 'Signing out...' : 'Sign out'}
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-sm"
        >
            {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
    )
}
