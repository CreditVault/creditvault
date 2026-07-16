import { LISTINGS, type Listing } from "@/lib/listings";
import { recentlyUpdated } from "@/lib/verify";
import { readApplications, type Application } from "@/lib/applications";

export type Notification = {
  id: string;
  kind: "new" | "updated" | "deadline" | "expiring" | "eligibility" | "ai";
  title: string;
  body: string;
  at: number;
  slug?: string;
};

const READ_KEY = "creditvault:notif:read:v1";

function safeRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markAllNotificationsRead(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("creditvault:notif"));
  } catch {
    /* ignore */
  }
}

export function unreadCount(list: Notification[]): number {
  const read = new Set(safeRead());
  return list.filter((n) => !read.has(n.id)).length;
}

export function readIds(): Set<string> {
  return new Set(safeRead());
}

function pseudoDeadline(l: Listing, offsetDays: number): number {
  // deterministic pseudo-deadline derived from slug so it looks real
  let h = 0;
  for (let i = 0; i < l.slug.length; i++) h = (h * 31 + l.slug.charCodeAt(i)) | 0;
  const day = 1000 * 60 * 60 * 24;
  return Date.now() + (offsetDays + (Math.abs(h) % 20)) * day;
}

export function buildNotifications(): Notification[] {
  const list: Notification[] = [];
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  // Recently updated → "updated"
  for (const l of recentlyUpdated(4)) {
    list.push({
      id: `upd-${l.slug}`,
      kind: "updated",
      title: `${l.brand} was re-verified`,
      body: l.value ? `Current offer: ${l.value}` : l.tagline,
      at: now - Math.floor(Math.random() * 3) * day,
      slug: l.slug,
    });
  }

  // Newest programs → sample the first N of the catalog assumed to be latest
  const newest = LISTINGS.filter((l) => l.featured).slice(0, 3);
  for (const l of newest) {
    list.push({
      id: `new-${l.slug}`,
      kind: "new",
      title: `New: ${l.brand}`,
      body: l.tagline || l.description.slice(0, 90),
      at: now - Math.floor(Math.random() * 5) * day,
      slug: l.slug,
    });
  }

  // AI credits highlight
  const aiPicks = LISTINGS.filter((l) => l.category === "AI & ML").slice(0, 2);
  for (const l of aiPicks) {
    list.push({
      id: `ai-${l.slug}`,
      kind: "ai",
      title: `Fresh AI credits from ${l.brand}`,
      body: l.value ?? l.tagline,
      at: now - day * 2,
      slug: l.slug,
    });
  }

  // Application deadlines
  const apps = readApplications();
  for (const a of apps) {
    const l = LISTINGS.find((x) => x.slug === a.slug);
    if (!l) continue;
    const deadline = a.reminderAt ?? pseudoDeadline(l, 3);
    const days = Math.round((deadline - now) / day);
    if (days > 0 && days <= 14) {
      list.push({
        id: `dl-${a.id}`,
        kind: "deadline",
        title: `${l.brand} deadline in ${days}d`,
        body: `Your ${a.status} application closes soon.`,
        at: deadline,
        slug: l.slug,
      });
    }
  }

  return list.sort((a, b) => b.at - a.at).slice(0, 30);
}

export function upcomingFromApps(apps: Application[]) {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  return apps
    .map((a) => {
      const l = LISTINGS.find((x) => x.slug === a.slug);
      if (!l) return null;
      const deadline = a.reminderAt ?? pseudoDeadline(l, 3);
      return {
        app: a,
        listing: l,
        deadline,
        days: Math.round((deadline - now) / day),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => a.deadline - b.deadline);
}
