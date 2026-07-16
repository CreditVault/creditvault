import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy — CreditVault" },
      { name: "description", content: "Rules of the road for using CreditVault." },
    ],
  }),
  component: AupPage,
});

function AupPage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      updated="July 16, 2026"
      description="To keep CreditVault safe and useful for everyone, please follow these rules when using the Service."
    >
      <h2>You must not</h2>
      <ul>
        <li>Scrape, crawl, mirror or bulk-download the directory in a way that harms the Service or overloads our infrastructure.</li>
        <li>Use the Service to distribute malware, phishing pages or fraudulent offers.</li>
        <li>Submit false, misleading, spammy or off-topic listings.</li>
        <li>Circumvent authentication, rate limits or security measures.</li>
        <li>Use CreditVault to harass, defame, dox or discriminate against anyone.</li>
        <li>Reuse our name, branding or content to misrepresent the origin of an offer.</li>
        <li>Use the AI assistant to generate content that is illegal, harmful, hateful or infringing.</li>
      </ul>

      <h2>Fair automated use</h2>
      <p>
        A reasonable, low-volume, well-identified crawler is fine. If you are building
        something on top of the directory please reach out via the{" "}
        <a href="/contact">contact page</a> before launching so we can help.
      </p>

      <h2>Enforcement</h2>
      <p>
        We may throttle, suspend or remove access to any user or IP that violates this
        policy, without notice where necessary to protect the Service.
      </p>

      <h2>Reporting</h2>
      <p>
        Report abuse or a bad listing via the <a href="/contact">contact page</a>. For
        copyright takedowns see the <a href="/dmca">DMCA</a> page.
      </p>
    </LegalPage>
  );
}
