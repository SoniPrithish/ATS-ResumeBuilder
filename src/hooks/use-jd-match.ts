import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useJDMatch() {
    const utils = trpc.useUtils();

    return trpc.match.matchResumeToJD.useMutation({
        onSuccess: (_data, variables) => {
            utils.match.getMatch.invalidate({
                resumeId: variables.resumeId,
                jdId: variables.jdId,
            });
            utils.job.list.invalidate();
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

export function useCreateJobDescription() {
    const utils = trpc.useUtils();

    return trpc.job.create.useMutation({
        onSuccess: () => {
            utils.job.list.invalidate();
        },
        onError: (error) => {
            toast.error('Failed to save job description', {
                description: error.message || 'Please try again.',
            });
        },
    });
}
