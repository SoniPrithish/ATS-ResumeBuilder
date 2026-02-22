import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export function EnhanceButton({
    onEnhance,
    isLoading,
    disabled
}: {
    onEnhance: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-colors group"
            onClick={onEnhance}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
            )}
            ✨ Enhance with AI
        </Button>
    );
}
