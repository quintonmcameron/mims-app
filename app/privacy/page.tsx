import {
  COMPANY_MAILING_ADDRESS,
  COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
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
          Last updated: {LEGAL_LAST_UPDATED} · Version {LEGAL_VERSION}
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. Information You Enter</h2>
          <p style={textStyle}>
            MIMS may ask for profile details, creative roles, city, project details, client names, public footprint
            signals, professional highlights, budget notes, and deal details. This information is used to generate
            information is used to generate pricing estimates, deal guidance, invoice previews, and scope suggestions.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. Client &amp; Third-Party Information</h2>
          <p style={textStyle}>
            When you enter a client name, budget, or public footprint signals, you are providing business information about
            that party. You are responsible for having a lawful basis to use that information in your work. MIMS does
            not automatically scrape or download client websites on your behalf in the current version; signals are based
            on what you type or select. Do not enter sensitive personal data (health, government IDs, etc.) unless
            necessary for your project.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. Local Storage on Your Device</h2>
          <p style={textStyle}>
            In the current version, MIMS stores onboarding status, legal acceptance version and date, and app state in
            your browser&apos;s local storage. This data stays on your device unless future account, database, or sync
            features are added.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. Analytics (Vercel Analytics)</h2>
          <p style={textStyle}>
            MIMS uses Vercel Analytics to collect limited usage data such as page views, referrers, browser type, device
            type, and general geography. This helps us understand how the app is used and improve reliability. Vercel
            processes this data as our hosting and analytics provider. We do not intentionally send your deal details,
            client names, or project notes to analytics. For more information, see Vercel&apos;s privacy documentation.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. Future Accounts and Payments</h2>
          <p style={textStyle}>
            If MIMS later adds user accounts, subscriptions, saved profiles, saved deals, or payments, the app may
            collect account information, billing status, and saved business inputs. Payment card details should be
            handled by a payment processor such as Stripe, not stored directly by MIMS.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. Public Links and Social Signals</h2>
          <p style={textStyle}>
            Website and social media inputs are treated as user-provided business signals. Audience size, brand maturity,
            and price point are rough indicators only, not verified proof of budget or buying power.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. Retention</h2>
          <p style={textStyle}>
            Data in local storage remains until you clear your browser data or uninstall the app. Analytics retention is
            governed by Vercel&apos;s policies. If we add cloud accounts later, we will describe retention and deletion
            in an updated policy.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>8. Service Providers</h2>
          <p style={textStyle}>
            MIMS does not sell your personal information. We currently use the following categories of providers (sign
            each provider&apos;s Data Processing Agreement when you enable their services):
          </p>
          <ul style={{ ...textStyle, paddingLeft: 22, marginTop: 8 }}>
            <li>
              <strong>Vercel</strong> — application hosting and Vercel Analytics (page views, device/browser type,
              general geography). Deal text you type is not intentionally sent to analytics.
            </li>
            <li>
              <strong>Stripe</strong> — not active in the current app version; if we add subscriptions, payment card
              data will be processed by Stripe, not stored on our servers.
            </li>
            <li>
              <strong>Supabase / PostHog / Resend</strong> — not active today; listed here so we update this policy
              before turning on database sync, product analytics, or transactional email.
            </li>
          </ul>
          <p style={{ ...textStyle, marginTop: 12 }}>
            We may disclose information if required by law or to protect rights and safety.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>9. Children</h2>
          <p style={textStyle}>
            MIMS is not directed to anyone under 18. We do not knowingly collect information from children.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>10. Your Choices</h2>
          <p style={textStyle}>
            You can avoid entering sensitive information, clear your browser storage, or stop using the app at any time.
            You may use browser privacy settings or extensions to limit analytics where available. Questions or requests:{" "}
            {LEGAL_CONTACT_EMAIL}.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>11. Changes</h2>
          <p style={textStyle}>
            We may update this policy as features change. The version date above will reflect material updates. The app
            may prompt you to re-accept when the legal version changes.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>12. Contact</h2>
          <p style={textStyle}>
            Privacy questions: {LEGAL_CONTACT_EMAIL}. Operator: {COMPANY_NAME}. Mailing address:{" "}
            {COMPANY_MAILING_ADDRESS}.
          </p>
        </section>
      </article>
    </main>
  );
}
