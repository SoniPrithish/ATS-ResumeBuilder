"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useResumes } from "@/hooks/use-resume";
import { ResumeCard } from "@/components/resume/resume-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ResumeRecord } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function ResumesPage() {
    const { data: resumes, isLoading } = useResumes();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="My Resumes" description="Manage your AI-optimized resumes" />
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <PageHeader
                title="My Resumes"
                description="Manage your AI-optimized resumes"
                action={
                    <Button asChild className="gap-2">
                        <Link href="/resumes/new">
                            <Plus className="h-4 w-4" /> Create New
                        </Link>
                    </Button>
                }
            />

            {resumes?.items.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No resumes yet"
                    description="Create your first AI-optimized resume to get started with TechResume AI."
                    action={{ label: "Create Resume", href: "/resumes/new" }}
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {resumes?.items.map((resume: ResumeRecord) => (
                        <ResumeCard key={resume.id} resume={resume} />
                    ))}
                </div>
            )}

            {/* Pagination would go here if needed */}
            <div className="flex justify-center mt-8 text-sm text-muted-foreground">
                Showing {resumes?.items.length} of {resumes?.total} resumes
            </div>
        </div>
    );
}
