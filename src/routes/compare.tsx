import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Minus, X } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LogoTile } from "@/components/site/ListingCard";
import { LISTINGS, AUDIENCE_META, type Listing } from "@/lib/listings";
import { formatVerified, lastVerifiedAt } from "@/lib/verify";
import { officialUrl } from "@/lib/officialUrl";

const schema = z.object({
  a: fallback(z.string(), "").default(""),
  b: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/compare")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Compare offers — CreditVault" },
      { name: "description", content: "Side-by-side comparison of credit programs, perks and startup offers." },
    ],
  }),
  component: ComparePage,
});

const INDEX = new Map(LISTINGS.map((l) => [l.slug, l] as const));

function Picker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return LISTINGS.slice(0, 8);
    return LISTINGS.filter(
      (l) => l.brand.toLowerCase().includes(s) || l.name.toLowerCase().includes(s),
    ).slice(0, 8);
  }, [q]);
  const selected = INDEX.get(value);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      {selected ? (
        <div className="mt-3 flex items-center gap-3">
          <LogoTile src={selected.logo_url} name={selected.brand} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{selected.brand}</p>
            <p className="truncate text-[11px] text-muted-foreground">{selected.category}</p>
          </div>
          <button
            onClick={() => onChange("")}
            aria-label="Clear"
            className="rounded-md border border-white/10 p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brand…"
            className="mt-3 w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/40"
          />
          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {results.map((l) => (
              <li key={l.slug}>
                <button
                  onClick={() => onChange(l.slug)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <LogoTile src={l.logo_url} name={l.brand} />
                  <span className="truncate">{l.brand}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Row({ label, a, b }: { label: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-4 border-t border-white/5 py-3 text-sm">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <div>{a ?? <Minus className="h-3.5 w-3.5 text-muted-foreground" />}</div>
      <div>{b ?? <Minus className="h-3.5 w-3.5 text-muted-foreground" />}</div>
    </div>
  );
}

function cell(l: Listing | undefined, fn: (l: Listing) => React.ReactNode) {
  return l ? fn(l) : null;
}

function ComparePage() {
  const { a, b } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setA = (slug: string) => navigate({ search: (p: { a: string; b: string }) => ({ ...p, a: slug }) });
  const setB = (slug: string) => navigate({ search: (p: { a: string; b: string }) => ({ ...p, b: slug }) });
  const la = INDEX.get(a);
  const lb = INDEX.get(b);

  return (
    <div className="min-h-dvh">
      <Nav />
      <main className="container-x py-12">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Compare offers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick two programs to see credit value, audience and verification side-by-side.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Picker label="Offer A" value={a} onChange={setA} />
          <Picker label="Offer B" value={b} onChange={setB} />
        </div>

        {(la || lb) && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <Row
              label="Brand"
              a={cell(la, (l) => <span className="font-semibold">{l.brand}</span>)}
              b={cell(lb, (l) => <span className="font-semibold">{l.brand}</span>)}
            />
            <Row label="Value" a={cell(la, (l) => l.value ?? "—")} b={cell(lb, (l) => l.value ?? "—")} />
            <Row label="Category" a={cell(la, (l) => l.category)} b={cell(lb, (l) => l.category)} />
            <Row label="Audience" a={cell(la, (l) => AUDIENCE_META[l.audience].label)} b={cell(lb, (l) => AUDIENCE_META[l.audience].label)} />
            <Row label="Location" a={cell(la, (l) => l.location)} b={cell(lb, (l) => l.location)} />
            
            <Row
              label="Last verified"
              a={cell(la, (l) => (
                <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" />{formatVerified(lastVerifiedAt(l.slug))}</span>
              ))}
              b={cell(lb, (l) => (
                <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" />{formatVerified(lastVerifiedAt(l.slug))}</span>
              ))}
            />
            <Row
              label="Description"
              a={cell(la, (l) => <p className="text-muted-foreground">{l.description || l.tagline}</p>)}
              b={cell(lb, (l) => <p className="text-muted-foreground">{l.description || l.tagline}</p>)}
            />
            <Row
              label="Apply"
              a={cell(la, (l) => (
                <a href={officialUrl(l.brand, l.claim_url)} target="_blank" rel="noreferrer nofollow" className="text-primary underline-offset-2 hover:underline">Official site ↗</a>
              ))}
              b={cell(lb, (l) => (
                <a href={officialUrl(l.brand, l.claim_url)} target="_blank" rel="noreferrer nofollow" className="text-primary underline-offset-2 hover:underline">Official site ↗</a>
              ))}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
