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
          Last updated: May 18, 2026
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. What MIMS Does</h2>
          <p style={textStyle}>
            MIMS is an educational business tool for independent, freelance creative professionals. It helps users think through pricing, scope, project inputs, client signals, and deal preparation. Rate estimates reflect freelance market benchmarks for independent work only. The app provides estimates and suggested language based on information entered by the user.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. No Professional Advice</h2>
          <p style={textStyle}>
            MIMS does not provide legal, financial, tax, accounting, or contract advice. Pricing outputs, negotiation guidance, invoice previews, and scope suggestions are informational estimates only. You are responsible for reviewing your own agreements, confirming freelance market rates and scope fit your project, and deciding what to send to a client.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. User Responsibility</h2>
          <p style={textStyle}>
            You are responsible for the information you enter and for how you use the app's outputs. MIMS does not guarantee that a client will accept a rate, that an estimate reflects every market condition, or that a generated scope will fit every project.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. Accounts, Payments, and Access</h2>
          <p style={textStyle}>
            If paid subscriptions, accounts, or saved profiles are added later, access may depend on account status and payment status. Any future paid plan should include clear billing, cancellation, and refund terms before launch.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. Intellectual Property</h2>
          <p style={textStyle}>
            The MIMS name, design, product structure, and original app content belong to the owner of MIMS. You may use the app outputs for your own freelance business, but you may not copy, resell, or recreate the app as a competing product without permission.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. Limitation of Liability</h2>
          <p style={textStyle}>
            To the fullest extent allowed by law, MIMS is not responsible for lost income, rejected proposals, client disputes, contract issues, business losses, or decisions made from app outputs. Use MIMS as a support tool, not as the final authority for business or legal decisions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. Changes</h2>
          <p style={textStyle}>
            These terms may be updated as MIMS adds accounts, subscriptions, storage, analytics, or other launch features. Continued use of the app after updates means you accept the updated terms.
          </p>
        </section>
      </article>
    </main>
  );
}
