"use client";

import { use, useEffect } from "react";
import { useResume } from "@/hooks/use-resume";
import { useResumeStore } from "@/stores/resume-store";
import { ResumeForm } from "@/components/resume/resume-form";
import { ResumePreview } from "@/components/resume/resume-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Eye, Edit2 } from "lucide-react";

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: resume, isLoading, isError } = useResume(resolvedParams.id);
    const { setResume, previewMode, togglePreview } = useResumeStore();

    useEffect(() => {
        if (resume) {
            setResume(resume as any);
        }
    }, [resume, setResume]);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (isError || !resume) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold">Resume not found</h2>
                <p className="text-muted-foreground">The resume you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-none px-4 py-2 border-b bg-background flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{resume.title}</h1>
                    <p className="text-xs text-muted-foreground">Last updated: {new Date(resume.updatedAt).toLocaleString()}</p>
                </div>
                <Button
                    variant="outline"
                    className="md:hidden"
                    onClick={togglePreview}
                >
                    {previewMode ? (
                        <><Edit2 className="w-4 h-4 mr-2" /> Edit</>
                    ) : (
                        <><Eye className="w-4 h-4 mr-2" /> Preview</>
                    )}
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Panel */}
                <div
                    className={`flex-1 overflow-y-auto border-r bg-background/50 ${previewMode ? 'hidden md:block md:w-[60%]' : 'w-full md:w-[60%]'}`}
                >
                    <ResumeForm resumeId={resolvedParams.id} />
                </div>

                {/* Preview Panel */}
                <div
                    className={`overflow-y-auto bg-muted/20 ${!previewMode ? 'hidden md:block md:w-[40%]' : 'w-full md:w-[40%]'}`}
                >
                    <div className="h-full p-4 md:p-8">
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
