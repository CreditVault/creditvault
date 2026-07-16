import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Check, Loader2, Send, Sparkles } from "lucide-react";
import { z } from "zod";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CATEGORY_ORDER } from "@/lib/listings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit your offer — CreditVault" },
      {
        name: "description",
        content:
          "Share a startup credit, student discount, or developer perk with the CreditVault community. Verified submissions get listed within 48 hours.",
      },
      { property: "og:title", content: "Submit your offer — CreditVault" },
      { property: "og:description", content: "Add your perk to the largest verified credit directory." },
      { property: "og:url", content: "/submit" },
    ],
    links: [{ rel: "canonical", href: "/submit" }],
  }),
  component: SubmitPage,
});

const schema = z.object({
  brand: z.string().trim().min(2, "Brand name is required").max(80),
  name: z.string().trim().min(4, "Offer title is required").max(140),
  claim_url: z.string().trim().url("Must be a valid URL").max(400),
  value: z.string().trim().max(60).optional().or(z.literal("")),
  category: z.string().min(1, "Choose a category"),
  audience: z.enum(["student", "startup", "developer"]),
  description: z.string().trim().min(20, "Add at least 20 characters").max(1000),
  submitter_email: z.string().trim().email("Valid email required").max(255),
});

type FormState = Partial<Record<keyof z.infer<typeof schema>, string>>;

function SubmitPage() {
  const [form, setForm] = useState<FormState>({ audience: "startup" });
  const [errors, setErrors] = useState<FormState>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: FormState = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as keyof FormState] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const payload = {
      ...parsed.data,
      value: parsed.data.value ? parsed.data.value : null,
    };
    const { error } = await supabase.from("offer_submissions").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't submit your offer", { description: error.message });
      return;
    }
    toast.success("Offer submitted for review");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-dvh text-foreground">
        <Nav />
        <main className="container-x flex flex-col items-center py-24 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Thanks — your offer is in the queue</h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            We manually verify every submission. Expect a decision within 48 hours at{" "}
            <span className="text-foreground">{form.submitter_email}</span>.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/browse"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Browse offers <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm({ audience: "startup" });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm"
            >
              Submit another
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh text-foreground">
      <Nav />
      <main className="container-x py-10 md:py-14">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground">Submit an offer</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <section>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Community submission
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-[42px] md:leading-[1.1]">
              Submit your offer
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Know a credit, discount, or perk that belongs in CreditVault? Send it over. Verified offers appear in the directory within 48 hours and reach 40k+ founders, students and developers.
            </p>

            <form
              onSubmit={onSubmit}
              noValidate
              className="mt-8 space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Brand / Company" error={errors.brand}>
                  <input
                    value={form.brand ?? ""}
                    onChange={(e) => update("brand", e.target.value)}
                    maxLength={80}
                    placeholder="Notion, Vercel, Figma…"
                    className={input(errors.brand)}
                  />
                </Field>
                <Field label="Offer title" error={errors.name}>
                  <input
                    value={form.name ?? ""}
                    onChange={(e) => update("name", e.target.value)}
                    maxLength={140}
                    placeholder="Notion Plus free for 1 year"
                    className={input(errors.name)}
                  />
                </Field>
              </div>

              <Field label="Claim URL" error={errors.claim_url}>
                <input
                  value={form.claim_url ?? ""}
                  onChange={(e) => update("claim_url", e.target.value)}
                  maxLength={400}
                  placeholder="https://…"
                  className={input(errors.claim_url)}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Value (optional)" error={errors.value}>
                  <input
                    value={form.value ?? ""}
                    onChange={(e) => update("value", e.target.value)}
                    maxLength={60}
                    placeholder="$500 credit"
                    className={input(errors.value)}
                  />
                </Field>
                <Field label="Category" error={errors.category}>
                  <select
                    value={form.category ?? ""}
                    onChange={(e) => update("category", e.target.value)}
                    className={input(errors.category)}
                  >
                    <option value="">Select…</option>
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Audience" error={errors.audience}>
                  <select
                    value={form.audience ?? "startup"}
                    onChange={(e) => update("audience", e.target.value)}
                    className={input(errors.audience)}
                  >
                    <option value="student">Students</option>
                    <option value="startup">Startups</option>
                    <option value="developer">Developers</option>
                  </select>
                </Field>
              </div>

              <Field label="Description" error={errors.description}>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => update("description", e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="What does the offer include? Any eligibility caveats?"
                  className={input(errors.description) + " resize-y"}
                />
              </Field>

              <Field label="Your email" error={errors.submitter_email}>
                <input
                  type="email"
                  value={form.submitter_email ?? ""}
                  onChange={(e) => update("submitter_email", e.target.value)}
                  maxLength={255}
                  placeholder="you@company.com"
                  className={input(errors.submitter_email)}
                />
              </Field>

              <p className="text-xs text-muted-foreground">
                We'll only email you about this submission. No newsletter opt-in.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </form>
          </section>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                What gets accepted
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                {[
                  "Offer is publicly available (no leaked codes).",
                  "Clear eligibility for students, startups, or devs.",
                  "Claim URL points to the official provider.",
                  "Still active — we verify before publishing.",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Timeline
              </p>
              <p className="mt-3 text-sm text-foreground/85">
                Manual review within <span className="text-foreground">48 hours</span>. If approved, your offer joins the directory and appears in the audience feeds you selected.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </label>
  );
}

function input(error?: string) {
  return `w-full rounded-xl border ${
    error ? "border-destructive/60" : "border-white/10"
  } bg-black/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none`;
}
