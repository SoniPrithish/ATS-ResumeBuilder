import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, "r") as f:
        content = f.read()

    # export.service.ts specific syntax errors
    content = content.replace("data: null,\n                    error: 'Resume not found',\n                    warnings: [],", "error: 'Resume not found',")
    content = content.replace("data: null,\n                    error: 'Unauthorized',\n                    warnings: [],", "error: 'Unauthorized',")
    content = content.replace("data: null,\n                    error: 'Cannot export archived resume',\n                    warnings: [],", "error: 'Cannot export archived resume',")
    content = content.replace(",\n                ,\n                warnings: [],", "")
    content = content.replace(",\n                warnings: [],", "")

    # Clean up CanonicalResume object in export.service.ts
    content = content.replace("contact: (", "contactInfo: (")
    content = content.replace("name: '',", "fullName: '',")
    content = content.replace("frameworks: [],", "")
    content = content.replace("other: [],", "")

    with open(filepath, "w") as f:
        f.write(content)

fix_file("src/server/services/export.service.ts")
print("Fix applied")
