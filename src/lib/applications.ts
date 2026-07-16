import { useCallback, useEffect, useSyncExternalStore } from "react";

export const APP_STATUSES = [
  "saved",
  "draft",
  "applying",
  "submitted",
  "review",
  "approved",
  "rejected",
  "expired",
  "renewed",
] as const;

export type AppStatus = (typeof APP_STATUSES)[number];

export const STATUS_META: Record<
  AppStatus,
  { label: string; tone: string; dot: string }
> = {
  saved: { label: "Saved", tone: "text-muted-foreground", dot: "bg-white/40" },
  draft: { label: "Draft", tone: "text-slate-300", dot: "bg-slate-400" },
  applying: { label: "Applying", tone: "text-amber-300", dot: "bg-amber-400" },
  submitted: { label: "Submitted", tone: "text-sky-300", dot: "bg-sky-400" },
  review: { label: "Under review", tone: "text-indigo-300", dot: "bg-indigo-400" },
  approved: { label: "Approved", tone: "text-emerald-300", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", tone: "text-rose-300", dot: "bg-rose-400" },
  expired: { label: "Expired", tone: "text-zinc-400", dot: "bg-zinc-500" },
  renewed: { label: "Renewed", tone: "text-teal-300", dot: "bg-teal-400" },
};

export type Application = {
  id: string;
  slug: string;
  status: AppStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  approvedAt?: number;
  reminderAt?: number;
  notes?: string;
  documents?: string[];
  timeline: { at: number; status: AppStatus; note?: string }[];
};

const KEY = "creditvault:applications:v1";
const EVT = "creditvault:applications";

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

function write(list: Application[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Application[] {
  return read();
}

function getServerSnapshot(): Application[] {
  return [];
}

export function useApplications() {
  const apps = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const upsert = useCallback(
    (
      slug: string,
      patch: Partial<Omit<Application, "id" | "slug" | "createdAt" | "timeline">> & {
        status?: AppStatus;
        note?: string;
      },
    ) => {
      const now = Date.now();
      const list = read();
      const existing = list.find((a) => a.slug === slug);
      if (existing) {
        const next: Application = {
          ...existing,
          ...patch,
          updatedAt: now,
          submittedAt:
            patch.status === "submitted" && !existing.submittedAt
              ? now
              : (patch.submittedAt ?? existing.submittedAt),
          approvedAt:
            patch.status === "approved" && !existing.approvedAt
              ? now
              : (patch.approvedAt ?? existing.approvedAt),
          timeline: patch.status
            ? [
                ...existing.timeline,
                { at: now, status: patch.status, note: patch.note },
              ]
            : existing.timeline,
        };
        write(list.map((a) => (a.id === existing.id ? next : a)));
        return next;
      }
      const created: Application = {
        id: now.toString(36) + Math.random().toString(36).slice(2, 6),
        slug,
        status: patch.status ?? "saved",
        createdAt: now,
        updatedAt: now,
        submittedAt: patch.status === "submitted" ? now : patch.submittedAt,
        approvedAt: patch.status === "approved" ? now : patch.approvedAt,
        reminderAt: patch.reminderAt,
        notes: patch.notes,
        documents: patch.documents,
        timeline: [{ at: now, status: patch.status ?? "saved", note: patch.note }],
      };
      write([...list, created]);
      return created;
    },
    [],
  );

  const remove = useCallback((slug: string) => {
    write(read().filter((a) => a.slug !== slug));
  }, []);

  const bySlug = useCallback(
    (slug: string) => apps.find((a) => a.slug === slug),
    [apps],
  );

  return { apps, upsert, remove, bySlug };
}

// Convenience non-hook read for one-off computations
export function readApplications(): Application[] {
  return read();
}

export function useEnsureFirstBadge() {
  // no-op placeholder; kept for API stability if hooks want to react
  useEffect(() => {}, []);
}
