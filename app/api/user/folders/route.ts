import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all folders for the user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const folders = await prisma.folder.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return NextResponse.json({ folders })
    } catch (error) {
        console.error('Folder fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST - Create a new folder
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, color } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
        }

        const folder = await prisma.folder.create({
            data: {
                name,
                color: color || 'blue',
                userId: user.id
            }
        })

        return NextResponse.json({ folder })
    } catch (error) {
        console.error('Folder creation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
