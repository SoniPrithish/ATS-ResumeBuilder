import { Card, CardContent } from "@/components/ui/card";

export function DisplayAd({
    slot,
    format = "horizontal",
    className = "",
}: {
    slot: string;
    format?: "horizontal" | "vertical" | "square";
    className?: string;
}) {
    const getDims = () => {
        switch (format) {
            case "vertical": return "w-[300px] h-[600px] flex-col";
            case "square": return "w-[250px] h-[250px] flex-col";
            case "horizontal": default: return "w-full min-h-[90px] md:h-[90px] flex-row";
        }
    };

    return (
        <Card className={`overflow-hidden border-border/40 bg-muted/10 shadow-sm ${className}`}>
            <CardContent className={`p-0 m-0 flex ${getDims()} items-center justify-center relative`}>
                <div className="absolute top-1 right-2 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50 z-10">
                    Advertisement
                </div>

                {/* Placeholder for actual Google Ads or other provider */}
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 opacity-50">
                    <span className="text-sm font-medium border border-dashed border-muted-foreground/50 rounded px-2 py-1">Ad Slot: {slot}</span>
                    <span className="text-xs text-muted-foreground hidden md:block">Adverts help keep TechResume free</span>
                </div>
            </CardContent>
        </Card>
    );
}
