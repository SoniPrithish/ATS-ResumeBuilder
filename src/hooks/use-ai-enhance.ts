import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useEnhanceBullet() {
    return trpc.ai.enhanceBullet.useMutation({
        onError: (error) => {
            toast.error('Enhancement failed', {
                description: error.message || 'Failed to enhance bullet.',
            });
        }
    });
}

export function useTailorResume() {
    return trpc.ai.tailorResume.useMutation({
        onError: (error) => {
            toast.error('Tailoring failed', {
                description: error.message || 'Failed to tailor resume.',
            });
        }
    });
}

export function useGenerateSummary() {
    return trpc.ai.generateSummary.useMutation({
        onError: (error) => {
            toast.error('Summary generation failed', {
                description: error.message || 'Failed to generate summary.',
            });
        }
    });
}
