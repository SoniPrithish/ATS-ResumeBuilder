import { BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";

export function AILoading({
    text = "Analyzing data...",
}: {
    text?: string;
}) {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-primary/20 bg-primary/5">
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative bg-primary/10 p-4 rounded-full border border-primary/30">
                    <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                </div>
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                AI is thinking{dots}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
                {text}
            </p>

            {/* Fake streaming skeleton */}
            <div className="w-full max-w-md mt-8 space-y-3 opacity-50">
                <div className="h-3 bg-muted-foreground/20 rounded w-full animate-pulse" />
                <div className="h-3 bg-muted-foreground/20 rounded w-[90%] animate-pulse delay-75" />
                <div className="h-3 bg-muted-foreground/20 rounded w-[80%] animate-pulse delay-150" />
            </div>
        </div>
    );
}
