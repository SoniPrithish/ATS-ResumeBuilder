import { Badge } from "@/components/ui/badge";

export function KeywordCloud({
    matched,
    missing,
}: {
    matched: string[];
    missing: string[];
}) {
    return (
        <div className="space-y-6">
            <div className="p-5 border rounded-xl bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-500">Matched Keywords</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{matched.length} found</span>
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
                    <p className="text-sm text-muted-foreground italic">No standard keywords identified.</p>
                )}
            </div>

            <div className="p-5 border rounded-xl bg-card">
                <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                    <span className="text-red-500">Missing Standard Keywords</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{missing.length} missing</span>
                </h3>
                {missing.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {missing.map((word, idx) => (
                            <Badge key={idx} variant="outline" className="bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20 opacity-75 px-2.5 py-1">
                                {word}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Great job! You have all the standard keywords.</p>
                )}
            </div>
        </div>
    );
}
