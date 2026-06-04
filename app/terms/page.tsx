import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  LEGAL_OPERATOR_NAME,
  LEGAL_VERSION,
} from "@/lib/mims/legal";

const sectionStyle = {
  marginTop: 28,
} as const;

const headingStyle = {
  margin: "0 0 10px",
  color: "#f4e6c3",
  fontSize: 18,
  letterSpacing: "-0.02em",
} as const;

const textStyle = {
  color: "rgba(255,255,255,0.72)",
  fontSize: 15,
  lineHeight: 1.75,
} as const;

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "#ffffff",
        padding: "48px 20px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <article style={{ maxWidth: 820, margin: "0 auto" }}>
        <a href="/" style={{ color: "#e8c57a", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
          Back to MIMS
        </a>
        <p style={{ margin: "28px 0 8px", color: "#e8c57a", fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          MIMS
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(34px, 8vw, 64px)", letterSpacing: "-0.06em", lineHeight: 0.95 }}>
          Terms of Service
        </h1>
        <p style={{ ...textStyle, marginTop: 16 }}>
          Last updated: {LEGAL_LAST_UPDATED} · Version {LEGAL_VERSION}
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. What MIMS Does</h2>
          <p style={textStyle}>
            {LEGAL_OPERATOR_NAME} is an educational business tool for independent, freelance creative professionals. It
            helps you think through pricing, scope, project inputs, client signals, and deal preparation. Rate outputs are
            freelance market estimates and suggested language based on information you enter — not guaranteed quotes,
            binding rates, or professional advice.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. No Professional Advice</h2>
          <p style={textStyle}>
            MIMS does not provide legal, financial, tax, accounting, or contract advice. Pricing outputs, negotiation
            prompts, invoice previews, scope-of-work drafts, and similar features are informational estimates and
            templates only. You are responsible for reviewing your own agreements, confirming rates and scope fit your
            project, and deciding what to send to a client.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. Generated Documents (Invoice &amp; SOW)</h2>
          <p style={textStyle}>
            Invoice and scope-of-work content produced in the app are draft templates for your review. They may include
            sample terms (usage, deposits, kill fees, payment timing, cancellation). Do not treat generated text as a
            final contract. Have a qualified attorney review and customize documents before you send or sign them.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. User Responsibility</h2>
          <p style={textStyle}>
            You are responsible for the information you enter and for how you use the app&apos;s outputs. MIMS does not
            guarantee that a client will accept a rate, that an estimate reflects every market condition, or that a
            generated scope will fit every project.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. Eligibility</h2>
          <p style={textStyle}>
            You must be at least 18 years old and able to form a binding contract to use MIMS. By using the app, you
            represent that you meet these requirements.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. Accounts, Payments, and Access</h2>
          <p style={textStyle}>
            If paid subscriptions, accounts, or saved profiles are added later, access may depend on account status and
            payment status. Any paid plan will include clear billing, cancellation, and refund terms before charges
            apply.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. Intellectual Property</h2>
          <p style={textStyle}>
            The MIMS name, design, product structure, and original app content belong to the operator of MIMS. You may
            use outputs for your own freelance business, but you may not copy, resell, or recreate the app as a competing
            product without permission.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>8. Disclaimer of Warranties</h2>
          <p style={textStyle}>
            MIMS is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind,
            whether express or implied, including implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement. We do not warrant that the app will be uninterrupted, error-free, or that
            outputs will be accurate or complete.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>9. Limitation of Liability</h2>
          <p style={textStyle}>
            To the fullest extent allowed by law, MIMS and its operator are not liable for lost income, rejected
            proposals, client disputes, contract issues, business losses, or decisions made from app outputs. Use MIMS as
            a support tool, not as the final authority for business or legal decisions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>10. Indemnification</h2>
          <p style={textStyle}>
            You agree to indemnify and hold harmless the operator of MIMS from claims, damages, and expenses (including
            reasonable attorneys&apos; fees) arising from your use of the app, your deal materials, your client
            relationships, or content you submit — except to the extent caused by our intentional misconduct.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>11. Termination</h2>
          <p style={textStyle}>
            You may stop using MIMS at any time. We may suspend or discontinue the app or features with reasonable notice
            where practicable. Sections that by nature should survive (disclaimers, liability limits, indemnity,
            governing law) survive termination.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>12. Governing Law &amp; Disputes</h2>
          <p style={textStyle}>
            These terms are governed by the laws of the United States and the state in which the operator of MIMS is
            principally located, without regard to conflict-of-law rules. Before filing a claim, contact us at{" "}
            {LEGAL_CONTACT_EMAIL} to try to resolve the dispute informally. If informal resolution fails, disputes will
            be brought in the state or federal courts located in that same state, unless applicable law requires
            otherwise.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>13. Changes</h2>
          <p style={textStyle}>
            We may update these terms as MIMS evolves. Material updates will be reflected in the version date above.
            Continued use after an update means you accept the revised terms. The app may ask you to re-accept when the
            legal version changes.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>14. Contact</h2>
          <p style={textStyle}>
            Questions about these terms: {LEGAL_CONTACT_EMAIL}. Operator: {LEGAL_OPERATOR_NAME}.
          </p>
        </section>
      </article>
    </main>
  );
}
