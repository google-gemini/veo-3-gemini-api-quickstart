import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { imageId } = await request.json()

        if (!imageId) {
            return NextResponse.json({ error: 'Missing imageId' }, { status: 400 })
        }

        // Verify ownership and delete
        // We use deleteMany to ensure we only delete if it belongs to the user
        // deleteMany returns { count: n }
        const result = await prisma.image.deleteMany({
            where: {
                id: imageId,
                userId: user.id
            }
        })

        if (result.count === 0) {
            return NextResponse.json({ error: 'Image not found or unauthorized' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Delete API error:', error)
        return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
    }
}
