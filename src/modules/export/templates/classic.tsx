import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'
import type { CanonicalResume } from '@/types/resume'
import type { TemplateConfig } from '../types'

export function ClassicTemplate({
    resume,
    config,
}: {
    resume: CanonicalResume
    config: TemplateConfig
}): React.JSX.Element {
    const styles = StyleSheet.create({
        page: {
            padding: config.spacing.margin,
            fontFamily: config.fonts.body,
            fontSize: 10,
            color: config.colors.text,
            backgroundColor: config.colors.background,
        },
        header: { marginBottom: config.spacing.sectionGap, textAlign: 'center' },
        name: {
            fontSize: 22,
            fontFamily: config.fonts.heading,
            color: config.colors.primary,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        contactLine: { fontSize: 9, color: config.colors.accent },
        section: { marginBottom: config.spacing.sectionGap },
        sectionHeader: {
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: config.fonts.heading,
            color: config.colors.primary,
            textTransform: config.layout.sectionHeaderStyle === 'uppercase' ? 'uppercase' : 'none',
            marginBottom: 2,
            letterSpacing: 1,
        },
        divider: {
            borderBottomWidth: 1,
            borderBottomColor: config.colors.sectionBorder,
            marginBottom: config.spacing.itemGap,
        },
        item: { marginBottom: config.spacing.itemGap },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        itemTitle: { fontWeight: 'bold', fontSize: 11, color: config.colors.primary },
        itemSubtitle: { fontSize: 10, color: config.colors.text, marginBottom: 4 },
        itemDate: { fontSize: 9, color: config.colors.accent },
        bodyText: { fontSize: 10, lineHeight: 1.5, marginBottom: 2 },
        bold: { fontWeight: 'bold' },
        bulletRow: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingLeft: config.spacing.bulletIndent,
        },
        bulletDot: { width: 10, fontSize: 10 },
        bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
        link: { color: config.colors.accent, fontSize: 9, textDecoration: 'underline' },
    })

    const { contactInfo, summary, experience, education, skills, projects, certifications } = resume as any
    const contactItems = [
        (contactInfo?.email),
        (contactInfo?.phone),
        (contactInfo?.linkedin),
        (contactInfo?.github),
        (contactInfo?.website),
        (contactInfo?.location),
    ].filter(Boolean)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.fullName}>{contactInfo?.fullName || 'Your Name'}</Text>
                    {contactItems.length > 0 && (
                        <Text style={styles.contactLine}>{contactItems.join(' | ')}</Text>
                    )}
                </View>

                {/* SUMMARY */}
                {summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>SUMMARY</Text>
                        {config.layout.showSectionDividers && <View style={styles.divider} />}
                        <Text style={styles.bodyText}>{summary}</Text>
                    </View>
                )}

                {/* EXPERIENCE */}
                {experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>EXPERIENCE</Text>
                        {config.layout.showSectionDividers && <View style={styles.divider} />}
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{exp.title}</Text>
                                    <Text style={styles.itemDate}>
                                        {exp.startDate} — {exp.endDate ?? 'Present'}
                                    </Text>
                                </View>
                                <Text style={styles.itemSubtitle}>
                                    {exp.company}
                                    {exp.location ? `, ${exp.location}` : ''}
                                </Text>
                                {(exp.bullets || []).map((bullet, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>{bullet}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* EDUCATION */}
                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>EDUCATION</Text>
                        {config.layout.showSectionDividers && <View style={styles.divider} />}
                        {education.map((edu, i) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                                    <Text style={styles.itemDate}>{edu.endDate}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>
                                    {edu.institution}
                                    {'' ? `, ${''}` : ''}
                                </Text>
                                {edu.gpa && <Text style={styles.bodyText}>GPA: {edu.gpa}</Text>}
                                {(edu.coursework || []) && (edu.coursework || []).length > 0 && (
                                    <Text style={styles.bodyText}>
                                        Relevant Coursework: {(edu.coursework || []).join(', ')}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* SKILLS */}
                {((skills?.technical || []).length > 0 ||
                    (skills?.languages || []).length > 0 ||
                    (skills?.tools || []).length > 0 ||
                    (skills?.soft || []).length > 0) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>SKILLS</Text>
                            {config.layout.showSectionDividers && <View style={styles.divider} />}
                            {(skills?.technical || []).length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Languages: </Text>
                                    {(skills?.technical || []).join(', ')}
                                </Text>
                            )}
                            {(skills?.languages || []).length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Frameworks: </Text>
                                    {(skills?.languages || []).join(', ')}
                                </Text>
                            )}
                            {(skills?.tools || []).length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Tools: </Text>
                                    {(skills?.tools || []).join(', ')}
                                </Text>
                            )}
                            {(skills?.soft || []).length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Soft Skills: </Text>
                                    {(skills?.soft || []).join(', ')}
                                </Text>
                            )}
                        </View>
                    )}

                {/* PROJECTS */}
                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>PROJECTS</Text>
                        {config.layout.showSectionDividers && <View style={styles.divider} />}
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{proj.name}</Text>
                                    {proj.url && (
                                        <Link src={proj.url} style={styles.link}>
                                            Link
                                        </Link>
                                    )}
                                </View>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <Text style={styles.bodyText}>
                                        Technologies: {proj.technologies.join(', ')}
                                    </Text>
                                )}
                                {proj.description && <Text style={styles.bodyText}>{proj.description}</Text>}
                                {(proj.highlights || []) &&
                                    (proj.highlights || []).map((bullet, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={styles.bulletDot}>•</Text>
                                            <Text style={styles.bulletText}>{bullet}</Text>
                                        </View>
                                    ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* CERTIFICATIONS */}
                {certifications && certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>CERTIFICATIONS</Text>
                        {config.layout.showSectionDividers && <View style={styles.divider} />}
                        {certifications.map((cert, i) => (
                            <View key={i} style={styles.bulletRow}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.bulletText}>
                                    {cert.name}
                                    {cert.issuer ? ` — ${cert.issuer}` : ''}
                                    {cert.date ? ` (${cert.date})` : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    )
}
