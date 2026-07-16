import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import {
  buildNotifications,
  markAllNotificationsRead,
  readIds,
  type Notification,
} from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · CreditVault" },
      { name: "description", content: "New programs, updated credits, deadlines and eligibility changes — all in one inbox." },
    ],
  }),
  component: NotificationsPage,
});

const KIND_TONE: Record<Notification["kind"], string> = {
  new: "text-emerald-300",
  updated: "text-sky-300",
  deadline: "text-rose-300",
  expiring: "text-amber-300",
  eligibility: "text-fuchsia-300",
  ai: "text-primary",
};

function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    setList(buildNotifications());
    setRead(readIds());
  }, []);

  const groups = useMemo(() => {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    return {
      today: list.filter((n) => now - n.at < day),
      week: list.filter((n) => now - n.at >= day && now - n.at < 7 * day),
      older: list.filter((n) => now - n.at >= 7 * day),
    };
  }, [list]);

  const markAll = () => {
    const ids = list.map((n) => n.id);
    markAllNotificationsRead(ids);
    setRead(new Set(ids));
  };

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Notifications"
        title="What changed since you last visited."
        subtitle="New programs, re-verified offers, upcoming deadlines and fresh AI credits."
        actions={
          <button
            onClick={markAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium transition hover:border-white/20"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        }
      />

      <section className="container-x py-10">
        <div className="grid gap-3">
          <Group title="Today" items={groups.today} read={read} />
          <Group title="This week" items={groups.week} read={read} />
          <Group title="Earlier" items={groups.older} read={read} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Group({
  title,
  items,
  read,
}: {
  title: string;
  items: Notification[];
  read: Set<string>;
}) {
  if (items.length === 0) return null;
  return (
    <GlassCard>
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="mt-3 divide-y divide-white/[0.05]">
        {items.map((n) => {
          const unread = !read.has(n.id);
          const body = (
            <div className="flex items-start gap-3 py-3">
              <span className={"mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.04] " + KIND_TONE[n.kind]}>
                <Bell className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={"text-[13px] " + (unread ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {n.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{n.body}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {new Date(n.at).toLocaleString(undefined, { month: "short", day: "numeric" })}
              </span>
              {unread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
            </div>
          );
          return (
            <li key={n.id}>
              {n.slug ? (
                <Link to="/offer/$slug" params={{ slug: n.slug }} className="block hover:bg-white/[0.02]">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
