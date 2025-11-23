import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { imageBase64, prompt, mimeType } = await request.json()

        if (!imageBase64 || !prompt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Upload to Supabase Storage
        console.log('Uploading to Supabase Storage...')
        const buffer = Buffer.from(imageBase64, 'base64')
        const fileName = `${user.id}/${Date.now()}.${mimeType.split('/')[1]}`

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('generated-images')
            .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: false
            })

        if (uploadError) {
            console.error('Supabase Storage Upload error:', uploadError)
            return NextResponse.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 })
        }
        console.log('Upload successful:', uploadData)

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('generated-images')
            .getPublicUrl(fileName)

        console.log('Public URL:', publicUrl)

        // 2. Save to Prisma
        console.log('Saving to Prisma...')
        // Ensure UserProfile exists
        await prisma.userProfile.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                email: user.email!,
                fullName: user.user_metadata.full_name,
                avatarUrl: user.user_metadata.avatar_url
            }
        })

        // Create Prompt and Image
        let promptRecord = await prisma.prompt.findFirst({
            where: {
                userId: user.id,
                text: prompt
            }
        })

        if (!promptRecord) {
            promptRecord = await prisma.prompt.create({
                data: {
                    text: prompt,
                    userId: user.id
                }
            })
        }

        const imageRecord = await prisma.image.create({
            data: {
                url: publicUrl,
                userId: user.id,
                promptId: promptRecord.id
            }
        })
        console.log('Prisma save successful:', imageRecord)

        return NextResponse.json({ success: true, image: imageRecord })
    } catch (error: any) {
        console.error('Save API Critical error:', error)
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 })
    }
}
