import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "DMCA / Takedown Notices — CreditVault" },
      { name: "description", content: "How to report copyright or trademark issues on CreditVault." },
    ],
  }),
  component: DmcaPage,
});

function DmcaPage() {
  return (
    <LegalPage
      title="DMCA & Takedown Notices"
      updated="July 16, 2026"
      description="CreditVault respects intellectual property rights. If you believe content on the Service infringes your rights, please tell us."
    >
      <h2>What to include in a notice</h2>
      <ol>
        <li>Your name, organisation and contact details (email required).</li>
        <li>Identification of the copyrighted work or trademark at issue.</li>
        <li>The URL(s) on CreditVault where the material appears.</li>
        <li>A statement that you have a good-faith belief that the use is not authorised.</li>
        <li>A statement, under penalty of perjury, that the information is accurate and that you are the rights holder or authorised to act on their behalf.</li>
        <li>Your physical or electronic signature.</li>
      </ol>

      <h2>Where to send it</h2>
      <p>
        Submit notices through the <a href="/contact">contact page</a>. We aim to review
        every complete notice within a reasonable timeframe and will remove or disable
        access to material that appears to infringe.
      </p>

      <h2>Counter-notices</h2>
      <p>
        If you believe content was removed in error, you may send a counter-notice with the
        same identifying details plus a statement, under penalty of perjury, of your
        good-faith belief that the removal was a mistake.
      </p>

      <h2>Repeat infringers</h2>
      <p>
        We will terminate the accounts of users who are repeat infringers where
        appropriate.
      </p>
    </LegalPage>
  );
}
