import os

files_to_fix = [
    "src/modules/export/docx-generator.ts",
    "src/modules/export/pdf-generator.tsx",
    "src/modules/export/templates/classic.tsx",
    "src/modules/export/templates/minimal.tsx",
    "src/modules/export/templates/modern.tsx",
    "tests/unit/export/docx-generator.test.ts",
    "tests/unit/export/pdf-generator.test.ts"
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r") as f:
        content = f.read()

    # resume.contact -> resume.contactInfo
    # Note: need to handle resume.contact carefully so we don't double replace
    content = content.replace("resume.contact.", "resume.contactInfo.")
    # In destructuring or passing contact -> contactInfo
    content = content.replace("contact.name", "contactInfo.fullName")
    content = content.replace("contactInfo.name", "contactInfo.fullName")

    # contact fields that changed or we just replace globally
    content = content.replace("resume.contactInfo.email", "resume.contactInfo.email")

    # optional arrays
    content = content.replace("resume.projects.length", "(resume.projects?.length || 0)")
    content = content.replace("resume.certifications.length", "(resume.certifications?.length || 0)")
    
    # docx-generator uses education / projects directly without checking optionality
    content = content.replace("resume.projects,", "resume.projects || [],")
    content = content.replace("resume.certifications)", "resume.certifications || [])")
    content = content.replace("resume.projects)", "resume.projects || [])")

    # education fields
    content = content.replace("edu.location", "''")
    content = content.replace("({edu.location})", "")
    content = content.replace(", ''", "") # cleanup string concat issues if any
    content = content.replace("edu.graduationDate", "edu.endDate")
    content = content.replace("edu.relevantCoursework", "edu.coursework")

    # skills
    content = content.replace("skills.frameworks", "skills.languages")
    content = content.replace("'Frameworks'", "'Languages'")
    content = content.replace("frameworks:", "languages:")
    content = content.replace("frameworks?:", "languages?:")

    # projects bullets
    content = content.replace("proj.bullets", "proj.highlights")
    content = content.replace("bullets: string[]", "highlights?: string[]")

    with open(filepath, "w") as f:
        f.write(content)

print("Done")
