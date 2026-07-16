import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { LogoTile, ListingCard } from "@/components/site/ListingCard";
import { LISTINGS, type Listing } from "@/lib/listings";
import { parseValueUsd, formatUsd } from "@/lib/estimate";
import { useReviews } from "@/lib/reactions";
import { officialUrl } from "@/lib/officialUrl";

export const Route = createFileRoute("/company/$brand")({
  head: ({ params }) => ({
    meta: [
      { title: `${decodeURIComponent(params.brand)} — programs & credits · CreditVault` },
      {
        name: "description",
        content: `All programs, credits, requirements and reviews for ${decodeURIComponent(params.brand)} in one premium page.`,
      },
    ],
  }),
  loader: ({ params }): { brand: string; programs: Listing[] } => {
    const brand = decodeURIComponent(params.brand);
    const key = brand.toLowerCase();
    const programs = LISTINGS.filter((l) => l.brand.toLowerCase() === key);
    if (programs.length === 0) throw notFound();
    return { brand, programs };
  },
  component: CompanyPage,
  notFoundComponent: () => (
    <div className="min-h-dvh">
      <Nav />
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-semibold">Company not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">We don't have a page for this brand yet.</p>
        <Link to="/browse" className="mt-6 inline-flex items-center gap-1 text-primary">
          Browse the directory <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <Footer />
    </div>
  ),
});

function CompanyPage() {
  const { brand, programs } = Route.useLoaderData() as { brand: string; programs: Listing[] };
  const primary = programs[0];
  const { reviews } = useReviews(primary.slug);

  const similar = useMemo(() => {
    const cats = new Set(programs.map((p) => p.category));
    return LISTINGS.filter((l) => l.brand.toLowerCase() !== brand.toLowerCase() && cats.has(l.category))
      .slice(0, 6);
  }, [brand, programs]);

  const totalValue = programs.reduce((a, p) => a + parseValueUsd(p.value), 0);

  const faqs = [
    { q: `Is ${brand} free to apply to?`, a: `Yes — every program listed here uses the official ${brand} application page. CreditVault never charges to apply.` },
    { q: "How long does approval take?", a: "Typical review time is 1–4 weeks. Check each program page for details." },
    { q: "Do I need to be incorporated?", a: primary.audience === "student" ? "No — most student offers require only proof of enrollment." : "Most startup programs require an incorporated entity and a company email." },
  ];

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />

      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-40" />
        <div className="pointer-events-none absolute -top-24 right-0 h-[320px] w-[520px] rounded-full bg-primary/20 blur-[110px]" />
        <div className="container-x relative py-12">
          <Link to="/browse" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
            ← Directory
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <LogoTile src={primary.logo_url} name={primary.brand} />
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{brand}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{primary.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-muted-foreground">
                  {programs.length} program{programs.length > 1 ? "s" : ""}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-muted-foreground">
                  ~{formatUsd(totalValue)} in value
                </span>
              </div>
            </div>
            <a
              href={officialUrl(primary.brand, primary.claim_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Visit official page <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                <Sparkles className="mr-1 inline h-3 w-3" /> Programs
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {programs.map((p) => <ListingCard key={p.slug} l={p} />)}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Benefits</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {primary.tags?.slice(0, 6).map((t) => (
                  <li key={t} className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-[13px]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
                {(!primary.tags || primary.tags.length === 0) && (
                  <li className="text-sm text-muted-foreground">See the official page for the latest benefits.</li>
                )}
              </ul>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Application guide</p>
              <ol className="mt-3 space-y-2 text-[13px] text-muted-foreground">
                <ListStep n={1}>Prepare your company/entity details, founder email and a short pitch.</ListStep>
                <ListStep n={2}>Open the official {brand} page and start the application.</ListStep>
                <ListStep n={3}>Upload documents — incorporation, ID, and product URL.</ListStep>
                <ListStep n={4}>Track the application in your <Link to="/applications" className="text-primary hover:opacity-90">CreditVault tracker</Link>.</ListStep>
              </ol>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">FAQs</p>
              <div className="mt-3 space-y-2">
                {faqs.map((f) => (
                  <details key={f.q} className="group rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                    <summary className="cursor-pointer text-[13px] font-medium">{f.q}</summary>
                    <p className="mt-2 text-[13px] text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Requirements</p>
              <ul className="mt-3 space-y-1.5 text-[13px]">
                <ReqItem>{primary.audience === "student" ? "Valid student ID / .edu email" : "Registered company entity"}</ReqItem>
                <ReqItem>Founder or maintainer email</ReqItem>
                <ReqItem>Product URL or GitHub repo</ReqItem>
                <ReqItem>Short pitch / product description</ReqItem>
              </ul>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Latest updates</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                  <p className="text-[11px] text-muted-foreground">Verified today</p>
                  <p className="mt-0.5">Program links and credit values confirmed live.</p>
                </li>
                <li className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                  <p className="text-[11px] text-muted-foreground">This month</p>
                  <p className="mt-0.5">Application flow reviewed by the community.</p>
                </li>
              </ul>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Community reviews ({reviews.length})
              </p>
              {reviews.length === 0 ? (
                <p className="mt-2 text-[13px] text-muted-foreground">
                  No reviews yet. <Link to="/community" className="text-primary hover:opacity-90">Be the first</Link>.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {reviews.slice(0, 3).map((r) => (
                    <li key={r.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-[13px]">
                      <p className="text-[11px] text-amber-300">{"★".repeat(r.rating)}</p>
                      <p className="mt-1">{r.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">— {r.author}</p>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">Similar companies</p>
            <h2 className="mt-1 text-2xl font-semibold">You might also like</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => <ListingCard key={l.slug} l={l} />)}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ListStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] text-primary">
        {n}
      </span>
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}

function ReqItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}
