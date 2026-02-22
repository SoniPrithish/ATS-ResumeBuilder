import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ScoreGauge({ score, size = 200, label }: { score: number, size?: number, label?: string }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    // Color logic
    let colorClass = 'text-green-500';
    let strokeClass = 'stroke-green-500';
    if (score < 40) {
        colorClass = 'text-red-500';
        strokeClass = 'stroke-red-500';
    } else if (score < 60) {
        colorClass = 'text-orange-500';
        strokeClass = 'stroke-orange-500';
    } else if (score < 80) {
        colorClass = 'text-yellow-500';
        strokeClass = 'stroke-yellow-500';
    }

    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn('transition-all duration-1000 ease-out', strokeClass)}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={cn("text-5xl font-bold tracking-tighter", colorClass)}>
                    {Math.round(animatedScore)}
                </span>
                {label && <span className="text-sm font-medium text-muted-foreground mt-1">{label}</span>}
            </div>
        </div>
    );
}
