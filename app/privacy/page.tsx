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

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ ...textStyle, marginTop: 16 }}>
          Last updated: May 18, 2026
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. Information You Enter</h2>
          <p style={textStyle}>
            MIMS may ask for profile details, creative roles, city, project details, client website or social links, public footprint signals, professional highlights, budget notes, and deal details. This information is used to generate pricing estimates, deal guidance, invoice previews, and scope suggestions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. Current Local Storage</h2>
          <p style={textStyle}>
            In the current version, MIMS is designed as a lightweight prototype and may store onboarding status or app state locally in your browser. Local browser storage stays on that device unless future account, database, or sync features are added.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. Future Accounts and Payments</h2>
          <p style={textStyle}>
            If MIMS later adds user accounts, subscriptions, saved profiles, saved deals, or payments, the app may collect account information, billing status, and saved business inputs. Payment card details should be handled by a payment processor such as Stripe, not stored directly by MIMS.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. Analytics and Error Tracking</h2>
          <p style={textStyle}>
            If analytics or error tracking tools are added, MIMS may collect usage events, device information, browser details, page views, and error logs to improve performance and fix bugs. Sensitive project details should not be intentionally sent to analytics tools.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. Public Links and Social Signals</h2>
          <p style={textStyle}>
            Website and social media inputs are treated as user-provided business signals. Follower counts, audience size, brand maturity, and price point are used only as rough indicators, not official proof of budget or buying power.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. Data Sharing</h2>
          <p style={textStyle}>
            MIMS should not sell personal information. If third-party tools are added for hosting, analytics, authentication, payments, database storage, or email, those providers may process information as needed to run the service.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. Your Choices</h2>
          <p style={textStyle}>
            You can avoid entering sensitive information, clear your browser storage, or stop using the app at any time. If accounts are added later, MIMS should provide a way to request access, correction, or deletion of saved account data.
          </p>
        </section>
      </article>
    </main>
  );
}
