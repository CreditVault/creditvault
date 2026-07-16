import listingsData from "@/data/listings.json";

export type Listing = {
  source: "studentoffers" | "startupperks" | "resourify";
  audience: "student" | "startup" | "developer";
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  value: string | null;
  category: string;
  claim_url: string;
  source_url: string;
  logo_url: string | null;
  location: string;
  tags: string[];
  featured: boolean;
};

export const LISTINGS = listingsData as Listing[];

export const CATEGORY_ORDER = [
  "AI & ML",
  "Cloud",
  "Dev Tools",
  "Database",
  "Design",
  "Productivity",
  "Analytics",
  "Marketing",
  "Email",
  "Security",
  "Learning",
  "Media",
  "Finance",
  "Membership",
  "Lifestyle",
  "Deals",
  "Food",
  "Health",
  "Science",
  "Other",
] as const;

export function getCategoryCounts(rows: Listing[] = LISTINGS) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.category, (map.get(r.category) ?? 0) + 1);
  return CATEGORY_ORDER.filter((c) => map.get(c)).map((c) => ({
    name: c,
    count: map.get(c) ?? 0,
  }));
}

export function getSourceCounts(rows: Listing[] = LISTINGS) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.source, (map.get(r.source) ?? 0) + 1);
  return map;
}

export const SOURCE_META: Record<
  Listing["source"],
  { label: string; site: string; color: string }
> = {
  studentoffers: { label: "Verified", site: "creditvault", color: "#22c55e" },
  startupperks: { label: "Verified", site: "creditvault", color: "#f59e0b" },
  resourify: { label: "Verified", site: "creditvault", color: "#a855f7" },
};

export const AUDIENCE_META: Record<
  Listing["audience"],
  { label: string; short: string }
> = {
  student: { label: "Students", short: "Student" },
  startup: { label: "Startups", short: "Startup" },
  developer: { label: "Developers", short: "Dev" },
};

export function filterListings(opts: {
  q?: string;
  category?: string;
  source?: string;
  audience?: string;
}) {
  const q = (opts.q ?? "").trim().toLowerCase();
  return LISTINGS.filter((l) => {
    if (opts.category && opts.category !== "all" && l.category !== opts.category) return false;
    if (opts.source && opts.source !== "all" && l.source !== opts.source) return false;
    if (opts.audience && opts.audience !== "all" && l.audience !== opts.audience) return false;
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.tags.some((t) => t?.toLowerCase().includes(q))
    );
  });
}

export function totalEstimatedValue(): string {
  // Rough: sum of any $-prefixed values in tagline/value.
  let total = 0;
  for (const l of LISTINGS) {
    const s = `${l.value ?? ""} ${l.tagline ?? ""}`;
    const m = s.match(/\$([\d,]+(?:\.\d+)?)(k|K|m|M)?/);
    if (!m) continue;
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (m[2]?.toLowerCase() === "k") n *= 1_000;
    else if (m[2]?.toLowerCase() === "m") n *= 1_000_000;
    total += n;
  }
  if (total > 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M+`;
  if (total > 1_000) return `$${Math.round(total / 1_000)}K+`;
  return `$${total}`;
}
