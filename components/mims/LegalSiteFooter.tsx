/** CalOPPA-friendly Terms · Privacy links — place near bottom of main app chrome. */
export function LegalSiteFooter() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "6px 12px 2px",
        fontSize: 11,
        color: "var(--text-3)",
      }}
    >
      <a href="/terms" style={{ color: "var(--text-3)", textDecoration: "none" }}>
        Terms
      </a>
      <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
      <a href="/privacy" style={{ color: "var(--text-3)", textDecoration: "none" }}>
        Privacy
      </a>
    </div>
  );
}
