import { PageHeader } from "@/components/shared/page-header";
import { UploadDropzone } from "@/components/resume/upload-dropzone";

export default function UploadPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
            <PageHeader
                title="Upload Resume"
                description="Upload your existing resume to let TechResume AI analyze and optimize it."
            />

            <div className="bg-muted/30 border rounded-2xl p-8 md:p-12 mt-8">
                <h2 className="text-2xl font-bold text-center mb-2">Let AI parse your resume</h2>
                <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
                    We extract your contact info, experience, education, and skills automatically so you don&apos;t have to type them.
                </p>

                <UploadDropzone />
            </div>

            <div className="mt-12 space-y-4 border-t pt-8">
                <h3 className="font-semibold text-lg">What happens next?</h3>
                <ul className="space-y-4">
                    <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">1</div>
                        <div>
                            <p className="font-medium">Information Extraction</p>
                            <p className="text-sm text-muted-foreground">Our AI extracts content from your resume and structures it.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">2</div>
                        <div>
                            <p className="font-medium">ATS Scoring</p>
                            <p className="text-sm text-muted-foreground">We instantly calculate your resume&apos;s ATS score based on industry standards.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">3</div>
                        <div>
                            <p className="font-medium">AI Optimization</p>
                            <p className="text-sm text-muted-foreground">You can review, edit and use AI to optimize bullet points and keywords.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}
