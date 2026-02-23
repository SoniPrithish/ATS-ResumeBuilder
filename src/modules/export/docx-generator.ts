import {
    Document,
    Paragraph,
    TextRun,
    AlignmentType,
    Packer,
    BorderStyle,
} from 'docx'
import type {
    CanonicalResume,
    ExperienceEntry,
    EducationEntry,
    ProjectEntry,
    CertificationEntry,
    SkillSet,
} from '@/types/resume'
import type { ExportOptions, ExportResult } from './types'

/**
 * Helper to slugify a string
 */
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
}

export async function generateDocx(
    resume: CanonicalResume,
    options: ExportOptions
): Promise<ExportResult> {
    // 1. Basic empty check
    const hasData =
        resume.contactInfo.fullName ||
        resume.summary ||
        resume.experience.length > 0 ||
        resume.education.length > 0 ||
        Object.values(resume.skills).some(arr => arr.length > 0) ||
        (resume.projects?.length || 0) > 0 ||
        (resume.certifications?.length || 0) > 0

    if (!hasData) {
        throw new Error('EXPORT_EMPTY_RESUME')
    }

    // Filter valid contact fields for the top line
    const contactLine = [
        resume.contactInfo.email,
        resume.contactInfo.phone,
        resume.contactInfo.linkedin,
        resume.contactInfo.github,
        resume.contactInfo.website,
        resume.contactInfo.location,
    ]
        .filter(Boolean)
        .join(' | ')

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
                },
                children: [
                    // NAME
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: resume.contactInfo.fullName || 'Your Name',
                                bold: true,
                                size: 28, // Half-points (so 14pt)
                                font: 'Calibri',
                            }),
                        ],
                    }),

                    // CONTACT LINE
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: contactLine,
                                size: 18,
                                font: 'Calibri',
                                color: '666666',
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Content Paragraphs
                    ...buildSummaryParagraphs(resume.summary),
                    ...buildExperienceParagraphs(resume.experience),
                    ...buildEducationParagraphs(resume.education),
                    ...buildSkillsParagraphs(resume.skills),
                    ...buildProjectsParagraphs(resume.projects || []),
                    ...buildCertificationsParagraphs(resume.certifications || []),
                ],
            },
        ],
    })

    let buffer: Buffer
    try {
        buffer = await Packer.toBuffer(doc)
    } catch (err: unknown) {
        throw new Error(
            `EXPORT_RENDER_FAILED: ${err instanceof Error ? err.message : String(err)}`
        )
    }

    const baseName = slugify(resume.contactInfo.fullName || 'resume')
    const timestamp = Date.now()
    const fileName = `${baseName}_${options.templateId}_${timestamp}.docx`

    return {
        buffer,
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: buffer.length,
    }
}

function buildSectionHeader(title: string): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: 22,
                font: 'Calibri',
            }),
        ],
        border: {
            bottom: {
                color: '000000',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
            },
        },
        spacing: { before: 200, after: 100 },
    })
}

function buildBulletParagraph(text: string): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text,
                size: 20,
                font: 'Calibri',
            }),
        ],
        bullet: { level: 0 },
        spacing: { before: 50, after: 50 },
    })
}

function buildSummaryParagraphs(summary?: string | null): Paragraph[] {
    if (!summary) return []
    return [
        buildSectionHeader('Summary'),
        new Paragraph({
            children: [
                new TextRun({
                    text: summary,
                    size: 20,
                    font: 'Calibri',
                }),
            ],
            spacing: { after: 100 },
        }),
    ]
}

function buildExperienceParagraphs(experience: ExperienceEntry[]): Paragraph[] {
    if (!experience || experience.length === 0) return []

    const paragraphs: Paragraph[] = [buildSectionHeader('Experience')]

    experience.forEach((exp) => {
        // Title and Company
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: exp.title,
                        bold: true,
                        size: 20,
                        font: 'Calibri',
                    }),
                    new TextRun({
                        text: ` | ${exp.company}${exp.location ? `, ${exp.location}` : ''}`,
                        size: 20,
                        font: 'Calibri',
                    }),
                ],
                spacing: { before: 100 },
            })
        )

        // Date
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${exp.startDate} ${exp.endDate ? `— ${exp.endDate}` : '— Present'}`,
                        size: 18,
                        font: 'Calibri',
                        color: '666666',
                    }),
                ],
                spacing: { after: 50 },
            })
        )

        // Bullets
        if (exp.bullets) {
            exp.bullets.forEach((bullet) => {
                paragraphs.push(buildBulletParagraph(bullet))
            })
        }
    })

    return paragraphs
}

function buildEducationParagraphs(education: EducationEntry[]): Paragraph[] {
    if (!education || education.length === 0) return []

    const paragraphs: Paragraph[] = [buildSectionHeader('Education')]

    education.forEach((edu) => {
        // Degree and Institution
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: edu.degree,
                        bold: true,
                        size: 20,
                        font: 'Calibri',
                    }),
                ],
                spacing: { before: 100 },
            })
        )

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: edu.institution,
                        size: 20,
                        font: 'Calibri',
                    }),
                    new TextRun({
                        text: `  |  ${edu.endDate}`,
                        size: 18,
                        color: '666666',
                        font: 'Calibri',
                    }),
                ],
                spacing: { after: 50 },
            })
        )

        if (edu.gpa) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20, font: 'Calibri' })],
                    spacing: { after: 50 },
                })
            )
        }

        if (edu.coursework && edu.coursework.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `Relevant Coursework: ${edu.coursework.join(', ')}`, size: 20, font: 'Calibri' }),
                    ],
                    spacing: { after: 50 },
                })
            )
        }
    })

    return paragraphs
}

function buildSkillsParagraphs(skills: SkillSet | undefined): Paragraph[] {
    if (
        !skills ||
        (!skills.technical?.length &&
            !skills.languages?.length &&
            !skills.tools?.length &&
            !skills.soft?.length)
    )
        return []

    const paragraphs: Paragraph[] = [buildSectionHeader('Skills')]

    const addSkillLine = (label: string, items: string[]) => {
        if (items && items.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${label}: `, bold: true, size: 20, font: 'Calibri' }),
                        new TextRun({ text: items.join(', '), size: 20, font: 'Calibri' }),
                    ],
                    spacing: { before: 50, after: 50 },
                })
            )
        }
    }

    addSkillLine('Technical', skills.technical)
    addSkillLine('Languages', skills.languages ?? [])
    addSkillLine('Tools', skills.tools)
    addSkillLine('Soft Skills', skills.soft)

    return paragraphs
}

function buildProjectsParagraphs(projects: ProjectEntry[]): Paragraph[] {
    if (!projects || projects.length === 0) return []

    const paragraphs: Paragraph[] = [buildSectionHeader('Projects')]

    projects.forEach((proj) => {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: proj.name,
                        bold: true,
                        size: 20,
                        font: 'Calibri',
                    }),
                    ...(proj.url
                        ? [
                            new TextRun({
                                text: ` | ${proj.url}`,
                                size: 18,
                                font: 'Calibri',
                                color: '0563C1', // Blue link like color
                                underline: {},
                            }),
                        ]
                        : []),
                ],
                spacing: { before: 100 },
            })
        )

        if (proj.technologies && proj.technologies.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Technologies: ${proj.technologies.join(', ')}`,
                            size: 20,
                            font: 'Calibri',
                        }),
                    ],
                    spacing: { after: 50 },
                })
            )
        }

        if (proj.description) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: proj.description,
                            size: 20,
                            font: 'Calibri',
                        }),
                    ],
                    spacing: { after: 50 },
                })
            )
        }

        if (proj.highlights) {
            proj.highlights.forEach((bullet) => {
                paragraphs.push(buildBulletParagraph(bullet))
            })
        }
    })

    return paragraphs
}

function buildCertificationsParagraphs(certifications: CertificationEntry[]): Paragraph[] {
    if (!certifications || certifications.length === 0) return []

    const paragraphs: Paragraph[] = [buildSectionHeader('Certifications')]

    certifications.forEach((cert) => {
        paragraphs.push(
            buildBulletParagraph(
                `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`
            )
        )
    })

    return paragraphs
}
