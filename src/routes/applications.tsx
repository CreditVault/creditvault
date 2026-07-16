import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Bell, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { LogoTile } from "@/components/site/ListingCard";
import { LISTINGS } from "@/lib/listings";
import { officialUrl } from "@/lib/officialUrl";
import {
  APP_STATUSES,
  STATUS_META,
  useApplications,
  type AppStatus,
  type Application,
} from "@/lib/applications";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Application tracker · CreditVault" },
      { name: "description", content: "Track every startup, credit and grant application from draft to approved." },
    ],
  }),
  component: ApplicationsPage,
});

const FILTERS: (AppStatus | "all")[] = ["all", ...APP_STATUSES];

function ApplicationsPage() {
  const { apps, upsert, remove } = useApplications();
  const [filter, setFilter] = useState<AppStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filter === "all" ? apps : apps.filter((a) => a.status === filter);
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [apps, filter]);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Application tracker"
        title="From draft to approved."
        subtitle="A private Kanban for every credit and grant you're chasing. Nothing leaves this browser."
        actions={
          <QuickAdd
            onAdd={(slug) => upsert(slug, { status: "saved", note: "Added from tracker" })}
          />
        }
      />

      <section className="container-x py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = f === "all" ? apps.length : apps.filter((a) => a.status === f).length;
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition " +
                  (active
                    ? "border-primary/40 bg-primary/15 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground")
                }
              >
                {f === "all" ? "All" : STATUS_META[f].label}
                <span className="rounded-full bg-white/10 px-1.5 text-[10px] font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <GlassCard className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {apps.length === 0
                ? "No applications yet. Open an offer and hit 'Track application'."
                : "No applications in this status."}
            </p>
          </GlassCard>
        ) : (
          <div className="mt-6 grid gap-3">
            {filtered.map((a) => {
              const l = LISTINGS.find((x) => x.slug === a.slug);
              if (!l) return null;
              const open = openId === a.id;
              return (
                <GlassCard key={a.id} className="!p-0">
                  <div className="flex items-center gap-3 p-4">
                    <LogoTile src={l.logo_url} name={l.brand} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to="/offer/$slug" params={{ slug: l.slug }} className="truncate text-sm font-medium hover:text-foreground">
                          {l.brand}
                        </Link>
                        <span className={"inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] " + STATUS_META[a.status].tone}>
                          <span className={"h-1 w-1 rounded-full " + STATUS_META[a.status].dot} />
                          {STATUS_META[a.status].label}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{l.value || l.category}</p>
                    </div>
                    <select
                      value={a.status}
                      onChange={(e) => upsert(a.slug, { status: e.target.value as AppStatus })}
                      className="rounded-md border border-white/10 bg-background/60 px-2 py-1 text-xs outline-none focus:border-primary/40"
                    >
                      {APP_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-background">
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setOpenId(open ? null : a.id)}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                    >
                      {open ? "Close" : "Details"}
                    </button>
                    <a
                      href={officialUrl(l.brand, l.claim_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Apply <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this application?")) remove(a.slug);
                      }}
                      aria-label="Remove"
                      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {open && <DetailPanel app={a} onSave={(patch) => upsert(a.slug, patch)} />}
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function DetailPanel({
  app,
  onSave,
}: {
  app: Application;
  onSave: (patch: {
    notes?: string;
    documents?: string[];
    reminderAt?: number;
  }) => void;
}) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const [docs, setDocs] = useState((app.documents ?? []).join("\n"));
  const [reminder, setReminder] = useState(
    app.reminderAt ? new Date(app.reminderAt).toISOString().slice(0, 10) : "",
  );

  return (
    <div className="grid gap-4 border-t border-white/[0.07] bg-white/[0.02] p-4 md:grid-cols-2">
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Contact person, promo code, questions to ask…"
          className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
        />
        <label className="mt-3 block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Required documents (one per line)
        </label>
        <textarea
          value={docs}
          onChange={(e) => setDocs(e.target.value)}
          rows={3}
          placeholder={"Company registration\nFounder ID\nPitch deck"}
          className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
        />
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <Bell className="mr-1 inline h-3 w-3" /> Reminder
            </label>
            <input
              type="date"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
            />
          </div>
          <button
            onClick={() =>
              onSave({
                notes,
                documents: docs.split(/\n+/).map((s) => s.trim()).filter(Boolean),
                reminderAt: reminder ? new Date(reminder).getTime() : undefined,
              })
            }
            className="h-10 self-end rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Save details
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Status timeline</p>
        <ol className="mt-2 space-y-2">
          {app.timeline.map((t, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
              <span className={"mt-1 h-1.5 w-1.5 rounded-full " + STATUS_META[t.status].dot} />
              <div className="min-w-0 flex-1">
                <p className={"text-[12px] " + STATUS_META[t.status].tone}>
                  {STATUS_META[t.status].label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(t.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {t.note && <p className="mt-1 text-[12px] text-foreground/80">{t.note}</p>}
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: (slug: string) => void }) {
  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return LISTINGS.filter((l) =>
      (l.brand + " " + l.name).toLowerCase().includes(t),
    ).slice(0, 6);
  }, [q]);
  return (
    <div className="relative">
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-1 pl-2">
        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Add a program…"
          className="w-56 bg-transparent px-1 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
        />
        <Link
          to="/browse"
          className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse
        </Link>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute right-0 top-11 z-30 w-72 overflow-hidden rounded-lg border border-white/10 bg-background/95 shadow-xl backdrop-blur-xl">
          {suggestions.map((l) => (
            <li key={l.slug}>
              <button
                onClick={() => {
                  onAdd(l.slug);
                  setQ("");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-white/5"
              >
                <span className="min-w-0 flex-1 truncate">{l.brand}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {l.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
