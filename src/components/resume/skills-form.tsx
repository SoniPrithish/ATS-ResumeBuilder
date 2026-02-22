import { useState } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";


export function SkillsForm() {
    const { currentResume, updateSection } = useResumeStore();

    if (!currentResume) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Skills</h3>
            </div>

            <div className="space-y-6">
                <SkillCategory
                    title="Technical Skills"
                    description="Programming languages, core technologies (e.g. JavaScript, Python, SQL)"
                    skills={currentResume.skills.technical}
                    onChange={(newSkills) =>
                        updateSection("skills", { ...currentResume.skills, technical: newSkills })
                    }
                />

                <SkillCategory
                    title="Frameworks & Libraries"
                    description="(e.g. React, Node.js, Spring Boot)"
                    skills={currentResume.skills.languages || []}
                    onChange={(newSkills) =>
                        updateSection("skills", { ...currentResume.skills, languages: newSkills })
                    }
                />

                <SkillCategory
                    title="Tools & Platforms"
                    description="(e.g. Git, Docker, AWS, Figma)"
                    skills={currentResume.skills.tools}
                    onChange={(newSkills) =>
                        updateSection("skills", { ...currentResume.skills, tools: newSkills })
                    }
                />

                <SkillCategory
                    title="Soft Skills & Concepts"
                    description="(e.g. Agile, Leadership, Problem Solving)"
                    skills={currentResume.skills.soft}
                    onChange={(newSkills) =>
                        updateSection("skills", { ...currentResume.skills, soft: newSkills })
                    }
                />
            </div>
        </div>
    );
}

function SkillCategory({
    title,
    description,
    skills,
    onChange,
}: {
    title: string;
    description: string;
    skills: string[];
    onChange: (skills: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        const newSkill = inputValue.trim();
        if (newSkill && !skills.includes(newSkill)) {
            onChange([...skills, newSkill]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAdd();
        } else if (e.key === "Backspace" && inputValue === "" && skills.length > 0) {
            handleChange(skills[skills.length - 1]); // Set input to last skill so they can edit it
            handleRemove(skills[skills.length - 1]);
        }
    };

    const handleRemove = (skillToRemove: string) => {
        onChange(skills.filter((skill) => skill !== skillToRemove));
    };

    const handleChange = (val: string) => {
        setInputValue(val);
    }

    return (
        <div className="p-5 border rounded-lg bg-card shadow-sm">
            <div className="mb-4">
                <Label className="text-base">{title}</Label>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1 flex items-center gap-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 transition-colors">
                            {skill}
                            <button
                                type="button"
                                onClick={() => handleRemove(skill)}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                                aria-label={`Remove ${skill}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Type a skill and press Enter...`}
                        className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={!inputValue.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
