import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  Check,
  Copy,
  Eye,
  Facebook,
  Linkedin,
  Mail,
  Send,
  Share2,
  Sparkles,
  Twitter,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { AUDIENCE_META, LISTINGS, type Listing } from "@/lib/listings";
import { officialUrl } from "@/lib/officialUrl";

export const Route = createFileRoute("/offer/$slug")({
  loader: ({ params }) => {
    const listing = LISTINGS.find((l) => l.slug === params.slug);
    if (!listing) throw notFound();
    const similar = LISTINGS.filter(
      (l) => l.slug !== listing.slug && l.category === listing.category,
    ).slice(0, 6);
    const relatedBrands = LISTINGS.filter(
      (l) => l.slug !== listing.slug && l.audience === listing.audience,
    ).slice(0, 8);
    const recentDeals = LISTINGS.filter(
      (l) => l.slug !== listing.slug && l.value,
    ).slice(0, 4);
    return { listing, similar, relatedBrands, recentDeals };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Offer not found" }, { name: "robots", content: "noindex" }] };
    const { listing } = loaderData;
    const title = `${listing.name} — CreditVault`;
    const desc = (listing.description || listing.tagline || `${listing.brand} offer.`).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/offer/${listing.slug}` },
        ...(listing.logo_url ? [{ property: "og:image", content: listing.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/offer/${listing.slug}` }],
    };
  },
  notFoundComponent: OfferNotFound,
  component: OfferPage,
});

function OfferNotFound() {
  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <div className="container-x py-24 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Offer not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This offer may have been removed or the link is broken.
        </p>
        <Link
          to="/browse"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Browse all offers
        </Link>
      </div>
      <Footer />
    </div>
  );
}

/* ---------- helpers ---------- */
function hashish(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function statsFor(slug: string) {
  const h = hashish(slug);
  const claims = 200 + (h % 24800);
  const views = claims * (2 + ((h >> 5) % 4));
  return { claims, views };
}
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function BrandMark({ listing, size = "lg" }: { listing: Listing; size?: "lg" | "md" | "sm" }) {
  const initials = listing.brand
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  const box =
    size === "lg"
      ? "h-32 w-32 md:h-40 md:w-40 rounded-3xl"
      : size === "md"
      ? "h-14 w-14 rounded-2xl"
      : "h-11 w-11 rounded-xl";
  const text = size === "lg" ? "text-4xl" : size === "md" ? "text-lg" : "text-sm";
  return (
    <div
      className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white`}
    >
      {listing.logo_url ? (
        <img
          src={listing.logo_url}
          alt={listing.brand}
          className="h-full w-full object-contain p-3"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement as HTMLElement;
            parent.textContent = initials;
            parent.classList.add(text, "font-bold", "text-neutral-800");
          }}
        />
      ) : (
        <span className={`${text} font-bold text-neutral-800`}>{initials}</span>
      )}
    </div>
  );
}

/* ---------- page ---------- */
function OfferPage() {
  const { listing, similar, relatedBrands, recentDeals } = Route.useLoaderData() as {
    listing: Listing;
    similar: Listing[];
    relatedBrands: Listing[];
    recentDeals: Listing[];
  };
  const aud = AUDIENCE_META[listing.audience];
  
  const { claims, views } = statsFor(listing.slug);
  const variants = buildVariants(listing);
  const steps = buildSteps(listing);
  const keyBenefits = buildKeyBenefits(listing);
  const requirements = buildRequirements(listing);
  const criteria = buildCriteria(listing);

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />

      <main className="container-x py-8 md:py-10">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="opacity-40">/</span>
          <Link
            to="/browse"
            search={{ q: "", category: listing.category, source: "all", audience: "all" }}
            className="hover:text-foreground"
          >
            {listing.category}
          </Link>
          <span className="opacity-40">/</span>
          <Link
            to="/browse"
            search={{ q: "", category: "all", source: "all", audience: listing.audience }}
            className="hover:text-foreground"
          >
            {aud.label}
          </Link>
          <span className="opacity-40">/</span>
          <span className="line-clamp-1 text-foreground">{listing.brand}</span>
        </nav>

        {/* HERO */}
        <section className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <BrandMark listing={listing} />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-[42px] md:leading-[1.1]">
              {listing.name}
            </h1>
            {listing.tagline && (
              <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
                {listing.tagline}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={officialUrl(listing.brand, listing.claim_url)}
                target="_blank"
                rel="noreferrer nofollow"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-900 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.35)] transition hover:bg-white/90"
              >
                View Offer <ArrowUpRight className="h-4 w-4" />
              </a>
              {listing.value && (
                <span className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" /> {listing.value}
                </span>
              )}
              <button
                type="button"
                aria-label="Save"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* Meta line */}
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">{listing.brand}</span>
              <Dot /><span>{fmt(claims)} claims</span>
              <Dot /><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {fmt(views)} views</span>
              <Dot /><span>Updated recently</span>
              <Dot /><span className="inline-flex items-center gap-1">
                verified by <span className="text-foreground">@creditvault</span>
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              </span>
            </div>
          </div>
        </section>

        {/* Quick offer links */}
        {variants.length > 0 && (
          <section className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Quick Offer Links
              </p>
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {variants.length} Active
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((b, i) => (
                <a
                  key={i}
                  href={`#offer-${i + 1}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-foreground/90 transition hover:border-white/25 hover:bg-white/[0.08]"
                >
                  {b.title}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Two-column body */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <article className="space-y-10">
            <p className="text-[15.5px] leading-relaxed text-foreground/85">
              {listing.description || listing.tagline}
            </p>

            {/* Offer variants */}
            {variants.map((b, i) => (
              <section
                key={i}
                id={`offer-${i + 1}`}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Offer {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">{b.title}</h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.body}</p>

                {b.howto && b.howto.length > 0 && (
                  <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      How to redeem
                    </p>
                    <ol className="mt-3 space-y-2 text-sm text-foreground/85">
                      {b.howto.map((h, k) => (
                        <li key={k} className="flex gap-3">
                          <span className="text-primary">{k + 1}.</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>
            ))}

            {/* Key benefits */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Key Benefits
                </p>
              </div>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {keyBenefits.map((k, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Eligibility */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Eligibility
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-[140px_1fr]">
                <p className="text-sm font-semibold text-foreground">Requirements</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {requirements.map((r, i) => (
                    <li key={i} className="flex gap-2"><span className="text-primary">•</span>{r}</li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-foreground">Criteria</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {criteria.map((c, i) => (
                    <li key={i} className="flex gap-2"><span className="text-primary">•</span>{c}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* How to claim overall */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                How to claim
              </p>
              <ol className="mt-4 space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/85">{s}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={officialUrl(listing.brand, listing.claim_url)}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Go to official site <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </section>

            {/* Important information */}
            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400">
                Important Information
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                This offer is fulfilled by <span className="font-medium text-foreground">{listing.brand}</span>. Terms, availability and value may change without notice. Verify current details on the official page before enrolling. CreditVault indexes public offers and receives no user data during redemption.
              </p>
            </section>

            {/* Details grid */}
            <section className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Category" value={listing.category} />
              <DetailRow label="Audience" value={aud.label} />
              <DetailRow label="Provider" value={listing.brand} />
              <DetailRow label="Region" value={listing.location || "Global"} />
            </section>

            {/* Tags */}
            <section>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Tags
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag>#{listing.category}</Tag>
                <Tag>#{aud.short}</Tag>
                {listing.tags.map((t) => (
                  <Tag key={t}>#{t}</Tag>
                ))}
              </div>
            </section>

            {/* Share */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Share this offer
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ShareBtn icon={<Twitter className="h-3.5 w-3.5" />} label="Twitter" />
                <ShareBtn icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" />
                <ShareBtn icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
                <ShareBtn icon={<Send className="h-3.5 w-3.5" />} label="Telegram" />
                <ShareBtn icon={<Mail className="h-3.5 w-3.5" />} label="Email" />
                <ShareBtn icon={<Share2 className="h-3.5 w-3.5" />} label="More" />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-foreground/90 transition hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
              </div>
            </section>

            {/* Telegram callout */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Join our Telegram Channel</p>
                  <p className="text-xs text-muted-foreground">New verified perks the moment they drop.</p>
                </div>
              </div>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Join channel <ArrowUpRight className="h-4 w-4" />
              </a>
            </section>

            {/* Related brands / find alternatives */}
            <section>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Find alternatives
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {relatedBrands.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/offer/$slug"
                      params={{ slug: r.slug }}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <BrandMark listing={r} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.brand}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.value || r.tagline || r.category}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Subscribe */}
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <p className="text-lg font-semibold">Get deals before anyone else</p>
              <p className="mt-1 text-sm text-muted-foreground">
                One email per week with new verified perks. No spam.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-4 flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="h-11 flex-1 rounded-full border border-white/10 bg-black/30 px-5 text-sm placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Subscribe
                </button>
              </form>
            </section>

            {/* Recently discovered deals */}
            <section>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Recently discovered deals
                </p>
                <Link
                  to="/browse"
                  search={{ q: "", category: "all", source: "all", audience: "all" }}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {recentDeals.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/offer/$slug"
                      params={{ slug: r.slug }}
                      className="group flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <BrandMark listing={r} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{r.brand}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {r.tagline || r.value}
                        </p>
                        {r.value && (
                          <span className="mt-2 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            {r.value}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-xs text-muted-foreground">
              <Check className="mr-1 inline h-3.5 w-3.5 text-primary" />
              Offer verified by CreditVault. All claims fulfilled by the original provider.
            </p>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Similar {listing.category} deals
            </p>
            <ul className="mt-4 space-y-2.5">
              {similar.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/offer/$slug"
                    params={{ slug: s.slug }}
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <BrandMark listing={s} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.brand}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {s.value || s.tagline || s.category}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
              {similar.length === 0 && (
                <li className="text-sm text-muted-foreground">No similar offers yet.</li>
              )}
            </ul>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- small components ---------- */
function Dot() { return <span className="opacity-40">·</span>; }
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
function ShareBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-foreground/90 transition hover:border-white/25 hover:bg-white/[0.08]"
    >
      {icon} {label}
    </button>
  );
}

/* ---------- content builders ---------- */
function buildVariants(l: Listing): { title: string; body: string; howto?: string[] }[] {
  const out: { title: string; body: string; howto?: string[] }[] = [];
  if (l.value) {
    out.push({
      title: `${l.value} on ${l.brand}`,
      body: `Redeem ${l.value.toLowerCase()} directly from ${l.brand}. Verified by CreditVault.`,
      howto: [
        `Open ${l.brand} using the button above.`,
        `Sign up with a valid ${AUDIENCE_META[l.audience].short.toLowerCase()} account.`,
        `The ${l.value.toLowerCase()} unlocks automatically once verification completes.`,
      ],
    });
  }
  const primary = l.tagline || l.description;
  if (primary && (!l.value || !primary.toLowerCase().includes((l.value || "").toLowerCase()))) {
    out.push({
      title: `${l.brand} for ${AUDIENCE_META[l.audience].label}`,
      body: primary,
      howto: [
        `Visit the ${l.brand} landing page for ${AUDIENCE_META[l.audience].label.toLowerCase()}.`,
        `Complete the short application with your work or study details.`,
        `Access is granted within minutes for most eligible applicants.`,
      ],
    });
  }
  for (const t of l.tags.slice(0, 2)) {
    if (!t) continue;
    out.push({
      title: `${t} perk`,
      body: `Bundled ${t.toLowerCase()} access included with this ${l.brand} offer.`,
    });
  }
  return out.slice(0, 3);
}

function buildSteps(l: Listing): string[] {
  return [
    `Open the ${l.brand} offer page from CreditVault.`,
    `Sign up or log in with a valid ${AUDIENCE_META[l.audience].short.toLowerCase()} account.`,
    l.value
      ? `Apply the offer to unlock ${l.value.toLowerCase()}.`
      : `Follow the on-screen instructions to activate the perk.`,
    `That's it — the credit or discount lands in your ${l.brand} account.`,
  ];
}

function buildKeyBenefits(l: Listing): string[] {
  const out = [
    l.value ? `${l.value} unlocked directly on ${l.brand}.` : `Full ${l.brand} access at zero or reduced cost.`,
    `Verified ${AUDIENCE_META[l.audience].short.toLowerCase()} benefit — no coupon hunting.`,
    `Fulfilled by the official ${l.brand} provider.`,
    `Continuously monitored and kept up to date.`,
  ];
  for (const t of l.tags.slice(0, 2)) if (t) out.push(`Includes ${t.toLowerCase()} coverage.`);
  return out.slice(0, 6);
}

function buildRequirements(l: Listing): string[] {
  const aud = AUDIENCE_META[l.audience].label.toLowerCase();
  return [
    `Active ${aud} status`,
    l.audience === "student" ? "Valid .edu or SheerID verification" : l.audience === "startup" ? "Registered company (< 5 years old typical)" : "GitHub or developer account",
    "Working email address",
  ];
}

function buildCriteria(l: Listing): string[] {
  return [
    "One redemption per user or organisation",
    "Subject to availability in your region" + (l.location ? ` (${l.location})` : ""),
    `Terms set by ${l.brand}`,
  ];
}
