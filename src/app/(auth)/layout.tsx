import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2 font-bold select-none text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        TR
                    </div>
                    <span>TechResume AI</span>
                </Link>
            </div>
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
