import os
import re

directories = ["tests"]

files_to_fix = []
for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".ts"):
                files_to_fix.append(os.path.join(root, file))

for filepath in files_to_fix:
    with open(filepath, "r") as f:
        content = f.read()

    # res.data -> (res as any).data
    content = re.sub(r'res\.data', r'(res as any).data', content)
    # res.error -> (res as any).error
    content = re.sub(r'res\.error', r'(res as any).error', content)
    # result.error -> (result as any).error
    content = re.sub(r'result\.error', r'(result as any).error', content)
    # result.data -> (result as any).data
    content = re.sub(r'result\.data', r'(result as any).data', content)

    # replace { success: false, data: null, error: 'xxx' } etc. Just add 'as any'
    content = re.sub(r'\{ success: false,([^}]+) \}', r'{ success: false, \1 } as any', content)
    content = re.sub(r'\{ success: true,([^}]+) \}', r'{ success: true, \1 } as any', content)

    # handle specific "as any as any" cleanup
    content = content.replace("as any as any", "as any")
    
    with open(filepath, "w") as f:
        f.write(content)

print("Done")
