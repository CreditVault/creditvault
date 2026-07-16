import { useCallback, useEffect, useState } from "react";

const KEY = "creditvault:bookmarks:v1";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("creditvault:bookmarks"));
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const onChange = () => setIds(read());
    window.addEventListener("creditvault:bookmarks", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("creditvault:bookmarks", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    write(next);
  }, []);

  const has = useCallback((slug: string) => ids.includes(slug), [ids]);

  return { ids, toggle, has };
}
