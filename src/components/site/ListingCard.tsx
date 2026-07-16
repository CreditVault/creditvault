import { ArrowUpRight, Bookmark, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useBookmarks } from "@/lib/bookmarks";
import { AUDIENCE_META, type Listing } from "@/lib/listings";
import { formatVerified, lastVerifiedAt } from "@/lib/verify";

export function ListingCard({ l }: { l: Listing }) {
  const aud = AUDIENCE_META[l.audience];
  const { has, toggle } = useBookmarks();
  const saved = has(l.slug);
  return (
    <Link
      to="/offer/$slug"
      params={{ slug: l.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-5 transition hover:border-white/20 hover:from-white/[0.06]"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(l.slug);
        }}
        aria-label={saved ? "Remove bookmark" : "Save offer"}
        className={
          "absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border transition " +
          (saved
            ? "border-primary/40 bg-primary/15 text-primary"
            : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground")
        }
      >
        <Bookmark className={"h-4 w-4 " + (saved ? "fill-current" : "")} />
      </button>
      <div className="flex items-start justify-between gap-3 pr-10">
        <div className="flex items-center gap-3">
          <LogoTile src={l.logo_url} name={l.brand} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{l.brand}</p>
            <p className="mt-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {l.category}
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>

      <p className="mt-4 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
        {l.description || l.tagline}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
        {l.value && (
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {l.value}
          </span>
        )}
        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground">
          {aud.short}
        </span>
        <span
          title={`Last verified ${lastVerifiedAt(l.slug).toDateString()}`}
          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
        >
          <CheckCircle2 className="h-3 w-3" /> Verified · {formatVerified(lastVerifiedAt(l.slug))}
        </span>
      </div>
    </Link>
  );
}

export function LogoTile({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            (e.currentTarget.parentElement as HTMLElement).textContent = initials;
            (e.currentTarget.parentElement as HTMLElement).classList.add(
              "text-xs",
              "font-bold",
              "text-neutral-800",
            );
          }}
        />
      ) : (
        <span className="text-xs font-bold text-neutral-800">{initials}</span>
      )}
    </div>
  );
}
