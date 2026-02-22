import { useResumeStore } from "@/stores/resume-store";
import { EducationEntry } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { nanoid } from "nanoid";

export function EducationFormList() {
    const { currentResume, updateSection } = useResumeStore();

    if (!currentResume) return null;

    const handleAdd = () => {
        updateSection("education", [
            ...currentResume.education,
            {
                id: nanoid(),
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                gpa: "",
                coursework: [],
            },
        ]);
    };

    const handleRemove = (id: string) => {
        updateSection(
            "education",
            currentResume.education.filter((edu) => edu.id !== id)
        );
    };

    const handleUpdate = (id: string, updatedEdu: EducationEntry) => {
        updateSection(
            "education",
            currentResume.education.map((edu) => (edu.id === id ? updatedEdu : edu))
        );
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const items = [...currentResume.education];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        updateSection("education", items);
    };

    const moveDown = (index: number) => {
        if (index === currentResume.education.length - 1) return;
        const items = [...currentResume.education];
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        updateSection("education", items);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button onClick={handleAdd} size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Education
                </Button>
            </div>

            <div className="space-y-6">
                {currentResume.education.map((edu, index) => (
                    <EducationFormItem
                        key={edu.id}
                        index={index}
                        education={edu}
                        total={currentResume.education.length}
                        onRemove={() => handleRemove(edu.id)}
                        onUpdate={(updatedEdu) => handleUpdate(edu.id, updatedEdu)}
                        onMoveUp={() => moveUp(index)}
                        onMoveDown={() => moveDown(index)}
                    />
                ))}
                {currentResume.education.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No education added yet. Click &quot;Add Education&quot; to start.
                    </div>
                )}
            </div>
        </div>
    );
}

function EducationFormItem({
    education,
    index,
    total,
    onRemove,
    onUpdate,
    onMoveUp,
    onMoveDown,
}: {
    education: EducationEntry;
    index: number;
    total: number;
    onRemove: () => void;
    onUpdate: (updatedEdu: EducationEntry) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({
            ...education,
            [name]: value,
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
                    <Label htmlFor={`institution-${education.id}`}>Institution</Label>
                    <Input
                        id={`institution-${education.id}`}
                        name="institution"
                        value={education.institution}
                        onChange={handleChange}
                        placeholder="University of Washington"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`degree-${education.id}`}>Degree</Label>
                    <Input
                        id={`degree-${education.id}`}
                        name="degree"
                        value={education.degree}
                        onChange={handleChange}
                        placeholder="Bachelor of Science"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`field-${education.id}`}>Field of Study</Label>
                    <Input
                        id={`field-${education.id}`}
                        name="field"
                        value={education.field}
                        onChange={handleChange}
                        placeholder="Computer Science"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`gpa-${education.id}`}>GPA (Optional)</Label>
                    <Input
                        id={`gpa-${education.id}`}
                        name="gpa"
                        value={education.gpa || ""}
                        onChange={handleChange}
                        placeholder="3.8/4.0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`startDate-${education.id}`}>Start Date</Label>
                    <Input
                        id={`startDate-${education.id}`}
                        name="startDate"
                        value={education.startDate}
                        onChange={handleChange}
                        placeholder="MM/YYYY"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`endDate-${education.id}`}>End Date</Label>
                    <Input
                        id={`endDate-${education.id}`}
                        name="endDate"
                        value={education.endDate || ""}
                        onChange={handleChange}
                        placeholder="MM/YYYY or Expected MM/YYYY"
                    />
                </div>
            </div>
        </div>
    );
}
