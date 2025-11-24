'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'

export default function CreditDisplay() {
    const [credits, setCredits] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [showInfo, setShowInfo] = useState(false)

    useEffect(() => {
        const fetchCredits = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // We need an API to fetch credits securely
                const resp = await fetch('/api/user/credits')
                if (resp.ok) {
                    const data = await resp.json()
                    setCredits(data.credits)
                }
            }
            setLoading(false)
        }

        fetchCredits()

        // Listen for credit updates (custom event)
        const handleUpdate = () => fetchCredits()
        window.addEventListener('credits-updated', handleUpdate)

        // Close popup when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            if (showInfo && !(e.target as Element).closest('.credit-display-container')) {
                setShowInfo(false)
            }
        }
        window.addEventListener('click', handleClickOutside)

        return () => {
            window.removeEventListener('credits-updated', handleUpdate)
            window.removeEventListener('click', handleClickOutside)
        }
    }, [showInfo])

    if (loading || credits === null) return null

    return (
        <div className="relative credit-display-container">
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
                <Coins className="w-4 h-4" />
                <span>{credits}</span>
            </button>

            {showInfo && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-4 z-50 text-sm">
                    <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Credit Costs</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Image Generation</p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Gemini Flash 2.5</span>
                                    <span className="font-medium">1 credit</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Imagen 4.0</span>
                                    <span className="font-medium">2 credits</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Nano Banana Pro</span>
                                    <span className="font-medium">3 credits</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-slate-700" />
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Video Generation</p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Veo 2</span>
                                    <span className="font-medium">10 credits</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Veo 3</span>
                                    <span className="font-medium">25 credits</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
