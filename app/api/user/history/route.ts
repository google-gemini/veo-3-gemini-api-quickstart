import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        // const cursor = searchParams.get('cursor') // For pagination if needed later

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const images = await prisma.image.findMany({
            where: {
                userId: user.id
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                prompt: true,
                folder: true
            }
        })

        const historyItems = images.map(img => ({
            id: img.id,
            imageUrl: img.url,
            timestamp: new Date(img.createdAt).getTime(),
            folderId: img.folderId,
            prompt: img.prompt?.text || '',
            mode: 'create-image' // Default mode, could be inferred if we stored it
        }))

        return NextResponse.json({ history: historyItems })
    } catch (error) {
        console.error('History fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
