import type { CanonicalResume } from "@/types/resume";

export const PARSED_RESUME: CanonicalResume = {
  contactInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "",
    github: "",
    website: "",
  },
  summary:
    "Senior software engineer with 6+ years building scalable web platforms.",
  experience: [
    {
      id: "exp-1",
      company: "Acme Inc.",
      title: "Senior Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      current: true,
      bullets: [
        "Built TypeScript services handling 10k requests/second.",
        "Reduced cloud spend by 28% with query and cache tuning.",
      ],
      technologies: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Example",
      degree: "B.S. Computer Science",
      field: "Computer Science",
      startDate: "",
      endDate: "2019",
      gpa: "",
      honors: [],
      coursework: [],
    },
  ],
  skills: {
    technical: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    soft: [],
    tools: [],
    languages: [],
    certifications: [],
  },
  projects: [],
  certifications: [],
  customSections: [],
};
