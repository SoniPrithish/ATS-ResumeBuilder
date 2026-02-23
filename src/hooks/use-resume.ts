import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import type { PaginatedResult } from '@/types/common';
import type { ResumeRecord } from '@/types/resume';


export function useResume(id: string) {
    const query = trpc.resume.getById.useQuery({ id }, {
        enabled: !!id,
    });
    return {
        ...query,
        data: query.data as ResumeRecord | undefined,
    };
}

export function useResumes(page = 1, pageSize = 10) {
    const query = trpc.resume.list.useQuery({
        page,
        pageSize,
    });
    return {
        ...query,
        data: query.data as PaginatedResult<ResumeRecord> | undefined,
    };
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
        onSuccess: (_data, variables) => {
            utils.resume.getById.invalidate({ id: variables.id });
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
