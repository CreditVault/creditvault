import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — CreditVault" },
      { name: "description", content: "The terms that govern your use of the CreditVault directory." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="July 16, 2026"
      description="These Terms govern your access to and use of CreditVault (the “Service”), a free, community-maintained directory of startup credits, student offers and developer perks."
    >
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using CreditVault you agree to be bound by these Terms. If you do not
        agree, please stop using the Service.
      </p>

      <h2>2. Nature of the service</h2>
      <p>
        CreditVault aggregates publicly available information about third-party programs,
        perks and credit offers. We are not affiliated with, endorsed by, or a partner of the
        companies listed unless explicitly stated. All trademarks, product names and logos
        remain the property of their respective owners.
      </p>

      <h2>3. No warranty on listings</h2>
      <ul>
        <li>Offers, values, eligibility and links can change or expire at any time without notice.</li>
        <li>We work hard to verify listings but do not guarantee their accuracy, availability or completeness.</li>
        <li>Always confirm current terms on the official provider's website before applying.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>
        You agree not to misuse the Service. Prohibited conduct is described in our{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>. We may suspend or remove access
        for any user who violates it.
      </p>

      <h2>5. User submissions</h2>
      <p>
        If you submit an offer, correction or other content, you grant CreditVault a
        worldwide, royalty-free, non-exclusive licence to host, reproduce and display that
        content as part of the directory. You confirm you have the right to share it.
      </p>

      <h2>6. Accounts</h2>
      <p>
        Some features (such as saving offers) may require an account. You are responsible for
        keeping your credentials secure and for all activity under your account.
      </p>

      <h2>7. Third-party links</h2>
      <p>
        The Service contains links to third-party websites. We are not responsible for their
        content, policies or practices. Your interactions with third parties are solely
        between you and them.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The CreditVault name, branding and original directory content are protected by
        applicable IP laws. The underlying open-source code is licensed separately under the
        MIT License.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        The Service is provided "as is" and "as available" without warranties of any kind,
        express or implied, including merchantability, fitness for a particular purpose and
        non-infringement.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, CreditVault and its contributors will not be
        liable for any indirect, incidental, special, consequential or punitive damages, or
        any loss of profits or revenues, arising from your use of the Service.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be indicated by
        updating the "Last updated" date at the top of this page. Continued use of the
        Service after changes constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Reach us via the <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  );
}
