"use client";

import { useUIStore } from '@/stores/ui-store';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

export function Topbar() {
    const { toggleMobileNav, toggleSidebar } = useUIStore();
    const pathname = usePathname();
    const { data: session } = useSession();

    const getPageTitle = () => {
        if (pathname.includes('/dashboard')) return 'Dashboard';
        if (pathname.includes('/resumes')) return 'My Resumes';
        if (pathname.includes('/jobs')) return 'Job Descriptions';
        if (pathname.includes('/analytics')) return 'Analytics';
        if (pathname.includes('/settings')) return 'Settings';
        return '';
    };

    return (
        <header className="flex h-16 items-center border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleMobileNav} className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <div className="relative hidden w-64 md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="pl-8 w-full bg-muted shadow-none" />
                </div>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <Avatar className="h-8 w-8 md:hidden">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
