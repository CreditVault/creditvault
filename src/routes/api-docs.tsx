import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useState } from "react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { LISTINGS } from "@/lib/listings";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "Public API · CreditVault" },
      { name: "description", content: "Query CreditVault programmatically — companies, programs, credits, categories and search." },
    ],
  }),
  component: ApiDocsPage,
});

const ENDPOINTS: { method: "GET"; path: string; desc: string; example: string }[] = [
  { method: "GET", path: "/api/v1/companies", desc: "List every company in the vault.", example: `[{ "brand": "AWS", "slug": "aws-activate", "audience": "startup" }]` },
  { method: "GET", path: "/api/v1/programs", desc: "All programs with credit values.", example: `[{ "brand": "AWS", "value": "$100K credits", "audience": "startup" }]` },
  { method: "GET", path: "/api/v1/credits", desc: "Credit-bearing offers only.", example: `[{ "brand": "OpenAI", "value": "$1K credits" }]` },
  { method: "GET", path: "/api/v1/student", desc: "Student-only offers.", example: `[{ "brand": "GitHub Student Pack", "value": "Free" }]` },
  { method: "GET", path: "/api/v1/startup", desc: "Startup-only programs.", example: `[{ "brand": "Google for Startups", "value": "$200K" }]` },
  { method: "GET", path: "/api/v1/cloud", desc: "Cloud credit programs.", example: `[{ "brand": "Cloudflare for Startups", "value": "$250K" }]` },
  { method: "GET", path: "/api/v1/ai", desc: "AI & ML credit programs.", example: `[{ "brand": "Anthropic Startups", "value": "$25K" }]` },
  { method: "GET", path: "/api/v1/categories", desc: "Category taxonomy + counts.", example: `[{ "name": "Cloud", "count": 42 }]` },
  { method: "GET", path: "/api/v1/search?q=…", desc: "Free-text search across brand, tags and description.", example: `{ "results": [{ "brand": "Supabase" }] }` },
  { method: "GET", path: "/api/v1/compare?slugs=a,b,c", desc: "Compare two or more programs side-by-side.", example: `{ "programs": [/* … */] }` },
];

function ApiDocsPage() {
  const example = LISTINGS[0];
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (t: string, id: string) => {
    await navigator.clipboard.writeText(t);
    setCopied(id);
    setTimeout(() => setCopied(null), 1400);
  };

  const curl = `curl https://vault001.lovable.app/api/v1/programs`;

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Public API"
        title="Query the vault from anywhere."
        subtitle="A read-only JSON API for the entire CreditVault directory. Free to use, no auth required."
      />

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {ENDPOINTS.map((e) => (
              <GlassCard key={e.path}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-400/15 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                      {e.method}
                    </span>
                    <code className="text-[13px] text-foreground">{e.path}</code>
                  </div>
                  <button
                    onClick={() => copy(e.path, e.path)}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-muted-foreground hover:border-white/20 hover:text-foreground"
                  >
                    <Copy className="h-3 w-3" /> {copied === e.path ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{e.desc}</p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.05] bg-black/40 p-3 font-mono text-[11px] text-foreground/80">
{e.example}
                </pre>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Quick start</p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.05] bg-black/40 p-3 font-mono text-[11px] text-foreground/80">
{curl}
              </pre>
              <button
                onClick={() => copy(curl, "curl")}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-muted-foreground hover:border-white/20 hover:text-foreground"
              >
                <Copy className="h-3 w-3" /> {copied === "curl" ? "Copied" : "Copy"}
              </button>
              <p className="mt-3 text-[12px] text-muted-foreground">
                Rate-limited to 60 req/min per IP. Cached for 60s at the edge.
              </p>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Sample response</p>
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-white/[0.05] bg-black/40 p-3 font-mono text-[11px] text-foreground/80">
{JSON.stringify(
  {
    brand: example.brand,
    slug: example.slug,
    audience: example.audience,
    category: example.category,
    value: example.value,
    claim_url: example.claim_url,
  },
  null,
  2,
)}
              </pre>
              <Link to="/submit" className="mt-3 inline-flex text-[12px] text-primary hover:opacity-90">
                Suggest a new endpoint →
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
