import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center">
                <span className="absolute inset-0 rounded-xl bg-primary/25 blur-md animate-logo-pulse" />
                <img src={logoUrl} alt="CREDITVAULT" width={36} height={36} className="relative h-9 w-9 animate-logo-float" loading="lazy" />
              </span>
              <span className="text-[14px] font-bold uppercase tracking-[0.22em]">CREDITVAULT</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The open, community-verified directory of every startup credit, student offer and
              developer perk. Free forever.
            </p>
          </div>
          <FooterCol
            title="Directory"
            links={[
              { label: "Browse all", to: "/browse" },
              { label: "Compare", to: "/compare" },
              { label: "World map", to: "/map" },
              
              { label: "Submit an offer", to: "/submit" },
            ]}
          />
          <FooterCol
            title="Tools"
            links={[
              { label: "Founder dashboard", to: "/dashboard" },
              { label: "Applications", to: "/applications" },
              { label: "Credit calculator", to: "/calculator" },
              { label: "Stack builder", to: "/stack" },
              { label: "Deadline calendar", to: "/calendar" },
              { label: "Trending", to: "/trending" },
            ]}
          />
          <FooterCol
            title="Community"
            links={[
              { label: "VaultAI assistant", to: "/vaultai" },
              { label: "Community", to: "/community" },
              { label: "Achievements", to: "/achievements" },
              { label: "Resources", to: "/resources" },
              { label: "Public API", to: "/api-docs" },
              { label: "Notifications", to: "/notifications" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Terms & Conditions", to: "/terms" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Cookie Policy", to: "/cookies" },
              { label: "Acceptable Use", to: "/acceptable-use" },
              { label: "DMCA / Takedowns", to: "/dmca" },
              { label: "Contact", to: "/contact" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CreditVault.tech · Open source · MIT License</p>
          <p className="font-mono">Built for the community, not for lock-in.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to?: string; href?: string; search?: Record<string, string> }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link
                to={l.to}
                search={l.search as never}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
