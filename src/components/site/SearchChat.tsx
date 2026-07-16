import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Sparkles, X, ArrowUpRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LISTINGS, type Listing } from "@/lib/listings";
import { LogoTile } from "./ListingCard";
import { askAssistant } from "@/lib/ai-assistant.functions";

type Msg = {
  role: "user" | "assistant";
  content: string;
  results?: Listing[];
  error?: boolean;
};

const SLUG_INDEX = new Map(LISTINGS.map((l) => [l.slug, l] as const));

export function SearchChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your **CreditVault assistant**. Ask me anything — try _\"AWS offers\"_, _\"AI API credits\"_, or _\"perks for open-source maintainers\"_.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ask = useServerFn(askAssistant);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      setOpen(true);
      if (typeof q === "string" && q.trim()) setTimeout(() => send(q), 60);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("creditvault:ask", onAsk as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("creditvault:ask", onAsk as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (q: string) => {
    const query = q.trim();
    if (!query || busy) return;
    setInput("");
    const nextMsgs: Msg[] = [...msgs, { role: "user", content: query }];
    setMsgs(nextMsgs);
    setBusy(true);
    try {
      const payload = nextMsgs
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));
      const { reply, slugs } = await ask({ data: { messages: payload } });
      const results = slugs
        .map((s) => SLUG_INDEX.get(s))
        .filter((l): l is Listing => Boolean(l));
      setMsgs((m) => [...m, { role: "assistant", content: reply, results }]);
    } catch (err) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            (err instanceof Error ? err.message : "Something went wrong.") +
            "\n\nTry again in a moment.",
          error: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = useMemo(
    () => [
      "AWS offers",
      "Free AI API credits",
      "GitHub student perks",
      "Compare Supabase and Firebase",
      "Perks for open-source maintainers",
    ],
    [],
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="chat-glow fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-foreground shadow-xl transition hover:scale-[1.03]"
      >
        <span aria-hidden className="chat-glow-halo" />
        <span aria-hidden className="chat-glow-ring" />
        <span className="relative z-10 inline-flex items-center gap-2">
          {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {open ? "Close" : "Ask AI"}
        </span>
      </button>

      {open && (
        <div className="chat-glow fixed bottom-24 right-5 z-50 flex h-[600px] w-[calc(100vw-2.5rem)] max-w-[440px] flex-col overflow-hidden shadow-2xl">
          <span aria-hidden className="chat-glow-halo" />
          <span aria-hidden className="chat-glow-ring" />
          <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[22px] bg-background/95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">CreditVault AI</p>
                  <p className="text-[11px] text-muted-foreground">
                    Ask anything • ⌘K
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col"}>
                  <div
                    className={
                      "max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed " +
                      (m.role === "user"
                        ? "self-end bg-primary text-primary-foreground"
                        : m.error
                          ? "bg-destructive/15 text-foreground"
                          : "bg-white/5 text-foreground")
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
                    <div className="mt-2 space-y-1.5">
                      {m.results.map((l) => (
                        <Link
                          key={l.slug}
                          to="/offer/$slug"
                          params={{ slug: l.slug }}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                        >
                          <LogoTile src={l.logo_url} name={l.brand} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">{l.brand}</p>
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

              {msgs.length === 1 && !busy && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
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
                send(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask about any offer, company, or category…"
                disabled={busy}
                className="flex-1 rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
