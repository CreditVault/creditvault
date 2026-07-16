import { LISTINGS, type Listing } from "@/lib/listings";

const REGION_ALIASES: Record<string, string> = {
  us: "United States",
  usa: "United States",
  uk: "United Kingdom",
  eu: "European Union",
  in: "India",
  global: "Global",
  worldwide: "Global",
};

function normalizeCountry(raw: string): string {
  const s = raw.trim();
  if (!s) return "Global";
  const key = s.toLowerCase();
  if (REGION_ALIASES[key]) return REGION_ALIASES[key];
  if (key.includes("limited")) return "Selected countries";
  return s;
}

export function groupByCountry(): {
  country: string;
  count: number;
  audiences: Record<string, number>;
  categories: Record<string, number>;
  listings: Listing[];
}[] {
  const map = new Map<
    string,
    {
      count: number;
      audiences: Record<string, number>;
      categories: Record<string, number>;
      listings: Listing[];
    }
  >();
  for (const l of LISTINGS) {
    const country = normalizeCountry(l.location || "Global");
    const cur = map.get(country) ?? {
      count: 0,
      audiences: {},
      categories: {},
      listings: [],
    };
    cur.count += 1;
    cur.audiences[l.audience] = (cur.audiences[l.audience] ?? 0) + 1;
    cur.categories[l.category] = (cur.categories[l.category] ?? 0) + 1;
    cur.listings.push(l);
    map.set(country, cur);
  }
  return Array.from(map.entries())
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.count - a.count);
}
