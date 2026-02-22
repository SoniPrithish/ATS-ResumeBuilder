import { ENGLISH_STOPWORDS } from "@/modules/matcher/keyword-extractor";
import type { SimilarityResult } from "@/modules/matcher/types";

function preprocess(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !ENGLISH_STOPWORDS.has(token));
}

function termFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();

    if (tokens.length === 0) {
        return tf;
    }

    for (const token of tokens) {
        tf.set(token, (tf.get(token) ?? 0) + 1);
    }

    for (const [term, count] of tf.entries()) {
        tf.set(term, count / tokens.length);
    }

    return tf;
}

function inverseDocumentFrequency(terms: Set<string>, docs: string[][]): Map<string, number> {
    const idf = new Map<string, number>();

    for (const term of terms) {
        const containingDocs = docs.filter((doc) => doc.includes(term)).length;
        idf.set(term, Math.log((1 + 2) / (1 + containingDocs)) + 1);
    }

    return idf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>, terms: Set<string>): number {
    let dot = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const term of terms) {
        const va = a.get(term) ?? 0;
        const vb = b.get(term) ?? 0;
        dot += va * vb;
        magnitudeA += va * va;
        magnitudeB += vb * vb;
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function topTerms(tfidf: Map<string, number>, count: number): string[] {
    return Array.from(tfidf.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([term]) => term);
}

export function calculateSimilarity(resumeText: string, jdText: string): SimilarityResult {
    const resumeTokens = preprocess(resumeText);
    const jdTokens = preprocess(jdText);

    if (resumeTokens.length === 0 || jdTokens.length === 0) {
        return {
            cosineSimilarity: 0,
            topSharedTerms: [],
            uniqueToResume: [],
            uniqueToJD: [],
        };
    }

    const terms = new Set([...resumeTokens, ...jdTokens]);
    const resumeTF = termFrequency(resumeTokens);
    const jdTF = termFrequency(jdTokens);
    const idf = inverseDocumentFrequency(terms, [resumeTokens, jdTokens]);

    const resumeTfidf = new Map<string, number>();
    const jdTfidf = new Map<string, number>();

    for (const term of terms) {
        resumeTfidf.set(term, (resumeTF.get(term) ?? 0) * (idf.get(term) ?? 0));
        jdTfidf.set(term, (jdTF.get(term) ?? 0) * (idf.get(term) ?? 0));
    }

    const sharedTerms = Array.from(terms).filter(
        (term) => (resumeTF.get(term) ?? 0) > 0 && (jdTF.get(term) ?? 0) > 0
    );

    const sharedScores = new Map<string, number>();
    for (const term of sharedTerms) {
        sharedScores.set(
            term,
            ((resumeTfidf.get(term) ?? 0) + (jdTfidf.get(term) ?? 0)) / 2
        );
    }

    const uniqueResume = new Map<string, number>(
        Array.from(resumeTfidf.entries()).filter(([term]) => (jdTF.get(term) ?? 0) === 0)
    );

    const uniqueJd = new Map<string, number>(
        Array.from(jdTfidf.entries()).filter(([term]) => (resumeTF.get(term) ?? 0) === 0)
    );

    return {
        cosineSimilarity: cosineSimilarity(resumeTfidf, jdTfidf, terms),
        topSharedTerms: topTerms(sharedScores, 10),
        uniqueToResume: topTerms(uniqueResume, 10),
        uniqueToJD: topTerms(uniqueJd, 10),
    };
}
