import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ScoreChart({ data }: { data: { date: string, score: number }[] }) {
    if (!data || data.length === 0) return null;

    // Render an SVG line chart spanning 0-100 on Y and based on data length for X
    const w = 600;
    const h = 250;
    const paddingX = 40;
    const paddingY = 30;

    const points = data.map((d, i) => {
        const x = paddingX + (i * ((w - paddingX * 2) / (data.length - 1 || 1)));
        const y = h - paddingY - (d.score * ((h - paddingY * 2) / 100));
        return { x, y, score: d.score, date: d.date };
    });

    const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    return (
        <Card className="col-span-1 md:col-span-2 shadow-sm border-border/50">
            <CardHeader>
                <CardTitle>ATS Score Trend</CardTitle>
                <CardDescription>Your resume score improvement over time</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <div className="w-full overflow-x-auto min-h-[300px] flex justify-center">
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[800px] h-auto">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(val => {
                            const y = h - paddingY - (val * ((h - paddingY * 2) / 100));
                            return (
                                <g key={val}>
                                    <line x1={paddingX} y1={y} x2={w - paddingX} y2={y} stroke="currentColor" className="text-muted-foreground/20" strokeDasharray="4" />
                                    <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">{val}</text>
                                </g>
                            );
                        })}

                        {/* Path */}
                        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />

                        {/* Points */}
                        {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="4" fill="currentColor" className="text-primary hover:r-6 hover:text-primary transition-all duration-200" />
                                <rect x={p.x - 20} y={p.y - 30} width="40" height="20" rx="4" fill="var(--background)" stroke="currentColor" strokeWidth="1" className="text-border opacity-0 group-hover:opacity-100 transition-opacity" />
                                <text x={p.x} y={p.y - 17} textAnchor="middle" className="text-[10px] fill-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity">{p.score}</text>
                            </g>
                        ))}

                        {/* X Axis Labels */}
                        {points.map((p, i) => (
                            <text key={`x-${i}`} x={p.x} y={h - 10} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                                {p.date}
                            </text>
                        ))}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
