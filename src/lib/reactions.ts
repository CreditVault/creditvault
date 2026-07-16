import { useCallback, useSyncExternalStore } from "react";

const LIKES_KEY = "creditvault:likes:v1";
const REVIEWS_KEY = "creditvault:reviews:v1";
const LIKES_EVT = "creditvault:likes";
const REVIEWS_EVT = "creditvault:reviews";

export type Review = {
  id: string;
  slug: string;
  rating: number; // 1..5
  body: string;
  author: string;
  createdAt: number;
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown, evt: string) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(evt));
}

function subscribe(evt: string) {
  return (cb: () => void) => {
    window.addEventListener(evt, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(evt, cb);
      window.removeEventListener("storage", cb);
    };
  };
}

export function useLikes() {
  const likes = useSyncExternalStore(
    subscribe(LIKES_EVT),
    () => safeRead<string[]>(LIKES_KEY, []),
    () => [] as string[],
  );

  const toggle = useCallback((slug: string) => {
    const cur = safeRead<string[]>(LIKES_KEY, []);
    const next = cur.includes(slug)
      ? cur.filter((s) => s !== slug)
      : [...cur, slug];
    safeWrite(LIKES_KEY, next, LIKES_EVT);
  }, []);

  const has = useCallback((slug: string) => likes.includes(slug), [likes]);
  return { likes, toggle, has };
}

export function useReviews(slug?: string) {
  const all = useSyncExternalStore(
    subscribe(REVIEWS_EVT),
    () => safeRead<Review[]>(REVIEWS_KEY, []),
    () => [] as Review[],
  );
  const forSlug = slug ? all.filter((r) => r.slug === slug) : all;

  const add = useCallback(
    (r: Omit<Review, "id" | "createdAt">) => {
      const cur = safeRead<Review[]>(REVIEWS_KEY, []);
      const next: Review = {
        ...r,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        createdAt: Date.now(),
      };
      safeWrite(REVIEWS_KEY, [next, ...cur], REVIEWS_EVT);
      return next;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    const cur = safeRead<Review[]>(REVIEWS_KEY, []);
    safeWrite(
      REVIEWS_KEY,
      cur.filter((r) => r.id !== id),
      REVIEWS_EVT,
    );
  }, []);

  return { reviews: forSlug, all, add, remove };
}
