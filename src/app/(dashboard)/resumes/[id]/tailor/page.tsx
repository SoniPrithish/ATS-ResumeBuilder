"use client";

import { use, useState } from "react";
import { useResume } from "@/hooks/use-resume";
import { useTailorResume } from "@/hooks/use-ai-enhance";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";
import { AILoading } from "@/components/ai/ai-loading";
import { TailorPanel, type TailorApplyPayload, type TailorPanelData } from "@/components/ai/tailor-panel";
import { useSearchParams } from "next/navigation";

export default function TailorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const jobId = searchParams.get("jobId");

    const { data: resume, isLoading: isLoadingResume } = useResume(resolvedParams.id);
    const tailorResume = useTailorResume();
    const [tailorData, setTailorData] = useState<TailorPanelData | null>(null);

    if (isLoadingResume) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-2xl font-bold">Resume not found</h2>
                <Button asChild variant="outline">
                    <Link href="/resumes"><ArrowLeft className="w-4 h-4 mr-2" /> Back to My Resumes</Link>
                </Button>
            </div>
        );
    }

    const handleTailor = async () => {
        if (!jobId) {
            alert("Please select a Job Description first.");
            return;
        }
        try {
            const data = await tailorResume.mutateAsync({
                resumeId: resume.id,
                jobId: jobId,
            });
            setTailorData(data);
        } catch {
            // handled
        }
    };

    const applyAll = (data: TailorApplyPayload) => {
        console.log("Applying", data);
        // In real implementation we'd apply this to the resume using the `useUpdateResume` hook or store
        alert("Changes would be applied here in a fully wired app.");
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href={`/resumes/${resume.id}/match`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <PageHeader
                    title="AI Resume Tailoring"
                    description={`Optimize "${resume.title}" for a specific role`}
                />
            </div>

            {!tailorData && !tailorResume.isPending && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <PlayCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Ready to Tailor</h2>
                    <p className="text-muted-foreground max-w-md text-center mb-8">
                        Our AI will analyze the selected Job Description and creatively rewrite your summary and experience bullets to match perfectly.
                    </p>
                    <Button size="lg" onClick={handleTailor} className="w-full max-w-xs gap-2">
                        ✨ Start AI Tailoring
                    </Button>
                </div>
            )}

            {tailorResume.isPending && (
                <AILoading text="Analyzing JD and generating creative suggestions to improve your resume..." />
            )}

            {tailorData && !tailorResume.isPending && (
                <TailorPanel tailorData={tailorData} onApplyAll={applyAll} />
            )}
        </div>
    );
}
