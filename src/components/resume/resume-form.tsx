import { useResumeStore } from "@/stores/resume-store";
import { useUpdateResume } from "@/hooks/use-resume";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactInfoForm } from "./contact-info-form";
import { SummaryForm } from "./summary-form";
import { ExperienceFormList } from "./experience-form";
import { EducationFormList } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsFormList } from "./projects-form";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function ResumeForm({ resumeId }: { resumeId: string }) {
    const { currentResume, activeSection, setActiveSection, isDirty, setDirty } = useResumeStore();
    const updateResume = useUpdateResume();
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

    // Use a ref to store the latest resume state to avoid stale closures in effects
    const resumeRef = useRef(currentResume);
    useEffect(() => {
        resumeRef.current = currentResume;
    }, [currentResume]);

    const saveResume = useCallback(async () => {
        if (!resumeRef.current || !isDirty) return;

        setDirty(false); // Optimistic UI
        try {
            await updateResume.mutateAsync({
                id: resumeId,
                title: resumeRef.current.title,
                templateId: resumeRef.current.templateId,
                contactInfo: resumeRef.current.contactInfo as unknown as Record<string, unknown>,
                summary: resumeRef.current.summary,
                experience: resumeRef.current.experience as unknown as Record<string, unknown>[],
                education: resumeRef.current.education as unknown as Record<string, unknown>[],
                skills: resumeRef.current.skills as unknown as Record<string, unknown>,
                projects: (resumeRef.current.projects ?? []) as unknown as Record<string, unknown>[],
                certifications: (resumeRef.current.certifications ?? []) as unknown as Record<string, unknown>[],
                customSections: (resumeRef.current.customSections ?? []) as unknown as Record<string, unknown>[],
            });
            setLastSavedTime(new Date());
        } catch {
            setDirty(true); // Revert on failure
        }
    }, [resumeId, updateResume, isDirty, setDirty]);

    // Use the custom debounce hook for auto-save
    const debouncedDirty = useDebounce(isDirty, 2000);

    useEffect(() => {
        if (debouncedDirty) {
            const timer = setTimeout(() => {
                void saveResume();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [debouncedDirty, saveResume]);

    // Ensure contactInfo-form and summary-form exists, I'll generate them in the same file or as separate files. 
    // The Prompt asked for Experience, Education, Skills, Projects forms, so I will modularize them.

    if (!currentResume) return null;

    return (
        <div className="flex flex-col h-full relative">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center">
                    {isDirty ? (
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Unsaved changes</span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {lastSavedTime ? `Saved ${lastSavedTime.toLocaleTimeString()}` : 'All changes saved'}
                        </span>
                    )}
                </div>
                <Button
                    size="sm"
                    onClick={saveResume}
                    disabled={!isDirty || updateResume.isPending}
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    {updateResume.isPending ? "Saving..." : "Save Now"}
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 pb-20">
                <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
                        <TabsList className="w-max inline-flex">
                            <TabsTrigger value="Contact Info">Contact Info</TabsTrigger>
                            <TabsTrigger value="Summary">Summary</TabsTrigger>
                            <TabsTrigger value="Experience">Experience</TabsTrigger>
                            <TabsTrigger value="Education">Education</TabsTrigger>
                            <TabsTrigger value="Skills">Skills</TabsTrigger>
                            <TabsTrigger value="Projects">Projects</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-4 bg-card border rounded-lg p-6 shadow-sm">
                        <TabsContent value="Contact Info" className="mt-0 outline-none">
                            <ContactInfoForm />
                        </TabsContent>
                        <TabsContent value="Summary" className="mt-0 outline-none">
                            <SummaryForm />
                        </TabsContent>
                        <TabsContent value="Experience" className="mt-0 outline-none">
                            <ExperienceFormList />
                        </TabsContent>
                        <TabsContent value="Education" className="mt-0 outline-none">
                            <EducationFormList />
                        </TabsContent>
                        <TabsContent value="Skills" className="mt-0 outline-none">
                            <SkillsForm />
                        </TabsContent>
                        <TabsContent value="Projects" className="mt-0 outline-none">
                            <ProjectsFormList />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
