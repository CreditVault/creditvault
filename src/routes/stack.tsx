import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Rocket } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { CountUp } from "@/components/site/charts";
import { LISTINGS, type Listing } from "@/lib/listings";
import { estimateForListings, formatUsd } from "@/lib/estimate";

export const Route = createFileRoute("/stack")({
  head: () => ({
    meta: [
      { title: "Startup stack builder · CreditVault" },
      { name: "description", content: "Pick your startup type and get a recommended stack — cloud, database, auth, AI, payments — with every credit available." },
    ],
  }),
  component: StackPage,
});

type StartupType = "ai" | "saas" | "healthcare" | "fintech" | "edtech" | "marketplace";

const TYPE_META: Record<StartupType, { label: string; hint: string; keywords: string[] }> = {
  ai: { label: "AI Startup", hint: "LLMs, agents, model APIs", keywords: ["ai", "openai", "anthropic", "gpu", "ml"] },
  saas: { label: "SaaS", hint: "Product-led SaaS", keywords: ["saas", "b2b", "product"] },
  healthcare: { label: "Healthcare", hint: "HIPAA-friendly stacks", keywords: ["health", "hipaa"] },
  fintech: { label: "FinTech", hint: "Payments, banking, ledger", keywords: ["fintech", "payment", "bank"] },
  edtech: { label: "EdTech", hint: "Learning platforms", keywords: ["edu", "learning", "student"] },
  marketplace: { label: "Marketplace", hint: "Two-sided marketplaces", keywords: ["marketplace", "commerce"] },
};

type Layer = {
  key: string;
  label: string;
  hint: string;
  match: (l: Listing) => boolean;
};

const LAYERS: Layer[] = [
  { key: "cloud", label: "Cloud provider", hint: "Compute, networking, edge", match: (l) => l.category === "Cloud" },
  { key: "db", label: "Database", hint: "Primary datastore", match: (l) => l.category === "Database" },
  { key: "auth", label: "Authentication", hint: "Users, sessions, SSO", match: (l) => /auth|clerk|workos|supabase/i.test(l.brand + " " + l.tags.join(" ")) },
  { key: "pay", label: "Payments", hint: "Billing & checkout", match: (l) => l.category === "Finance" || /stripe|paddle|lemon/i.test(l.brand) },
  { key: "email", label: "Email", hint: "Transactional email", match: (l) => l.category === "Email" || /resend|postmark|sendgrid/i.test(l.brand) },
  { key: "monitor", label: "Monitoring", hint: "Errors + logs + APM", match: (l) => /sentry|datadog|logtail|logrocket|posthog/i.test(l.brand) },
  { key: "storage", label: "Storage & CDN", hint: "Object storage, CDN", match: (l) => /r2|s3|storage|cdn|cloudflare|bunny/i.test(l.brand + " " + l.tags.join(" ")) },
  { key: "analytics", label: "Analytics", hint: "Product + web analytics", match: (l) => l.category === "Analytics" },
  { key: "ai", label: "AI models", hint: "LLMs & multimodal", match: (l) => l.category === "AI & ML" },
  { key: "hosting", label: "Hosting", hint: "Frontend hosting", match: (l) => /vercel|netlify|render|fly|railway/i.test(l.brand) },
];

function StackPage() {
  const [type, setType] = useState<StartupType>("saas");

  const picks = useMemo(() => {
    const kw = TYPE_META[type].keywords;
    return LAYERS.map((layer) => {
      const pool = LISTINGS.filter((l) => layer.match(l));
      const boosted = pool
        .map((l) => {
          const hay = (l.brand + " " + l.tagline + " " + l.tags.join(" ")).toLowerCase();
          let score = l.featured ? 3 : 1;
          for (const k of kw) if (hay.includes(k)) score += 5;
          return { l, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => x.l);
      return { layer, picks: boosted };
    });
  }, [type]);

  const allPicks = picks.flatMap((p) => p.picks);
  const totalValue = estimateForListings(allPicks);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Startup stack builder"
        title="A recommended stack — and every credit for it."
        subtitle="Pick your startup type. We assemble a modern stack across cloud, DB, auth, payments, AI and monitoring — with the credit programs that fund each layer."
      />

      <section className="container-x py-10">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TYPE_META) as StartupType[]).map((k) => (
            <button
              key={k}
              onClick={() => setType(k)}
              className={
                "rounded-full border px-3 py-1.5 text-[12px] transition " +
                (type === k
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground")
              }
            >
              {TYPE_META[k].label}
            </button>
          ))}
        </div>

        <GlassCard className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Estimated stack credits</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              <CountUp value={totalValue} format={formatUsd} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended for <span className="text-foreground">{TYPE_META[type].label}</span> · {TYPE_META[type].hint}
            </p>
          </div>
          <Link to="/calculator" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium transition hover:border-white/20">
            Full calculator <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>

        <div className="mt-6 space-y-8">
          {picks.map(({ layer, picks }) => (
            <div key={layer.key}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                    <Rocket className="mr-1 inline h-3 w-3" /> {layer.label}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{layer.hint}</h3>
                </div>
              </div>
              {picks.length === 0 ? (
                <GlassCard>
                  <p className="text-sm text-muted-foreground">No matching programs in the vault yet.</p>
                </GlassCard>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {picks.map((l) => <ListingCard key={l.slug} l={l} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
