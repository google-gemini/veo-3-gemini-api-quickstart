import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// PATCH - Update image folder
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { imageId, folderId } = await request.json()

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
        }

        // Verify the image belongs to the user
        const image = await prisma.image.findFirst({
            where: {
                id: imageId,
                userId: user.id
            }
        })

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 })
        }

        // Update the image folder
        const updatedImage = await prisma.image.update({
            where: { id: imageId },
            data: { folderId: folderId || null }
        })

        return NextResponse.json({ image: updatedImage })
    } catch (error) {
        console.error('Image folder update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
