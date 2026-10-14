import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  Code2,
  GitBranch,
  Github,
  Lock,
  Mail,
  Map,
  MessageSquareCode,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepoPilot — AI-powered codebase understanding for developers" },
      {
        name: "description",
        content:
          "Connect a GitHub repository, ask a question in plain English, and RepoPilot finds the relevant code and explains how it works.",
      },
      { property: "og:title", content: "RepoPilot — Understand any codebase. Ask questions. Ship faster." },
      {
        property: "og:description",
        content:
          "AI-powered codebase assistant that helps developers understand unfamiliar repositories without spending hours reading through files.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const capabilities = [
  {
    icon: BookOpenText,
    title: "Understand unfamiliar codebases",
    body: "Get oriented in a new repo in minutes instead of days of reading files.",
  },
  {
    icon: Search,
    title: "Find where functionality lives",
    body: "Locate the exact implementation of any feature, endpoint, or behavior.",
  },
  {
    icon: Workflow,
    title: "Explain architecture & data flows",
    body: "See how the pieces fit together — from request to database and back.",
  },
  {
    icon: GitBranch,
    title: "Trace features across files",
    body: "Follow a feature as it threads through components, services, and stores.",
  },
  {
    icon: Map,
    title: "Find where to make changes",
    body: "Know exactly which files to touch before you write a single line.",
  },
  {
    icon: Code2,
    title: "Answers with source references",
    body: "Every answer cites the relevant files, so you can verify and dive deeper.",
  },
];

const terminalLines = [
  { prompt: true, text: 'repopilot ask "where is user authentication handled?"' },
  { prompt: false, text: "Analyzing repository… 214 files indexed" },
  { prompt: false, text: "" },
  { prompt: false, text: "Authentication is handled in 3 places:", accent: true },
  { prompt: false, text: "  1. src/auth/session.ts — creates & validates JWTs" },
  { prompt: false, text: "  2. src/middleware/requireAuth.ts — guards routes" },
  { prompt: false, text: "  3. src/routes/login.tsx — credentials → session" },
  { prompt: false, text: "" },
  { prompt: false, text: "Login posts to /api/auth, which calls createSession()", dim: true },
  { prompt: false, text: "in session.ts. The token is stored as an httpOnly", dim: true },
  { prompt: false, text: "cookie and checked by requireAuth on every request.", dim: true },
];

const faqs = [
  {
    icon: Github,
    question: "How does RepoPilot connect to my GitHub repository?",
    answer:
      "You connect through GitHub's official OAuth sign-in flow, and you choose exactly which repositories to share. RepoPilot requests read-only access only — it can never push, modify, or delete code — and you can revoke access from your GitHub settings at any time.",
  },
  {
    icon: MessageSquareCode,
    question: "How does RepoPilot answer questions about my codebase?",
    answer:
      "When you ask a question in plain English, RepoPilot searches your repository for the files, functions, and call paths relevant to it. Claude then reasons over that focused context and produces an explanation with citations to the exact files and lines, so you can verify every answer against the source.",
  },
  {
    icon: ShieldCheck,
    question: "How is my repository data protected?",
    answer:
      "Access is strictly read-only, and your code is encrypted in transit and at rest. Repository data is never used to train AI models, indexed data stays isolated to your workspace, and removing a repository erases its index immediately.",
  },
  {
    icon: Lock,
    question: "Who can see the code I connect?",
    answer:
      "Only you. Your repositories and the answers RepoPilot generates are private to your account, are not shared with other users, and can be permanently deleted whenever you want.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3 text-left">
      {faqs.map((faq, i) => (
        <div key={faq.question} className="rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 p-6 text-left"
          >
            <span className="flex items-center gap-3 font-semibold tracking-tight">
              <faq.icon className="size-5 shrink-0 text-primary" />
              {faq.question}
            </span>
            <ChevronDown
              className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <p className="px-6 pb-6 pl-14 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function BetaSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError("Please enter your name (up to 100 characters).");
      return;
    }
    if (
      trimmedEmail.length > 255 ||
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("beta_signups")
      .insert({ name: trimmedName, email: trimmedEmail });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong — please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-xl border border-primary/40 bg-accent p-8 text-center">
        <p className="font-display text-lg font-semibold text-accent-foreground">
          You're on the list!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks, {name.trim()} — we'll reach out at {email.trim()} with your beta invite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto mt-10 max-w-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          aria-label="Your name"
          className="h-12 flex-1 rounded-lg border border-border bg-terminal px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={255}
          aria-label="Your email address"
          className="h-12 flex-1 rounded-lg border border-border bg-terminal px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Requesting…" : "Request access"}
          <ArrowRight className="size-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">RepoPilot</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#capabilities" className="transition-colors hover:text-foreground">Capabilities</a>
            <a href="#status" className="transition-colors hover:text-foreground">Status</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Join the beta
            <ArrowRight className="size-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="grid-bg absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              MVP — Private Beta
            </div>
            <h1
              className="font-display mt-8 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Understand any codebase.{" "}
              <span className="text-primary text-glow">Ask questions.</span>{" "}
              Ship faster.
            </h1>
            <p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              RepoPilot is an AI-powered codebase assistant that helps developers
              understand unfamiliar repositories without spending hours reading
              through files.
            </p>
            <p
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              Connect a GitHub repository, ask a question in plain English, and
              RepoPilot finds the relevant code and explains how it works.
            </p>
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Request beta access
                <ArrowRight className="size-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Github className="size-4" />
                View on GitHub
              </a>
            </div>
          </div>

          {/* Terminal demo */}
          <div
            className="mx-auto mt-20 max-w-3xl animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            <div className="overflow-hidden rounded-xl border border-terminal-border bg-terminal shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-terminal-border px-4 py-3">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-muted-foreground/40" />
                <span className="size-3 rounded-full bg-primary/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  repopilot — zsh
                </span>
              </div>
              <div className="p-5 font-mono text-sm leading-7">
                {terminalLines.map((line, i) => (
                  <div key={i} className="flex">
                    {line.prompt && (
                      <span className="mr-2 select-none text-primary">❯</span>
                    )}
                    <span
                      className={
                        line.accent
                          ? "text-primary"
                          : line.dim
                            ? "text-muted-foreground"
                            : "text-foreground/90"
                      }
                    >
                      {line.text || "\u00A0"}
                    </span>
                  </div>
                ))}
                <div className="flex">
                  <span className="mr-2 select-none text-primary">❯</span>
                  <span className="inline-block h-5 w-2.5 translate-y-1 bg-primary animate-cursor-blink" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-sm text-primary">// capabilities</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              What RepoPilot can do
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <cap.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold tracking-tight">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cap.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built with Claude */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-8 rounded-2xl border border-border bg-card p-10 md:flex-row md:items-center md:justify-between md:p-14">
            <div className="max-w-xl">
              <p className="font-mono text-sm text-primary">// under the hood</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight">
                Built with Claude
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                RepoPilot uses Claude for advanced code understanding and
                reasoning across large codebases.
              </p>
            </div>
            <div className="font-mono rounded-xl border border-terminal-border bg-terminal px-6 py-5 text-sm">
              <div className="text-muted-foreground">$ repopilot status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-foreground">claude · connected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-sm text-primary">// faq</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              How RepoPilot connects to GitHub, answers your questions, and keeps your code safe.
            </p>
          </div>
          <Faq />
        </div>
      </section>

      {/* Status + Founder + GitHub */}
      <section id="status" className="border-t border-border/60 py-24">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="font-mono text-sm text-primary">// status</p>
            <h3 className="font-display mt-3 text-xl font-bold tracking-tight">
              MVP — Private Beta
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We are currently testing RepoPilot with a small group of developers
              and improving its codebase analysis and GitHub integration.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="font-mono text-sm text-primary">// founder</p>
            <h3 className="font-display mt-3 text-xl font-bold tracking-tight">
              [Your Name]
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Founder, RepoPilot</p>
            <a
              href="mailto:hello@repopilot.dev"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="size-4" />
              [Your Email]
            </a>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="font-mono text-sm text-primary">// open source</p>
            <h3 className="font-display mt-3 text-xl font-bold tracking-tight">
              GitHub
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              View the project and follow development on GitHub.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Github className="size-4" />
              [GitHub Repository]
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="border-t border-border/60 py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Interested in trying RepoPilot{" "}
            <span className="text-primary">or joining the beta?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Get in touch and we'll get you set up with early access.
          </p>
          <BetaSignupForm />
          <p className="mt-6 text-sm text-muted-foreground">
            Prefer email? Write to us at{" "}
            <a href="mailto:hello@repopilot.dev" className="text-primary hover:underline">
              hello@repopilot.dev
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </span>
            <span className="font-display font-semibold tracking-tight">RepoPilot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered codebase understanding for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
