import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/config'
import { exportService } from '@/server/services/export.service'
import type { ExportOptions, TemplateId } from '@/modules/export'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const format = (searchParams.get('format') || 'pdf') as 'pdf' | 'docx'
        const template = (searchParams.get('template') || 'classic') as TemplateId

        if (!['pdf', 'docx'].includes(format)) {
            return new NextResponse('Invalid format', { status: 400 })
        }

        if (!['classic', 'modern', 'minimal'].includes(template)) {
            return new NextResponse('Invalid template', { status: 400 })
        }

        const options: ExportOptions = {
            templateId: template,
            format,
            includeLinks: true,
            colorAccent: searchParams.get('colorAccent') || undefined,
        }

        const { id: resumeId } = await params
        const result = await exportService.exportResume(resumeId, session.user.id, options)

        if (!result.success) {
            if (result.error === 'Resume not found') {
                return new NextResponse(result.error, { status: 404 })
            }
            if (result.error === 'Unauthorized') {
                return new NextResponse(result.error, { status: 403 })
            }
            return new NextResponse(result.error || 'Server Error', { status: 500 })
        }

        const headers = new Headers()
        headers.set('Content-Type', result.data.mimeType)
        headers.set('Content-Disposition', `attachment; filename="${result.data.fileName}"`)
        headers.set('Content-Length', result.data.sizeBytes.toString())

        return new NextResponse(new Uint8Array(result.data.buffer), {
            status: 200,
            headers,
        })
    } catch (error) {
        console.error('Export route error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
