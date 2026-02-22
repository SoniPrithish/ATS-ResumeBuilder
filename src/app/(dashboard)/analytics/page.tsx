"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "@/components/analytics/stats-cards";
import { ScoreChart } from "@/components/analytics/score-chart";
import { ActivityFeed } from "@/components/analytics/activity-feed";

// Mock data
const mockChartData = [
    { date: "Oct 1", score: 65 },
    { date: "Oct 15", score: 70 },
    { date: "Nov 1", score: 68 },
    { date: "Nov 15", score: 75 },
    { date: "Dec 1", score: 82 },
    { date: "Dec 15", score: 88 },
    { date: "Today", score: 92 },
];

const mockActivities = [
    { type: "AI_ENHANCED", description: "Enhanced 3 bullets in Software Engineer resume", time: "2 hours ago" },
    { type: "JD_MATCHED", description: "Matched against 'Senior Frontend Dev' at Google (Score: 88%)", time: "1 day ago" },
    { type: "ATS_SCORED", description: "Scored Software Engineer resume (Score: 92%)", time: "2 days ago" },
    { type: "RESUME_CREATED", description: "Created new resume 'Software Engineer'", time: "3 days ago" },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 animate-in fade-in-50">
            <PageHeader
                title="Analytics"
                description="Track your resume performance and optimization metrics."
            />

            <StatsCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ScoreChart data={mockChartData} />
                <ActivityFeed activities={mockActivities} />
            </div>
        </div>
    );
}
