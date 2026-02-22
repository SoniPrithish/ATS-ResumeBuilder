"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Github, Save, Trash2, Download } from "lucide-react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [repoUrl, setRepoUrl] = useState("");
    const [isTest, setIsTest] = useState(false);

    const handleTestConnection = () => {
        setIsTest(true);
        setTimeout(() => setIsTest(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 max-w-4xl mx-auto">
            <PageHeader
                title="Settings"
                description="Manage your account preferences and integrations."
            />

            <div className="grid gap-8">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Your personal details (synced via OAuth)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-20 h-20 shadow-sm border">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="text-xl">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <Label>Full Name</Label>
                                <Input value={session?.user?.name || ""} disabled className="bg-muted cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input value={session?.user?.email || ""} disabled className="bg-muted cursor-not-allowed" />
                            <p className="text-xs text-muted-foreground">Your email is managed through your authentication provider.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* GitHub Integration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Github className="w-5 h-5" /> GitHub Integration</CardTitle>
                        <CardDescription>Connect a repository to sync and version control your resumes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="repoUrl">Repository URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="repoUrl"
                                    placeholder="https://github.com/username/resume-repo"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                />
                                <Button variant="secondary" onClick={handleTestConnection} disabled={!repoUrl || isTest}>
                                    {isTest ? "Testing..." : "Test Connection"}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-500 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/50">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span>Status: Disconnected</span>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 px-6 py-4">
                        <Button className="ml-auto gap-2 text-sm"><Save className="w-4 h-4" /> Save Configuration</Button>
                    </CardFooter>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Editor Preferences</CardTitle>
                        <CardDescription>Default settings for new resumes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 max-w-sm">
                            <Label htmlFor="template">Default ATS-Friendly Template</Label>
                            <Select defaultValue="Classic">
                                <SelectTrigger id="template">
                                    <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Classic">Classic Serif (Harvard Style)</SelectItem>
                                    <SelectItem value="Modern">Modern Clean Sans-Serif</SelectItem>
                                    <SelectItem value="Minimal">Ultra Minimalist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Data & Privacy */}
                <Card className="border-destructive/20 shadow-none bg-muted/5">
                    <CardHeader>
                        <CardTitle>Data & Privacy</CardTitle>
                        <CardDescription>Manage your data and account removal.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <Download className="w-4 h-4" />
                            Export My Data (GDPR)
                        </Button>
                        <Button variant="destructive" className="gap-2 w-full sm:w-auto ml-auto">
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
