import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, MessageSquare, Send, Trophy } from "lucide-react";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { PageHero, GlassCard } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { LISTINGS } from "@/lib/listings";
import { useBookmarks } from "@/lib/bookmarks";
import { useLikes, useReviews } from "@/lib/reactions";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community · CreditVault" },
      { name: "description", content: "Bookmark, like and review startup credits with the CreditVault community." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { ids: bookmarks } = useBookmarks();
  const { likes } = useLikes();
  const { all: reviews, add, remove } = useReviews();
  const [slug, setSlug] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  const leaderboard = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of likes) map.set(s, (map.get(s) ?? 0) + 3);
    for (const s of bookmarks) map.set(s, (map.get(s) ?? 0) + 2);
    for (const r of reviews) map.set(r.slug, (map.get(r.slug) ?? 0) + 5);
    return [...map.entries()]
      .map(([s, score]) => ({ l: LISTINGS.find((x) => x.slug === s), score }))
      .filter((x): x is { l: NonNullable<typeof x.l>; score: number } => Boolean(x.l))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [bookmarks, likes, reviews]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    add({ slug, rating, body: body.trim().slice(0, 400), author: author.trim() || "Anonymous" });
    setBody("");
  };

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <PageHero
        eyebrow="Community"
        title="Programs the community actually uses."
        subtitle="Bookmarks, likes and reviews from real founders and students. Your interactions stay in this browser."
        actions={
          <Link to="/achievements" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium transition hover:border-white/20">
            <Trophy className="h-3.5 w-3.5" /> Your badges
          </Link>
        }
      />

      <section className="container-x py-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          {/* Leaderboard + reviews */}
          <div className="space-y-3">
            <GlassCard>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Community leaderboard</p>
                <span className="font-mono text-[11px] text-muted-foreground">Bookmarks · Likes · Reviews</span>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Save, like and review offers — your favorites appear here.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {leaderboard.map((r) => (
                    <ListingCard key={r.l.slug} l={r.l} />
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Recent reviews</p>
              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Be the first to review a program.</p>
              ) : (
                <ul className="mt-3 divide-y divide-white/[0.05]">
                  {reviews.slice(0, 8).map((r) => {
                    const l = LISTINGS.find((x) => x.slug === r.slug);
                    return (
                      <li key={r.id} className="py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium">
                            {l ? (
                              <Link to="/offer/$slug" params={{ slug: l.slug }} className="hover:text-foreground">
                                {l.brand}
                              </Link>
                            ) : (
                              r.slug
                            )}
                            <span className="ml-2 font-mono text-[11px] text-amber-300">
                              {"★".repeat(r.rating)}
                              <span className="text-muted-foreground">{"★".repeat(5 - r.rating)}</span>
                            </span>
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-foreground/90">{r.body}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">— {r.author}</p>
                          <button
                            onClick={() => remove(r.id)}
                            className="text-[11px] text-muted-foreground hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassCard>
          </div>

          {/* Sidebar: review form + counts */}
          <div className="space-y-3">
            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Leave a review</p>
              <form onSubmit={submit} className="mt-3 space-y-2">
                <select
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
                >
                  <option value="" className="bg-background">Pick a program…</option>
                  {LISTINGS.slice(0, 300).map((l) => (
                    <option key={l.slug} value={l.slug} className="bg-background">
                      {l.brand}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={
                        "h-8 flex-1 rounded-md border text-sm transition " +
                        (rating >= n
                          ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground")
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="Was the offer worth it? Any tips?"
                  className="w-full resize-none rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-[13px] outline-none focus:border-primary/40"
                />
                <button
                  type="submit"
                  disabled={!slug || !body.trim()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" /> Post review
                </button>
              </form>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Your interactions</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Stat n={bookmarks.length} label="Saved" />
                <Stat n={likes.length} label="Liked" icon={<Heart className="h-3 w-3" />} />
                <Stat n={reviews.filter((r) => r.author).length} label="Reviews" icon={<MessageSquare className="h-3 w-3" />} />
              </div>
              <Link to="/submit" className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-muted-foreground transition hover:border-white/20 hover:text-foreground">
                Submit a program →
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ n, label, icon }: { n: number; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-3">
      <p className="text-lg font-semibold">{n}</p>
      <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
    </div>
  );
}
