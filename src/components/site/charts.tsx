import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Animated numeric counter                                            */
/* ------------------------------------------------------------------ */
export function CountUp({
  value,
  duration = 1400,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{format(n)}</span>;
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list                                                 */
/* ------------------------------------------------------------------ */
export function BarList({
  items,
  max,
  format = (n) => n.toLocaleString(),
}: {
  items: { label: string; value: number; hint?: string; color?: string }[];
  max?: number;
  format?: (n: number) => string;
}) {
  const cap = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const pct = Math.max(2, (it.value / cap) * 100);
        return (
          <li key={it.label} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[12px]">
              <span className="truncate text-foreground/90">{it.label}</span>
              <span className="font-mono text-muted-foreground">
                {format(it.value)}
                {it.hint && <span className="ml-1 opacity-60">{it.hint}</span>}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background:
                    it.color ??
                    "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.55) 100%)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline (pure SVG)                                                */
/* ------------------------------------------------------------------ */
export function Sparkline({
  values,
  width = 160,
  height = 44,
  stroke = "hsl(var(--primary))",
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sp-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="url(#sp-fill)"
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
      <polyline fill="none" stroke={stroke} strokeWidth="1.6" points={points} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Donut ring                                                          */
/* ------------------------------------------------------------------ */
export function Donut({
  value,
  max,
  size = 92,
  label,
  sub,
}: {
  value: number;
  max: number;
  size?: number;
  label?: string;
  sub?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--muted) / 0.15)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(c * pct).toFixed(2)} ${c.toFixed(2)}`}
          style={{ transition: "stroke-dasharray 900ms ease-out" }}
        />
      </svg>
      <div>
        <p className="text-2xl font-semibold tracking-tight">
          <CountUp value={value} />
        </p>
        {label && <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
