import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface ATSSuggestion {
    id: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    title: string;
    message: string;
    actionableText?: string;
}

export function SuggestionList({ suggestions }: { suggestions: ATSSuggestion[] }) {
    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="p-8 text-center border-dashed border-2 rounded-xl text-muted-foreground bg-muted/20">
                <Info className="w-8 h-8 text-blue-500 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No suggestions available.</p>
                <p className="text-sm">Your resume appears fully optimized based on our current checks.</p>
            </div>
        );
    }

    const critical = suggestions.filter((s) => s.type === "CRITICAL");
    const warnings = suggestions.filter((s) => s.type === "WARNING");
    const info = suggestions.filter((s) => s.type === "INFO");

    return (
        <div className="space-y-6">
            {critical.length > 0 && (
                <SuggestionGroup
                    title="Critical Issues"
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                    items={critical}
                    borderColor="border-red-500"
                    bgColor="bg-red-500/10"
                />
            )}
            {warnings.length > 0 && (
                <SuggestionGroup
                    title="Warnings & Improvements"
                    icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    items={warnings}
                    borderColor="border-yellow-500"
                    bgColor="bg-yellow-500/10"
                />
            )}
            {info.length > 0 && (
                <SuggestionGroup
                    title="General Advice"
                    icon={<Info className="w-5 h-5 text-blue-500" />}
                    items={info}
                    borderColor="border-blue-500"
                    bgColor="bg-blue-500/10"
                />
            )}
        </div>
    );
}

function SuggestionGroup({
    title,
    icon,
    items,
    borderColor,
    bgColor,
}: {
    title: string;
    icon: React.ReactNode;
    items: ATSSuggestion[];
    borderColor: string;
    bgColor: string;
}) {
    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
                {icon}
                {title}
                <span className="text-sm font-normal text-muted-foreground ml-2">({items.length})</span>
            </h3>
            <div className="grid gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`flex flex-col gap-2 p-4 rounded-xl border-l-4 ${borderColor} ${bgColor} bg-opacity-30 dark:bg-opacity-10`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">{icon}</div>
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.message}</p>
                                {item.actionableText && (
                                    <p className="text-sm font-medium pt-2 text-primary opacity-90 italic">
                                        💡 {item.actionableText}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
