import { Link } from "@tanstack/react-router";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalPage({
  title,
  updated,
  description,
  children,
}: {
  title: string;
  updated: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <main className="container-x py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{description}</p>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-[13px] leading-relaxed text-amber-200/90">
            This page is maintained by the CreditVault team as a starting template. It is not
            legal advice. Review and adapt it with a qualified lawyer for your jurisdiction
            before relying on it in production.
          </div>

          <article className="prose prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-semibold prose-h3:mt-6 prose-h3:text-lg prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            {children}
          </article>

          <div className="mt-16 flex flex-wrap gap-3 border-t border-white/5 pt-8 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
            <span>·</span>
            <Link to="/acceptable-use" className="hover:text-foreground">Acceptable Use</Link>
            <span>·</span>
            <Link to="/dmca" className="hover:text-foreground">DMCA</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
