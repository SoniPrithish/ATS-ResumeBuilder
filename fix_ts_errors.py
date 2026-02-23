import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, "r") as f: content = f.read()
    content = content.replace(old, new)
    with open(path, "w") as f: f.write(content)

# Fix analytics.service.ts CacheService calls
replace_in_file("src/server/services/analytics.service.ts", "cacheService.getCached", "cacheService.get")
replace_in_file("src/server/services/analytics.service.ts", "cacheService.setCached", "cacheService.set")
replace_in_file("tests/unit/services/analytics.service.test.ts", "cacheService.getCached", "cacheService.get")
replace_in_file("tests/unit/services/analytics.service.test.ts", "cacheService.setCached", "cacheService.set")

router_test_files = [
    "tests/unit/routers/analytics.router.test.ts",
    "tests/unit/routers/user.router.test.ts",
    "tests/unit/routers/version.router.test.ts"
]

for f in router_test_files:
    replace_in_file(f, "db: {} as any,", "db: {} as any, headers: undefined, redis: {} as any,")

print("Fixed router contexts and cache calls")
