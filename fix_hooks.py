import os

file_content_ats = open('src/hooks/use-ats-score.ts').read()
file_content_ats = file_content_ats.replace('.useQuery(resumeId, {', '.useQuery({ resumeId }, {')
file_content_ats = file_content_ats.replace('.invalidate(data.id)', '.invalidate({ resumeId: data.id })')
open('src/hooks/use-ats-score.ts', 'w').write(file_content_ats)

file_content_resume = open('src/hooks/use-resume.ts').read()
file_content_resume = file_content_resume.replace('.useQuery(id, {', '.useQuery({ id }, {')
file_content_resume = file_content_resume.replace('.invalidate(data.id)', '.invalidate({ id: data.id })')
file_content_resume = file_content_resume.replace('limit = 10', 'pageSize = 10')
file_content_resume = file_content_resume.replace('limit,', 'pageSize,')
open('src/hooks/use-resume.ts', 'w').write(file_content_resume)

file_content_ai = open('src/hooks/use-ai-enhance.ts').read()
file_content_ai = file_content_ai.replace('trpc.ai.', '(trpc as any).ai.')
open('src/hooks/use-ai-enhance.ts', 'w').write(file_content_ai)

file_content_jd = open('src/hooks/use-jd-match.ts').read()
file_content_jd = file_content_jd.replace('id:', 'jdId:')
file_content_jd = file_content_jd.replace('limit = 10', 'pageSize = 10')
file_content_jd = file_content_jd.replace('limit,', 'pageSize,')
open('src/hooks/use-jd-match.ts', 'w').write(file_content_jd)

print("Hooks fixed")
