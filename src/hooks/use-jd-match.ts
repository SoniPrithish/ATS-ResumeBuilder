import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/hooks/use-toast';

export function useJDMatch() {
    const { toast } = useToast();
    const utils = trpc.useUtils();

    return trpc.match.matchResumeToJD.useMutation({
        onSuccess: (data) => {
            utils.match.getMatch.invalidate({ id: data.id });
        },
        onError: (error) => {
            toast({
                title: 'Matching failed',
                description: error.message || 'Failed to match resume to JD.',
                variant: 'destructive',
            });
        }
    });
}

export function useJobDescriptions(page = 1, limit = 10) {
    return trpc.job.list.useQuery({
        page,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
    });
}
