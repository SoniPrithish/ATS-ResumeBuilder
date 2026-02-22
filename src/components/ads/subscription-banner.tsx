import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { useState } from "react";

export function SubscriptionBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:bg-black/5 rounded-full"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/20 items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                            <Zap className="h-4 w-4 text-primary sm:hidden" />
                            Upgrade to Pro
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Get unlimited AI enhancements, real-time ATS scoring, one-click JD tailoring, and remove all ads.
                        </p>
                    </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button className="w-full sm:w-auto shadow-md gap-2" size="lg">
                        <Zap className="w-4 h-4" /> Go Pro for $10/mo
                    </Button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            </CardContent>
        </Card>
    );
}
