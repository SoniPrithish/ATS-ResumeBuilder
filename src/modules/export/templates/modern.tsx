import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'
import type { CanonicalResume } from '@/types/resume'
import type { TemplateConfig } from '../types'

export function ModernTemplate({
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
        header: {
            marginBottom: config.spacing.sectionGap,
            textAlign: config.layout.nameAlignment === 'left' ? 'left' : 'center',
        },
        name: {
            fontSize: 22,
            fontFamily: config.fonts.heading,
            color: config.colors.accent,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        contactLine: {
            fontSize: 9,
            color: config.colors.text,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
        },
        contactItem: {
            marginRight: 6,
        },
        section: { marginBottom: config.spacing.sectionGap },
        sectionHeader: {
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: config.fonts.heading,
            color: config.colors.accent,
            textTransform: config.layout.sectionHeaderStyle === 'titlecase' ? 'none' : 'uppercase',
            marginBottom: config.spacing.itemGap,
            borderLeftWidth: 3,
            borderLeftColor: config.colors.accent,
            paddingLeft: 6,
            letterSpacing: 0.5,
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
        bodyText: { fontSize: 10, lineHeight: 1.5, marginBottom: 4 },
        bold: { fontWeight: 'bold' },
        bulletRow: {
            flexDirection: 'row',
            marginBottom: 3,
            paddingLeft: config.spacing.bulletIndent,
        },
        bulletDot: { width: 10, fontSize: 10, color: config.colors.accent },
        bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
        link: { color: config.colors.accent, fontSize: 9, textDecoration: 'none' },
        skillsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
            marginBottom: 4,
        },
        skillBadge: {
            backgroundColor: config.colors.primary,
            color: config.colors.background,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 9,
            marginRight: 4,
            marginBottom: 4,
        },
        skillCategory: {
            fontSize: 10,
            fontWeight: 'bold',
            color: config.colors.primary,
            marginBottom: 4,
            marginTop: 4,
        },
        skillText: {
            fontSize: 10,
            color: config.colors.text,
            marginBottom: 4,
        },
    })

    const { contact, summary, experience, education, skills, projects, certifications } = resume

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{contact.name || 'Your Name'}</Text>
                    <View style={styles.contactLine}>
                        {contact.email && <Text style={styles.contactItem}>✉ {contact.email}</Text>}
                        {contact.phone && <Text style={styles.contactItem}>☎ {contact.phone}</Text>}
                        {contact.linkedin && <Text style={styles.contactItem}>in {contact.linkedin}</Text>}
                        {contact.github && <Text style={styles.contactItem}>gh {contact.github}</Text>}
                        {contact.website && <Text style={styles.contactItem}>🌐 {contact.website}</Text>}
                        {contact.location && <Text style={styles.contactItem}>📍 {contact.location}</Text>}
                    </View>
                </View>

                {summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Summary</Text>
                        <Text style={styles.bodyText}>{summary}</Text>
                    </View>
                )}

                {experience && experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Experience</Text>
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
                                {exp.bullets.map((bullet, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>{bullet}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {education && education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Education</Text>
                        {education.map((edu, i) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                                    <Text style={styles.itemDate}>{edu.graduationDate}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>
                                    {edu.institution}
                                    {edu.location ? `, ${edu.location}` : ''}
                                </Text>
                                {edu.gpa && <Text style={styles.bodyText}>GPA: {edu.gpa}</Text>}
                                {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                                    <Text style={styles.bodyText}>
                                        Relevant Coursework: {edu.relevantCoursework.join(', ')}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {(skills?.technical?.length > 0 ||
                    skills?.frameworks?.length > 0 ||
                    skills?.tools?.length > 0 ||
                    skills?.soft?.length > 0) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Skills</Text>
                            {skills.technical.length > 0 && (
                                <View>
                                    <Text style={styles.skillCategory}>Languages</Text>
                                    <View style={styles.skillsContainer}>
                                        {skills.technical.map((s, idx) => (
                                            <Text key={idx} style={styles.skillBadge}>{s}</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {skills.frameworks.length > 0 && (
                                <View>
                                    <Text style={styles.skillCategory}>Frameworks</Text>
                                    <View style={styles.skillsContainer}>
                                        {skills.frameworks.map((s, idx) => (
                                            <Text key={idx} style={styles.skillBadge}>{s}</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {skills.tools.length > 0 && (
                                <View>
                                    <Text style={styles.skillCategory}>Tools</Text>
                                    <View style={styles.skillsContainer}>
                                        {skills.tools.map((s, idx) => (
                                            <Text key={idx} style={styles.skillBadge}>{s}</Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {skills.soft.length > 0 && (
                                <View>
                                    <Text style={styles.skillCategory}>Soft Skills</Text>
                                    <Text style={styles.skillText}>{skills.soft.join(', ')}</Text>
                                </View>
                            )}
                        </View>
                    )}

                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Projects</Text>
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
                                    <View style={styles.skillsContainer}>
                                        {proj.technologies.map((t, idx) => (
                                            <Text key={idx} style={styles.skillBadge}>{t}</Text>
                                        ))}
                                    </View>
                                )}
                                {proj.description && <Text style={styles.bodyText}>{proj.description}</Text>}
                                {proj.bullets &&
                                    proj.bullets.map((bullet, j) => (
                                        <View key={j} style={styles.bulletRow}>
                                            <Text style={styles.bulletDot}>•</Text>
                                            <Text style={styles.bulletText}>{bullet}</Text>
                                        </View>
                                    ))}
                            </View>
                        ))}
                    </View>
                )}

                {certifications && certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Certifications</Text>
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
