import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { LISTINGS } from "@/lib/listings";
import { useApplications, STATUS_META } from "@/lib/applications";
import { upcomingFromApps } from "@/lib/notifications";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Deadline calendar · CreditVault" },
      { name: "description", content: "See every upcoming application deadline, renewal, hackathon and program event in one calendar." },
    ],
  }),
  component: CalendarPage,
});

type Event = {
  id: string;
  date: Date;
  title: string;
  kind: "deadline" | "hackathon" | "renewal" | "event";
  slug?: string;
};

const KIND_META: Record<Event["kind"], { label: string; dot: string; tone: string }> = {
  deadline: { label: "Deadline", dot: "bg-rose-400", tone: "text-rose-300" },
  hackathon: { label: "Hackathon", dot: "bg-fuchsia-400", tone: "text-fuchsia-300" },
  renewal: { label: "Renewal", dot: "bg-amber-400", tone: "text-amber-300" },
  event: { label: "Event", dot: "bg-sky-400", tone: "text-sky-300" },
};

function seedEvents(): Event[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pick = (arr: typeof LISTINGS, n: number) => arr.slice(0, n);

  const hackathons = pick(
    LISTINGS.filter((l) => l.tags?.some((t) => /hack/i.test(t))),
    3,
  );
  const events = pick(LISTINGS.filter((l) => l.featured), 4);

  const evts: Event[] = [];
  hackathons.forEach((l, i) => {
    evts.push({
      id: `hk-${l.slug}`,
      date: new Date(y, m, 8 + i * 7),
      title: `${l.brand} hackathon`,
      kind: "hackathon",
      slug: l.slug,
    });
  });
  events.forEach((l, i) => {
    evts.push({
      id: `ev-${l.slug}`,
      date: new Date(y, m, 4 + i * 5),
      title: `${l.brand} community day`,
      kind: "event",
      slug: l.slug,
    });
  });
  return evts;
}

function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const { apps } = useApplications();

  const events = useMemo<Event[]>(() => {
    const seeded = seedEvents();
    const upcoming = upcomingFromApps(apps);
    const fromApps: Event[] = upcoming.map((u) => ({
      id: `dl-${u.app.id}`,
      date: new Date(u.deadline),
      title: `${u.listing.brand} — ${STATUS_META[u.app.status].label}`,
      kind: "deadline",
      slug: u.listing.slug,
    }));
    return [...fromApps, ...seeded];
  }, [apps]);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(y, m, d));
  while (grid.length % 7 !== 0) grid.push(null);

  const eventsForDay = (d: Date) =>
    events.filter(
      (e) =>
        e.date.getFullYear() === d.getFullYear() &&
        e.date.getMonth() === d.getMonth() &&
        e.date.getDate() === d.getDate(),
    );

  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const upcomingList = [...events]
    .filter((e) => e.date.getTime() >= Date.now() - 24 * 3600 * 1000)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 12);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Deadline calendar"
        title="Never miss a window."
        subtitle="Application deadlines, renewals, hackathons and program events — in one view."
      />

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <GlassCard className="!p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{monthName}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCursor(new Date(y, m - 1, 1))}
                  aria-label="Previous month"
                  className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCursor(new Date())}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Today
                </button>
                <button
                  onClick={() => setCursor(new Date(y, m + 1, 1))}
                  aria-label="Next month"
                  className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.05] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="bg-background/60 px-2 py-1.5 text-center">{d}</div>
              ))}
              {grid.map((d, i) => {
                if (!d) return <div key={i} className="min-h-[92px] bg-background/40" />;
                const dayEvents = eventsForDay(d);
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className="min-h-[92px] bg-background/60 p-1.5">
                    <div className={"mb-1 text-[11px] " + (isToday ? "font-semibold text-primary" : "text-muted-foreground")}>
                      {d.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <EventChip key={e.id} e={e} />
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Coming up</p>
            <ul className="mt-3 space-y-2">
              {upcomingList.length === 0 && (
                <li className="text-sm text-muted-foreground">Nothing scheduled — start tracking applications.</li>
              )}
              {upcomingList.map((e) => (
                <li key={e.id} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <span className={"h-1.5 w-1.5 rounded-full " + KIND_META[e.kind].dot} />
                  <div className="min-w-0 flex-1">
                    {e.slug ? (
                      <Link to="/offer/$slug" params={{ slug: e.slug }} className="truncate text-[13px] hover:text-foreground">
                        {e.title}
                      </Link>
                    ) : (
                      <span className="truncate text-[13px]">{e.title}</span>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {e.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {KIND_META[e.kind].label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function EventChip({ e }: { e: Event }) {
  const inner = (
    <span className={"block truncate rounded px-1 py-0.5 text-[10px] " + KIND_META[e.kind].tone + " bg-white/[0.04]"}>
      {e.title}
    </span>
  );
  return e.slug ? (
    <Link to="/offer/$slug" params={{ slug: e.slug }} className="block hover:opacity-90">
      {inner}
    </Link>
  ) : inner;
}
