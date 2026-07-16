import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo.png";
import { GraduationCap, Rocket, Code2, Github, Star } from "lucide-react";
import { getRepoStars } from "@/lib/github.functions";

const REPO_OWNER = "CreditVault";
const REPO_NAME = "creditvault";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link to="/" className="group flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-60 transition-opacity duration-500 group-hover:opacity-100 animate-logo-pulse" />
            <img
              src={logoUrl}
              alt="CREDITVAULT"
              width={36}
              height={36}
              className="relative h-9 w-9 transition-transform duration-500 ease-out group-hover:scale-110 animate-logo-float"
            />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-bold uppercase tracking-[0.22em] bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              CREDITVAULT
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground/70">
              Explore Plus
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          <CategoryLink audience="student" icon={<GraduationCap className="h-5 w-5" />} label="Students" />
          <CategoryLink audience="startup" icon={<Rocket className="h-5 w-5" />} label="Startups" />
          <CategoryLink audience="developer" icon={<Code2 className="h-5 w-5" />} label="Developers" />
        </nav>

        <GitHubLink />
      </div>
    </header>
  );
}

function GitHubLink() {
  const fetchStars = useServerFn(getRepoStars);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchStars({ data: { owner: REPO_OWNER, repo: REPO_NAME } })
        .then((data) => {
          if (!cancelled) setStars(data.stars);
        })
        .catch(() => {
          if (!cancelled) setStars(null);
        });
    };

    load();
    const interval = setInterval(load, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchStars]);

  const formatted =
    stars === null
      ? "—"
      : stars >= 1000
        ? `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`
        : String(stars);

  return (
    <a
      href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative hidden items-center gap-2.5 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 transition hover:border-github-blue/30 hover:bg-github-blue/[0.06] sm:flex"
    >
      <span className="absolute inset-x-0 -bottom-px h-px scale-x-0 bg-gradient-to-r from-transparent via-github-blue/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
      <Github className="h-4 w-4 text-github-text transition-transform duration-300 group-hover:scale-105" />
      <span className="text-[12px] font-semibold tracking-wide text-foreground/90 transition group-hover:text-github-text">
        GitHub
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-github-blue">
        <Star className="h-3 w-3 fill-current" />
        {formatted}
      </span>
    </a>
  );
}

function CategoryLink({
  audience,
  icon,
  label,
}: {
  audience: "student" | "startup" | "developer";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to="/browse"
      search={{ audience }}
      className="group relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-foreground/85 transition hover:text-foreground"
    >
      <span className="text-primary transition-transform duration-300 group-hover:-translate-y-0.5">
        {icon}
      </span>
      <span>{label}</span>
      <span className="absolute inset-x-4 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
