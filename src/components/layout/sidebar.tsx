import { useUIStore } from '@/stores/ui-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Briefcase, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resumes', label: 'My Resumes', icon: FileText },
    { href: '/jobs', label: 'Job Descriptions', icon: Briefcase },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const { sidebarOpen } = useUIStore();
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside
            className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                }`}
        >
            <div className="flex h-16 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold select-none">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        TR
                    </div>
                    {sidebarOpen && <span className="text-xl">TechResume AI</span>}
                </Link>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                    return (
                        <Link key={link.href} href={link.href}>
                            <span
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span>{link.label}</span>}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || ''} />
                                <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            {sidebarOpen && (
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="truncate text-sm font-medium">{session?.user?.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{session?.user?.email}</span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
