import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    console.log('Auth Callback Debug:', {
        url: request.url,
        origin,
        headers: {
            host: request.headers.get('host'),
            'x-forwarded-host': request.headers.get('x-forwarded-host'),
            'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
            'forwarded': request.headers.get('forwarded')
        }
    })

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

            const forwardedHostHeader = request.headers.get('x-forwarded-host') // original origin before load balancer
            const forwardedProtoHeader = request.headers.get('x-forwarded-proto')

            if (forwardedHostHeader) {
                const forwardedHost = forwardedHostHeader.split(',')[0].trim()
                const forwardedProto = forwardedProtoHeader?.split(',')[0].trim() || 'https'
                return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
