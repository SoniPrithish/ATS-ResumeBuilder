import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TechResume AI — Free AI-Powered Resume Builder",
    template: "%s | TechResume AI",
  },
  description:
    "Build ATS-friendly resumes with AI. Get instant feedback, match your resume to job descriptions, and optimize for applicant tracking systems — completely free.",
  keywords: [
    "resume builder",
    "ATS resume",
    "AI resume",
    "resume optimizer",
    "job application",
    "career tools",
  ],
  authors: [{ name: "TechResume AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TechResume AI",
    title: "TechResume AI — Free AI-Powered Resume Builder",
    description:
      "Build ATS-friendly resumes with AI. Instant feedback, job matching, and optimization.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechResume AI — Free AI-Powered Resume Builder",
    description:
      "Build ATS-friendly resumes with AI. Instant feedback, job matching, and optimization.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
