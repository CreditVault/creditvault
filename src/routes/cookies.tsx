import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — CreditVault" },
      { name: "description", content: "How CreditVault uses cookies and local storage." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 16, 2026"
      description="CreditVault uses a minimal set of cookies and browser storage to keep the Service working."
    >
      <h2>1. What we use</h2>
      <ul>
        <li><strong>Strictly necessary</strong> — session and authentication cookies set when you sign in, so we can keep you signed in securely.</li>
        <li><strong>Preferences (local storage)</strong> — your saved offers ("bookmarks") are stored in your browser's <em>localStorage</em>, on your device, so you can find them later. This is not a cookie and is not sent to our servers.</li>
      </ul>

      <h2>2. What we do not use</h2>
      <ul>
        <li>No advertising or cross-site tracking cookies.</li>
        <li>No third-party analytics fingerprinting.</li>
      </ul>

      <h2>3. Managing cookies</h2>
      <p>
        You can clear cookies and site data at any time via your browser settings. Doing so
        will sign you out and clear locally saved bookmarks.
      </p>

      <h2>4. Changes</h2>
      <p>
        If we start using additional cookies, we will update this page and, where required,
        ask for your consent.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions? Get in touch via the <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  );
}
