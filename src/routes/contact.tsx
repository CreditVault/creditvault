import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CreditVault" },
      { name: "description", content: "Get in touch with the CreditVault team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      updated="July 16, 2026"
      description="We're a small team. The fastest way to reach us is one of the channels below."
    >
      <h2>General enquiries, feedback and legal notices</h2>
      <p>
        Email:{" "}
        <a href="mailto:hello@creditvault.tech">hello@creditvault.tech</a>
      </p>

      <h2>Report a bad or expired offer</h2>
      <p>
        Please include the offer URL on CreditVault and what looks wrong. This helps us
        re-verify quickly.
      </p>

      <h2>Submit a new offer</h2>
      <p>
        Use the <a href="/submit">Submit</a> page — it's the fastest path into the
        directory.
      </p>

      <h2>Security disclosures</h2>
      <p>
        If you believe you have found a security vulnerability, please email us before
        public disclosure and give us a reasonable time to respond.
      </p>

      <h2>Source code</h2>
      <p>
        CreditVault is open source. Issues and pull requests are welcome on{" "}
        <a href="https://github.com/CreditVault/creditvault" target="_blank" rel="noreferrer">
          GitHub
        </a>.
      </p>
    </LegalPage>
  );
}
