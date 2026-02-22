import { TECH_KEYWORD_DATABASE } from "@/modules/ats/keyword-database";
import type { ExtractedKeywords } from "@/types/job";

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

export const YEARS_EXPERIENCE_REGEX = /(\d+)\+?\s*years?\s*(of\s+)?(experience|professional)/i;
export const EDUCATION_LEVEL_REGEX = /(bachelor'?s?|master'?s?|phd|ph\.d|doctorate|bs|ms|ba|ma|mba)/i;

export const ENGLISH_STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "itself", "just", "let", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own",
    "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "you", "your", "yours", "yourself", "yourselves",
    "able", "across", "actually", "afterwards", "almost", "alone", "along", "already", "also", "although", "always", "among", "amongst", "another", "anyhow", "anyone", "anything", "anywhere", "around", "back", "became", "become", "becomes", "becoming", "beside", "besides", "beyond", "cannot", "con", "couldnt", "de", "describe", "detail", "done", "due", "eg", "eight", "either", "eleven", "else", "elsewhere", "enough", "etc", "even", "ever", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fifty", "fill", "find", "fire", "first", "five", "former", "formerly", "forty", "found", "four", "further", "get", "give", "go", "hence", "inc", "indeed", "interest", "itd", "keep", "last", "latter", "latterly", "least", "less", "ltd", "many", "may", "meanwhile", "might", "mill", "mine", "move", "much", "must", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "nobody", "none", "noone", "nothing", "nowhere", "often", "otherwise", "part", "per", "perhaps", "please", "put", "rather", "re", "s", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "show", "side", "since", "sincere", "six", "sixty", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "system", "take", "ten", "thick", "thin", "third", "three", "throughout", "thru", "thus", "together", "toward", "towards", "twelve", "twenty", "two", "un", "upon", "us", "via", "want", "whatever", "whence", "whenever", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "within", "without", "would", "yet",
]);

function normalizeSkill(value: string): string {
    const skill = value.trim().toLowerCase();
    return NORMALIZATION_MAP[skill] ?? skill;
}

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-\s]/g, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !ENGLISH_STOPWORDS.has(token));
}

function generateNgrams(tokens: string[], n: number): string[] {
    if (tokens.length < n) {
        return [];
    }

    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(" "));
    }

    return ngrams;
}

function mapCategory(category: string): "hard" | "soft" | "tool" | "cert" {
    const normalized = category.toLowerCase();

    if (normalized.includes("soft")) {
        return "soft";
    }

    if (normalized.includes("cert")) {
        return "cert";
    }

    if (normalized.includes("tool")) {
        return "tool";
    }

    if (normalized.includes("devops") || normalized.includes("cloud")) {
        return "tool";
    }

    return "hard";
}

export function extractKeywordsFromText(text: string): ExtractedKeywords {
    if (!text.trim()) {
        return {
            hardSkills: [],
            softSkills: [],
            tools: [],
            certifications: [],
            required: [],
            preferred: [],
            technologies: [],
        };
    }

    const tokens = tokenize(text);
    const candidates = [
        ...tokens,
        ...generateNgrams(tokens, 2),
        ...generateNgrams(tokens, 3),
    ];

    const hardSkills = new Set<string>();
    const softSkills = new Set<string>();
    const tools = new Set<string>();
    const certifications = new Set<string>();

    for (const candidate of candidates) {
        const normalized = normalizeSkill(candidate);
        const category = TECH_KEYWORD_DATABASE.get(normalized);
        if (!category) {
            continue;
        }

        const target = mapCategory(category);
        if (target === "hard") {
            hardSkills.add(normalized);
        } else if (target === "soft") {
            softSkills.add(normalized);
        } else if (target === "tool") {
            tools.add(normalized);
        } else {
            certifications.add(normalized);
        }
    }

    const yearsMatch = text.match(YEARS_EXPERIENCE_REGEX);
    const educationMatch = text.match(EDUCATION_LEVEL_REGEX);

    const result: ExtractedKeywords = {
        hardSkills: Array.from(hardSkills),
        softSkills: Array.from(softSkills),
        tools: Array.from(tools),
        certifications: Array.from(certifications),
        required: Array.from(new Set([...hardSkills, ...tools])),
        preferred: Array.from(new Set([...softSkills, ...certifications])),
        technologies: Array.from(new Set([...hardSkills, ...tools])),
        yearsExperience: yearsMatch ? Number.parseInt(yearsMatch[1] ?? "0", 10) : undefined,
        educationLevel: educationMatch?.[0]?.toLowerCase(),
    };

    return result;
}
