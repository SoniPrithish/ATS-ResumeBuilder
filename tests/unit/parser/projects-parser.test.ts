import { describe, it, expect } from "vitest";
import { parseProjects } from "@/modules/parser/projects-parser";

describe("parseProjects", () => {
  it("should parse standard project with name, tech, bullets", () => {
    const text = [
      "E-Commerce Platform (React, Node.js, PostgreSQL)",
      "- Built full-stack web application",
      "- Implemented payment processing",
      "- Deployed to AWS",
    ].join("\n");

    const projects = parseProjects(text);

    expect(projects.length).toBe(1);
    expect(projects[0].name).toContain("E-Commerce");
    expect(projects[0].technologies.length).toBeGreaterThanOrEqual(2);
    expect(projects[0].highlights!.length).toBe(3);
  });

  it("should parse project with URL", () => {
    const text = [
      "My Open Source Tool",
      "https://github.com/user/tool",
      "- Featured in tech blogs",
    ].join("\n");

    const projects = parseProjects(text);

    expect(projects.length).toBe(1);
    expect(projects[0].name).toContain("Open Source");
  });

  it("should parse multiple projects", () => {
    const text = [
      "Project Alpha (React, TypeScript)",
      "- Built dashboard",
      "- Added charts",
      "",
      "Project Beta (Python, Flask)",
      "- Created API",
      "- Added auth",
    ].join("\n");

    const projects = parseProjects(text);

    expect(projects.length).toBe(2);
  });

  it("should handle minimal info", () => {
    const text = "Side Project";

    const projects = parseProjects(text);

    expect(projects.length).toBe(1);
    expect(projects[0].name).toBe("Side Project");
  });

  it("should return empty array for empty text", () => {
    expect(parseProjects("")).toEqual([]);
  });
});
