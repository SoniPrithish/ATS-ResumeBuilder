import React from 'react'
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'
import type { CanonicalResume } from '@/types/resume'
import type { TemplateConfig } from '../types'

export function MinimalTemplate({
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
            color: config.colors.primary, // Monochrome
            backgroundColor: config.colors.background,
        },
        header: { marginBottom: config.spacing.sectionGap, textAlign: 'left' },
        name: {
            fontSize: 20,
            fontFamily: config.fonts.heading,
            color: config.colors.primary,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        contactLine: { fontSize: 9, color: config.colors.text },
        section: { marginBottom: config.spacing.sectionGap },
        sectionHeader: {
            fontSize: 11,
            fontWeight: 'bold',
            fontFamily: config.fonts.heading,
            color: config.colors.primary,
            marginBottom: config.spacing.itemGap,
        },
        item: { marginBottom: config.spacing.itemGap },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 1,
        },
        itemTitle: { fontWeight: 'bold', fontSize: 10, color: config.colors.primary },
        itemSubtitle: { fontSize: 10, color: config.colors.primary, marginBottom: 2 },
        itemDate: { fontSize: 9, color: config.colors.text },
        bodyText: { fontSize: 10, lineHeight: 1.4, marginBottom: 2, color: config.colors.text },
        bold: { fontWeight: 'bold' },
        bulletRow: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingLeft: config.spacing.bulletIndent,
        },
        bulletDot: { width: 10, fontSize: 10, color: config.colors.primary },
        bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4, color: config.colors.text },
        link: { color: config.colors.text, fontSize: 9, textDecoration: 'none' },
    })

    const { contact, summary, experience, education, skills, projects, certifications } = resume

    const contactItems = [
        contact.email,
        contact.phone,
        contact.linkedin,
        contact.github,
        contact.website,
        contact.location,
    ].filter(Boolean)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.name}>{contact.name || 'Your Name'}</Text>
                    {contactItems.length > 0 && (
                        <Text style={styles.contactLine}>{contactItems.join(' | ')}</Text>
                    )}
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
                                        Coursework: {edu.relevantCoursework.join(', ')}
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
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Languages: </Text>
                                    {skills.technical.join(', ')}
                                </Text>
                            )}
                            {skills.frameworks.length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Frameworks: </Text>
                                    {skills.frameworks.join(', ')}
                                </Text>
                            )}
                            {skills.tools.length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Tools: </Text>
                                    {skills.tools.join(', ')}
                                </Text>
                            )}
                            {skills.soft.length > 0 && (
                                <Text style={styles.bodyText}>
                                    <Text style={styles.bold}>Soft Skills: </Text>
                                    {skills.soft.join(', ')}
                                </Text>
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
                                        <Text style={styles.itemDate}>{proj.url}</Text>
                                    )}
                                </View>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <Text style={styles.bodyText}>
                                        Technologies: {proj.technologies.join(', ')}
                                    </Text>
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
