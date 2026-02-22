import { useState } from "react";
import { AISuggestionCard } from "./ai-suggestion-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PlusCircle } from "lucide-react";

export function TailorPanel({
    tailorData,
    onApplyAll,
}: {
    tailorData: { summary: { original: string, suggested: string }, bullets?: { id: string, original: string, suggested: string }[], keywords?: { missing?: string[] } };
    onApplyAll: (data: Record<string, unknown>) => void;
}) {
    const [acceptedSummary, setAcceptedSummary] = useState(false);
    const [acceptedBullets, setAcceptedBullets] = useState<Record<string, boolean>>({});

    if (!tailorData) return null;

    const handleApplyAll = () => {
        // Collect all accepted suggestions and update resume
        // We would pass this back up to the parent to handle the actual mutation
        onApplyAll({
            summary: acceptedSummary ? tailorData.summary.suggested : undefined,
            bullets: acceptedBullets,
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> AI Tailoring Suggestions
                    </h2>
                    <p className="text-muted-foreground mt-1">Review and apply suggestions to optimize your resume for this role.</p>
                </div>
                <Button onClick={handleApplyAll} className="gap-2 shadow-md">
                    <Sparkles className="w-4 h-4" /> Apply Selected Changes
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                    Summary Optimization
                    {acceptedSummary && <Badge variant="default" className="bg-green-500 hover:bg-green-600">Accepted</Badge>}
                </h3>
                {!acceptedSummary && (
                    <AISuggestionCard
                        type="Summary"
                        original={tailorData.summary.original}
                        suggested={tailorData.summary.suggested}
                        onAccept={() => setAcceptedSummary(true)}
                        onReject={() => { }} // Could hide it
                    />
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Experience Bullets</h3>
                {tailorData.bullets?.map((bullet: { id: string, original: string, suggested: string }, idx: number) => {
                    const isAccepted = acceptedBullets[bullet.id];
                    if (isAccepted) return (
                        <div key={bullet.id} className="p-4 border rounded-lg bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50 flex justify-between items-center">
                            <p className="line-clamp-1 italic">{bullet.suggested}</p>
                            <Badge variant="outline" className="text-green-600 border-green-300">Accepted</Badge>
                        </div>
                    );

                    return (
                        <AISuggestionCard
                            key={bullet.id}
                            type={`Bullet ${idx + 1}`}
                            original={bullet.original}
                            suggested={bullet.suggested}
                            onAccept={() => setAcceptedBullets(prev => ({ ...prev, [bullet.id]: true }))}
                            onReject={() => { }}
                        />
                    );
                })}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Missing Skills to Add</h3>
                <p className="text-sm text-muted-foreground mb-4">Click to instantly add these to your Skills section</p>
                <div className="flex flex-wrap gap-2">
                    {tailorData.keywords?.missing?.map((kw: string) => (
                        <Button
                            key={kw}
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                            onClick={() => {
                                // In real app, this would mutate resume store
                            }}
                        >
                            <PlusCircle className="w-3 h-3 text-primary" /> {kw}
                        </Button>
                    ))}
                    {(!tailorData.keywords?.missing || tailorData.keywords.missing.length === 0) && (
                        <div className="text-sm italic text-muted-foreground">No missing keywords found!</div>
                    )}
                </div>
            </div>
        </div>
    );
}
