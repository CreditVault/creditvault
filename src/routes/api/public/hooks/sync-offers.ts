import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SOURCES = [
  { source: "studentoffers.co", url: "https://studentoffers.co" },
  { source: "resourify.com", url: "https://resourify.com" },
  { source: "startupperks.directory", url: "https://startupperks.directory" },
];

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

async function firecrawlScrape(url: string) {
  const res = await fetch(`${GATEWAY}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": process.env.FIRECRAWL_API_KEY!,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links"],
      onlyMainContent: true,
    }),
  });
  if (!res.ok) throw new Error(`firecrawl ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  return {
    markdown: data.markdown ?? data.data?.markdown ?? "",
    links: (data.links ?? data.data?.links ?? []) as string[],
  };
}

async function extractOffersWithAI(source: string, sourceUrl: string, markdown: string, links: string[]) {
  const trimmed = markdown.slice(0, 60000);
  const linksSample = links.slice(0, 200);
  const prompt = `You extract startup/student/developer offers from a directory page.

Source: ${source} (${sourceUrl})

Return JSON: { "offers": [ { "title", "brand", "description", "url", "category", "value", "audience" } ] }

Rules:
- Only real offers/deals/credits/discounts (not nav links, blog posts, categories).
- "url": the offer detail or claim URL. Absolute. Prefer links found on the page.
- "audience": one of "student", "startup", "developer".
- "category": short label (e.g. Cloud, AI, Dev Tools, SaaS, Design, Education).
- "value": short value string (e.g. "$5,000 credits", "50% off", "Free 1 year") or "".
- "brand": company name.
- "description": 1-2 sentence plain summary.
- Return up to 40 offers. Only JSON, no prose.

PAGE MARKDOWN:
${trimmed}

LINKS ON PAGE (sample):
${linksSample.join("\n")}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a precise data extractor. Output only valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`ai ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
  }
  const offers = Array.isArray(parsed.offers) ? parsed.offers : [];
  return offers.filter((o: any) => o && o.title && o.url);
}

function externalIdFor(url: string, title: string) {
  const base = (url || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 180);
  return base || title.toLowerCase().slice(0, 80);
}

async function syncOne(supabase: any, src: { source: string; url: string }) {
  const runStart = new Date().toISOString();
  const { data: runInsert } = await supabase
    .from("scrape_runs")
    .insert({ source: src.source, status: "running", started_at: runStart })
    .select("id")
    .single();
  const runId = (runInsert as any)?.id;

  try {
    const { markdown, links } = await firecrawlScrape(src.url);
    const offers = await extractOffersWithAI(src.source, src.url, markdown, links);

    let newCount = 0;
    let updatedCount = 0;

    for (const o of offers) {
      const external_id = externalIdFor(o.url, o.title);
      const row = {
        source: src.source,
        source_url: src.url,
        external_id,
        title: String(o.title).slice(0, 200),
        brand: o.brand ? String(o.brand).slice(0, 120) : null,
        description: o.description ? String(o.description).slice(0, 1200) : null,
        url: String(o.url).slice(0, 800),
        category: o.category ? String(o.category).slice(0, 80) : null,
        value: o.value ? String(o.value).slice(0, 80) : null,
        audience: o.audience ? String(o.audience).slice(0, 40) : null,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("scraped_offers")
        .select("id")
        .eq("source", src.source)
        .eq("external_id", external_id)
        .maybeSingle();

      if (existing) {
        await supabase.from("scraped_offers").update(row).eq("id", (existing as any).id);
        updatedCount++;
      } else {
        await supabase.from("scraped_offers").insert(row);
        newCount++;
      }
    }

    await supabase
      .from("scrape_runs")
      .update({
        status: "success",
        offers_found: offers.length,
        offers_new: newCount,
        offers_updated: updatedCount,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return { source: src.source, found: offers.length, new: newCount, updated: updatedCount };
  } catch (e: any) {
    await supabase
      .from("scrape_runs")
      .update({
        status: "error",
        error: String(e?.message ?? e).slice(0, 500),
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return { source: src.source, error: String(e?.message ?? e) };
  }
}

async function handle() {
  if (!process.env.LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
  if (!process.env.FIRECRAWL_API_KEY) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const results = [];
  for (const src of SOURCES) {
    results.push(await syncOne(supabase, src));
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/hooks/sync-offers")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => handle(),
      POST: async () => handle(),
    },
  },
});
