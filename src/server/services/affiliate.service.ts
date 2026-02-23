import type { RankedSkillGap } from '@/types/job'

export interface AffiliateRecommendation {
    id: string
    skill: string
    type: 'course' | 'certification' | 'tool' | 'book'
    title: string
    provider: string
    description: string
    url: string
    price: 'free' | 'paid'
    rating?: number
    relevanceScore: number
}

// Internal Database entry type
interface RecommendationDBEntry {
    id: string
    skills: string[]
    type: 'course' | 'certification' | 'tool' | 'book'
    title: string
    provider: string
    description: string
    url: string
    price: 'free' | 'paid'
    rating?: number
}

// Hardcoded recommendation database
const RECOMMENDATION_DATABASE: RecommendationDBEntry[] = [
    // ── JavaScript / TypeScript ──
    {
        id: 'rec_ts_ui_dev',
        skills: ['typescript', 'ts', 'javascript', 'js'],
        type: 'course',
        title: 'TypeScript for Developers',
        provider: 'Udemy',
        description: 'Master TypeScript by building real-world projects.',
        url: 'https://udemy.com/course/typescript-for-developers/',
        price: 'paid',
        rating: 4.8,
    },
    {
        id: 'rec_js_free',
        skills: ['javascript', 'js'],
        type: 'course',
        title: 'Modern JavaScript from the beginning',
        provider: 'Coursera',
        description: 'Free comprehensive JavaScript course.',
        url: 'https://coursera.org',
        price: 'free',
        rating: 4.5,
    },
    // ── Python ──
    {
        id: 'rec_python_bootcamp',
        skills: ['python', 'py'],
        type: 'course',
        title: '100 Days of Code: The Complete Python Pro Bootcamp',
        provider: 'Udemy',
        description: 'Master Python by building 100 projects in 100 days.',
        url: 'https://udemy.com/course/100-days-of-code/',
        price: 'paid',
        rating: 4.9,
    },
    {
        id: 'rec_python_data',
        skills: ['python', 'pandas', 'numpy'],
        type: 'course',
        title: 'Python for Data Science',
        provider: 'Coursera',
        description: 'Learn Python fundamentals for data analysis.',
        url: 'https://coursera.org/learn/python-for-applied-data-science-ai',
        price: 'free',
        rating: 4.6,
    },
    // ── Java & Spring Boot ──
    {
        id: 'rec_java_spring',
        skills: ['java', 'spring', 'spring boot'],
        type: 'course',
        title: 'Spring & Hibernate for Beginners',
        provider: 'Udemy',
        description: 'Spring Boot 3, Spring Framework 6, and Hibernate.',
        url: 'https://udemy.com/course/spring-hibernate-tutorial/',
        price: 'paid',
        rating: 4.7,
    },
    // ── Go & Rust ──
    {
        id: 'rec_go_mastery',
        skills: ['go', 'golang'],
        type: 'course',
        title: 'Go Mastery',
        provider: 'Udemy',
        description: 'Become an elite Go programmer.',
        url: 'https://udemy.com/course/go-programming-language/',
        price: 'paid',
        rating: 4.8,
    },
    {
        id: 'rec_rust_lang',
        skills: ['rust'],
        type: 'book',
        title: 'The Rust Programming Language',
        provider: 'No Starch Press',
        description: 'The official book on Rust programming.',
        url: 'https://doc.rust-lang.org/book/',
        price: 'free',
        rating: 4.9,
    },
    // ── React, Next.js, Vue, Angular ──
    {
        id: 'rec_react_udemy_1',
        skills: ['react', 'react.js', 'reactjs'],
        type: 'course',
        title: 'React - The Complete Guide',
        provider: 'Udemy',
        description: 'Master React with hooks, Redux, Next.js, and more.',
        url: 'https://udemy.com/course/react-the-complete-guide/',
        price: 'paid',
        rating: 4.7,
    },
    {
        id: 'rec_nextjs_mastery',
        skills: ['next.js', 'nextjs', 'next'],
        type: 'course',
        title: 'Next.js 14 Full Stack Development',
        provider: 'Udemy',
        description: 'Build robust web applications with Next.js.',
        url: 'https://udemy.com/course/nextjs-express/',
        price: 'paid',
        rating: 4.8,
    },
    {
        id: 'rec_vue_master',
        skills: ['vue', 'vue.js', 'vuejs'],
        type: 'course',
        title: 'Vue - The Complete Guide (incl. Router & Composition API)',
        provider: 'Udemy',
        description: 'Vue.js is an awesome JavaScript Framework.',
        url: 'https://udemy.com/course/vuejs-2-the-complete-guide/',
        price: 'paid',
        rating: 4.7,
    },
    {
        id: 'rec_angular_core',
        skills: ['angular'],
        type: 'course',
        title: 'Angular - The Complete Guide',
        provider: 'Udemy',
        description: 'Master Angular 16 and build reactive single page applications.',
        url: 'https://udemy.com/course/the-complete-guide-to-angular-2/',
        price: 'paid',
        rating: 4.6,
    },
    // ── AWS, GCP, Azure ──
    {
        id: 'rec_aws_practitioner',
        skills: ['aws', 'amazon web services'],
        type: 'certification',
        title: 'AWS Certified Cloud Practitioner',
        provider: 'AWS',
        description: 'Validate your overall understanding of the AWS Cloud.',
        url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
        price: 'paid',
        rating: 4.7,
    },
    {
        id: 'rec_gcp_architect',
        skills: ['gcp', 'google cloud', 'google cloud platform'],
        type: 'certification',
        title: 'Google Cloud Professional Cloud Architect',
        provider: 'Google',
        description: 'Design and plan a cloud solution architecture.',
        url: 'https://cloud.google.com/certification/cloud-architect',
        price: 'paid',
        rating: 4.8,
    },
    {
        id: 'rec_azure_fundamentals',
        skills: ['azure', 'microsoft azure'],
        type: 'certification',
        title: 'Microsoft Certified: Azure Fundamentals',
        provider: 'Microsoft',
        description: 'Prove your knowledge of cloud concepts on Azure.',
        url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
        price: 'paid',
        rating: 4.6,
    },
    // ── Docker, Kubernetes, Terraform ──
    {
        id: 'rec_k8s_cka',
        skills: ['kubernetes', 'k8s'],
        type: 'certification',
        title: 'Certified Kubernetes Administrator (CKA)',
        provider: 'Linux Foundation',
        description: 'Demonstrate your competence in a hands-on environment.',
        url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
        price: 'paid',
        rating: 4.8,
    },
    {
        id: 'rec_docker_mastery',
        skills: ['docker'],
        type: 'course',
        title: 'Docker Mastery: with Kubernetes +Swarm',
        provider: 'Udemy',
        description: 'Build, test, deploy containers with Docker and K8s.',
        url: 'https://udemy.com/course/docker-mastery/',
        price: 'paid',
        rating: 4.7,
    },
    {
        id: 'rec_terraform_cert',
        skills: ['terraform'],
        type: 'certification',
        title: 'HashiCorp Certified: Terraform Associate',
        provider: 'HashiCorp',
        description: 'Understand basic concepts and skills associated with Terraform.',
        url: 'https://www.hashicorp.com/certification/terraform-associate',
        price: 'paid',
        rating: 4.8,
    },
    // ── PostgreSQL, MongoDB, Redis ──
    {
        id: 'rec_postgres_master',
        skills: ['postgresql', 'postgres', 'sql'],
        type: 'course',
        title: "SQL and PostgreSQL: The Complete Developer's Guide",
        provider: 'Udemy',
        description: 'Become an expert with SQL and PostgreSQL!',
        url: 'https://udemy.com/course/sql-and-postgresql/',
        price: 'paid',
        rating: 4.6,
    },
    {
        id: 'rec_mongodb_basics',
        skills: ['mongodb', 'mongo'],
        type: 'course',
        title: 'MongoDB Basics',
        provider: 'MongoDB University',
        description: 'Learn the fundamentals of MongoDB directly from the source.',
        url: 'https://learn.mongodb.com/learning-paths/introduction-to-mongodb',
        price: 'free',
        rating: 4.8,
    },
    {
        id: 'rec_redis_university',
        skills: ['redis'],
        type: 'course',
        title: 'Redis for Developers',
        provider: 'Redis University',
        description: 'Get hands-on experience using Redis.',
        url: 'https://university.redis.com/courses/ru101/',
        price: 'free',
        rating: 4.9,
    },
    // ── Data Structures, Algorithms, System Design ──
    {
        id: 'rec_sys_design_interview',
        skills: ['system design', 'architecture'],
        type: 'book',
        title: 'Designing Data-Intensive Applications',
        provider: "O'Reilly",
        description: 'The definitive guide to distributed systems architecture.',
        url: 'https://dataintensive.net/',
        price: 'paid',
        rating: 5.0,
    },
    {
        id: 'rec_dsa_leetcode',
        skills: ['data structures', 'algorithms', 'dsa'],
        type: 'tool',
        title: 'LeetCode Premium',
        provider: 'LeetCode',
        description: 'Master data structures, algorithms, and system design interviews.',
        url: 'https://leetcode.com',
        price: 'paid',
        rating: 4.8,
    },
    // ── Machine Learning, Deep Learning, NLP ──
    {
        id: 'rec_ml_andrew_ng',
        skills: ['machine learning', 'ml', 'ai'],
        type: 'course',
        title: 'Machine Learning Specialization',
        provider: 'Coursera',
        description: 'The updated classic ML course by Andrew Ng.',
        url: 'https://www.coursera.org/specializations/machine-learning-introduction',
        price: 'free',
        rating: 4.9,
    },
    {
        id: 'rec_dl_specialization',
        skills: ['deep learning', 'dl', 'nlp', 'neural networks'],
        type: 'course',
        title: 'Deep Learning Specialization',
        provider: 'Coursera',
        description: 'Become a Machine Learning expert.',
        url: 'https://www.coursera.org/specializations/deep-learning',
        price: 'paid',
        rating: 4.8,
    },
]

export const affiliateService = {
    /**
     * Return recommendations based on identified skill gaps
     */
    async getRecommendations(
        skillGaps: RankedSkillGap[],
        limit: number = 10
    ): Promise<AffiliateRecommendation[]> {
        if (!skillGaps || skillGaps.length === 0) {
            return this.getPopularRecommendations(undefined, limit)
        }

        const recommendations: AffiliateRecommendation[] = []
        const seenIds = new Set<string>()

        for (const gap of skillGaps) {
            // Determine base relevance score out of 100 based on gap properties
            let baseRelevance = 50
            if (gap.category === 'critical') baseRelevance += 40
            if (gap.category === 'recommended') baseRelevance += 25
            if (gap.category === 'bonus') baseRelevance += 10

            // Try finding mathing recs
            const gapSkillLower = gap.skill.toLowerCase()

            const matchingRecs = RECOMMENDATION_DATABASE.filter((rec) =>
                rec.skills.some((s) => gapSkillLower.includes(s) || s.includes(gapSkillLower))
            )

            for (const rec of matchingRecs) {
                if (!seenIds.has(rec.id)) {
                    seenIds.add(rec.id)
                    // Adjust relevance based on rating
                    const relevanceScore = Math.min(100, Math.floor(baseRelevance + (rec.rating || 0) * 2))

                    recommendations.push({
                        id: rec.id,
                        skill: gap.skill,
                        type: rec.type,
                        title: rec.title,
                        provider: rec.provider,
                        description: rec.description,
                        url: rec.url,
                        price: rec.price,
                        rating: rec.rating,
                        relevanceScore,
                    })
                }
            }
        }

        // Sort by relevance desc, then by rating desc
        recommendations.sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore
            }
            return (b.rating || 0) - (a.rating || 0)
        })

        const topN = recommendations.slice(0, limit)

        // Fallback if not enough recommendations
        if (topN.length < limit) {
            const popular = await this.getPopularRecommendations(undefined, limit - topN.length)
            for (const p of popular) {
                if (!seenIds.has(p.id)) {
                    seenIds.add(p.id)
                    topN.push(p)
                }
            }
        }

        return topN.slice(0, limit)
    },

    /**
     * Fallback / Generic popular recommendations
     */
    async getPopularRecommendations(
        category?: string,
        limit: number = 5
    ): Promise<AffiliateRecommendation[]> {
        const sorted = [...RECOMMATION_DATABASE].sort((a, b) => (b.rating || 0) - (a.rating || 0))
        const filtered = category ? sorted.filter((r) => r.type === category) : sorted

        return filtered.slice(0, limit).map((rec) => ({
            id: rec.id,
            skill: rec.skills[0] || 'Tech',
            type: rec.type,
            title: rec.title,
            provider: rec.provider,
            description: rec.description,
            url: rec.url,
            price: rec.price,
            rating: rec.rating,
            relevanceScore: 50,
        }))
    },
}

// Typo fix for above
const RECOMMATION_DATABASE = RECOMMENDATION_DATABASE
