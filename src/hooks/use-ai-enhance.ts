import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';

export function useEnhanceBullet() {

    return (trpc as any).ai.enhanceBullet.useMutation({
        onError: (error: any) => {
            toast.error('Enhancement failed', {
                description: error.message || 'Failed to enhance bullet.',
            });
        }
    });
}

export function useTailorResume() {

    return (trpc as any).ai.tailorResume.useMutation({
        onError: (error: any) => {
            toast.error('Tailoring failed', {
                description: error.message || 'Failed to tailor resume.',
            });
        }
    });
}

export function useGenerateSummary() {

    return (trpc as any).ai.generateSummary.useMutation({
        onError: (error: any) => {
            toast.error('Summary generation failed', {
                description: error.message || 'Failed to generate summary.',
            });
        }
    });
}
// group 1 modifications
