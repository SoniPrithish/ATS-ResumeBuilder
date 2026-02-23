import { AlertCircle, AlertTriangle, BookOpen, Star } from "lucide-react";
import type { RankedSkillGap } from "@/modules/matcher/types";

export function GapReport({
    gaps,
}: {
    gaps: RankedSkillGap[];
}) {
    if (!gaps || gaps.length === 0) {
        return (
            <div className="p-8 text-center border-dashed border-2 rounded-xl text-muted-foreground bg-muted/20">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No major gaps identified.</p>
                <p className="text-sm">You have great coverage for this role!</p>
            </div>
        );
    }

    const critical = gaps.filter((g) => g.category === "critical");
    const recommended = gaps.filter((g) => g.category === "recommended");
    const bonus = gaps.filter((g) => g.category === "bonus");

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Skill Gap Analysis
            </h3>

            {critical.length > 0 && (
                <GapGroup
                    title="Critical Missing Skills"
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                    items={critical}
                    colorClass="border-red-500 bg-red-500/10"
                    iconColor="text-red-500"
                />
            )}

            {recommended.length > 0 && (
                <GapGroup
                    title="Recommended to Know"
                    icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    items={recommended}
                    colorClass="border-yellow-500 bg-yellow-500/10"
                    iconColor="text-yellow-500"
                />
            )}

            {bonus.length > 0 && (
                <GapGroup
                    title="Bonus Skills"
                    icon={<Star className="w-5 h-5 text-blue-500" />}
                    items={bonus}
                    colorClass="border-blue-500 bg-blue-500/10"
                    iconColor="text-blue-500"
                />
            )}
        </div>
    );
}

function GapGroup({
    title,
    icon,
    items,
    colorClass,
    iconColor
}: {
    title: string;
    icon: React.ReactNode;
    items: RankedSkillGap[];
    colorClass: string;
    iconColor: string;
}) {
    return (
        <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-lg text-foreground">
                {title} <span className="text-sm font-normal text-muted-foreground">({items.length} skills)</span>
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item, idx) => (
                    <div key={idx} className={`flex flex-col gap-2 p-4 rounded-xl border-l-4 ${colorClass} bg-opacity-30 dark:bg-opacity-10 min-h-[100px]`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${iconColor}`}>{icon}</div>
                            <div className="space-y-1 w-full">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-foreground">{item.skill}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed h-[42px] overflow-hidden text-ellipsis line-clamp-2">
                                    Often seen alongside: <span className="italic">{item.relatedSkillsInResume.join(", ") || "various technologies"}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
