import React from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  BarChart3,
  Layers,
  Database,
  Settings2,
  PlugZap,
} from "lucide-react";


const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const Button = ({ as: Tag = "button", className = "", children, ...props }) => (
  <Tag
    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);


const theme = {
  primary: "#0F6FFF", 
  primarySoft: "#EAF2FF",
  accent: "#20B8FF",
  ink: "#1F2937",
  subtext: "#5B6B7A",
  surface: "#FFFFFF",
  muted: "#F5F7FA",
  ring: "#BFDBFE",
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: true, amount: 0.3 },
};

const SectionTitle = ({ eyebrow, title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto">
    {eyebrow && (
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primarySoft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
        <Sparkles size={14} /> {eyebrow}
      </div>
    )}
    <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">{title}</h2>
    {subtitle && <p className="mt-3 text-[var(--subtext)] leading-relaxed">{subtitle}</p>}
  </div>
);

export default function FluxLanding() {
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primarySoft", theme.primarySoft);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--ink", theme.ink);
    root.style.setProperty("--subtext", theme.subtext);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--ring", theme.ring);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <Navbar />
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <Stats />
      <Integrations />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100/80 backdrop-blur bg-white/75">
      <Container className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <div className="relative h-8 w-8 rounded-xl bg-[var(--primarySoft)]">
            <div className="absolute inset-0 m-[6px] rounded-lg bg-[var(--primary)]/90" />
          </div>
          <span className="text-[var(--ink)]">Flux <span className="text-[var(--primary)]">AI</span></span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--subtext)]">
          <a href="#features" className="hover:text-[var(--ink)]">Features</a>
          <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
          <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
          <a href="#faq" className="hover:text-[var(--ink)]">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button className="border border-slate-200 bg-white text-[var(--ink)] hover:bg-[var(--muted)]">Sign in</Button>
          <Button className="bg-[var(--primary)] text-white hover:bg-[var(--ink)]">
            Get Started <ArrowRight className="ml-1" size={16} />
          </Button>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,_#E6F0FF_0%,_transparent_55%)]" />
      <Container className="relative py-16 sm:py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primarySoft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Sparkles size={14} />
            Ship smarter, not harder
          </div>
          <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-6xl">
            Orchestrate data, models & pipelines at <span className="text-[var(--primary)]">Kaggle-clean</span> scale.
          </h1>
          <p className="mt-4 text-[var(--subtext)] text-lg">
            Flux AI is the sleek platform for training, evaluating, and shipping AI systems—
            optimized for speed, reproducibility, and collaboration.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button className="bg-[var(--primary)] text-white hover:bg-[var(--ink)]">
              Start free
            </Button>
            <Button className="border border-slate-200 bg-white text-[var(--ink)] hover:bg-[var(--muted)]">
              View docs
            </Button>
          </div>
        </motion.div>

       
        <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {[
            { icon: <Zap />, title: "Auto-optimize", body: "Hyperparameter search, pruning & distillation out of the box." },
            { icon: <ShieldCheck />, title: "Trust by design", body: "Versioned datasets, lineage, and guardrails baked in." },
            { icon: <BarChart3 />, title: "Insightful evals", body: "Live dashboards and slice-wise analytics for every run." },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primarySoft)] text-[var(--primary)]">{c.icon}</div>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-[var(--subtext)] mt-1">{c.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function LogosStrip() {
  return (
    <section className="py-10 border-t border-b border-slate-100 bg-[var(--muted)]/40">
      <Container className="flex flex-wrap items-center justify-center gap-8 opacity-70">
        {["OpenSource", "MLOps", "DataOps", "Security", "Cloud"]
          .map((name, i) => (
            <div key={i} className="text-sm font-semibold tracking-wide">
              {name}
            </div>
          ))}
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Layers />, title: "Unified pipeline graph",
      body: "Compose ETL, training, and eval steps as declarative nodes with automatic caching and retries.",
    },
    {
      icon: <Database />, title: "Versioned data lake",
      body: "Track dataset diffs, metrics, and lineage across experiments with zero boilerplate.",
    },
    {
      icon: <Settings2 />, title: "One-click deploy",
      body: "Promote models to APIs or batch jobs with rollback and A/B baked in.",
    },
    {
      icon: <ShieldCheck />, title: "Enterprise-grade controls",
      body: "SSO, RBAC, audit logs, PII scanners and policy rules to keep you compliant.",
    },
  ];
  return (
    <section id="features" className="py-20">
      <Container>
        <SectionTitle
          eyebrow="Why Flux AI"
          title="Everything you need to go from notebook → production"
          subtitle="Design like Kaggle. Operate like a cloud. Secure like an enterprise."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <motion.div key={i} {...fadeUp} className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--primarySoft)] text-[var(--primary)] grid place-items-center">
                  {it.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{it.title}</h3>
                  <p className="mt-2 text-[var(--subtext)]">{it.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Connect", body: "Point Flux at your repos, data buckets, and secrets.", icon: <PlugZap /> },
    { title: "Compose", body: "Drag blocks or define YAML to build your pipeline graph.", icon: <Layers /> },
    { title: "Train", body: "GPU-aware schedulers exploit spot, on-prem, or multi-cloud.", icon: <BrainCircuit /> },
    { title: "Ship", body: "Promote to serving with eval gates and canary rollouts.", icon: <ShieldCheck /> },
  ];
  return (
    <section id="how" className="py-20 bg-[var(--muted)]/40">
      <Container>
        <SectionTitle
          eyebrow="How it works"
          title="From zero to shipping in four steps"
          subtitle="No glue code. No yak shaving. Just outcomes."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={i} {...fadeUp} className="relative rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primarySoft)] text-[var(--primary)]">
                {s.icon}
              </div>
              <h4 className="font-semibold">{i + 1}. {s.title}</h4>
              <p className="mt-2 text-[var(--subtext)]">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const stats = [
    { k: "78%", v: "less boilerplate" },
    { k: "3×", v: "faster time-to-prod" },
    { k: "40%", v: "infra cost savings" },
    { k: "99.95%", v: "pipeline SLO" },
  ];
  return (
    <section className="py-16">
      <Container>
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-extrabold text-[var(--ink)]">{s.k}</div>
              <div className="text-xs uppercase tracking-wide text-[var(--subtext)]">{s.v}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Integrations() {
  const items = ["S3", "GCS", "Azure", "Snowflake", "Postgres", "Kafka", "Ray", "Kubernetes", "Weights&Biases", "OpenAI"];
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          eyebrow="Integrations"
          title="Works with your favorite stack"
          subtitle="Plug in data sources, schedulers, and observability without rewrites."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-[var(--subtext)] hover:border-[var(--ring)]"
            >
              {i}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "Flux AI trimmed our training cycles from days to hours while improving reproducibility.",
      name: "Priya S.", role: "ML Lead, Fintech",
    },
    {
      quote: "The eval dashboards catch regressions before customers do. Absolute game-changer.",
      name: "Mohit K.", role: "Head of Data, E-commerce",
    },
    {
      quote: "Enterprise guardrails let us scale without security headaches.",
      name: "Sana R.", role: "CISO, HealthTech",
    },
  ];
  return (
    <section className="py-20 bg-[var(--muted)]/40">
      <Container>
        <SectionTitle eyebrow="Loved by teams" title="What users are saying" />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.blockquote key={i} {...fadeUp} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[var(--ink)]">“{t.quote}”</p>
              <footer className="mt-4 text-sm text-[var(--subtext)]">{t.name} • {t.role}</footer>
            </motion.blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      blurb: "For solo builders exploring Flux AI.",
      features: ["2 projects", "3 seats", "Community support", "Shared GPU queue"],
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Team",
      price: "$49",
      blurb: "Ship production models with your team.",
      features: ["Unlimited projects", "Priority GPUs", "Role-based access", "Audit logs"],
      cta: "Try 14-day trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      blurb: "Advanced security & scale for orgs.",
      features: ["SSO/SAML", "VPC peering", "On-prem agent", "Dedicated support"],
      cta: "Contact sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <Container>
        <SectionTitle eyebrow="Pricing" title="Simple, transparent plans" subtitle="Start free. Scale as you grow." />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-6 bg-white ${
                t.highlighted ? "border-[var(--ring)] shadow-md" : "border-slate-200"
              }`}
            >
              {t.highlighted && (
                <span className="absolute -top-3 right-4 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-[var(--subtext)]">{t.blurb}</p>
              <div className="mt-4 text-3xl font-extrabold">{t.price}<span className="text-base font-medium text-[var(--subtext)]">/mo</span></div>
              <ul className="mt-4 space-y-2 text-sm">
                {t.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[var(--primary)]" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full bg-[var(--primary)] text-white hover:bg-[var(--ink)]">{t.cta}</Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Can I host Flux AI on-prem?", a: "Yes. Our on-prem agent connects securely to your cluster with zero egress of data by default." },
    { q: "Which clouds do you support?", a: "AWS, GCP, Azure today. Bring-your-own compute is supported via Kubernetes." },
    { q: "Is my data secure?", a: "Data never leaves your storage unless you opt in. RBAC, SSO, and detailed audit logs included." },
    { q: "Do you have a free tier?", a: "Yes—Starter is free with generous limits for makers and students." },
  ];
  return (
    <section id="faq" className="py-20 bg-[var(--muted)]/40">
      <Container>
        <SectionTitle eyebrow="FAQ" title="Answers to common questions" />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-medium">
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--primary)]" /> {f.q}
                </span>
              </summary>
              <p className="mt-3 text-[var(--subtext)]">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_400px_at_50%_-10%,_#E6FAFF_0%,_transparent_55%)]" />
      <Container className="relative">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold">Build like Kaggle. Ship like a pro.</h3>
          <p className="mt-3 text-[var(--subtext)]">Create your first pipeline in minutes and see results the same day.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button className="bg-[var(--primary)] text-white hover:bg-[var(--ink)]">Create account</Button>
            <Button className="border border-slate-200 bg-white text-[var(--ink)] hover:bg-[var(--muted)]">
              <Github size={16} className="mr-2" /> Star on GitHub
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  const links = [
    { h: "Product", items: ["Features", "Pricing", "Changelog", "Status"] },
    { h: "Company", items: ["About", "Careers", "Blog", "Contact"] },
    { h: "Resources", items: ["Docs", "Guides", "Security", "Support"] },
  ];
  return (
    <footer className="border-t border-slate-100 bg-white">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <div className="h-8 w-8 rounded-xl bg-[var(--primarySoft)]">
                <div className="m-[6px] h-[calc(100%-12px)] w-[calc(100%-12px)] rounded-lg bg-[var(--primary)]" />
              </div>
              Flux <span className="text-[var(--primary)]">AI</span>
            </div>
            <p className="mt-3 text-sm text-[var(--subtext)] max-w-xs">
              The Kaggle-inspired platform to design, train, and deploy AI at scale.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[var(--subtext)]">
              <a href="#" className="hover:text-[var(--ink)]"><Twitter size={18} /></a>
              <a href="#" className="hover:text-[var(--ink)]"><Linkedin size={18} /></a>
              <a href="#" className="hover:text-[var(--ink)]"><Github size={18} /></a>
            </div>
          </div>
          {links.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-[var(--ink)]">{col.h}</h4>
              <ul className="mt-3 space-y-2 text-sm text-[var(--subtext)]">
                {col.items.map((it, idx) => (
                  <li key={idx}><a href="#" className="hover:text-[var(--ink)]">{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold text-[var(--ink)]">Newsletter</h4>
            <p className="mt-3 text-sm text-[var(--subtext)]">Get product updates and tips.</p>
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 bg-[var(--muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <Button className="bg-[var(--primary)] text-white hover:bg-[var(--ink)]">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--subtext)]">
          <p>© {new Date().getFullYear()} Flux AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[var(--ink)]">Privacy</a>
            <a href="#" className="hover:text-[var(--ink)]">Terms</a>
            <a href="#" className="hover:text-[var(--ink)]">Security</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
