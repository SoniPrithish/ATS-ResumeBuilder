import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface CategoryDetail {
    id: string;
    name: string;
    score: number;
    weight: number;
    details: (string | { title?: string; name?: string; description?: string; message?: string })[];
}

export function ScoreBreakdown({ categories }: { categories: CategoryDetail[] }) {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "[&>div]:bg-green-500 bg-green-500/20";
        if (score >= 60) return "[&>div]:bg-yellow-500 bg-yellow-500/20";
        if (score >= 40) return "[&>div]:bg-orange-500 bg-orange-500/20";
        return "[&>div]:bg-red-500 bg-red-500/20";
    };

    return (
        <div className="space-y-4">
            {categories.map((category) => (
                <Collapsible
                    key={category.id}
                    open={openItems.includes(category.id)}
                    onOpenChange={() => toggleItem(category.id)}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm py-2 transition-all overflow-hidden"
                >
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className={`p-2 rounded-full transition-transform ${openItems.includes(category.id) ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                            >
                                {openItems.includes(category.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">{category.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">{category.score}/100</span>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden sm:inline-flex">
                                            Weight: {category.weight}%
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={category.score}
                                    className={cn("h-2 transition-all", getProgressColor(category.score))}
                                />
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 pt-2 text-sm text-muted-foreground border-t bg-muted/20">
                        <div className="mt-4 space-y-3">
                            {category.details && category.details.length > 0 ? (
                                <ul className="space-y-4 pl-12 pr-4 relative before:absolute before:inset-y-0 before:left-[30px] before:w-px before:bg-border">
                                    {category.details.map((detail, idx) => (
                                        <li key={idx} className="relative">
                                            <div className="absolute top-2 -left-[14px] w-2 h-2 rounded-full bg-primary/40 ring-4 ring-background" />
                                            {typeof detail === "string" ? (
                                                <p className="leading-relaxed">{detail}</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-foreground">{detail.title || detail.name}</p>
                                                    <p className="leading-relaxed opacity-90">{detail.description || detail.message}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center italic opacity-70 p-4">No additional details available for this category.</p>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
}
