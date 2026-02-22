import { useResumeStore } from "@/stores/resume-store";
import { ProjectEntry } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { nanoid } from "nanoid";
import { BulletEditor } from "./bullet-editor";

export function ProjectsFormList() {
    const { currentResume, updateSection } = useResumeStore();

    if (!currentResume) return null;

    const handleAdd = () => {
        updateSection("projects", [
            ...(currentResume.projects || []),
            {
                id: nanoid(),
                name: "",
                description: "",
                url: "",
                technologies: [],
                highlights: [""],
            },
        ]);
    };

    const handleRemove = (id: string) => {
        updateSection(
            "projects",
            currentResume.projects?.filter((proj) => proj.id !== id) || []
        );
    };

    const handleUpdate = (id: string, updatedProj: ProjectEntry) => {
        updateSection(
            "projects",
            currentResume.projects?.map((proj) => (proj.id === id ? updatedProj : proj)) || []
        );
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const items = [...(currentResume.projects || [])];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        updateSection("projects", items);
    };

    const moveDown = (index: number) => {
        const items = [...(currentResume.projects || [])];
        if (index === items.length - 1) return;
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        updateSection("projects", items);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Projects</h3>
                <Button onClick={handleAdd} size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Project
                </Button>
            </div>

            <div className="space-y-6">
                {currentResume.projects?.map((proj, index) => (
                    <ProjectsFormItem
                        key={proj.id}
                        index={index}
                        project={proj}
                        total={currentResume.projects?.length || 0}
                        onRemove={() => handleRemove(proj.id)}
                        onUpdate={(updatedProj) => handleUpdate(proj.id, updatedProj)}
                        onMoveUp={() => moveUp(index)}
                        onMoveDown={() => moveDown(index)}
                    />
                ))}
                {(!currentResume.projects || currentResume.projects.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No projects added yet. Click &quot;Add Project&quot; to start.
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectsFormItem({
    project,
    index,
    total,
    onRemove,
    onUpdate,
    onMoveUp,
    onMoveDown,
}: {
    project: ProjectEntry;
    index: number;
    total: number;
    onRemove: () => void;
    onUpdate: (updatedProj: ProjectEntry) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({
            ...project,
            [name]: value,
        });
    };

    const handleTechStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = e.target.value.split(",").map((t) => t.trim());
        onUpdate({
            ...project,
            technologies: arr,
        });
    };

    const handleBulletChange = (val: string, bIndex: number) => {
        const newBullets = [...(project.highlights || [])];
        newBullets[bIndex] = val;
        onUpdate({ ...project, highlights: newBullets });
    };

    const handleAddBullet = () => {
        onUpdate({ ...project, highlights: [...(project.highlights || []), ""] });
    };

    const handleRemoveBullet = (bIndex: number) => {
        onUpdate({
            ...project,
            highlights: project.highlights?.filter((_, i) => i !== bIndex),
        });
    };

    return (
        <div className="relative p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow group">
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onMoveUp}
                    disabled={index === 0}
                >
                    <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                >
                    <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={onRemove}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-6 md:pt-0">
                <div className="space-y-2">
                    <Label htmlFor={`name-${project.id}`}>Project Name</Label>
                    <Input
                        id={`name-${project.id}`}
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        placeholder="AI Resume Builder"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`url-${project.id}`}>Project URL</Label>
                    <Input
                        id={`url-${project.id}`}
                        name="url"
                        value={project.url || ""}
                        onChange={handleChange}
                        placeholder="https://github.com/..."
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`tech-${project.id}`}>Technologies (comma separated)</Label>
                    <Input
                        id={`tech-${project.id}`}
                        name="tech"
                        value={project.technologies?.join(", ") || ""}
                        onChange={handleTechStringChange}
                        placeholder="React, Next.js, Tailwind CSS"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Project Highlights</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddBullet}
                        className="h-8 text-xs gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add Highlight
                    </Button>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-muted">
                    {(project.highlights || []).map((bullet, bIndex) => (
                        <div key={bIndex} className="relative flex items-start gap-2 group/bullet">
                            <div className="mt-2 w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                            <div className="flex-1">
                                <BulletEditor
                                    value={bullet}
                                    onChange={(val) => handleBulletChange(val, bIndex)}
                                    onRemove={() => handleRemoveBullet(bIndex)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
