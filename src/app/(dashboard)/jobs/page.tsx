"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useJobDescriptions } from "@/hooks/use-jd-match";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Briefcase, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function JobsPage() {
    const { data: jobs, isLoading } = useJobDescriptions();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Job Descriptions" description="Manage saved job descriptions" />
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <PageHeader
                title="Job Descriptions"
                description="Saved job descriptions for matching against resumes."
            />

            {jobs?.items.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No jobs saved yet"
                    description="You can save job descriptions when running a JD match against your resume."
                    action={{ label: "Go to My Resumes", href: "/resumes" }}
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {jobs?.items.map((job) => (
                        <Card key={job.id} className="flex flex-col h-full transition-all duration-200 hover:shadow-lg border-border/50 hover:border-primary/50 group">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                            {job.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Briefcase className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <Link href={`/jobs/${job.id}`} className="flex-1">
                                <CardContent className="flex-1">
                                    <p className="line-clamp-3 text-sm text-muted-foreground bg-muted/20 p-4 rounded-md border border-border/50 font-mono text-xs">
                                        {job.rawText.substring(0, 150)}...
                                    </p>
                                </CardContent>
                            </Link>
                            <CardFooter className="pt-2 pb-4 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between w-full">
                                    <span>Saved {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
