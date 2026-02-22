import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 md:py-8">
            <div className="container px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-col items-center gap-2 md:items-start md:gap-1">
                    <Link href="/" className="flex items-center gap-2 font-bold select-none">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                            TR
                        </div>
                        <span>TechResume AI</span>
                    </Link>
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} TechResume AI. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/privacy" className="text-sm font-medium hover:underline underline-offset-4">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm font-medium hover:underline underline-offset-4">
                        Terms of Service
                    </Link>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline underline-offset-4"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
