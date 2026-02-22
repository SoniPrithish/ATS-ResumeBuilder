import { describe, it, expect } from "vitest";
import { extractContact } from "@/modules/parser/contact-extractor";

describe("extractContact", () => {
  it("should extract full contact block with all fields", () => {
    const text = [
      "Jane Doe",
      "jane.doe@example.com",
      "(555) 123-4567",
      "San Francisco, CA",
      "https://linkedin.com/in/janedoe",
      "https://github.com/janedoe",
      "https://janedoe.dev",
    ].join("\n");

    const contact = extractContact(text);

    expect(contact.fullName).toBe("Jane Doe");
    expect(contact.email).toBe("jane.doe@example.com");
    expect(contact.phone).toBe("(555) 123-4567");
    expect(contact.location).toBe("San Francisco, CA");
    expect(contact.linkedin).toContain("linkedin.com/in/janedoe");
    expect(contact.github).toContain("github.com/janedoe");
    expect(contact.website).toBe("https://janedoe.dev");
  });

  it("should extract partial info (only name + email)", () => {
    const text = "John Smith\njohn@company.org\n\nExperience\nSenior Dev";

    const contact = extractContact(text);

    expect(contact.fullName).toBe("John Smith");
    expect(contact.email).toBe("john@company.org");
  });

  it("should return empty strings when no contact info found", () => {
    const text = "";

    const contact = extractContact(text);

    expect(contact.fullName).toBe("");
    expect(contact.email).toBe("");
  });

  it("should extract email in middle of text", () => {
    const text =
      "Developer | contact@dev.io | 555-123-4567\nNew York, NY";

    const contact = extractContact(text);

    expect(contact.email).toBe("contact@dev.io");
    expect(contact.phone).toBe("555-123-4567");
  });

  it("should handle multiple URLs (linkedin + github + portfolio)", () => {
    const text = [
      "Test User",
      "test@test.com",
      "https://linkedin.com/in/testuser | https://github.com/testuser | https://portfolio.dev",
    ].join("\n");

    const contact = extractContact(text);

    expect(contact.linkedin).toContain("linkedin.com/in/testuser");
    expect(contact.github).toContain("github.com/testuser");
    expect(contact.website).toBe("https://portfolio.dev");
  });

  it("should handle international phone format", () => {
    const text = "User Name\nemail@test.com\n+1 555 123 4567\nBoston, MA";

    const contact = extractContact(text);

    expect(contact.phone).toContain("555");
  });
});
