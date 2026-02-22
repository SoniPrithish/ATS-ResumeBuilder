import { Badge } from "@/components/ui/badge";

export function KeywordComparison({
    matched,
    missing,
}: {
    matched: string[];
    missing: string[];
}) {
    const total = matched.length + missing.length;
    const matchPercentage = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Keyword Match</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                    <span className="text-primary">{matchPercentage}%</span> Match ({matched.length}/{total})
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border rounded-xl bg-card">
                    <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                        <span className="text-green-600 dark:text-green-500">Matched Keywords</span>
                    </h3>
                    {matched.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {matched.map((word, idx) => (
                                <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-2.5 py-1">
                                    {word}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No keywords matched.</p>
                    )}
                </div>

                <div className="p-5 border rounded-xl bg-card relative">
                    <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                        <span className="text-red-500">Missing Keywords</span>
                    </h3>
                    {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {missing.map((word, idx) => (
                                <Badge key={idx} variant="outline" className="bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20 opacity-75 px-2.5 py-1 relative">
                                    {word}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">You hit every single keyword!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
