import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Progress } from "@/components/ui/progress";

export function MatchResults({ matchData }: { matchData: { overallScore: number; categoryScores: { keywordScore: number, experienceScore: number, similarityScore: number } } | null }) {
    if (!matchData) return null;

    return (
        <Card className="shadow-md border border-border/50">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle>Match Results Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <h3 className="text-xl font-bold mb-4">Overall Match</h3>
                        <ScoreGauge score={matchData.overallScore} size={180} />
                    </div>

                    {/* Sub Scores */}
                    <div className="flex-1 w-full space-y-6">
                        <h3 className="text-xl font-bold border-b pb-2">Category Scores</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">Keywords & Skills</span>
                                    <span className="font-bold">{matchData.categoryScores.keywordScore}%</span>
                                </div>
                                <Progress
                                    value={matchData.categoryScores.keywordScore}
                                    className="h-2 [&>div]:bg-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">Experience Relevance</span>
                                    <span className="font-bold">{matchData.categoryScores.experienceScore}%</span>
                                </div>
                                <Progress
                                    value={matchData.categoryScores.experienceScore}
                                    className="h-2 [&>div]:bg-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">Semantic Similarity</span>
                                    <span className="font-bold">{matchData.categoryScores.similarityScore}%</span>
                                </div>
                                <Progress
                                    value={matchData.categoryScores.similarityScore}
                                    className="h-2 [&>div]:bg-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">Readability & Format</span>
                                    <span className="font-bold">{(Math.min(100, (matchData.categoryScores.experienceScore + matchData.categoryScores.keywordScore) / 2)).toFixed(0)}%</span>
                                </div>
                                <Progress
                                    value={(matchData.categoryScores.experienceScore + matchData.categoryScores.keywordScore) / 2}
                                    className="h-2 [&>div]:bg-primary"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
