export const SAMPLE_SOFTWARE_ENGINEER_JD = `
Senior Software Engineer at TechCorp

About the role
We are building core platform services for millions of users.

Requirements
- 5+ years of professional software engineering experience
- Strong Python and React experience
- PostgreSQL and AWS hands-on experience
- Docker and CI/CD pipeline implementation
- Strong understanding of REST APIs and microservices

Preferred Qualifications
- Kubernetes in production environments
- Terraform and infrastructure as code
- GraphQL API design
- TypeScript for frontend platforms

Responsibilities
- Design, build, and maintain scalable backend services
- Collaborate with product and design on roadmap delivery
- Build highly reliable APIs with strong observability
- Improve release velocity through CI/CD automation
- Mentor engineers and review architecture decisions
- Participate in on-call and incident response
`;

export const EXPECTED_JD_KEYWORDS = {
    hardSkills: ["python", "react", "postgresql", "aws", "graphql", "typescript"],
    tools: ["docker", "kubernetes", "terraform"],
};

export const EXPECTED_MATCH_WITH_SAMPLE_RESUME = {
    minOverallScore: 40,
    maxOverallScore: 95,
    shouldIncludeMissing: ["kubernetes", "terraform"],
};
