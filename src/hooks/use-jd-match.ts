import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useJDMatch() {
    const utils = trpc.useUtils();

    return trpc.match.matchResumeToJD.useMutation({
        onSuccess: (data) => {
            utils.match.getMatch.invalidate({ jdId: data.jdId });
        },
        onError: (error) => {
            toast.error('Matching failed', {
                description: error.message || 'Failed to match resume to JD.',
            });
        }
    });
}

export function useJobDescriptions(page = 1, pageSize = 10) {
    return trpc.job.list.useQuery({
        page,
        pageSize,
        
    });
}
// group 1 modifications
