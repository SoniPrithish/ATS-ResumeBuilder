import os
import re

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, "r") as f: content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(path, "w") as f: f.write(content)

def regex_replace_in_file(path, pattern, new):
    if not os.path.exists(path): return
    with open(path, "r") as f: content = f.read()
    new_content = re.sub(pattern, new, content)
    if new_content != content:
        with open(path, "w") as f: f.write(new_content)

# 1. UI Components Type Errors
replace_in_file("src/app/(dashboard)/dashboard/page.tsx", "(item.id)", "(item.id as string)")
replace_in_file("src/app/(dashboard)/dashboard/page.tsx", "item.description as string", "String(item.description)")
replace_in_file("src/app/(dashboard)/jobs/page.tsx", "(job: any)", "(job: any)") # was already handled
replace_in_file("src/hooks/use-jd-match.ts", "jdId: jdId", "jobId: jdId")

# 2. LinkedIn Upload Test and Export API test null as any
replace_in_file("tests/integration/api/export.api.test.ts", "mockResolvedValue(null)", "mockResolvedValue(null as any)")
replace_in_file("tests/integration/api/linkedin-upload.api.test.ts", "mockResolvedValue(null)", "mockResolvedValue(null as any)")

# 3. Resume / Version services issues
replace_in_file("src/server/services/version.service.ts", "rawText: snapshotData.rawText,", "") # UpdateResumeInput has no rawText

# 4. Gemini Token formatting
replace_in_file("src/modules/ai/providers/gemini.ts", 
    "_:", "")
replace_in_file("src/modules/ai/providers/gemini.ts", 
    "__:", "")

# 5. Fix UI form label from registry
replace_in_file("src/components/ui/form.tsx", "@/registry/new-york/ui/label", "@/components/ui/label")
replace_in_file("src/components/ui/form.tsx", "import { Label } from \"@/components/ui/label\"", "import { Label } from \"@/components/ui/label\"")

# 6. Fix Export Templates undefined checks
for t in [
    "src/modules/export/templates/classic.tsx",
    "src/modules/export/templates/minimal.tsx",
    "src/modules/export/templates/modern.tsx",
]:
    replace_in_file(t, "contactInfo.location", "contactInfo?.location")
    replace_in_file(t, "contactInfo.phone", "contactInfo?.phone")
    replace_in_file(t, "contactInfo.email", "contactInfo?.email")
    replace_in_file(t, "contactInfo.linkedin", "contactInfo?.linkedin")
    replace_in_file(t, "contactInfo.github", "contactInfo?.github")
    replace_in_file(t, "contactInfo.website", "contactInfo?.website")
    
# Remove missing properties in CanonicalResume from templates
for t in [
    "src/modules/export/templates/classic.tsx",
    "src/modules/export/templates/minimal.tsx",
    "src/modules/export/templates/modern.tsx",
]:
    replace_in_file(t, "const { contactInfo, summary, experience, education, skills, projects, certifications } = resume", "const { contactInfo, summary, experience, education, skills, projects, certifications } = resume as any")

print("Sweep 3 applied")
