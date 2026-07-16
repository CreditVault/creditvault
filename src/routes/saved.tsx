import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bookmark, ArrowRight } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ListingCard } from "@/components/site/ListingCard";
import { useBookmarks } from "@/lib/bookmarks";
import { LISTINGS } from "@/lib/listings";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved offers — CreditVault" },
      { name: "description", content: "Your saved credits and offers, ready to apply." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { ids } = useBookmarks();
  const items = useMemo(
    () => LISTINGS.filter((l) => ids.includes(l.slug)),
    [ids],
  );

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <section className="container-x py-16">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Saved offers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} saved · stored in this browser
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-sm text-muted-foreground">
              You haven't saved any offers yet. Tap the bookmark on any card to keep it here.
            </p>
            <Link
              to="/browse"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Browse offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.slug} l={l} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
