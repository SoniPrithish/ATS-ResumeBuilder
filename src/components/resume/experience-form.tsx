import { useResumeStore } from "@/stores/resume-store";
import { ExperienceEntry } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { BulletEditor } from "./bullet-editor";
import { nanoid } from "nanoid";

export function ExperienceFormList() {
    const { currentResume, updateSection } = useResumeStore();

    if (!currentResume) return null;

    const handleAdd = () => {
        updateSection("experience", [
            ...currentResume.experience,
            {
                id: nanoid(),
                company: "",
                title: "",
                startDate: "",
                endDate: "",
                current: false,
                bullets: [""],
            },
        ]);
    };

    const handleRemove = (id: string) => {
        updateSection(
            "experience",
            currentResume.experience.filter((exp) => exp.id !== id)
        );
    };

    const handleUpdate = (id: string, updatedExp: ExperienceEntry) => {
        updateSection(
            "experience",
            currentResume.experience.map((exp) => (exp.id === id ? updatedExp : exp))
        );
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const items = [...currentResume.experience];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        updateSection("experience", items);
    };

    const moveDown = (index: number) => {
        if (index === currentResume.experience.length - 1) return;
        const items = [...currentResume.experience];
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        updateSection("experience", items);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button onClick={handleAdd} size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Experience
                </Button>
            </div>

            <div className="space-y-6">
                {currentResume.experience.map((exp, index) => (
                    <ExperienceFormItem
                        key={exp.id}
                        index={index}
                        experience={exp}
                        total={currentResume.experience.length}
                        onRemove={() => handleRemove(exp.id)}
                        onUpdate={(updatedExp) => handleUpdate(exp.id, updatedExp)}
                        onMoveUp={() => moveUp(index)}
                        onMoveDown={() => moveDown(index)}
                    />
                ))}
                {currentResume.experience.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No work experience added yet. Click &quot;Add Experience&quot; to start.
                    </div>
                )}
            </div>
        </div>
    );
}

function ExperienceFormItem({
    experience,
    index,
    total,
    onRemove,
    onUpdate,
    onMoveUp,
    onMoveDown,
}: {
    experience: ExperienceEntry;
    index: number;
    total: number;
    onRemove: () => void;
    onUpdate: (updatedExp: ExperienceEntry) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        onUpdate({
            ...experience,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleCheckboxChange = (checked: boolean) => {
        onUpdate({
            ...experience,
            current: checked,
            endDate: checked ? "" : experience.endDate,
        });
    };

    const handleBulletChange = (val: string, bIndex: number) => {
        const newBullets = [...experience.bullets];
        newBullets[bIndex] = val;
        onUpdate({ ...experience, bullets: newBullets });
    };

    const handleAddBullet = () => {
        onUpdate({ ...experience, bullets: [...experience.bullets, ""] });
    };

    const handleRemoveBullet = (bIndex: number) => {
        onUpdate({
            ...experience,
            bullets: experience.bullets.filter((_, i) => i !== bIndex),
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
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onRemove}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-6 md:pt-0">
                <div className="space-y-2">
                    <Label htmlFor={`title-${experience.id}`}>Job Title</Label>
                    <Input
                        id={`title-${experience.id}`}
                        name="title"
                        value={experience.title}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`company-${experience.id}`}>Company</Label>
                    <Input
                        id={`company-${experience.id}`}
                        name="company"
                        value={experience.company}
                        onChange={handleChange}
                        placeholder="Google"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                    <Input
                        id={`startDate-${experience.id}`}
                        name="startDate"
                        value={experience.startDate}
                        onChange={handleChange}
                        placeholder="MM/YYYY"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                        <span htmlFor={`endDate-${experience.id}`}>End Date</span>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`current-${experience.id}`}
                                checked={experience.current}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label
                                htmlFor={`current-${experience.id}`}
                                className="text-xs font-normal"
                            >
                                I currently work here
                            </Label>
                        </div>
                    </Label>
                    <Input
                        id={`endDate-${experience.id}`}
                        name="endDate"
                        value={experience.current ? "Present" : (experience.endDate || "")}
                        onChange={handleChange}
                        placeholder="MM/YYYY"
                        disabled={experience.current}
                        className={experience.current ? "bg-muted text-muted-foreground" : ""}
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`location-${experience.id}`}>Location (Optional)</Label>
                    <Input
                        id={`location-${experience.id}`}
                        name="location"
                        value={experience.location || ""}
                        onChange={handleChange}
                        placeholder="San Francisco, CA"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Bullet Points</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddBullet}
                        className="h-8 text-xs gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add Bullet
                    </Button>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-muted">
                    {experience.bullets.map((bullet, bIndex) => (
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
