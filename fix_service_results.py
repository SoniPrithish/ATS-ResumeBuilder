import os
import re

directories = [
    "src/server/services",
    "src/app/api/export/[id]",
    "src/app/api/upload/linkedin",
    "tests"
]

files_to_fix = []
for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                files_to_fix.append(os.path.join(root, file))

for filepath in files_to_fix:
    with open(filepath, "r") as f:
        content = f.read()

    # In tests, we still construct these objects sometimes.
    # But usually it's in the return values in services

    # { success: false, data: null, error: 'xxx', warnings: [] } -> { success: false, error: 'xxx' }
    content = re.sub(r'\{\s*success:\s*false\s*,\s*data:\s*null\s*,\s*error:\s*(.+?)\s*,\s*warnings:\s*\[\]\s*\}', r'{ success: false, error: \1 }', content)
    
    # { success: true, data: xxx, error: null, warnings: [] } -> { success: true, data: xxx }
    content = re.sub(r'\{\s*success:\s*true\s*,\s*data:\s*(.+?)\s*,\s*error:\s*null\s*,\s*warnings:\s*\[\]\s*\}', r'{ success: true, data: \1 }', content)

    # In tests, if we do res.error when it might not exist:
    
    with open(filepath, "w") as f:
        f.write(content)

print("Done")
