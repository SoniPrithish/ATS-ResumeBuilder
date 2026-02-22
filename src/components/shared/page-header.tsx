import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col items-start justify-between gap-4 border-b bg-background pb-6 pt-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 w-full sm:w-auto mt-4 sm:mt-0">{action}</div>}
        </div>
    );
}
