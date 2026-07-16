import { LISTINGS, type Listing } from "@/lib/listings";

// Extract a rough USD figure from a "$100K credits" / "$5,000 in credits" / "Free for 1 year" style string.
export function parseValueUsd(v: string | null | undefined): number {
  if (!v) return 0;
  const s = v.toLowerCase().replace(/,/g, "");
  // capture dollar amounts with optional k/m suffix
  const m = s.match(/\$?\s*(\d+(?:\.\d+)?)\s*([km])?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const suf = m[2];
  if (!isFinite(n)) return 0;
  if (suf === "m") return n * 1_000_000;
  if (suf === "k") return n * 1_000;
  // heuristics for "free / 100% off"
  if (s.includes("free")) return 500;
  if (s.includes("year") && !suf) return Math.max(n * 100, 200);
  return n;
}

export function estimateFor(slugs: string[]): {
  total: number;
  byCategory: Record<string, number>;
  byAudience: Record<string, number>;
  perItem: Record<string, number>;
} {
  const map = new Map(LISTINGS.map((l) => [l.slug, l] as const));
  let total = 0;
  const byCategory: Record<string, number> = {};
  const byAudience: Record<string, number> = {};
  const perItem: Record<string, number> = {};
  for (const s of slugs) {
    const l = map.get(s);
    if (!l) continue;
    const n = parseValueUsd(l.value);
    perItem[s] = n;
    total += n;
    byCategory[l.category] = (byCategory[l.category] ?? 0) + n;
    byAudience[l.audience] = (byAudience[l.audience] ?? 0) + n;
  }
  return { total, byCategory, byAudience, perItem };
}

export function estimateForListings(rows: Listing[]): number {
  return rows.reduce((acc, l) => acc + parseValueUsd(l.value), 0);
}

export function formatUsd(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return "$" + Math.round(n).toLocaleString();
}
