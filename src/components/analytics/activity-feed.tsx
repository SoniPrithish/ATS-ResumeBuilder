import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Activity, Link as LinkIcon, Sparkles } from "lucide-react";

export function ActivityFeed({ activities }: { activities: { type: string; description: string; time: string }[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case "RESUME_CREATED": return <FileText className="h-4 w-4 text-primary" />;
            case "ATS_SCORED": return <Activity className="h-4 w-4 text-green-500" />;
            case "JD_MATCHED": return <LinkIcon className="h-4 w-4 text-blue-500" />;
            case "AI_ENHANCED": return <Sparkles className="h-4 w-4 text-yellow-500" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <Card className="col-span-1 shadow-sm border-border/50">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and improvements</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No recent activity.
                        </div>
                    ) : (
                        activities.map((activity, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="mt-0.5 relative">
                                    <div className="absolute top-6 bottom-[-24px] left-1/2 w-px bg-border -translate-x-1/2 hidden group-last:block" />
                                    <div className="h-8 w-8 rounded-full border bg-background flex items-center justify-center relative z-10 shadow-sm">
                                        {getIcon(activity.type)}
                                    </div>
                                </div>
                                <div className="space-y-1 pb-4">
                                    <p className="font-medium leading-none">{activity.description}</p>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
