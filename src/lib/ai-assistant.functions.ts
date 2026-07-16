import { createServerFn } from "@tanstack/react-start";
import { LISTINGS, type Listing } from "@/lib/listings";

type ChatMsg = { role: "user" | "assistant"; content: string };

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s+.#-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

const STOP = new Set([
  "the","a","an","for","of","and","or","to","in","on","me","my","i","is","are","what",
  "which","show","give","list","all","any","get","find","offers","offer","free","credits",
  "credit","program","programs","that","do","does","have","provide","provides","from",
  "with","best","by","about","tell","can","you","how","much","many","need","want","use",
]);

function scoreListing(l: Listing, tokens: string[]): number {
  if (!tokens.length) return 0;
  const brand = l.brand.toLowerCase();
  const name = l.name.toLowerCase();
  const cat = l.category.toLowerCase();
  const desc = (l.description + " " + l.tagline + " " + (l.tags || []).join(" ")).toLowerCase();
  const aud = l.audience.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (STOP.has(t)) continue;
    if (brand === t) s += 50;
    else if (brand.startsWith(t) || brand.includes(t)) s += 20;
    if (name.includes(t)) s += 6;
    if (cat.includes(t)) s += 8;
    if (aud.includes(t)) s += 5;
    if (desc.includes(t)) s += 2;
  }
  return s;
}

function selectRelevant(query: string, limit = 40): Listing[] {
  const tokens = tokenize(query);
  const scored = LISTINGS.map((l) => ({ l, s: scoreListing(l, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.l);
  if (scored.length >= 5) return scored;
  // top-up with featured items so the model still has options
  const extras = LISTINGS.filter((l) => l.featured && !scored.includes(l)).slice(0, limit - scored.length);
  return [...scored, ...extras];
}

function compact(l: Listing) {
  return {
    slug: l.slug,
    brand: l.brand,
    name: l.name,
    audience: l.audience,
    category: l.category,
    value: l.value,
    tagline: l.tagline,
    tags: l.tags?.slice(0, 6) ?? [],
    claim_url: l.claim_url,
  };
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMsg[] }) => {
    if (!Array.isArray(data?.messages) || !data.messages.length) throw new Error("messages required");
    const trimmed = data.messages.slice(-8).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content ?? "").slice(0, 2000),
    }));
    return { messages: trimmed };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const relevant = selectRelevant(lastUser).map(compact);

    const system = `You are the CreditVault AI Assistant — a warm, precise concierge for startup credits, student offers, developer perks, cloud/AI credits, grants and programs.

RULES
- Answer using ONLY the offers in <catalog>. Never invent programs, values, URLs or eligibility.
- If nothing in the catalog fits, say so briefly and suggest a related category the user could browse.
- Be conversational and concise (max ~180 words). Use short markdown: bold brand names, bullet lists, no giant tables.
- When you recommend specific offers, mention them by brand name inline. Do NOT paste raw URLs — the UI renders cards separately.
- End with ONE short follow-up suggestion when useful.
- After your prose reply, append a single line exactly of the form:
  <slugs>slug1,slug2,slug3</slugs>
  listing 1–6 slugs from the catalog you referenced, most relevant first. If none, write <slugs></slugs>.

<catalog>
${JSON.stringify(relevant)}
</catalog>`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit — please try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed [${resp.status}]: ${body.slice(0, 200)}`);
    }
    const json = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const m = raw.match(/<slugs>([^<]*)<\/slugs>/i);
    const slugs = m
      ? m[1].split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const reply = raw.replace(/<slugs>[^<]*<\/slugs>/i, "").trim();
    return { reply, slugs };
  });
