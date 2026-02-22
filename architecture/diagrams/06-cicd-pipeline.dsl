@direction LR
@spacing 50

(Git Push) -> [GitHub Actions Trigger]
[GitHub Actions Trigger] -> [Lint and TypeCheck]
[Lint and TypeCheck] -> [Unit Tests - Vitest]
[Unit Tests - Vitest] -> [Build Next.js]
[Build Next.js] -> {Branch?}
{Branch?} -> "feature" -> [Vercel Preview Deploy]
{Branch?} -> "main" -> [Run DB Migration]
[Run DB Migration] -> [Vercel Production Deploy]
[Vercel Production Deploy] -> [Smoke Tests]
[Smoke Tests] -> {Pass?}
{Pass?} -> "yes" -> (Deploy Complete)
{Pass?} -> "no" -> (Auto Rollback)
