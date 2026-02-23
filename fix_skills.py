import os

files_to_fix = [
    "tests/unit/export/docx-generator.test.ts",
    "tests/unit/export/pdf-generator.test.ts"
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r") as f:
        content = f.read()

    content = content.replace("languages: [], tools: [], languages: [], soft: [], other: []", "languages: [], tools: [], soft: []")
    content = content.replace("languages: [],\n                    soft: ['Talking'],\n                    other: []", "soft: ['Talking']")

    with open(filepath, "w") as f:
        f.write(content)

print("Done")
