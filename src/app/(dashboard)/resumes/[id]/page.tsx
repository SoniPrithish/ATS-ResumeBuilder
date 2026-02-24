"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Edit2, GitBranch, Sparkles, Target } from "lucide-react";
import { useResume } from "@/hooks/use-resume";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: resume, isLoading } = useResume(resolvedParams.id);

  if (isLoading) {
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
          <Link href="/resumes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Resumes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={resume.title}
        description="Overview and quick actions"
        action={
          <Button asChild variant="outline">
            <Link href={`/resumes/${resume.id}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Resume
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button asChild className="justify-start gap-2" variant="secondary">
          <Link href={`/resumes/${resume.id}/score`}>
            <Target className="h-4 w-4" /> ATS Score
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="secondary">
          <Link href={`/resumes/${resume.id}/match`}>
            <Brain className="h-4 w-4" /> JD Match
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="secondary">
          <Link href={`/resumes/${resume.id}/tailor`}>
            <Sparkles className="h-4 w-4" /> AI Tailor
          </Link>
        </Button>
        <Button asChild className="justify-start gap-2" variant="secondary">
          <Link href={`/resumes/${resume.id}/versions`}>
            <GitBranch className="h-4 w-4" /> Versions
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {resume.summary || "No summary yet."}
          </p>
          <div className="text-sm text-muted-foreground">
            Updated {new Date(resume.updatedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
