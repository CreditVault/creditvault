import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-40" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
      <div className="container-x relative flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/15 " +
        className
      }
    >
      {children}
    </div>
  );
}
