import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useJDMatch() {
    const utils = trpc.useUtils();

    return trpc.match.matchResumeToJD.useMutation({
        onSuccess: (data) => {
            utils.match.getMatch.invalidate({ id: data.id });
        },
        onError: (error) => {
            toast.error('Matching failed', {
                description: error.message || 'Failed to match resume to JD.',
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
// group 1 modifications
