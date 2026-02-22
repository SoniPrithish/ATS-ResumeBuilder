import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 mb-8 text-sm text-muted-foreground max-w-sm mx-auto">
                {description}
            </p>
            {action && (
                <Button asChild>
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    );
}
