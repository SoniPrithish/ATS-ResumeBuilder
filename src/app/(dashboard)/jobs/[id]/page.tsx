"use client";

import { use } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, Briefcase } from "lucide-react";
import Link from "next/link";
// Mocked until we implement trpc.job.getById 
// The prompt didn't strictly say to create `useJob(id)` in hooks, but we'd need it.

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <div className="space-y-8 animate-in fade-in-50 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="shrink-0">
                        <Link href={`/jobs`}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <PageHeader
                        title="Senior Frontend Engineer"
                        description="Company: Acme Corp"
                    />
                </div>
                <Button asChild className="gap-2">
                    <Link href={`/resumes`}>
                        <PlayCircle className="w-4 h-4" /> Match with Resume
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-xl border p-6 md:p-8 space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Full Description
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {`Requirements:
- Strong experience with React and Next.js
- Tailwind CSS mastery
- Understanding of web performance
- Great communication skills
...

(Job ID: ${resolvedParams.id})`}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4">Extracted Keywords (Simulation)</h3>
                    <div className="flex flex-wrap gap-2">
                        {["React", "Next.js", "Tailwind CSS", "Frontend"].map(kw => (
                            <span key={kw} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">{kw}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
