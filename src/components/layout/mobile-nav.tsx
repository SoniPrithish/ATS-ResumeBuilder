import { useUIStore } from '@/stores/ui-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Briefcase, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from 'next-auth/react';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resumes', label: 'My Resumes', icon: FileText },
    { href: '/jobs', label: 'Job Descriptions', icon: Briefcase },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
    const { mobileNavOpen, toggleMobileNav } = useUIStore();
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <Sheet open={mobileNavOpen} onOpenChange={toggleMobileNav}>
            <SheetContent side="left" className="flex flex-col border-r bg-background p-0 w-64">
                <SheetHeader className="border-b px-4 py-4 text-left">
                    <SheetTitle className="flex items-center gap-2 font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            TR
                        </div>
                        <span>TechResume AI</span>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                        return (
                            <Link key={link.href} href={link.href} onClick={toggleMobileNav}>
                                <span
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{link.label}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={session?.user?.image || ''} />
                            <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden w-32">
                            <span className="truncate text-sm font-medium">{session?.user?.name}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
