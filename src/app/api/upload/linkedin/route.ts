import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/config'
import { linkedinService } from '@/server/services/linkedin.service'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request): Promise<Response> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = request.headers.get('content-type') || ''
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'Must be a multipart/form-data request' }, { status: 400 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await linkedinService.importFromPdf(session.user.id, buffer)

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Import failed' }, { status: 400 })
        }

        return NextResponse.json(
            { resumeId: result.data.resumeId, message: 'LinkedIn profile imported successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('LinkedIn upload route error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
