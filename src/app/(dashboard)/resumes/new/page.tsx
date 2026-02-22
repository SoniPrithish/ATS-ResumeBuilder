"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCreateResume } from "@/hooks/use-resume";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CheckCircle2, Loader2, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

const createResumeSchema = z.object({
    title: z.string().min(1, "Resume title is required").max(100),
    templateId: z.string().min(1, "Template is required"),
});

const templates = [
    { id: "Classic", name: "Classic", desc: "Simple, highly ATS-friendly format." },
    { id: "Modern", name: "Modern", desc: "Clean layout with subtle accents." },
    { id: "Minimal", name: "Minimal", desc: "Ultra-clean and spacious." },
];

export default function NewResumePage() {
    const router = useRouter();
    const createResume = useCreateResume();

    const form = useForm<z.infer<typeof createResumeSchema>>({
        resolver: zodResolver(createResumeSchema),
        defaultValues: {
            title: "My Tech Resume",
            templateId: "Classic",
        },
    });

    async function onSubmit(values: z.infer<typeof createResumeSchema>) {
        createResume.mutate(values, {
            onSuccess: (data) => {
                router.push(`/resumes/${data.id}/edit`);
            },
        });
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-50">
            <PageHeader
                title="Create New Resume"
                description="Start from scratch and build an AI-optimized resume."
            />

            <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Resume Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Frontend Engineer" {...field} className="h-12 text-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="templateId"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-base font-semibold block">Select Template</FormLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {templates.map((template) => (
                                            <Card
                                                key={template.id}
                                                className={cn(
                                                    "cursor-pointer transition-all border-2",
                                                    field.value === template.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                                onClick={() => field.onChange(template.id)}
                                            >
                                                <CardContent className="p-6 relative text-center">
                                                    {field.value === template.id && (
                                                        <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                                                    )}
                                                    <div className="h-24 w-full bg-muted/50 rounded flex items-center justify-center mb-4">
                                                        <LayoutTemplate className="h-8 w-8 text-muted-foreground/30" />
                                                    </div>
                                                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-2">{template.desc}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" disabled={createResume.isPending} className="w-full md:w-auto min-w-[200px]">
                                {createResume.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Resume"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
