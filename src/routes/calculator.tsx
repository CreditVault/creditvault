import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Cloud, Code2, GraduationCap, Sparkles } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { LISTINGS, type Listing } from "@/lib/listings";
import { BarList, CountUp } from "@/components/site/charts";
import { estimateFor, formatUsd, parseValueUsd } from "@/lib/estimate";
import { useBookmarks } from "@/lib/bookmarks";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Startup credit calculator · CreditVault" },
      { name: "description", content: "Estimate the total value of every startup, cloud, AI, developer and student credit you're eligible for." },
    ],
  }),
  component: CalculatorPage,
});

type Bucket = "cloud" | "ai" | "dev" | "student" | "other";

function bucketOf(l: Listing): Bucket {
  if (l.audience === "student") return "student";
  if (l.category === "AI & ML") return "ai";
  if (l.category === "Cloud" || l.category === "Database") return "cloud";
  if (l.category === "Dev Tools") return "dev";
  return "other";
}

const BUCKET_META: Record<Bucket, { label: string; color: string }> = {
  cloud: { label: "Cloud & infra", color: "linear-gradient(90deg,#22d3ee,#3b82f6)" },
  ai: { label: "AI credits", color: "linear-gradient(90deg,#a855f7,#ec4899)" },
  dev: { label: "Developer tools", color: "linear-gradient(90deg,#f59e0b,#f43f5e)" },
  student: { label: "Student benefits", color: "linear-gradient(90deg,#22c55e,#14b8a6)" },
  other: { label: "Other perks", color: "linear-gradient(90deg,#94a3b8,#475569)" },
};

function CalculatorPage() {
  const [audience, setAudience] = useState<"all" | "student" | "startup" | "developer">("startup");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [aiOn, setAiOn] = useState(true);
  const [cloudOn, setCloudOn] = useState(true);
  const [devOn, setDevOn] = useState(true);
  const [studentOn, setStudentOn] = useState(true);
  const { ids: saved } = useBookmarks();

  const rows = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (audience !== "all" && l.audience !== audience) return false;
      if (featuredOnly && !l.featured) return false;
      const b = bucketOf(l);
      if (b === "ai" && !aiOn) return false;
      if (b === "cloud" && !cloudOn) return false;
      if (b === "dev" && !devOn) return false;
      if (b === "student" && !studentOn) return false;
      return true;
    });
  }, [audience, featuredOnly, aiOn, cloudOn, devOn, studentOn]);

  const totals = useMemo(() => {
    const byBucket: Record<Bucket, number> = { cloud: 0, ai: 0, dev: 0, student: 0, other: 0 };
    let total = 0;
    for (const l of rows) {
      const n = parseValueUsd(l.value);
      byBucket[bucketOf(l)] += n;
      total += n;
    }
    return { total, byBucket };
  }, [rows]);

  const savedTotals = useMemo(() => estimateFor(saved).total, [saved]);
  const topOffers = useMemo(
    () =>
      [...rows]
        .map((l) => ({ l, n: parseValueUsd(l.value) }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 10),
    [rows],
  );

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Startup credit calculator"
        title="How much are you leaving on the table?"
        subtitle="Estimate the total dollar value across cloud, AI, dev tools and student perks — tuned to your profile."
      />

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
          {/* Controls */}
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Your profile</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["all", "startup", "student", "developer"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={
                    "rounded-full border px-3 py-1 text-[12px] capitalize transition " +
                    (audience === a
                      ? "border-primary/40 bg-primary/15"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground")
                  }
                >
                  {a === "all" ? "Everything" : a}
                </button>
              ))}
            </div>

            <p className="mt-5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Include</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <Toggle icon={Cloud} label="Cloud & infra" on={cloudOn} onChange={setCloudOn} />
              <Toggle icon={Sparkles} label="AI credits" on={aiOn} onChange={setAiOn} />
              <Toggle icon={Code2} label="Developer tools" on={devOn} onChange={setDevOn} />
              <Toggle icon={GraduationCap} label="Student benefits" on={studentOn} onChange={setStudentOn} />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Featured programs only
            </label>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[12px] text-muted-foreground">
              <p>You've saved <span className="font-mono text-foreground">{saved.length}</span> offers worth an estimated <span className="font-mono text-foreground">{formatUsd(savedTotals)}</span>.</p>
              <Link to="/dashboard" className="mt-2 inline-flex items-center gap-1 text-primary hover:opacity-90">
                Open dashboard <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </GlassCard>

          {/* Totals */}
          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Estimated total value</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-gradient md:text-6xl">
                <CountUp value={totals.total} format={formatUsd} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">across {rows.length.toLocaleString()} eligible programs</p>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {(Object.keys(BUCKET_META) as Bucket[])
                  .filter((b) => b !== "other")
                  .map((b) => (
                    <div key={b} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{BUCKET_META[b].label}</p>
                      <p className="mt-0.5 text-lg font-semibold tracking-tight">
                        <CountUp value={totals.byBucket[b]} format={formatUsd} />
                      </p>
                    </div>
                  ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Value by bucket</p>
              <div className="mt-3">
                <BarList
                  items={(Object.keys(BUCKET_META) as Bucket[]).map((b) => ({
                    label: BUCKET_META[b].label,
                    value: totals.byBucket[b],
                    color: BUCKET_META[b].color,
                  }))}
                  format={formatUsd}
                />
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Top 10 by estimated value</p>
              <ul className="mt-3 divide-y divide-white/[0.05]">
                {topOffers.map(({ l, n }) => (
                  <li key={l.slug} className="flex items-center justify-between py-2">
                    <Link to="/offer/$slug" params={{ slug: l.slug }} className="min-w-0 truncate text-[13px] hover:text-foreground">
                      {l.brand}
                    </Link>
                    <span className="ml-3 shrink-0 font-mono text-[12px] text-primary">
                      {formatUsd(n)}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  on,
  onChange,
}: {
  icon: typeof Cloud;
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={
        "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition " +
        (on
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">{label}</span>
      <span className={"h-2 w-2 rounded-full " + (on ? "bg-primary" : "bg-white/20")} />
    </button>
  );
}
