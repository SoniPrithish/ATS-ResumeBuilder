import { useResumeStore } from "@/stores/resume-store";
import { useGenerateSummary } from "@/hooks/use-ai-enhance";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export function SummaryForm() {
    const { currentResume, updateSection } = useResumeStore();
    const generateSummary = useGenerateSummary();

    if (!currentResume) return null;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateSection("summary", e.target.value);
    };

    const handleGenerateAI = async () => {
        try {
            // Just pass the current resume data, maybe it needs a specific format or we just use the mutation
            const result = await generateSummary.mutateAsync({
                resumeData: {
                    experience: currentResume.experience,
                    skills: currentResume.skills as unknown as Record<string, unknown>,
                    title: currentResume.title,
                }
            });
            if (result && result.summary) {
                updateSection("summary", result.summary);
            }
        } catch {
            // handled in hook
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="summary">Professional Summary</Label>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary"
                    onClick={handleGenerateAI}
                    disabled={generateSummary.isPending}
                >
                    {generateSummary.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    Generate with AI
                </Button>
            </div>
            <Textarea
                id="summary"
                name="summary"
                placeholder="A brief summary of your professional background and goals..."
                className="min-h-[200px] leading-relaxed resize-y"
                value={currentResume.summary || ""}
                onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground mt-2">
                Tip: Keep it between 2-4 sentences highlighting your most impressive achievements and years of experience.
            </p>
        </div>
    );
}
