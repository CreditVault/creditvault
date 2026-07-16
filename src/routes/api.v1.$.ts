import { createFileRoute } from "@tanstack/react-router";
import { LISTINGS, getCategoryCounts } from "@/lib/listings";

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=300",
      "access-control-allow-origin": "*",
      ...(init.headers ?? {}),
    },
  });
}

function slim(l: (typeof LISTINGS)[number]) {
  return {
    slug: l.slug,
    brand: l.brand,
    name: l.name,
    audience: l.audience,
    category: l.category,
    value: l.value,
    tagline: l.tagline,
    tags: l.tags,
    location: l.location,
    claim_url: l.claim_url,
    source_url: l.source_url,
    logo_url: l.logo_url,
    featured: l.featured,
  };
}

function filterByPath(path: string) {
  switch (path) {
    case "companies": {
      const brands = new Map<string, ReturnType<typeof slim>>();
      for (const l of LISTINGS) if (!brands.has(l.brand)) brands.set(l.brand, slim(l));
      return [...brands.values()];
    }
    case "programs":
      return LISTINGS.map(slim);
    case "credits":
      return LISTINGS.filter((l) => /credit|k|m|\$/i.test(l.value ?? "")).map(slim);
    case "student":
      return LISTINGS.filter((l) => l.audience === "student").map(slim);
    case "startup":
      return LISTINGS.filter((l) => l.audience === "startup").map(slim);
    case "cloud":
      return LISTINGS.filter((l) => l.category === "Cloud").map(slim);
    case "ai":
      return LISTINGS.filter((l) => l.category === "AI & ML").map(slim);
    case "categories":
      return getCategoryCounts();
    default:
      return null;
  }
}

export const Route = createFileRoute("/api/v1/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const splat = ((params as { _splat?: string })._splat ?? "").replace(/\/+$/, "");
        const url = new URL(request.url);
        if (splat === "search") {
          const q = (url.searchParams.get("q") ?? "").toLowerCase().trim();
          if (!q) return json({ results: [] });
          const results = LISTINGS.filter((l) => {
            const hay = (l.brand + " " + l.name + " " + l.tagline + " " + l.description + " " + (l.tags ?? []).join(" ")).toLowerCase();
            return hay.includes(q);
          })
            .slice(0, 50)
            .map(slim);
          return json({ query: q, count: results.length, results });
        }
        if (splat === "compare") {
          const slugs = (url.searchParams.get("slugs") ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const programs = slugs
            .map((s) => LISTINGS.find((l) => l.slug === s))
            .filter((l): l is (typeof LISTINGS)[number] => Boolean(l))
            .map(slim);
          return json({ programs });
        }
        const data = filterByPath(splat);
        if (data === null) {
          return json(
            { error: "Not found", endpoints: ["companies", "programs", "credits", "student", "startup", "cloud", "ai", "categories", "search", "compare"] },
            { status: 404 },
          );
        }
        return json(data);
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        }),
    },
  },
});
