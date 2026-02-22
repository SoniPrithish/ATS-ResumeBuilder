import { useState } from "react";
import { useEnhanceBullet } from "@/hooks/use-ai-enhance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Check, X, Loader2 } from "lucide-react";

export function BulletEditor({
    value,
    onChange,
    onRemove
}: {
    value: string;
    onChange: (val: string) => void;
    onRemove: () => void;
}) {
    const enhanceBullet = useEnhanceBullet();
    const [enhanced, setEnhanced] = useState<string | null>(null);

    const handleEnhance = async () => {
        if (!value || value.length < 5) return;
        try {
            const result = await enhanceBullet.mutateAsync({ bullet: value });
            if (result && result.enhanced) {
                setEnhanced(result.enhanced);
            }
        } catch {
            // handled
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Input
                    className="flex-1 text-sm bg-transparent"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe your achievement..."
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={handleEnhance}
                    disabled={!value || value.length < 5 || enhanceBullet.isPending}
                    title="✨ Enhance with AI"
                >
                    {enhanceBullet.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={onRemove}
                    title="Remove bullet point"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {enhanced && (
                <div className="ml-0 md:ml-4 p-3 rounded-md bg-primary/5 border border-primary/20 flex flex-col gap-2 relative shadow-sm animate-in zoom-in-95">
                    <p className="text-sm italic pr-12 text-foreground/90">{enhanced}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="h-7 text-xs px-2 bg-primary/90 hover:bg-primary"
                            onClick={() => {
                                onChange(enhanced);
                                setEnhanced(null);
                            }}
                        >
                            <Check className="w-3 h-3 mr-1" /> Accept
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => setEnhanced(null)}
                        >
                            <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
