import type { CanonicalResume } from '@/types/resume'
import type { ExportOptions, ExportResult } from './types'
import { generatePdf } from './pdf-generator'
import { generateDocx } from './docx-generator'

export { generatePdf, generateDocx }
export { TEMPLATE_CONFIGS } from './types'
export type { ExportOptions, ExportResult, TemplateId, TemplateConfig } from './types'

// Convenience function
export async function exportResume(
    resume: CanonicalResume,
    options: ExportOptions
): Promise<ExportResult> {
    if (options.format === 'pdf') {
        return generatePdf(resume, options)
    } else if (options.format === 'docx') {
        return generateDocx(resume, options)
    }
    throw new Error(`EXPORT_UNSUPPORTED_FORMAT: ${options.format as string}`)
}
