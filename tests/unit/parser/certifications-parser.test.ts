import { describe, it, expect } from "vitest";
import { parseCertifications } from "@/modules/parser/certifications-parser";

describe("parseCertifications", () => {
  it("should parse standard certifications", () => {
    const text = [
      "AWS Solutions Architect - Associate",
      "Issued by Amazon Web Services",
      "March 2023",
    ].join("\n");

    const certs = parseCertifications(text);

    expect(certs.length).toBe(1);
    expect(certs[0].name).toContain("AWS");
    expect(certs[0].issuer).toContain("Amazon");
  });

  it("should parse multiple certifications", () => {
    const text = [
      "AWS Solutions Architect",
      "",
      "Google Cloud Professional",
      "",
      "Certified Kubernetes Administrator",
    ].join("\n");

    const certs = parseCertifications(text);

    expect(certs.length).toBe(3);
  });

  it("should handle minimal info", () => {
    const text = "PMP Certification";

    const certs = parseCertifications(text);

    expect(certs.length).toBe(1);
    expect(certs[0].name).toContain("PMP");
  });

  it("should return empty array for empty text", () => {
    expect(parseCertifications("")).toEqual([]);
  });

  it("should extract credential URL", () => {
    const text = [
      "AWS Solutions Architect",
      "https://aws.amazon.com/verify/123",
      "Credential ID: AWS-123-ABC",
    ].join("\n");

    const certs = parseCertifications(text);

    expect(certs.length).toBe(1);
    expect(certs[0].url).toContain("aws.amazon.com");
    expect(certs[0].credentialId).toBe("AWS-123-ABC");
  });
});
