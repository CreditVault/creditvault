import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Trophy } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { CountUp } from "@/components/site/charts";
import { useBookmarks } from "@/lib/bookmarks";
import { useApplications } from "@/lib/applications";
import { useLikes, useReviews } from "@/lib/reactions";
import { computeAchievements } from "@/lib/achievements";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · CreditVault" },
      { name: "description", content: "Earn badges as you save, apply and contribute to the CreditVault community." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { ids: bookmarks } = useBookmarks();
  const { apps } = useApplications();
  const { likes } = useLikes();
  const { all: reviews } = useReviews();

  const achievements = useMemo(
    () =>
      computeAchievements({
        bookmarks: bookmarks.length,
        likes: likes.length,
        apps,
        reviews: reviews.length,
      }),
    [bookmarks.length, likes.length, apps, reviews.length],
  );

  const earned = achievements.filter((a) => a.earned);
  const total = achievements.length;

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Achievements"
        title="Every action earns a badge."
        subtitle="Save, apply, contribute and review — rack up points and climb the leaderboard."
        actions={
          <Link to="/community" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium transition hover:border-white/20">
            Community <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <section className="container-x py-10">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Badges earned</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              <CountUp value={earned.length} />
              <span className="text-primary">/{total}</span>
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Trophy className="h-6 w-6" />
          </div>
        </GlassCard>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <GlassCard key={a.id} className={a.earned ? "!border-primary/30 !bg-primary/[0.06]" : ""}>
              <div className="flex items-start gap-3">
                <div className={"flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl " + (a.earned ? "bg-primary/20" : "bg-white/[0.04] grayscale opacity-70")}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={"text-sm font-semibold " + (a.earned ? "text-foreground" : "text-muted-foreground")}>
                    {a.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{a.desc}</p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                      style={{ width: `${Math.round(a.progress * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {a.earned ? "Earned" : `${Math.round(a.progress * 100)}%`}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
