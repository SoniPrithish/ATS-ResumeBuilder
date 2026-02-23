import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ClassicTemplate } from './templates/classic'
import { ModernTemplate } from './templates/modern'
import { MinimalTemplate } from './templates/minimal'
import { TEMPLATE_CONFIGS, type ExportOptions, type ExportResult } from './types'
import type { CanonicalResume } from '@/types/resume'

/**
 * Helper to slugify a string
 */
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\\s+/g, '-') // Replace spaces with -
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\\w\\-]+/g, '') // Remove all non-word chars
        .replace(/\\-\\-+/g, '-') // Replace multiple - with single -
}

/**
 * Generates a PDF buffer from a CanonicalResume.
 * @param resume The user's parsed CanonicalResume data
 * @param options Export options like template and color accent
 * @returns A buffer of the PDF file, along with metadata
 */
export async function generatePdf(
    resume: CanonicalResume,
    options: ExportOptions
): Promise<ExportResult> {
    // 1. Basic empty check
    const hasData =
        resume.contact.name ||
        resume.summary ||
        resume.experience.length > 0 ||
        resume.education.length > 0 ||
        Object.values(resume.skills).some((arr) => arr.length > 0)

    if (!hasData) {
        throw new Error('EXPORT_EMPTY_RESUME')
    }

    // 2. Get template config
    const config = { ...TEMPLATE_CONFIGS[options.templateId] }
    if (!config) {
        throw new Error(`EXPORT_UNSUPPORTED_TEMPLATE: ${options.templateId}`)
    }

    // 3. Apply color accent override
    if (options.colorAccent) {
        config.colors = { ...config.colors, accent: options.colorAccent }
    }

    // 4. Select template content
    let TemplateContent: React.JSX.Element
    if (options.templateId === 'classic') {
        TemplateContent = <ClassicTemplate resume={ resume } config = { config } />
  } else if (options.templateId === 'modern') {
        TemplateContent = <ModernTemplate resume={ resume } config = { config } />
  } else if (options.templateId === 'minimal') {
        TemplateContent = <MinimalTemplate resume={ resume } config = { config } />
  } else {
        throw new Error(`EXPORT_UNSUPPORTED_TEMPLATE: ${options.templateId}`)
    }

    // 5. Render with timeout
    let buffer: Buffer
    try {
        const renderPromise = renderToBuffer(TemplateContent)
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('EXPORT_TIMEOUT')), 30000)
        )
        buffer = await Promise.race([renderPromise, timeoutPromise])
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'EXPORT_TIMEOUT') {
            throw err
        }
        throw new Error(
            `EXPORT_RENDER_FAILED: ${err instanceof Error ? err.message : String(err)}`
        )
    }

    // 6. Generate filename
    const baseName = slugify(resume.contact.name || 'resume')
    const timestamp = Date.now()
    const fileName = `${baseName}_${options.templateId}_${timestamp}.pdf`

    return {
        buffer,
        fileName,
        mimeType: 'application/pdf',
        sizeBytes: buffer.length,
    }
}
