"use client";

import { use } from "react";
import { useResume } from "@/hooks/use-resume";
import { useCachedScore } from "@/hooks/use-ats-score";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ATSScoreCard } from "@/components/scoring/ats-score-card";
import { ScoreBreakdown } from "@/components/scoring/score-breakdown";
import { SuggestionList } from "@/components/scoring/suggestion-list";
import { KeywordCloud } from "@/components/scoring/keyword-cloud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScorePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: resume, isLoading: isLoadingResume } = useResume(resolvedParams.id);
    const { data: scoreData, refetch } = useCachedScore(resolvedParams.id);

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

    return (
        <div className="space-y-8 animate-in fade-in-50 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href={`/resumes/${resume.id}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <PageHeader
                    title="ATS Score Results"
                    description={`Analysis for "${resume.title}"`}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                {/* Left Column: Main Content */}
                <div className="space-y-8">
                    <ATSScoreCard
                        resumeId={resume.id}
                        score={scoreData?.overallScore ?? null}
                        onScore={refetch}
                    />

                    {scoreData?.overallScore !== undefined && scoreData.overallScore !== null && (
                        <div className="bg-card rounded-xl border shadow-sm">
                            <Tabs defaultValue="suggestions" className="w-full">
                                <div className="border-b px-6 pt-6">
                                    <TabsList className="bg-transparent h-auto p-0 flex gap-6 pb-2">
                                        <TabsTrigger
                                            value="suggestions"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base"
                                        >
                                            Suggestions
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="breakdown"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base"
                                        >
                                            Detailed Breakdown
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <div className="p-6">
                                    <TabsContent value="suggestions" className="m-0 border-none outline-none">
                                        <SuggestionList suggestions={scoreData.suggestions || []} />
                                    </TabsContent>
                                    <TabsContent value="breakdown" className="m-0 border-none outline-none">
                                        <ScoreBreakdown categories={scoreData.categories || []} />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {scoreData && scoreData.keywords && (
                        <div className="sticky top-24">
                            <h3 className="font-semibold text-lg mb-4">Keyword Analysis</h3>
                            <KeywordCloud
                                matched={scoreData.keywords.matched || []}
                                missing={scoreData.keywords.missing || []}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
