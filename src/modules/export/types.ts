export type TemplateId = 'classic' | 'modern' | 'minimal'

export interface ExportOptions {
    templateId: TemplateId
    format: 'pdf' | 'docx'
    includeLinks: boolean       // whether to render hyperlinks
    colorAccent?: string        // hex color override for modern template
}

export interface TemplateConfig {
    id: TemplateId
    name: string
    description: string
    fonts: {
        heading: string
        body: string
    }
    colors: {
        primary: string           // headings, name
        text: string              // body text
        accent: string            // links, highlights
        background: string        // page background
        sectionBorder: string     // section divider color
    }
    spacing: {
        sectionGap: number        // gap between sections (pt)
        itemGap: number           // gap between items within section (pt)
        bulletIndent: number       // bullet point indentation (pt)
        margin: number            // page margin (pt)
    }
    layout: {
        showSectionDividers: boolean
        nameAlignment: 'left' | 'center'
        contactLayout: 'inline' | 'stacked'  // inline = "email | phone | linkedin"
        sectionHeaderStyle: 'uppercase' | 'titlecase' | 'bold'
    }
}

export const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
    classic: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional serif design — clean and professional',
        fonts: { heading: 'Georgia', body: 'Times New Roman' },
        colors: {
            primary: '#000000',
            text: '#333333',
            accent: '#2563EB',
            background: '#FFFFFF',
            sectionBorder: '#000000',
        },
        spacing: { sectionGap: 16, itemGap: 8, bulletIndent: 16, margin: 48 },
        layout: {
            showSectionDividers: true,
            nameAlignment: 'center',
            contactLayout: 'inline',
            sectionHeaderStyle: 'uppercase',
        },
    },
    modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Contemporary sans-serif with color accents',
        fonts: { heading: 'Helvetica', body: 'Helvetica' },
        colors: {
            primary: '#1E40AF',
            text: '#374151',
            accent: '#3B82F6',
            background: '#FFFFFF',
            sectionBorder: '#3B82F6',
        },
        spacing: { sectionGap: 14, itemGap: 8, bulletIndent: 14, margin: 40 },
        layout: {
            showSectionDividers: true,
            nameAlignment: 'left',
            contactLayout: 'inline',
            sectionHeaderStyle: 'titlecase',
        },
    },
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Ultra-clean design with maximum readability',
        fonts: { heading: 'Helvetica', body: 'Helvetica' },
        colors: {
            primary: '#111827',
            text: '#4B5563',
            accent: '#6B7280',
            background: '#FFFFFF',
            sectionBorder: '#E5E7EB',
        },
        spacing: { sectionGap: 12, itemGap: 6, bulletIndent: 12, margin: 44 },
        layout: {
            showSectionDividers: false,
            nameAlignment: 'left',
            contactLayout: 'inline',
            sectionHeaderStyle: 'bold',
        },
    },
}

export interface ExportResult {
    buffer: Buffer
    fileName: string
    mimeType: string
    sizeBytes: number
}
