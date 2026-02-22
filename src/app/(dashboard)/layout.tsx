import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            <Sidebar />
            <MobileNav />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
