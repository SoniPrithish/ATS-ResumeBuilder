import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useATSScore(resumeId: string) {
    const utils = trpc.useUtils();

    return trpc.ats.score.useMutation({
        onSuccess: () => {
            utils.ats.getScore.invalidate(resumeId);
            utils.resume.getById.invalidate(resumeId);
        },
        onError: (error) => {
            toast.error('Scoring failed', {
                description: error.message || 'Failed to score resume.',
            });
        }
    });
}

export function useCachedScore(resumeId: string) {
    return trpc.ats.getScore.useQuery(resumeId, {
        enabled: !!resumeId,
    });
}
// group 1 modifications
