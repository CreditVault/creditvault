import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cloud,
  Code2,
  Command,
  Database,
  Github,
  GraduationCap,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";


import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ListingCard } from "@/components/site/ListingCard";
import { recentlyUpdated } from "@/lib/verify";

import {
  LISTINGS,
  filterListings,
  getCategoryCounts,
  totalEstimatedValue,
  type Listing,
} from "@/lib/listings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ property: "og:url", content: "/" }],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

/* ---------------- helpers ---------------- */

function useCountUp(target: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(eased * target);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

/* ---------------- sections ---------------- */

function Hero() {
  const navigate = useNavigate();
  const goAsk = (q: string) => {
    const query = q.trim();
    if (!query) return;
    navigate({ to: "/vaultai", search: { q: query } });
  };
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {/* Grid + orbs */}
      <div className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-60" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px] animate-orb" />

      <div className="container-x relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {LISTINGS.length} verified offers · Updated daily
          </span>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-gradient md:text-7xl">
            Every startup credit,
            <br />
            student offer & dev perk.
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            One free, community-verified directory of {LISTINGS.length}+ perks.
            No signup, no lock-in, no affiliate spam.
          </p>

          {/* AI Copilot search — primary experience */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = (new FormData(e.currentTarget).get("q") as string | null) ?? "";
              goAsk(q);
            }}
            className="chat-glow mt-10 w-full max-w-2xl"
          >
            <span aria-hidden className="chat-glow-halo" />
            <span aria-hidden className="chat-glow-ring" />
            <div className="relative z-10 flex items-center gap-2 rounded-2xl bg-background/90 p-2 backdrop-blur-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <input
                name="q"
                autoComplete="off"
                placeholder="Ask VaultAI: 'best AI credits for a solo founder in India'…"
                className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-1 rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90"
              >
                Ask AI <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {["AWS credits for startups", "Free AI API credits", "GitHub Student perks", "Compare Supabase vs Firebase"].map((s) => (
              <button
                key={s}
                onClick={() => goAsk(s)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>


          <Link
            to="/browse"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Or browse the full directory <ArrowRight className="h-3 w-3" />
          </Link>

          {/* Audience shortcuts */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <AudLink audience="student" icon={GraduationCap} label="I'm a student" />
            <AudLink audience="startup" icon={Rocket} label="I'm a founder" />
            <AudLink audience="developer" icon={Code2} label="I'm a developer" />
          </div>
        </div>

        <StatsRow />
      </div>
    </section>
  );
}


function AudLink({
  audience,
  icon: Icon,
  label,
}: {
  audience: string;
  icon: typeof Rocket;
  label: string;
}) {
  return (
    <Link
      to="/browse"
      search={{ audience } as never}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-muted-foreground transition hover:border-white/20 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

function StatsRow() {
  const est = useMemo(() => totalEstimatedValue(), []);
  const counts = useMemo(() => {
    const brands = new Set(LISTINGS.map((l) => l.brand.toLowerCase())).size;
    const categories = new Set(LISTINGS.map((l) => l.category)).size;
    return { total: LISTINGS.length, brands, categories };
  }, []);

  const total = useCountUp(counts.total);
  const brands = useCountUp(counts.brands);
  const categories = useCountUp(counts.categories);

  return (
    <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] md:grid-cols-4">
      <Stat label="Verified offers" value={Math.round(total).toLocaleString()} suffix="" />
      <Stat label="Companies indexed" value={Math.round(brands).toLocaleString()} suffix="+" />
      <Stat label="Est. total value" value={est.replace(/[$+MK]/g, "")} prefix="$" suffix={est.includes("M") ? "M+" : "K+"} />
      <Stat label="Categories" value={Math.round(categories).toLocaleString()} suffix="+" mono />
    </div>
  );
}

function Stat({
  label,
  value,
  prefix,
  suffix,
  mono,
}: {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-background/60 p-6">
      <p className={"text-3xl font-semibold tracking-tight " + (mono ? "font-mono" : "")}>
        {prefix}
        {value}
        {suffix && <span className="text-primary">{suffix}</span>}
      </p>
      <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ---------------- Categories ---------------- */

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  "AI & ML": Sparkles,
  Cloud: Cloud,
  "Dev Tools": Code2,
  Database: Database,
  Design: Zap,
  Productivity: LineChart,
  Analytics: LineChart,
  Learning: GraduationCap,
  Security: ShieldCheck,
};

function Categories() {
  const cats = getCategoryCounts().slice(0, 12);
  return (
    <section className="border-b border-white/5 py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Browse by category"
          title="Every credit, sorted."
          subtitle={`${LISTINGS.length} offers across ${cats.length}+ categories, verified and updated daily.`}
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => {
            const Icon = CATEGORY_ICONS[c.name] ?? Rocket;
            return (
              <Link
                key={c.name}
                to="/browse"
                search={{ category: c.name } as never}
                className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      {c.count} offers
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Featured ---------------- */

function pickFeatured(): Listing[] {
  const priorityBrands = [
    "aws activate",
    "cloudflare for startups",
    "google cloud startups",
    "microsoft for startups",
    "anthropic startup program",
    "openai startup credits",
    "vercel for startups",
    "digitalocean hatch",
    "notion for startups",
    "linear for startups",
    "mongodb atlas startups",
    "amplitude startup scholarship",
  ];
  const startup = filterListings({ source: "startupperks" }).sort((a, b) => {
    const ai = priorityBrands.indexOf(a.name.toLowerCase());
    const bi = priorityBrands.indexOf(b.name.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return startup.slice(0, 6);
}

function Featured() {
  const items = useMemo(pickFeatured, []);
  return (
    <section className="border-b border-white/5 py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Featured for founders"
          title="The big startup programs."
          subtitle="$100K+ AWS credits, $250K Cloudflare, $25K Anthropic — the flagship perks worth applying for first."
          action={
            <Link
              to="/browse"
              search={{ audience: "startup" } as never}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium transition hover:border-white/20 hover:bg-white/10"
            >
              All startup perks <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.slug} l={l} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentlyUpdated() {
  const items = useMemo(() => recentlyUpdated(6), []);
  return (
    <section className="border-b border-white/5 py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Recently updated"
          title="Fresh from the last 30 days."
          subtitle="Automatically re-verified links and new programs, sorted by last check."
          action={
            <Link
              to="/browse"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium transition hover:border-white/20 hover:bg-white/10"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.slug} l={l} />
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------------- Trust ---------------- */

function Trust() {
  const items = [
    { icon: ShieldCheck, title: "Verified links only", desc: "Every claim URL is fetched and re-checked. Broken and expired offers are flagged out." },
    { icon: Zap, title: "Fresh, not stale", desc: "Offers refreshed continuously. No 2022 deals pretending to be live." },
    { icon: Check, title: "No signup wall", desc: "Zero accounts, zero email capture, zero affiliate rewrites. Just links to the provider." },
  ];
  return (
    <section className="border-b border-white/5 py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Why CreditVault"
          title="Built for signal, not for clicks."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <it.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-b border-white/5">
      <div className="container-x py-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-10 md:p-14">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Stop tab-hopping between five directories.
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground">
              Search all {LISTINGS.length} verified perks in one place. Free forever, no account
              required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90"
              >
                Browse the directory <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GitHubStudentBanner() {
  return (
    <section className="border-b border-white/5 bg-github-bg">
      <div className="container-x py-10 md:py-14">
        <div className="github-glow">
          <span aria-hidden className="github-glow-halo" />
          <span aria-hidden className="github-glow-ring" />
          <Link
            to="https://education.github.com/pack"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative z-10 flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-github-card via-github-bg to-background p-8 md:flex-row md:items-center md:justify-between md:p-10"
          >
            {/* animated orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-github-blue/25 blur-[80px] animate-orb" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-github-purple/20 blur-[70px] animate-orb" style={{ animationDelay: "-6s" }} />

            {/* shine sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-github-shine" />
            </div>

            <div className="relative flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm md:h-20 md:w-20">
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-github-blue/30 blur-xl animate-logo-pulse" />
                <Github className="relative h-8 w-8 text-github-text md:h-10 md:w-10 animate-logo-float" />
              </div>
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-github-blue">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-github-blue opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-github-blue" />
                  </span>
                  Featured student program
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-github-text md:text-3xl">
                  GitHub Student Developer Pack
                </h2>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-github-muted">
                  Free access to premium developer tools, cloud credits, and learning resources —
                  all with a verified student email.
                </p>
              </div>
            </div>

            <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-github-blue px-5 text-sm font-semibold text-github-text shadow-lg shadow-github-blue/40 transition group-hover:bg-github-blue-hover group-hover:shadow-github-blue/60">
                Claim the Pack <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
              <span className="text-xs text-github-muted transition group-hover:text-github-text">
                education.github.com/pack →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}



function Home() {
  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <Hero />
      <GitHubStudentBanner />
      <Categories />
      <Featured />
      <RecentlyUpdated />
      <Trust />
      <CTA />
      <Footer />
    </div>
  );
}

