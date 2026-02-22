import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';


export function useResume(id: string) {
    return trpc.resume.getById.useQuery(id, {
        enabled: !!id,
    });
}

export function useResumes(page = 1, limit = 10) {
    return trpc.resume.list.useQuery({
        page,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
    });
}

export function useCreateResume() {
    const utils = trpc.useUtils();

    return trpc.resume.create.useMutation({
        onSuccess: () => {
            toast.success('Resume created', {
                description: 'Your new resume has been created successfully.',
            });
            utils.resume.list.invalidate();
        },
        onError: (error) => {
            toast.error('Error', {
                description: error.message || 'Failed to create resume.',
            });
        }
    });
}

export function useUpdateResume() {
    const utils = trpc.useUtils();

    return trpc.resume.update.useMutation({
        onSuccess: (data) => {
            utils.resume.getById.invalidate(data.id);
            utils.resume.list.invalidate();
        },
    });
}

export function useDeleteResume() {
    const utils = trpc.useUtils();

    return trpc.resume.delete.useMutation({
        onSuccess: () => {
            toast.success('Resume deleted', {
                description: 'The resume has been permanently deleted.',
            });
            utils.resume.list.invalidate();
        },
        onError: (error) => {
            toast.error('Error', {
                description: error.message || 'Failed to delete resume.',
            });
        }
    });
}
// group 1 modifications
