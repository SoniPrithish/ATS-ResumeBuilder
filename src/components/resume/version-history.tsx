"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function VersionHistory({ resumeId }: { resumeId: string }) {
  const versionsQuery = trpc.version.list.useQuery(
    { resumeId },
    { enabled: !!resumeId },
  );

  const restoreMutation = trpc.version.restore.useMutation({
    onSuccess: () => {
      versionsQuery.refetch();
    },
  });

  if (versionsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!versionsQuery.data?.success || !versionsQuery.data.data?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No saved versions yet.
        </CardContent>
      </Card>
    );
  }

  const versions = versionsQuery.data.data;

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <div className="font-medium">Version {version.version}</div>
              <div className="text-sm text-muted-foreground">
                {version.changeNote || "No change note"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(version.createdAt).toLocaleString()}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                restoreMutation.mutate({ resumeId, version: version.version })
              }
              disabled={restoreMutation.isPending}
            >
              Restore
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
