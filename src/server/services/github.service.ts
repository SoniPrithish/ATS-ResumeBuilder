import { db } from '@/server/lib/db'
import type { CanonicalResume } from '@/types/resume'
import type { ServiceResult } from '@/types/common'

export interface GitHubVersion {
    version: number
    commitSha: string
    commitUrl: string
    message: string
    date: string
}

export const githubService = {
    /**
     * Get the GitHub access token for a user.
     */
    async getAccessToken(userId: string): Promise<string | null> {
        const account = await db.account.findFirst({
            where: {
                userId,
                provider: 'github',
            },
        })
        return account?.access_token || null
    },

    /**
     * Helper to parse owner/repo from URL
     */
    _parseRepoObj(repoUrl: string): { owner: string; repo: string } | null {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!match) return null
        let repo = match[2]
        if (repo.endsWith('.git')) {
            repo = repo.slice(0, -4)
        }
        return { owner: match[1], repo }
    },

    async createOrUpdateResumeVersion(
        userId: string,
        resumeId: string,
        version: number,
        data: CanonicalResume,
        changeNote?: string
    ): Promise<ServiceResult<{ commitSha: string; url: string }>> {
        const token = await this.getAccessToken(userId)
        if (!token) {
            return { success: false, error: 'Link your GitHub account in Settings' }
        }

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user?.githubRepoUrl) {
            return { success: false, error: 'Configure a GitHub repo URL in Settings' }
        }

        const repoObj = this._parseRepoObj(user.githubRepoUrl)
        if (!repoObj) {
            return { success: false, error: 'Repository not found. Check your repo URL.' }
        }

        const path = `resumes/${resumeId}/v${version}.json`
        const apiUrl = `https://api.github.com/repos/${repoObj.owner}/${repoObj.repo}/contents/${path}`
        const fileContent = JSON.stringify(data, null, 2)
        const base64Content = Buffer.from(fileContent).toString('base64')

        // 1. GET to see if it exists (get SHA)
        let sha: string | undefined
        const getRes = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (getRes.status === 200) {
            const getJson = await getRes.json()
            sha = getJson.sha
        } else if (getRes.status === 401) {
            return { success: false, error: 'GitHub token expired. Please re-link your account.' }
        } else if (getRes.status === 403) {
            return { success: false, error: 'GitHub API rate limit reached. Try again later.' }
        } else if (getRes.status === 404) {
            // File doesn't exist, which is fine
        } else {
            return { success: false, error: 'Repository not found. Check your repo URL.' }
        }

        // 2. PUT to create/update
        const message = `Resume update v${version}: ${changeNote || 'Auto-save'}`
        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                content: base64Content,
                sha,
            }),
        })

        if (!putRes.ok) {
            if (putRes.status === 401) return { success: false, error: 'GitHub token expired. Please re-link your account.' }
            if (putRes.status === 403 || putRes.status === 404) return { success: false, error: 'Insufficient permissions. Ensure the repo scope is granted.' }
            return { success: false, error: 'Failed to update GitHub repository.' }
        }

        const putJson = await putRes.json()
        return {
            success: true,
            data: {
                commitSha: putJson.commit.sha,
                url: putJson.commit.html_url,
            },
            error: null,
            warnings: [],
        }
    },

    async getResumeVersions(
        userId: string,
        resumeId: string
    ): Promise<ServiceResult<GitHubVersion[]>> {
        const token = await this.getAccessToken(userId)
        if (!token) return { success: false, error: 'Link your GitHub account in Settings' }

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user?.githubRepoUrl) return { success: false, error: 'Configure a GitHub repo URL in Settings' }

        const repoObj = this._parseRepoObj(user.githubRepoUrl)
        if (!repoObj) return { success: false, error: 'Repository not found. Check your repo URL.' }

        const apiUrl = `https://api.github.com/repos/${repoObj.owner}/${repoObj.repo}/commits?path=resumes/${resumeId}/`

        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!res.ok) {
            return { success: false, error: 'Failed to fetch commits from GitHub' }
        }

        const commits = await res.json()
        const versions: GitHubVersion[] = commits.map((c: any) => {
            // Extract version from commit message if possible
            const match = c.commit.message.match(/v(\d+)/)
            const version = match ? parseInt(match[1], 10) : 0
            return {
                version,
                commitSha: c.sha,
                commitUrl: c.html_url,
                message: c.commit.message,
                date: c.commit.author.date,
            }
        })

        // Sort descending
        versions.sort((a, b) => b.version - a.version)

        return { success: true, data: versions }
    },

    async getResumeVersion(
        userId: string,
        resumeId: string,
        version: number
    ): Promise<ServiceResult<CanonicalResume>> {
        const token = await this.getAccessToken(userId)
        if (!token) return { success: false, error: 'Link your GitHub account in Settings' }

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user?.githubRepoUrl) return { success: false, error: 'Configure a GitHub repo URL in Settings' }

        const repoObj = this._parseRepoObj(user.githubRepoUrl)
        if (!repoObj) return { success: false, error: 'Repository not found. Check your repo URL.' }

        const path = `resumes/${resumeId}/v${version}.json`
        const apiUrl = `https://api.github.com/repos/${repoObj.owner}/${repoObj.repo}/contents/${path}`

        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!res.ok) {
            if (res.status === 404) return { success: false, error: 'Version not found in repository' }
            return { success: false, error: 'Failed to fetch version from GitHub' }
        }

        const fileMeta = await res.json()
        const base64Content = fileMeta.content
        const fileContent = Buffer.from(base64Content, 'base64').toString('utf-8')

        try {
            const canonicalResume = JSON.parse(fileContent) as CanonicalResume
            return { success: true, data: canonicalResume }
        } catch (e) {
            return { success: false, error: 'Failed to parse version JSON data' }
        }
    },

    async testConnection(userId: string): Promise<ServiceResult<{ connected: boolean; repoName: string }>> {
        const token = await this.getAccessToken(userId)
        if (!token) return { success: false, error: 'Link your GitHub account in Settings' }

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user?.githubRepoUrl) return { success: false, error: 'Configure a GitHub repo URL in Settings' }

        const repoObj = this._parseRepoObj(user.githubRepoUrl)
        if (!repoObj) return { success: false, error: 'Repository not found. Check your repo URL.' }

        const apiUrl = `https://api.github.com/repos/${repoObj.owner}/${repoObj.repo}`
        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (res.status === 200) {
            const json = await res.json()
            return { success: true, data: { connected: true, repoName: json.full_name } }
        } else if (res.status === 401) {
            return { success: false, error: 'GitHub token expired. Please re-link your account.' }
        } else if (res.status === 404) {
            return { success: false, error: 'Repository not found. Check your repo URL.' }
        }

        return { success: false, error: 'Insufficient permissions. Ensure the repo scope is granted.' }
    },
}
