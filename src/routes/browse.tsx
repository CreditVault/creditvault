import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ListingCard } from "@/components/site/ListingCard";
import {
  filterListings,
  getCategoryCounts,
  AUDIENCE_META,
  LISTINGS,
  type Listing,
} from "@/lib/listings";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(), // preserved for backward-compat links
  audience: z.string().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: `Browse ${652} verified perks & credits — CreditVault` },
      {
        name: "description",
        content:
          "Search verified startup credits, student offers, and developer perks organized by category — AI, cloud, dev tools, design, and more.",
      },
    ],
  }),
  component: BrowsePage,
});

const CATS_PER_PAGE = 6;
const PER_CAT = 12;

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [catPage, setCatPage] = useState(CATS_PER_PAGE);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rows = useMemo(
    () =>
      filterListings({
        q: search.q,
        category: search.category,
        source: search.source,
        audience: search.audience,
      }),
    [search.q, search.category, search.source, search.audience],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Listing[]>();
    for (const l of rows) {
      const key = l.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return Array.from(map.entries())
      .map(([name, items]) => ({ name, items }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [rows]);

  const categories = useMemo(() => {
    if (!search.audience) return getCategoryCounts();
    const counts = new Map<string, number>();
    for (const l of rows) counts.set(l.category, (counts.get(l.category) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [rows, search.audience]);
  const hasFilters = !!(search.q || search.category || search.source || search.audience);

  function update(patch: Record<string, string | undefined>) {
    navigate({
      search: (prev: Record<string, string | undefined>) => {
        const next: Record<string, string | undefined> = { ...prev, ...patch };
        for (const k of Object.keys(next)) if (!next[k] || next[k] === "all") delete next[k];
        return next as never;
      },
      replace: true,
    });
    setCatPage(CATS_PER_PAGE);
  }

  const visibleGroups = grouped.slice(0, catPage);
  const lockedAudience = search.audience
    ? AUDIENCE_META[search.audience as keyof typeof AUDIENCE_META]
    : null;

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />

      {/* Hero */}
      <section className="border-b border-white/5 bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {lockedAudience
                ? `${lockedAudience.label} · ${rows.length} verified offers`
                : `Directory · ${LISTINGS.length} verified offers · ${categories.length} categories`}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {lockedAudience
                ? `Offers for ${lockedAudience.label.toLowerCase()}.`
                : "Every credit, perk, and offer — by category."}
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {lockedAudience
                ? "Every claim link goes straight to the provider."
                : "Filter by audience or category. Every claim link goes straight to the provider."}
            </p>

            {!lockedAudience && (
              <div className="mt-4 flex w-full max-w-2xl items-center gap-2 rounded-xl border border-white/10 bg-card/60 p-1.5 backdrop-blur-sm">
                <Search className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search.q ?? ""}
                  onChange={(e) => update({ q: e.target.value })}
                  placeholder="Search AWS, Notion, Figma, Anthropic…"
                  className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {hasFilters && (
                  <button
                    onClick={() =>
                      navigate({ search: () => ({}) as never, replace: true })
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className={lockedAudience ? "" : "grid gap-8 lg:grid-cols-[240px_1fr]"}>
          {!lockedAudience && (
            <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
              <FilterGroup title="Audience">
                <FilterPill
                  active={!search.audience}
                  onClick={() => update({ audience: undefined })}
                >
                  All
                </FilterPill>
                {(Object.keys(AUDIENCE_META) as (keyof typeof AUDIENCE_META)[]).map((a) => (
                  <FilterPill
                    key={a}
                    active={search.audience === a}
                    onClick={() => update({ audience: a })}
                  >
                    {AUDIENCE_META[a].label}
                  </FilterPill>
                ))}
              </FilterGroup>

              <FilterGroup title="Category">
                <FilterPill
                  active={!search.category}
                  onClick={() => update({ category: undefined })}
                >
                  All categories
                </FilterPill>
                {categories.map((c) => (
                  <FilterPill
                    key={c.name}
                    active={search.category === c.name}
                    onClick={() => update({ category: c.name })}
                  >
                    {c.name}
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground/70">
                      {c.count}
                    </span>
                  </FilterPill>
                ))}
              </FilterGroup>
            </aside>
          )}

          {/* Results grouped by category */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{rows.length}</span> offer
                {rows.length === 1 ? "" : "s"} across{" "}
                <span className="font-medium text-foreground">{grouped.length}</span> categor
                {grouped.length === 1 ? "y" : "ies"}
              </p>
              {!lockedAudience && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground lg:hidden">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </div>
              )}
            </div>


            {grouped.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No results. Try clearing filters or searching a broader term.
                </p>
              </div>
            ) : (
              <div className="space-y-14">
                {visibleGroups.map((g) => {
                  const isOpen = expanded[g.name];
                  const shown = isOpen ? g.items : g.items.slice(0, PER_CAT);
                  return (
                    <div key={g.name} id={`cat-${g.name}`}>
                      <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/5 pb-3">
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                            {g.name}
                          </h2>
                          <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                            {g.items.length} offer{g.items.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <button
                          onClick={() => update({ category: g.name })}
                          className="hidden shrink-0 text-xs text-primary hover:underline sm:inline"
                        >
                          Focus this category →
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {shown.map((l) => (
                          <ListingCard key={l.slug} l={l} />
                        ))}
                      </div>
                      {g.items.length > PER_CAT && (
                        <div className="mt-5">
                          <button
                            onClick={() =>
                              setExpanded((s) => ({ ...s, [g.name]: !isOpen }))
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-medium transition hover:border-white/20 hover:bg-white/10"
                          >
                            {isOpen
                              ? `Show fewer`
                              : `Show all ${g.items.length} in ${g.name}`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {catPage < grouped.length && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setCatPage((v) => v + CATS_PER_PAGE)}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium transition hover:border-white/20 hover:bg-white/10"
                    >
                      Load more categories
                      <span className="text-xs font-mono text-muted-foreground">
                        {catPage}/{grouped.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition " +
        (active
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

// Link is used implicitly via Route.useNavigate — silence unused import
export { Link };
