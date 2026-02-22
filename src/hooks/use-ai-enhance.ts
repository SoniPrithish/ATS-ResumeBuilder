import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/hooks/use-toast';

export function useEnhanceBullet() {
    const { toast } = useToast();

    return trpc.ai.enhanceBullet.useMutation({
        onError: (error) => {
            toast({
                title: 'Enhancement failed',
                description: error.message || 'Failed to enhance bullet.',
                variant: 'destructive',
            });
        }
    });
}

export function useTailorResume() {
    const { toast } = useToast();

    return trpc.ai.tailorResume.useMutation({
        onError: (error) => {
            toast({
                title: 'Tailoring failed',
                description: error.message || 'Failed to tailor resume.',
                variant: 'destructive',
            });
        }
    });
}

export function useGenerateSummary() {
    const { toast } = useToast();

    return trpc.ai.generateSummary.useMutation({
        onError: (error) => {
            toast({
                title: 'Summary generation failed',
                description: error.message || 'Failed to generate summary.',
                variant: 'destructive',
            });
        }
    });
}
