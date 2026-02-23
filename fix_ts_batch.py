import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, "r") as f: content = f.read()
    content = content.replace(old, new)
    with open(path, "w") as f: f.write(content)

replace_in_file("src/server/services/export.service.ts", "data: null,\n            error:", "error:")
replace_in_file("src/server/services/export.service.ts", "success: false,\n                data: null,\n                error", "success: false,\n                error")
replace_in_file("src/server/services/export.service.ts", "error: null", "")

replace_in_file("src/server/services/linkedin.service.ts", "isLinkedInPdf, parseLinkedInPdf", "parseLinkedInPdf")
replace_in_file("tests/unit/services/linkedin.service.test.ts", "isLinkedInPdf, parseLinkedInPdf", "parseLinkedInPdf")

# ServiceResult data: null / error: null
for f in [
    "src/server/services/linkedin.service.ts", 
    "src/server/services/github.service.ts", 
    "src/server/services/version.service.ts",
    "src/server/services/user.service.ts",
    "tests/unit/services/linkedin.service.test.ts",
    "tests/unit/services/version.service.test.ts",
    "tests/integration/api/export.api.test.ts",
    "tests/integration/api/linkedin-upload.api.test.ts"
]:
    replace_in_file(f, "data: null,\n            error:", "error:")
    replace_in_file(f, "data: null,\n                error:", "error:")
    replace_in_file(f, "error: null,\n", "")
    replace_in_file(f, "error: null", "")

# ai utils caughtErr
replace_in_file("tests/unit/ai/utils.test.ts", "const caughtErr =", "const caughtErr: any =")

# hooks any errors
replace_in_file("src/hooks/use-ai-enhance.ts", "onError: (error) =>", "onError: (error: any) =>")

print("Fixed batch")
