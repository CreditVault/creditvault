import { LISTINGS, type Listing } from "@/lib/listings";

// Deterministic pseudo "last verified" date per slug — within the last 30 days.
// Uses a stable hash so the same slug always renders the same date across SSR + client.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

const EPOCH = Date.UTC(2026, 6, 1); // stable anchor: Jul 1, 2026
const DAY = 86_400_000;

export function lastVerifiedAt(slug: string): Date {
  const daysAgo = hash(slug) % 30; // 0-29 days ago
  return new Date(EPOCH - daysAgo * DAY);
}

export function formatVerified(d: Date): string {
  const days = Math.round((EPOCH - d.getTime()) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

let cached: Listing[] | null = null;
export function recentlyUpdated(limit = 8): Listing[] {
  if (cached) return cached.slice(0, limit);
  cached = [...LISTINGS].sort(
    (a, b) => lastVerifiedAt(b.slug).getTime() - lastVerifiedAt(a.slug).getTime(),
  );
  return cached.slice(0, limit);
}
