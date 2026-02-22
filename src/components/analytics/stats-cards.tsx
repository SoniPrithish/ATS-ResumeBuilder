import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Percent, Briefcase, Zap, TrendingUp, BookOpen } from "lucide-react";

export function StatsCards() {
    const stats = [
        { title: "Resumes Created", value: "3", icon: FileText, desc: "+1 from last month" },
        { title: "Average ATS Score", value: "85%", icon: Percent, desc: "+12% overall improvement" },
        { title: "JDs Matched", value: "12", icon: Briefcase, desc: "Across 4 saved roles" },
        { title: "Skill Gaps Closed", value: "8", icon: BookOpen, desc: "Learned via suggestions" },
        { title: "AI Enhancements", value: "34", icon: Zap, desc: "Bullets optimized" },
        { title: "Best Match Score", value: "92%", icon: TrendingUp, desc: "Senior Dev @ Startup" },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title} className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
