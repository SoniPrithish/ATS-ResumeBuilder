import { ResumeRecord } from "@/types/resume";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Edit2, Activity, Link as LinkIcon, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useDeleteResume } from "@/hooks/use-resume";

export function ResumeCard({ resume }: { resume: ResumeRecord }) {
    const deleteResume = useDeleteResume();
    const date = new Date(resume.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETE": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "DRAFT": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
            case "ARCHIVED": return "bg-muted text-muted-foreground hover:bg-muted/80";
            default: return "";
        }
    };

    return (
        <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-lg border-border/50 hover:border-primary/50 group">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {resume.title}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/resumes/${resume.id}/edit`}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/resumes/${resume.id}/score`}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Score
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/resumes/${resume.id}/match`}>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Match JD
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this resume?")) {
                                        deleteResume.mutate(resume.id);
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className={getStatusColor(resume.status)}>
                        {resume.status}
                    </Badge>
                    <Badge variant="outline" className="border-border/50">
                        {resume.templateId || "Classic"}
                    </Badge>
                </div>
            </CardHeader>
            <Link href={`/resumes/${resume.id}`} className="flex-1">
                <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 my-2 mx-4 rounded-md border border-border/50 group-hover:bg-primary/5 transition-colors">
                    <FileText className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </CardContent>
            </Link>
            <CardFooter className="pt-2 pb-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between w-full">
                    <span>Updated {date}</span>
                    {resume.lastAtsScore && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                            <Activity className="h-3 w-3 text-primary" />
                            {resume.lastAtsScore}/100
                        </span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
