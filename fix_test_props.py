import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, "r") as f: content = f.read()
    content = content.replace(old, new)
    with open(path, "w") as f: f.write(content)

# Fix generators tests
for path in ["tests/unit/export/docx-generator.test.ts", "tests/unit/export/pdf-generator.test.ts"]:
    replace_in_file(path, "contact: {", "contactInfo: {")
    replace_in_file(path, "name: 'John Doe',", "fullName: 'John Doe',")
    replace_in_file(path, "location: 'New York',", "") # Already removed location from Education in generator tests python script? No, wait education had location.
    # In canonical resume, the contact object was "contact", we mapped it to "contactInfo".

# Fix analytics cache service mock
replace_in_file("tests/unit/services/analytics.service.test.ts", "cacheService: {", "cacheService: {\n        get: vi.fn(),\n        set: vi.fn(),")

print("Files patched")
