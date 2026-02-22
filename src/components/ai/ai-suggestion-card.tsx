import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AISuggestionCard({
    original,
    suggested,
    type,
    onAccept,
    onReject,
}: {
    original: string;
    suggested: string;
    type: string;
    onAccept: () => void;
    onReject: () => void;
}) {
    return (
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="bg-primary/10 px-4 py-2 flex items-center justify-between border-b border-primary/20">
                <Badge variant="outline" className="border-primary/30 text-primary bg-background/50 backdrop-blur">
                    {type} Suggestion
                </Badge>
                <div className="flex gap-2">
                    <Button size="sm" variant="default" className="h-7 text-xs px-2 gap-1 bg-primary hover:bg-primary/90" onClick={onAccept}>
                        <Check className="w-3 h-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1" onClick={onReject}>
                        <X className="w-3 h-3" /> Reject
                    </Button>
                </div>
            </div>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-primary/20">
                    <div className="p-4 bg-background/50 space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original</span>
                        <p className="text-sm line-through opacity-70 text-foreground">{original}</p>
                    </div>
                    <div className="p-4 space-y-2 relative bg-primary/5">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Suggested</span>
                        <p className="text-sm font-medium text-foreground">{suggested}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
