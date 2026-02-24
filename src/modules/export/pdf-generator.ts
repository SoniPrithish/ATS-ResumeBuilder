import React, { createElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/modules/export/templates/classic";
import { ModernTemplate } from "@/modules/export/templates/modern";
import { MinimalTemplate } from "@/modules/export/templates/minimal";
import {
  TEMPLATE_CONFIGS,
  type ExportOptions,
  type ExportResult,
} from "@/modules/export/types";
import type { CanonicalResume } from "@/types/resume";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function generatePdf(
  resume: CanonicalResume,
  options: ExportOptions,
): Promise<ExportResult> {
  const hasData =
    resume.contactInfo.fullName ||
    resume.summary ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    Object.values(resume.skills).some((arr) => arr.length > 0);

  if (!hasData) {
    throw new Error("EXPORT_EMPTY_RESUME");
  }

  const config = { ...TEMPLATE_CONFIGS[options.templateId] };
  if (!config) {
    throw new Error(`EXPORT_UNSUPPORTED_TEMPLATE: ${options.templateId}`);
  }

  if (options.colorAccent) {
    config.colors = { ...config.colors, accent: options.colorAccent };
  }

  let templateContent: React.ReactElement;
  if (options.templateId === "classic") {
    templateContent = createElement(ClassicTemplate, { resume, config });
  } else if (options.templateId === "modern") {
    templateContent = createElement(ModernTemplate, { resume, config });
  } else if (options.templateId === "minimal") {
    templateContent = createElement(MinimalTemplate, { resume, config });
  } else {
    throw new Error(`EXPORT_UNSUPPORTED_TEMPLATE: ${options.templateId}`);
  }

  let buffer: Buffer;
  try {
    const renderPromise = renderToBuffer(
      templateContent as unknown as React.ReactElement<DocumentProps>,
    );
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("EXPORT_TIMEOUT")), 30_000),
    );
    buffer = await Promise.race([renderPromise, timeoutPromise]);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EXPORT_TIMEOUT") {
      throw err;
    }
    throw new Error(
      `EXPORT_RENDER_FAILED: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const baseName = slugify(resume.contactInfo.fullName || "resume");
  const timestamp = Date.now();
  const fileName = `${baseName}_${options.templateId}_${timestamp}.pdf`;

  return {
    buffer,
    fileName,
    mimeType: "application/pdf",
    sizeBytes: buffer.length,
  };
}
