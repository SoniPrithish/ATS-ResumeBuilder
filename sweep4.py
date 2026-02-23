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

for t in [
    "src/modules/export/docx-generator.ts",
    "src/modules/export/templates/classic.tsx",
    "src/modules/export/templates/minimal.tsx",
    "src/modules/export/templates/modern.tsx",
]:
    # Fix the accidental replacements from earlier
    replace_in_file(t, "proj.fullName", "proj.name")
    replace_in_file(t, "cert.fullName", "cert.name")
    replace_in_file(t, "edu.coursework || []", "(edu.coursework || [])")
    replace_in_file(t, "exp.bullets || []", "(exp.bullets || [])")
    replace_in_file(t, "proj.highlights || []", "(proj.highlights || [])")
    replace_in_file(t, "skills?.technical || []", "(skills?.technical || [])")
    replace_in_file(t, "skills?.languages || []", "(skills?.languages || [])")
    replace_in_file(t, "skills?.tools || []", "(skills?.tools || [])")
    replace_in_file(t, "skills?.soft || []", "(skills?.soft || [])")
    replace_in_file(t, "((skills?.technical || []))", "(skills?.technical || [])")
    replace_in_file(t, "((skills?.languages || []))", "(skills?.languages || [])")
    replace_in_file(t, "((skills?.tools || []))", "(skills?.tools || [])")
    replace_in_file(t, "((skills?.soft || []))", "(skills?.soft || [])")
    replace_in_file(t, "((edu.coursework || []))", "(edu.coursework || [])")
    replace_in_file(t, "((exp.bullets || []))", "(exp.bullets || [])")
    replace_in_file(t, "((proj.highlights || []))", "(proj.highlights || [])")

    # Fix the weird lengths
    replace_in_file(t, "((edu.coursework || [])).length > 0", "(edu.coursework || []).length > 0")
    replace_in_file(t, "((edu.coursework || [])) && (edu.coursework || []).length > 0", "(edu.coursework || []).length > 0")
    replace_in_file(t, "((exp.bullets || [])).map", "(exp.bullets || []).map")
    replace_in_file(t, "((proj.highlights || [])).map", "(proj.highlights || []).map")
    replace_in_file(t, "skills?.technical?.length > 0", "(skills?.technical || []).length > 0")
    replace_in_file(t, "skills?.languages?.length > 0", "(skills?.languages || []).length > 0")
    replace_in_file(t, "skills?.tools?.length > 0", "(skills?.tools || []).length > 0")
    replace_in_file(t, "skills?.soft?.length > 0", "(skills?.soft || []).length > 0")

    # Contact Info fixes again to make sure everything has contactInfo fallback properly
    regex_replace_in_file(t, r"contactInfo\?\.([a-zA-Z]+)", r"(contactInfo?. \1)")

    # The config.layout.fullNameAlignment -> nameAlignment
    replace_in_file(t, "fullNameAlignment", "nameAlignment")

print("Sweep 4 applied")
