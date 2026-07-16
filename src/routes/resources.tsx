import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, CheckCircle2, FileText, GraduationCap, Rocket, Video } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource hub · CreditVault" },
      { name: "description", content: "Guides, templates, pitch decks, funding and grant playbooks for founders and students." },
    ],
  }),
  component: ResourcesPage,
});

const SECTIONS: {
  title: string;
  icon: typeof BookOpen;
  items: { label: string; desc: string; href?: string; to?: string }[];
}[] = [
  {
    title: "Founder guides",
    icon: Rocket,
    items: [
      { label: "How to stack $250K+ in startup credits", desc: "The exact sequence to apply for AWS, GCP, Azure and Cloudflare.", to: "/browse" },
      { label: "The AI-first startup playbook", desc: "OpenAI, Anthropic, Groq and Hugging Face credit programs.", to: "/browse" },
      { label: "Cutting cloud bills to zero for year one", desc: "Free tiers, credits and edge-first architecture patterns.", to: "/stack" },
    ],
  },
  {
    title: "Templates",
    icon: FileText,
    items: [
      { label: "Pitch deck (10 slides)", desc: "Sequoia-style template used by 30+ funded startups.", href: "https://www.sequoiacap.com/article/writing-a-business-plan/" },
      { label: "Business plan skeleton", desc: "Investor-ready outline with financial model links.", href: "https://articles.bplans.com/how-to-write-a-business-plan/" },
      { label: "One-pager (investor)", desc: "Print-ready single sheet with problem, solution, traction.", href: "https://slidebean.com/blog/startups-investor-one-pager" },
    ],
  },
  {
    title: "Funding & grants",
    icon: GraduationCap,
    items: [
      { label: "Government grants directory", desc: "Country-by-country programs for early-stage teams.", to: "/map" },
      { label: "Accelerator application guide", desc: "YC, Techstars, 500 — what actually gets accepted.", to: "/browse" },
      { label: "Non-dilutive funding checklist", desc: "Grants, credits, competitions — no equity required.", to: "/browse" },
    ],
  },
  {
    title: "Student & OSS",
    icon: BookOpen,
    items: [
      { label: "GitHub Student Pack — full breakdown", desc: "Every perk, ranked by real value.", to: "/browse" },
      { label: "Open-source maintainer perks", desc: "Free plans and credits for OSS contributors.", to: "/browse" },
      { label: "Hackathon-ready checklist", desc: "Tools, hosting and credits to ship in 48 hours.", to: "/calendar" },
    ],
  },
  {
    title: "Video & courses",
    icon: Video,
    items: [
      { label: "YC Startup School (free)", desc: "9-week async program from Y Combinator.", href: "https://www.startupschool.org/" },
      { label: "Stanford CS183 (How to start a startup)", desc: "Classic lecture series with Sam Altman.", href: "https://startupclass.samaltman.com/" },
      { label: "Andrej Karpathy — Zero to Hero (AI)", desc: "Build LLMs from scratch on free GPUs.", href: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
    ],
  },
  {
    title: "Checklists",
    icon: CheckCircle2,
    items: [
      { label: "Pre-launch checklist", desc: "Legal, compliance, analytics before day 1.", to: "/browse" },
      { label: "AWS Activate application checklist", desc: "Docs to prepare before you apply.", to: "/browse" },
      { label: "Fundraising due-diligence pack", desc: "Everything an investor will ask for.", to: "/browse" },
    ],
  },
];

function ResourcesPage() {
  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Resource hub"
        title="Everything founders wish they had on day one."
        subtitle="Guides, templates, checklists and playbooks — curated from the best free sources."
      />

      <section className="container-x py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((sec) => (
            <GlassCard key={sec.title}>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                <sec.icon className="h-3.5 w-3.5" /> {sec.title}
              </p>
              <ul className="mt-3 space-y-2">
                {sec.items.map((it) => {
                  const inner = (
                    <div className="group flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/20 hover:bg-white/[0.05]">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium">{it.label}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{it.desc}</p>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
                    </div>
                  );
                  return (
                    <li key={it.label}>
                      {it.to ? (
                        <Link to={it.to}>{inner}</Link>
                      ) : (
                        <a href={it.href} target="_blank" rel="noreferrer">{inner}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
