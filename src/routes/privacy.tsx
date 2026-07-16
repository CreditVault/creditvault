import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CreditVault" },
      { name: "description", content: "How CreditVault handles data when you use our free directory of credits and perks." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 16, 2026"
      description="This policy explains what limited information CreditVault collects, why we collect it, and the choices you have."
    >
      <h2>1. Who we are</h2>
      <p>
        CreditVault is a community-maintained directory of publicly available credit, perk
        and student offer programs. The Service is operated by the CreditVault team
        (“we”, “us”, “our”).
      </p>

      <h2>2. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li><strong>Account data</strong> — if you sign in, we store your email address and, when applicable, your OAuth provider identifier (e.g. Google user ID).</li>
        <li><strong>Submissions</strong> — content you send us through the Submit form or contact page.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Bookmarks</strong> — offers you save are stored in your browser's local storage on your device, not on our servers.</li>
        <li><strong>Basic request data</strong> — IP address, user-agent and timestamps in server logs for security and abuse prevention.</li>
      </ul>

      <h2>3. What we do not do</h2>
      <ul>
        <li>We do not sell your personal data.</li>
        <li>We do not run advertising trackers or third-party ad networks.</li>
        <li>We do not require signup to browse the directory.</li>
      </ul>

      <h2>4. Legal bases (EEA/UK users)</h2>
      <p>
        We rely on legitimate interests to operate and secure the Service, and on your
        consent for optional features (such as creating an account).
      </p>

      <h2>5. Sharing and subprocessors</h2>
      <p>
        We use a small number of infrastructure providers to run CreditVault, including
        hosting, authentication and AI providers. These processors handle data only on our
        instructions and under appropriate agreements. We do not share your data with
        anyone else except when required by law.
      </p>

      <h2>6. Data retention</h2>
      <ul>
        <li>Account data is retained while your account exists. You may request deletion at any time.</li>
        <li>Server logs are retained for a short operational window and then discarded.</li>
        <li>Bookmarks live in your browser and are cleared when you clear site data.</li>
      </ul>

      <h2>7. Your rights</h2>
      <p>
        Depending on where you live you may have the right to access, correct, delete,
        export or restrict processing of your personal data. To exercise these rights,
        contact us via the <a href="/contact">contact page</a>.
      </p>

      <h2>8. Children</h2>
      <p>
        CreditVault is not directed to children under 13 (or the equivalent minimum age in
        your jurisdiction). We do not knowingly collect personal information from children.
      </p>

      <h2>9. Security</h2>
      <p>
        We take reasonable technical and organisational measures to protect the limited
        information we hold, but no service can guarantee absolute security.
      </p>

      <h2>10. International transfers</h2>
      <p>
        Our infrastructure providers may process data in countries other than yours. Where
        required, appropriate safeguards are used.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be indicated by
        updating the "Last updated" date at the top of this page.
      </p>

      <h2>12. Contact</h2>
      <p>
        For privacy questions, requests or complaints, please use the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  );
}
