import { useState } from "react";
import { useJDMatch, useJobDescriptions } from "@/hooks/use-jd-match";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search } from "lucide-react";

export function JDInput({ resumeId, onMatchStart, onMatchComplete }: { resumeId: string; onMatchStart?: () => void; onMatchComplete?: (data: Record<string, unknown>) => void }) {
    const [tab, setTab] = useState("paste");
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [jdText, setJdText] = useState("");
    const [selectedJdId, setSelectedJdId] = useState<string | null>(null);

    const { data: jobs, isLoading: isLoadingJobs } = useJobDescriptions(1, 100);
    const matchMutation = useJDMatch();

    const handleMatchNew = async () => {
        if (jdText.length < 50) return;
        if (onMatchStart) onMatchStart();
        try {
            const data = await matchMutation.mutateAsync({
                resumeId,
                jobId: jdText,
                title: title || "New Job",
                company: company || "Unknown Company",
            });
            if (onMatchComplete) onMatchComplete(data);
        } catch {
            // Handled in mutation
        }
    };

    const handleMatchExisting = async () => {
        if (!selectedJdId) return;
        if (onMatchStart) onMatchStart();
        try {
            const data = await matchMutation.mutateAsync({
                resumeId,
                jobId: selectedJdId,
            });
            if (onMatchComplete) onMatchComplete(data);
        } catch {
            // Handled in mutation
        }
    };

    return (
        <Card className="shadow-md border border-border/50">
            <CardHeader className="bg-muted/20 border-b">
                <CardTitle>Job Description Match</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent h-12">
                        <TabsTrigger
                            value="paste"
                            className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-muted/10 h-12"
                        >
                            Paste New JD
                        </TabsTrigger>
                        <TabsTrigger
                            value="select"
                            className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-muted/10 h-12"
                        >
                            Select Existing
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                        <TabsContent value="paste" className="mt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Senior Frontend Developer"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company (Optional)</Label>
                                    <Input
                                        id="company"
                                        placeholder="Acme Corp"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jdText">Job Description</Label>
                                <Textarea
                                    id="jdText"
                                    placeholder="Paste the full job description here..."
                                    className="min-h-[200px]"
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground flex justify-between">
                                    <span>Must be at least 50 characters</span>
                                    <span className={jdText.length < 50 && jdText.length > 0 ? "text-red-500" : ""}>{jdText.length} chars</span>
                                </p>
                            </div>

                            <Button
                                className="w-full gap-2 mt-2"
                                size="lg"
                                disabled={jdText.length < 50 || matchMutation.isPending}
                                onClick={handleMatchNew}
                            >
                                {matchMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                Save & Match
                            </Button>
                        </TabsContent>

                        <TabsContent value="select" className="mt-0 space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search saved jobs..." className="pl-9 bg-muted/20" />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {isLoadingJobs ? (
                                        <div className="flex items-center justify-center p-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : jobs?.items.length === 0 ? (
                                        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                            No saved job descriptions found.
                                        </div>
                                    ) : (
                                        jobs?.items.map((job: { id: string; title: string; company: string }) => (
                                            <div
                                                key={job.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedJdId === job.id
                                                    ? "border-primary bg-primary/10 hover:bg-primary/10"
                                                    : "hover:bg-muted/50 border-border/50"
                                                    }`}
                                                onClick={() => setSelectedJdId(job.id)}
                                            >
                                                <h4 className="font-semibold">{job.title}</h4>
                                                <p className="text-sm text-muted-foreground">{job.company}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    size="lg"
                                    disabled={!selectedJdId || matchMutation.isPending}
                                    onClick={handleMatchExisting}
                                >
                                    {matchMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">Match Selected JD</span>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
