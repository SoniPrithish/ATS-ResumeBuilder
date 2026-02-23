"use client";

import { use, useState } from "react";
import { useResume } from "@/hooks/use-resume";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { JDInput, type JDMatchCompletion } from "@/components/matching/jd-input";
import { MatchResults } from "@/components/matching/match-results";
import { KeywordComparison } from "@/components/matching/keyword-comparison";
import { GapReport } from "@/components/matching/gap-report";

export default function JDMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: resume, isLoading: isLoadingResume } = useResume(resolvedParams.id);
    const [matchData, setMatchData] = useState<JDMatchCompletion | null>(null);
    const [isMatching, setIsMatching] = useState(false);

    if (isLoadingResume) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-2xl font-bold">Resume not found</h2>
                <p className="text-muted-foreground">The resume you&apos;re looking for doesn&apos;t exist.</p>
                <Button asChild variant="outline">
                    <Link href="/resumes"><ArrowLeft className="w-4 h-4 mr-2" /> Back to My Resumes</Link>
                </Button>
            </div>
        );
    }

    const handleMatchStart = () => setIsMatching(true);
    const handleMatchComplete = (data: JDMatchCompletion) => {
        setMatchData(data);
        setIsMatching(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href={`/resumes/${resume.id}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <PageHeader
                    title="Job Description Match"
                    description={`See how well "${resume.title}" matches a specific role`}
                />
            </div>

            {!matchData && !isMatching && (
                <div className="max-w-3xl mx-auto">
                    <JDInput
                        resumeId={resume.id}
                        onMatchStart={handleMatchStart}
                        onMatchComplete={handleMatchComplete}
                    />
                </div>
            )}

            {isMatching && (
                <div className="flex flex-col h-[40vh] items-center justify-center space-y-4">
                    <div className="relative">
                        <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold">Matching against role...</h2>
                    <p className="text-muted-foreground">Analyzing keywords, skills, and experience gap...</p>
                </div>
            )}

            {matchData && !isMatching && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Matching against:</p>
                            <h3 className="font-semibold">
                                {matchData.jobTitle || "Job Description"} {matchData.company ? `at ${matchData.company}` : ""}
                            </h3>
                        </div>
                        <Button variant="outline" onClick={() => setMatchData(null)} size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" /> Match Another
                        </Button>
                    </div>

                    <MatchResults matchData={matchData.report} />
                    <KeywordComparison
                        matched={matchData.report.matchedKeywords.map((keyword) => keyword.keyword)}
                        missing={matchData.report.missingKeywords.map((keyword) => keyword.keyword)}
                    />
                    <GapReport gaps={matchData.report.skillGaps} />

                    <div className="flex justify-center pt-8 border-t">
                        <Button size="lg" asChild className="gap-2">
                            <Link href={`/resumes/${resume.id}/tailor?jobId=${matchData.jobId}`}>
                                ✨ Tailor Resume for this Role
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
