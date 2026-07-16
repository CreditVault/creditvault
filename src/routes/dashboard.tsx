import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  Compass,
  FileCheck2,
  LayoutGrid,
  Map as MapIcon,
  Rocket,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { BarList, CountUp, Donut, Sparkline } from "@/components/site/charts";
import { LISTINGS, filterListings } from "@/lib/listings";
import { useBookmarks } from "@/lib/bookmarks";
import { useApplications, STATUS_META, type AppStatus } from "@/lib/applications";
import { estimateFor, formatUsd } from "@/lib/estimate";
import { upcomingFromApps } from "@/lib/notifications";
import { recentlyUpdated } from "@/lib/verify";
import { useLikes } from "@/lib/reactions";
import { computeAchievements } from "@/lib/achievements";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Founder dashboard · CreditVault" },
      { name: "description", content: "Track your credits, applications and eligibility across every startup, student and developer program in one place." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { ids: bookmarks } = useBookmarks();
  const { apps } = useApplications();
  const { likes } = useLikes();

  const eligible = useMemo(() => estimateFor(LISTINGS.map((l) => l.slug)), []);
  const saved = useMemo(() => estimateFor(bookmarks), [bookmarks]);

  const byStatus = useMemo(() => {
    const acc: Partial<Record<AppStatus, number>> = {};
    for (const a of apps) acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, [apps]);

  const approved = byStatus.approved ?? 0;
  const pending = (byStatus.applying ?? 0) + (byStatus.submitted ?? 0) + (byStatus.review ?? 0);

  const recommended = useMemo(() => {
    const savedSet = new Set(bookmarks);
    const cats = new Map<string, number>();
    for (const s of bookmarks) {
      const l = LISTINGS.find((x) => x.slug === s);
      if (l) cats.set(l.category, (cats.get(l.category) ?? 0) + 1);
    }
    const top = [...cats.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const pool = top
      ? filterListings({ category: top }).filter((l) => !savedSet.has(l.slug))
      : LISTINGS.filter((l) => l.featured && !savedSet.has(l.slug));
    return pool.slice(0, 6);
  }, [bookmarks]);

  const upcoming = useMemo(() => upcomingFromApps(apps).slice(0, 5), [apps]);
  const recent = useMemo(() => recentlyUpdated(4), []);

  // fake weekly-savings sparkline built from real applications by day
  const sparkValues = useMemo(() => {
    const days = 14;
    const buckets = new Array(days).fill(0);
    const dayMs = 1000 * 60 * 60 * 24;
    const now = Date.now();
    for (const a of apps) {
      const d = Math.floor((now - a.updatedAt) / dayMs);
      if (d >= 0 && d < days) buckets[days - 1 - d] += 1;
    }
    if (buckets.every((v) => v === 0)) return [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8];
    return buckets;
  }, [apps]);

  const achievements = computeAchievements({
    bookmarks: bookmarks.length,
    likes: likes.length,
    apps,
    reviews: 0,
  });
  const earned = achievements.filter((a) => a.earned).length;

  const tools = [
    { to: "/applications", icon: FileCheck2, label: "Applications" },
    { to: "/calculator", icon: Sparkles, label: "Credit calculator" },
    { to: "/calendar", icon: CalendarDays, label: "Deadlines" },
    { to: "/stack", icon: Rocket, label: "Stack builder" },
    { to: "/map", icon: MapIcon, label: "World map" },
    { to: "/trending", icon: TrendingUp, label: "Trending" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/community", icon: LayoutGrid, label: "Community" },
    { to: "/achievements", icon: Trophy, label: "Achievements" },
    { to: "/resources", icon: Compass, label: "Resources" },
  ];

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Founder dashboard"
        title="Your credit vault, at a glance."
        subtitle="Everything you've saved, applied to and can still claim — synced to this browser."
        actions={
          <>
            <Link to="/browse" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
              Browse offers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/vaultai" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium transition hover:border-white/20">
              Ask VaultAI
            </Link>
          </>
        }
      />

      <section className="container-x py-10">
        {/* KPI row */}
        <div className="grid gap-3 md:grid-cols-4">
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Total eligible credits</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              <CountUp value={eligible.total} format={formatUsd} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Across {LISTINGS.length.toLocaleString()} verified offers</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Est. from your saved</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              <CountUp value={saved.total} format={formatUsd} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{bookmarks.length} saved · {likes.length} liked</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Applications</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              <CountUp value={apps.length} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pending} pending · <span className="text-emerald-300">{approved} approved</span>
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Achievements</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              <CountUp value={earned} /><span className="text-primary">/{achievements.length}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Keep applying to earn more</p>
          </GlassCard>
        </div>

        {/* charts */}
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Application activity</p>
                <h3 className="mt-1 text-lg font-semibold">Last 14 days</h3>
              </div>
              <Sparkline values={sparkValues} width={280} height={64} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Approved" value={approved} tone="text-emerald-300" />
              <MiniStat label="Pending" value={pending} tone="text-amber-300" />
              <MiniStat label="Saved" value={bookmarks.length} tone="text-sky-300" />
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Status mix</p>
            <div className="mt-3 flex items-center gap-4">
              <Donut value={approved} max={Math.max(1, apps.length)} label="Approved" sub={`of ${apps.length} total`} />
              <div className="flex-1 space-y-1.5 text-[12px]">
                {(Object.keys(STATUS_META) as AppStatus[])
                  .filter((s) => (byStatus[s] ?? 0) > 0)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className={"h-1.5 w-1.5 rounded-full " + STATUS_META[s].dot} />
                      <span className="flex-1 text-muted-foreground">{STATUS_META[s].label}</span>
                      <span className="font-mono">{byStatus[s]}</span>
                    </div>
                  ))}
                {apps.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Start by adding an application from any offer page.
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tools grid */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold tracking-wide">Tools</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {tools.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-sm transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <t.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{t.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom grid */}
        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          <GlassCard>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Upcoming deadlines</p>
              <Link to="/calendar" className="text-[11px] text-muted-foreground hover:text-foreground">See all →</Link>
            </div>
            <ul className="mt-3 space-y-2">
              {upcoming.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No deadlines yet. Track applications to see them here.
                </li>
              )}
              {upcoming.map((u) => (
                <li key={u.app.id} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[13px]">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.listing.brand}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{STATUS_META[u.app.status].label}</p>
                  </div>
                  <span className={"font-mono text-[11px] " + (u.days <= 3 ? "text-rose-300" : "text-muted-foreground")}>
                    {u.days > 0 ? `${u.days}d` : "today"}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Estimated by category</p>
              <span className="font-mono text-[11px] text-muted-foreground">{formatUsd(saved.total)}</span>
            </div>
            <div className="mt-3">
              <BarList
                items={Object.entries(saved.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([label, value]) => ({ label, value }))}
                format={formatUsd}
              />
              {bookmarks.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Save offers to build your personal credit stack.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Recently added</p>
              <Link to="/browse" className="text-[11px] text-muted-foreground hover:text-foreground">Browse →</Link>
            </div>
            <ul className="mt-3 space-y-1.5">
              {recent.map((l) => (
                <li key={l.slug}>
                  <Link
                    to="/offer/$slug"
                    params={{ slug: l.slug }}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] transition hover:bg-white/5"
                  >
                    <span className="truncate">{l.brand}</span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] text-muted-foreground">{l.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* Recommendations */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">Recommended for you</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Based on what you've saved</h2>
            </div>
            <Link to="/browse" className="text-xs text-muted-foreground hover:text-foreground">Browse all →</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((l) => (
              <ListingCard key={l.slug} l={l} />
            ))}
          </div>
        </div>

        {/* Saved snapshot */}
        {bookmarks.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">Saved programs</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your vault</h2>
              </div>
              <Link to="/saved" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" /> All saved
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks
                .map((s) => LISTINGS.find((l) => l.slug === s))
                .filter(Boolean)
                .slice(0, 6)
                .map((l) => (
                  <ListingCard key={l!.slug} l={l!} />
                ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={"mt-0.5 text-xl font-semibold tracking-tight " + tone}>
        <CountUp value={value} />
      </p>
    </div>
  );
}
