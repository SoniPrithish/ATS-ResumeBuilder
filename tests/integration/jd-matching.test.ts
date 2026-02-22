import { describe, it, expect } from "vitest";
import { parseJobDescription } from "@/modules/matcher/jd-parser";
import { generateMatchReport } from "@/modules/matcher/match-reporter";
import { createMockResume } from "../helpers/factories";
import {
    SAMPLE_SOFTWARE_ENGINEER_JD,
    EXPECTED_MATCH_WITH_SAMPLE_RESUME,
} from "../helpers/fixtures/sample-jd";

describe("jd matching integration", () => {
    it("runs full pipeline from raw JD + canonical resume", () => {
        const resume = createMockResume();
        const parsedJD = parseJobDescription(SAMPLE_SOFTWARE_ENGINEER_JD);
        const report = generateMatchReport(resume, parsedJD);

        expect(report.overallScore).toBeGreaterThanOrEqual(EXPECTED_MATCH_WITH_SAMPLE_RESUME.minOverallScore);
        expect(report.overallScore).toBeLessThanOrEqual(EXPECTED_MATCH_WITH_SAMPLE_RESUME.maxOverallScore);
        expect(report.matchedKeywords.length + report.missingKeywords.length).toBeGreaterThan(0);
        expect(report.skillGaps.length).toBeGreaterThanOrEqual(0);
    });
});
