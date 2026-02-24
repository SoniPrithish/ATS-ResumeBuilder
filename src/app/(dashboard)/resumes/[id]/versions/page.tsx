"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useResume } from "@/hooks/use-resume";
import { PageHeader } from "@/components/shared/page-header";
import { VersionHistory } from "@/components/resume/version-history";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";

export default function ResumeVersionsPage({ params }: { params: Promise<{ id: string }> }) {
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
        title="Version History"
        description={`Tracked revisions for \"${resume.title}\"`}
        action={
          <Button asChild variant="outline">
            <Link href={`/resumes/${resume.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resume
            </Link>
          </Button>
        }
      />
      <VersionHistory resumeId={resume.id} />
    </div>
  );
}
