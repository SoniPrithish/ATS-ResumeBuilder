import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
    return (
        <Loader2
            className={cn('animate-spin text-muted-foreground', className)}
            size={size}
        />
    );
}

export function FullPageLoader() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <LoadingSpinner size={48} />
        </div>
    );
}
