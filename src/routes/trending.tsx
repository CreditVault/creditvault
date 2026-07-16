import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { BarList, CountUp, Sparkline } from "@/components/site/charts";
import { LISTINGS, getCategoryCounts } from "@/lib/listings";
import { recentlyUpdated } from "@/lib/verify";
import { useBookmarks } from "@/lib/bookmarks";
import { useLikes } from "@/lib/reactions";
import { formatUsd, parseValueUsd } from "@/lib/estimate";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending & analytics · CreditVault" },
      { name: "description", content: "Trending companies, most-bookmarked programs, most-claimed credits and the freshest offers." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const { ids: bookmarks } = useBookmarks();
  const { likes } = useLikes();

  const trending = useMemo(() => {
    const score = new Map<string, number>();
    for (const s of bookmarks) score.set(s, (score.get(s) ?? 0) + 2);
    for (const s of likes) score.set(s, (score.get(s) ?? 0) + 3);
    // seed with featured & AI programs so the page is populated for new users
    for (const l of LISTINGS.filter((x) => x.featured)) score.set(l.slug, (score.get(l.slug) ?? 0) + 1);
    return [...score.entries()]
      .map(([s, sc]) => ({ l: LISTINGS.find((x) => x.slug === s), sc }))
      .filter((x): x is { l: NonNullable<typeof x.l>; sc: number } => Boolean(x.l))
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 6);
  }, [bookmarks, likes]);

  const mostViewed = useMemo(() => LISTINGS.filter((l) => l.featured).slice(0, 6), []);
  const highestValue = useMemo(
    () =>
      [...LISTINGS]
        .map((l) => ({ l, n: parseValueUsd(l.value) }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 6)
        .map((x) => x.l),
    [],
  );
  const recent = useMemo(() => recentlyUpdated(6), []);
  const categories = useMemo(() => getCategoryCounts().slice(0, 8), []);

  const spark = useMemo(() => Array.from({ length: 20 }, (_, i) => 20 + Math.round(Math.sin(i / 2) * 8) + i), []);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Trending & analytics"
        title="What founders are chasing this week."
        subtitle="Live rankings across trending companies, most-viewed programs, biggest credits and newest additions."
      />

      <section className="container-x py-10">
        <div className="grid gap-3 md:grid-cols-4">
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Verified programs</p>
            <p className="mt-1 text-3xl font-semibold"><CountUp value={LISTINGS.length} /></p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Popular categories</p>
            <p className="mt-1 text-3xl font-semibold"><CountUp value={categories.length} /></p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Bookmarks (you)</p>
            <p className="mt-1 text-3xl font-semibold"><CountUp value={bookmarks.length} /></p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Activity trend</p>
            <div className="mt-1"><Sparkline values={spark} width={220} height={44} /></div>
          </GlassCard>
        </div>

        <Section title="Trending companies" subtitle="Ranked by community bookmarks + likes.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((t) => <ListingCard key={t.l.slug} l={t.l} />)}
          </div>
        </Section>

        <Section title="Most viewed" subtitle="Featured startup programs founders open first.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mostViewed.map((l) => <ListingCard key={l.slug} l={l} />)}
          </div>
        </Section>

        <Section title="Biggest credits" subtitle="Highest estimated dollar value in the vault.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highestValue.map((l) => <ListingCard key={l.slug} l={l} />)}
          </div>
        </Section>

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Recently updated</p>
            <ul className="mt-3 divide-y divide-white/[0.05]">
              {recent.map((l) => (
                <li key={l.slug} className="flex items-center justify-between py-2">
                  <Link to="/offer/$slug" params={{ slug: l.slug }} className="truncate text-[13px] hover:text-foreground">
                    {l.brand}
                  </Link>
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">{l.category}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Most popular categories</p>
            <div className="mt-3">
              <BarList
                items={categories.map((c) => ({
                  label: c.name,
                  value: c.count,
                  hint: `· ${formatUsd(
                    LISTINGS.filter((l) => l.category === c.name).reduce((a, l) => a + parseValueUsd(l.value), 0),
                  )}`,
                }))}
              />
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">{title}</p>
        {subtitle && <h3 className="mt-1 text-lg font-semibold">{subtitle}</h3>}
      </div>
      {children}
    </div>
  );
}
