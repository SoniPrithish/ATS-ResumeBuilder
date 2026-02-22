import { useResumeStore } from "@/stores/resume-store";

// A basic renderer for the resume preview
export function ResumePreview() {
    const { currentResume } = useResumeStore();

    if (!currentResume) return null;

    const { contactInfo, summary, experience, education, skills, projects } = currentResume;
    const t = currentResume.templateId || "Classic";

    return (
        <div className={`w-full max-w-[850px] mx-auto bg-white text-black min-h-[1100px] shadow-lg p-8 md:p-12 print:shadow-none print:p-0 template-${t.toLowerCase()}`}>
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{contactInfo?.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                    {contactInfo?.email && <span>{contactInfo.email}</span>}
                    {contactInfo?.phone && <span>• {contactInfo.phone}</span>}
                    {contactInfo?.location && <span>• {contactInfo.location}</span>}
                    {contactInfo?.linkedin && <span>• <a href={contactInfo.linkedin} className="text-blue-600 hover:underline">{contactInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></span>}
                    {contactInfo?.github && <span>• <a href={contactInfo.github} className="text-blue-600 hover:underline">{contactInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a></span>}
                </div>
            </header>

            {summary && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-2 pb-1">Summary</h2>
                    <p className="text-sm leading-relaxed">{summary}</p>
                </section>
            )}

            {experience && experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-3 pb-1">Experience</h2>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold">{exp.title}</h3>
                                    <span className="text-sm font-medium">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="italic text-gray-700">{exp.company}{exp.location && `, ${exp.location}`}</span>
                                </div>
                                {exp.bullets && exp.bullets.length > 0 && (
                                    <ul className="list-disc leading-relaxed text-sm ml-4 pl-1 space-y-1 text-gray-800">
                                        {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {projects && projects.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-3 pb-1">Projects</h2>
                    <div className="space-y-4">
                        {projects.map((proj) => (
                            <div key={proj.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold">
                                        {proj.name}
                                        {proj.url && <span className="font-normal italic text-sm text-gray-600 ml-2"><a href={proj.url} className="hover:underline">{proj.url.replace(/^https?:\/\/(www\.)?/, '')}</a></span>}
                                    </h3>
                                </div>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="text-sm italic text-gray-700 mb-2">
                                        {proj.technologies.join(", ")}
                                    </p>
                                )}
                                {proj.highlights && proj.highlights.length > 0 && (
                                    <ul className="list-disc leading-relaxed text-sm ml-4 pl-1 space-y-1 text-gray-800">
                                        {proj.highlights.filter(b => b.trim()).map((bullet, i) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education && education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-3 pb-1">Education</h2>
                    <div className="space-y-3">
                        {education.map((edu) => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold">{edu.institution}</h3>
                                    <span className="text-sm font-medium">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="italic text-gray-700">{edu.degree} in {edu.field}</span>
                                    {edu.gpa && <span className="text-sm">GPA: {edu.gpa}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills && (skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0 || (skills.languages && skills.languages.length > 0)) && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-3 pb-1">Skills</h2>
                    <div className="text-sm leading-relaxed space-y-1 text-gray-800">
                        {skills.technical && skills.technical.length > 0 && (
                            <div><span className="font-bold">Technical:</span> {skills.technical.join(", ")}</div>
                        )}
                        {skills.languages && skills.languages.length > 0 && (
                            <div><span className="font-bold">Frameworks/Languages:</span> {skills.languages.join(", ")}</div>
                        )}
                        {skills.tools && skills.tools.length > 0 && (
                            <div><span className="font-bold">Tools:</span> {skills.tools.join(", ")}</div>
                        )}
                        {skills.soft && skills.soft.length > 0 && (
                            <div><span className="font-bold">Concepts/Soft:</span> {skills.soft.join(", ")}</div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
