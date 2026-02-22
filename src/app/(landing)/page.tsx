"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Sparkles, LayoutTemplate, Activity, CopyCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Code2 className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                            TechResume <span className="font-light">AI</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild className="hidden sm:flex">
                            <Link href="/login">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    {/* Background Decor */}
                    <div className="absolute inset-0 z-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[size:40px_40px]">
                        <div className="absolute inset-0 bg-background [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                    </div>

                    <div className="container relative z-10 px-6 mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-6 text-primary border-primary/20 bg-primary/10">
                                <Sparkles className="mr-2 h-4 w-4" /> The Next Generation Resume Builder
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 mt-4">
                                Crack the <span className="text-primary relative inline-block">ATS<span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 rotate-1"></span></span>.<br className="hidden sm:block" /> Land the Interview.
                            </h1>
                            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
                                Build perfect, ATS-optimized software engineering resumes faster than ever. Tailor your experience to any job description with one click.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all w-full sm:w-auto hover:translate-y-[-2px]" asChild>
                                <Link href="/login">
                                    Build Your Resume Free <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium w-full sm:w-auto bg-background/50 hover:bg-background/80" asChild>
                                <Link href="/login">
                                    <Activity className="mr-2 h-5 w-5" /> Score Existing Resume
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Features Preview */}
                <section className="py-24 bg-muted/30 relative">
                    <div className="container px-6 mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built for Developers</h2>
                            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                Stop tweaking Microsoft Word templates. Start engineering your career.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: LayoutTemplate,
                                    title: "Harvard-Style Formats",
                                    description: "Use battle-tested templates guaranteed to parse correctly in Workday, Greenhouse, and Lever."
                                },
                                {
                                    icon: CopyCheck,
                                    title: "JD Match Analytics",
                                    description: "Compare your resume directly against the job description to find missing keywords before you apply."
                                },
                                {
                                    icon: Sparkles,
                                    title: "AI Bullet Optimization",
                                    description: "Transform weak bullet points into impactful, metric-driven achievements using our specialized AI."
                                }
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <f.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Proof/Social */}
                <section className="py-24 border-t">
                    <div className="container px-6 mx-auto text-center space-y-12">
                        <h2 className="text-2xl font-semibold opacity-80">Join engineers hired at</h2>
                        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Logos would go here, using simple text for now */}
                            <span className="text-2xl font-bold font-serif italic">google</span>
                            <span className="text-2xl font-bold tracking-tighter">META</span>
                            <span className="text-2xl font-bold">netflix</span>
                            <span className="text-2xl font-bold flex items-center"><span className="text-xl">a</span>mazon</span>
                            <span className="text-2xl font-medium tracking-wide border-2 border-current px-2 rounded-lg">STRIPE</span>
                        </div>

                        <div className="max-w-2xl mx-auto pt-12">
                            <div className="grid grid-cols-2 gap-8 text-center divide-x">
                                <div className="space-y-2">
                                    <p className="text-4xl font-bold text-primary">10x</p>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faster the tailoring</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-4xl font-bold text-primary">85%+</p>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Interview Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
