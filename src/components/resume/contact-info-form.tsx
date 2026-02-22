import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactInfoForm() {
    const { currentResume, updateSection } = useResumeStore();

    if (!currentResume) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateSection("contactInfo", {
            ...currentResume.contactInfo,
            [name]: value
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        value={currentResume.contactInfo.fullName || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={currentResume.contactInfo.email || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={currentResume.contactInfo.phone || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        value={currentResume.contactInfo.location || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                        id="linkedin"
                        name="linkedin"
                        value={currentResume.contactInfo.linkedin || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                        id="github"
                        name="github"
                        value={currentResume.contactInfo.github || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Personal Website / Portfolio</Label>
                    <Input
                        id="website"
                        name="website"
                        value={currentResume.contactInfo.website || currentResume.contactInfo.portfolio || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
}
