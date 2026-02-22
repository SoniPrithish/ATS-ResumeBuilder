"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Percent, Briefcase, Zap, Plus, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useResumes } from "@/hooks/use-resume";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { data: resumes, isLoading } = useResumes();

    // Fake stats for now - hook these up to real data later
    const stats = [
        { name: "Total Resumes", value: resumes?.items.length || 0, icon: FileText },
        { name: "Average ATS Score", value: "85%", icon: Percent },
        { name: "JDs Matched", value: "12", icon: Briefcase },
        { name: "AI Enhancements", value: "34", icon: Zap },
    ];

    return (
        <div className="space-y-8 animate-in fade-in-50">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
                </h1>
                <p className="text-muted-foreground">
                    Here&apos;s an overview of your resume optimization process.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.name} className="transition-all duration-200 hover:shadow-md border border-border/50 bg-card/50 backdrop-blur">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.name}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {isLoading && stat.name === "Total Resumes" ? "..." : stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex gap-4 flex-wrap">
                <Button asChild size="lg" className="gap-2 shadow-lg">
                    <Link href="/resumes/new">
                        <Plus className="h-5 w-5" />
                        Create Resume
                    </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="gap-2 shadow-sm border border-border/50">
                    <Link href="/resumes/upload">
                        <Upload className="h-5 w-5" />
                        Upload Resume
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 shadow-sm">
                    <Link href="/resumes/match">
                        <LinkIcon className="h-5 w-5" />
                        New JD Match
                    </Link>
                </Button>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Recent Resumes</h2>
                {!isLoading && resumes?.items.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">You haven&apos;t created any resumes yet.</p>
                        <Button asChild>
                            <Link href="/resumes/new">Create Your First Resume</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Map over resumes to create resume cards */}
                        {resumes?.items.slice(0, 5).map(resume => (
                            <Card key={resume.id} className="transition-all hover:border-primary/50 group hover:shadow-md cursor-pointer">
                                <Link href={`/resumes/${resume.id}`}>
                                    <CardHeader>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{resume.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
