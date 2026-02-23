import { Activity, LayoutTemplate, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "./score-gauge";
import { useATSScore } from "@/hooks/use-ats-score";

export function ATSScoreCard({
    resumeId,
    score,
    onScore
}: {
    resumeId: string;
    score: number | null;
    onScore: () => void;
}) {
    const atsScore = useATSScore(resumeId);

    const getScoreLabel = (s: number | null) => {
        if (s === null) return "Not Scored";
        if (s >= 80) return "Excellent";
        if (s >= 60) return "Good";
        if (s >= 40) return "Needs Work";
        return "Poor";
    };

    const handleScore = () => {
        atsScore.mutate({
            resumeId,
        }, {
            onSuccess: () => {
                onScore();
            }
        });
    };

    if (score === null) {
        return (
            <Card className="flex flex-col items-center justify-center p-8 border-dashed bg-muted/20">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Not Scored Yet</h3>
                <p className="text-center text-muted-foreground max-w-sm mb-6">
                    Find out how ATS systems view your resume and get actionable feedback to improve it.
                </p>
                <Button
                    size="lg"
                    onClick={handleScore}
                    disabled={atsScore.isPending}
                    className="gap-2"
                >
                    <Activity className="w-4 h-4" />
                    {atsScore.isPending ? "Scoring..." : "Score My Resume"}
                </Button>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden shadow-md">
            <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Overall ATS Score
                        </CardTitle>
                        <CardDescription className="mt-1 pb-0">
                            Your resume&apos;s comprehensive grade based on industry standards.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 hidden md:flex"
                        onClick={handleScore}
                        disabled={atsScore.isPending}
                    >
                        <RefreshCw className={`w-4 h-4 ${atsScore.isPending ? 'animate-spin' : ''}`} />
                        Rescore
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-6 md:p-10">
                <div className="flex-1 flex justify-center w-full max-w-xs">
                    <ScoreGauge score={score} size={220} />
                </div>

                <div className="flex-1 space-y-6 w-full max-w-sm">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-xl">{getScoreLabel(score)}</h4>
                        <p className="text-muted-foreground text-sm">
                            {score >= 80
                                ? "Your resume is highly optimized and likely to pass automated screening."
                                : score >= 60
                                    ? "Your resume is good, but could use some optimization to ensure top screening results."
                                    : "Your resume needs significant optimization to pass most ATS systems."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/40 rounded-lg flex items-start gap-3">
                            <LayoutTemplate className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Format Match</p>
                                <p className="font-medium text-sm">High</p>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg flex items-start gap-3">
                            <Star className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Keywords</p>
                                <p className="font-medium text-sm">Actionable</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2 md:hidden"
                        onClick={handleScore}
                        disabled={atsScore.isPending}
                    >
                        <RefreshCw className={`w-4 h-4 ${atsScore.isPending ? 'animate-spin' : ''}`} />
                        Rescore Resume
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
