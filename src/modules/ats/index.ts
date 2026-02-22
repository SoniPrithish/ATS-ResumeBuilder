/**
 * @module modules/ats
 * @description ATS Scoring Engine entry point.
 * Re-exports all public APIs for the ATS analysis module.
 */

export { calculateATSScore, calculateATSScoreWithFileType } from "./aggregator";
export { generateSuggestions } from "./suggestion-generator";
export { scoreFormat } from "./format-scorer";
export { scoreKeywords } from "./keyword-scorer";
export { scoreSections } from "./section-scorer";
export { scoreBullets } from "./bullet-scorer";
export { scoreReadability } from "./readability-scorer";
export {
    TECH_KEYWORD_DATABASE,
    ACTION_VERBS,
    WEAK_VERBS,
} from "./keyword-database";
export * from "./types";
