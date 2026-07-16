import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { BarList, CountUp } from "@/components/site/charts";
import { groupByCountry } from "@/lib/countries";
import { AUDIENCE_META } from "@/lib/listings";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "World map · CreditVault" },
      { name: "description", content: "Startup programs, grants, accelerators and student benefits by country." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const data = useMemo(() => groupByCountry(), []);
  const top = data.slice(0, 24);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Programs by country"
        title="A world map of startup opportunity."
        subtitle="Every program in the vault, grouped by where founders and students can apply from."
      />

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Top regions</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {top.map((c) => (
                <Link
                  key={c.country}
                  to="/browse"
                  className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {c.country}
                      </p>
                      <p className="mt-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        <CountUp value={c.count} /> programs
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    {(["student", "startup", "developer"] as const)
                      .filter((a) => c.audiences[a])
                      .map((a) => (
                        <span key={a} className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-muted-foreground">
                          {AUDIENCE_META[a].short} · {c.audiences[a]}
                        </span>
                      ))}
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Region volume</p>
              <div className="mt-3">
                <BarList
                  items={top.slice(0, 10).map((c) => ({ label: c.country, value: c.count }))}
                />
              </div>
            </GlassCard>
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Global programs</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                <CountUp value={data.find((d) => d.country === "Global")?.count ?? 0} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Available to founders and students worldwide.</p>
              <Link to="/browse" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:opacity-90">
                Browse global perks <ArrowUpRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
