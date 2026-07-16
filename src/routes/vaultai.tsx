import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LogoTile } from "@/components/site/ListingCard";
import { LISTINGS, type Listing } from "@/lib/listings";
import { askAssistant } from "@/lib/ai-assistant.functions";

type Msg = {
  role: "user" | "assistant";
  content: string;
  results?: Listing[];
  error?: boolean;
};

type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

const SLUG_INDEX = new Map(LISTINGS.map((l) => [l.slug, l] as const));
const THREADS_KEY = "creditvault:vaultai:threads:v1";
const ACTIVE_KEY = "creditvault:vaultai:active:v1";

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi — I'm **VaultAI**, your concierge for startup credits, student offers, cloud/AI credits and developer perks. Ask me anything, or pick a suggestion below.",
};

const SUGGESTIONS = [
  "Best AI API credits for a solo founder",
  "AWS vs Google Cloud for early startups",
  "Free perks for open-source maintainers",
  "GitHub Student Pack highlights",
  "Compare Supabase and Firebase",
  "Grants for student hackathons in India",
];

export const Route = createFileRoute("/vaultai")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q.slice(0, 500) : undefined,
    t: typeof s.t === "string" ? s.t.slice(0, 64) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "VaultAI — Ask anything about startup credits & perks" },
      {
        name: "description",
        content:
          "Chat with VaultAI, the CreditVault assistant. Get instant, verified answers about startup credits, student offers, AI credits, cloud perks and grants.",
      },
      { property: "og:title", content: "VaultAI — CreditVault Assistant" },
      {
        property: "og:description",
        content:
          "Ask VaultAI anything about startup credits, student offers, AI credits, cloud perks and grants.",
      },
    ],
  }),
  component: VaultAIPage,
});

function newThreadId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function makeThread(): Thread {
  return {
    id: newThreadId(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [WELCOME],
  };
}

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return [];
}

function saveThreads(threads: Thread[]) {
  try {
    window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch {
    /* ignore quota */
  }
}

function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 45) + "…" : t || "New chat";
}

function VaultAIPage() {
  const { q, t } = Route.useSearch();
  const navigate = useNavigate();
  const ask = useServerFn(askAssistant);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSentRef = useRef<string | null>(null);

  // Bootstrap threads once (StrictMode-safe: idempotent read + write)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let list = loadThreads();
    let active = window.localStorage.getItem(ACTIVE_KEY);
    if (list.length === 0) {
      const first = makeThread();
      list = [first];
      active = first.id;
      saveThreads(list);
      window.localStorage.setItem(ACTIVE_KEY, active);
    }
    // Honor incoming ?t=
    if (t && list.some((x) => x.id === t)) active = t;
    if (!active || !list.some((x) => x.id === active)) active = list[0].id;
    setThreads(list);
    setActiveId(active);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist threads
  useEffect(() => {
    if (!hydrated) return;
    saveThreads(threads);
  }, [threads, hydrated]);

  // Persist active id + reflect in URL
  useEffect(() => {
    if (!hydrated || !activeId) return;
    try {
      window.localStorage.setItem(ACTIVE_KEY, activeId);
    } catch {
      /* ignore */
    }
    if (t !== activeId) {
      navigate({
        to: "/vaultai",
        search: (prev: { q?: string; t?: string }) => ({ ...prev, t: activeId }),
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, hydrated]);

  const activeThread = useMemo(
    () => threads.find((x) => x.id === activeId) ?? null,
    [threads, activeId],
  );
  const msgs = activeThread?.messages ?? [WELCOME];

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const patchThread = useCallback(
    (id: string, patch: (t: Thread) => Thread) => {
      setThreads((list) => list.map((x) => (x.id === id ? patch(x) : x)));
    },
    [],
  );

  const send = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query || busy || !activeId) return;
      setInput("");
      const currentId = activeId;
      const isFirstUser =
        (activeThread?.messages ?? []).every((m) => m.role !== "user");

      patchThread(currentId, (thr) => ({
        ...thr,
        title: isFirstUser ? titleFrom(query) : thr.title,
        updatedAt: Date.now(),
        messages: [...thr.messages, { role: "user", content: query }],
      }));

      setBusy(true);
      try {
        // Build payload from freshest messages
        const latest =
          threads.find((x) => x.id === currentId)?.messages ?? [];
        const payload = [...latest, { role: "user" as const, content: query }]
          .filter((m) => !("error" in m) || !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        const { reply, slugs } = await ask({ data: { messages: payload } });
        const results = slugs
          .map((s) => SLUG_INDEX.get(s))
          .filter((l): l is Listing => Boolean(l));

        patchThread(currentId, (thr) => ({
          ...thr,
          updatedAt: Date.now(),
          messages: [
            ...thr.messages,
            { role: "assistant", content: reply, results },
          ],
        }));
      } catch (err) {
        patchThread(currentId, (thr) => ({
          ...thr,
          updatedAt: Date.now(),
          messages: [
            ...thr.messages,
            {
              role: "assistant",
              content:
                (err instanceof Error ? err.message : "Something went wrong.") +
                "\n\nPlease try again in a moment.",
              error: true,
            },
          ],
        }));
      } finally {
        setBusy(false);
        setTimeout(() => inputRef.current?.focus(), 30);
      }
    },
    [ask, activeId, activeThread, busy, patchThread, threads],
  );

  // Auto-send incoming ?q= once
  useEffect(() => {
    if (!hydrated || !q || busy || !activeId) return;
    const key = `${activeId}::${q}`;
    if (autoSentRef.current === key) return;
    autoSentRef.current = key;
    void send(q);
    navigate({
      to: "/vaultai",
      search: { t: activeId },
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, q, activeId]);

  const createThread = () => {
    const thr = makeThread();
    setThreads((list) => [thr, ...list]);
    setActiveId(thr.id);
  };

  const selectThread = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  const deleteThread = (id: string) => {
    setThreads((list) => {
      const next = list.filter((x) => x.id !== id);
      if (id === activeId) {
        if (next.length === 0) {
          const thr = makeThread();
          setActiveId(thr.id);
          return [thr];
        }
        setActiveId(next[0].id);
      }
      return next;
    });
  };

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt - a.updatedAt),
    [threads],
  );

  const showSuggestions = msgs.length <= 1 && !busy;

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />

      <section className="relative border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
        <div className="container-x relative py-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
            CreditVault Assistant
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            VaultAI
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Ask anything about startup credits, student offers, AI credits,
            cloud perks and grants. Conversations are saved in this browser.
          </p>
        </div>
      </section>

      <section className="container-x py-6">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          {/* Threads sidebar */}
          <aside className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
            <button
              onClick={createThread}
              className="mb-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> New chat
            </button>
            <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {sortedThreads.length === 0 && (
                <p className="px-2 py-3 text-[12px] text-muted-foreground">
                  No conversations yet.
                </p>
              )}
              {sortedThreads.map((thr) => {
                const isActive = thr.id === activeId;
                return (
                  <div
                    key={thr.id}
                    className={
                      "group flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[12px] transition " +
                      (isActive
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.03] hover:text-foreground")
                    }
                  >
                    <button
                      onClick={() => selectThread(thr.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{thr.title}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this conversation? This can't be undone.",
                          )
                        )
                          deleteThread(thr.id);
                      }}
                      aria-label="Delete conversation"
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-white/10 hover:text-foreground group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Chat surface */}
          <div className="chat-glow">
            <span aria-hidden className="chat-glow-halo" />
            <span aria-hidden className="chat-glow-ring" />
            <div className="relative z-10 flex h-[70vh] min-h-[520px] flex-col overflow-hidden rounded-[22px] bg-background/90 backdrop-blur-xl">
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-6"
              >
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user" ? "flex justify-end" : "flex flex-col"
                    }
                  >
                    <div
                      className={
                        "max-w-[92%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed " +
                        (m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : m.error
                            ? "bg-destructive/15 text-foreground"
                            : "bg-white/[0.04] text-foreground")
                      }
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-strong:text-foreground">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.results && m.results.length > 0 && (
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {m.results.map((l) => (
                          <Link
                            key={l.slug}
                            to="/offer/$slug"
                            params={{ slug: l.slug }}
                            className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                          >
                            <LogoTile src={l.logo_url} name={l.brand} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium">
                                {l.brand}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {l.value || l.category}
                              </p>
                            </div>
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {busy && (
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking…
                  </div>
                )}

                {showSuggestions && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="flex items-end gap-2 border-t border-white/10 bg-white/[0.02] p-3"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  placeholder="Ask VaultAI anything…"
                  disabled={busy}
                  className="flex-1 resize-none rounded-lg border border-white/10 bg-background/60 px-3 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-muted-foreground">
          VaultAI can make mistakes. Verify important details on the official
          program page.
        </p>
      </section>

      <Footer />
    </div>
  );
}
