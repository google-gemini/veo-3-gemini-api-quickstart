import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check and create user profile
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { prisma } = await import('@/lib/prisma')

                const existingProfile = await prisma.userProfile.findUnique({
                    where: { id: user.id }
                })

                if (!existingProfile) {
                    // New user: Give 14 days trial + 100 credits
                    const trialEndsAt = new Date()
                    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

                    await prisma.userProfile.create({
                        data: {
                            id: user.id,
                            email: user.email!,
                            fullName: user.user_metadata.full_name,
                            avatarUrl: user.user_metadata.avatar_url,
                            credits: 100,
                            trialEndsAt: trialEndsAt
                        }
                    })
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
