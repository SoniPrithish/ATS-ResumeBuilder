import { TECH_KEYWORD_DATABASE } from "@/modules/ats/keyword-database";
import type { SkillSimilarityMap } from "@/modules/matcher/types";

const NORMALIZATION_MAP: Record<string, string> = {
    "react.js": "react",
    reactjs: "react",
    "node.js": "node",
    nodejs: "node",
    js: "javascript",
    ts: "typescript",
    k8s: "kubernetes",
    pg: "postgresql",
    mongo: "mongodb",
    py: "python",
};

const SIMILARITY_SEED: SkillSimilarityMap = {
    react: ["vue", "angular", "svelte", "next.js"],
    vue: ["react", "angular", "svelte"],
    angular: ["react", "vue", "svelte"],
    svelte: ["react", "vue", "angular"],
    python: ["ruby", "perl", "r", "go"],
    javascript: ["typescript", "node", "deno"],
    typescript: ["javascript", "flow"],
    node: ["deno", "bun", "python"],
    postgresql: ["mysql", "sqlite", "sql server"],
    mysql: ["postgresql", "mariadb", "sqlite"],
    mongodb: ["cassandra", "dynamodb", "postgresql"],
    redis: ["memcached", "mongodb"],
    aws: ["gcp", "azure"],
    gcp: ["aws", "azure"],
    azure: ["aws", "gcp"],
    docker: ["podman", "containerd"],
    kubernetes: ["docker swarm", "ecs", "nomad"],
    terraform: ["cloudformation", "pulumi"],
    ansible: ["chef", "puppet"],
    jenkins: ["github actions", "gitlab ci", "circleci"],
    "github actions": ["gitlab ci", "jenkins", "circleci"],
    tensorflow: ["pytorch", "keras", "scikit-learn"],
    pytorch: ["tensorflow", "keras"],
    "scikit-learn": ["tensorflow", "pytorch"],
    express: ["fastify", "koa", "hapi"],
    django: ["flask", "fastapi"],
    flask: ["django", "fastapi"],
    spring: ["spring boot", "quarkus", "micronaut"],
    "spring boot": ["spring", "quarkus", "micronaut"],
    fastapi: ["flask", "django", "express"],
    graphql: ["rest", "grpc"],
    rest: ["graphql", "grpc"],
    grpc: ["rest", "graphql"],
    kafka: ["rabbitmq", "sqs", "pubsub"],
    rabbitmq: ["kafka", "sqs"],
    "sql server": ["postgresql", "mysql", "oracle"],
    oracle: ["sql server", "postgresql"],
    next: ["nuxt", "remix"],
    nuxt: ["next", "remix"],
    remix: ["next", "nuxt"],
    tailwind: ["bootstrap", "material ui"],
    bootstrap: ["tailwind", "material ui"],
    "material ui": ["tailwind", "bootstrap", "chakra ui"],
    "chakra ui": ["material ui", "ant design"],
    "ant design": ["material ui", "chakra ui"],
    go: ["rust", "python"],
    rust: ["go", "c++"],
    "c++": ["rust", "c"],
    java: ["kotlin", "scala"],
    kotlin: ["java", "scala"],
    scala: ["java", "kotlin"],
    elasticsearch: ["solr", "opensearch"],
    prometheus: ["grafana", "datadog"],
    grafana: ["prometheus", "datadog"],
    datadog: ["grafana", "prometheus"],
    linux: ["unix", "bash"],
    "ci/cd": ["github actions", "jenkins", "gitlab ci"],
};

function normalizeSkill(value: string): string {
    const normalized = value.trim().toLowerCase();
    return NORMALIZATION_MAP[normalized] ?? normalized;
}

function buildBidirectionalMap(seed: SkillSimilarityMap): SkillSimilarityMap {
    const output: SkillSimilarityMap = {};

    for (const [skill, related] of Object.entries(seed)) {
        const normalizedSkill = normalizeSkill(skill);
        output[normalizedSkill] = Array.from(
            new Set([...(output[normalizedSkill] ?? []), ...related.map(normalizeSkill)])
        );

        for (const rel of related) {
            const normalizedRel = normalizeSkill(rel);
            output[normalizedRel] = Array.from(
                new Set([...(output[normalizedRel] ?? []), normalizedSkill])
            );
        }
    }

    return output;
}

export const SKILL_SIMILARITY_MAP: SkillSimilarityMap = buildBidirectionalMap(SIMILARITY_SEED);

export function levenshteinDistance(a: string, b: string): number {
    const source = normalizeSkill(a);
    const target = normalizeSkill(b);

    if (source === target) {
        return 0;
    }

    const matrix: number[][] = Array.from({ length: source.length + 1 }, () =>
        Array.from({ length: target.length + 1 }, () => 0)
    );

    for (let i = 0; i <= source.length; i++) {
        matrix[i][0] = i;
    }

    for (let j = 0; j <= target.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= source.length; i++) {
        for (let j = 1; j <= target.length; j++) {
            const cost = source[i - 1] === target[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[source.length][target.length];
}

export function classifySkill(skill: string): { category: string; confidence: number } {
    const normalized = normalizeSkill(skill);

    const exact = TECH_KEYWORD_DATABASE.get(normalized);
    if (exact) {
        return { category: exact, confidence: 1.0 };
    }

    const maxDistance = normalized.length <= 5 ? 2 : 3;
    for (const [entry, category] of TECH_KEYWORD_DATABASE.entries()) {
        if (levenshteinDistance(normalized, entry) <= maxDistance) {
            return { category, confidence: 0.8 };
        }
    }

    for (const [entry, category] of TECH_KEYWORD_DATABASE.entries()) {
        if (
            normalized.length >= 4 &&
            entry.length >= 4 &&
            (normalized.includes(entry) || entry.includes(normalized))
        ) {
            return { category, confidence: 0.6 };
        }
    }

    return { category: "other", confidence: 0 };
}
