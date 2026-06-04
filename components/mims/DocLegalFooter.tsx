import type { CSSProperties } from "react";
import { DOC_EXPORT_DISCLAIMER } from "@/lib/mims/legal";

type DocVariant = "light" | "dark" | "invoice" | "sow";

const footerStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.12)",
  fontSize: 10,
  lineHeight: 1.55,
  fontWeight: 500,
};

function variantLabel(variant: DocVariant): string {
  if (variant === "invoice") return "Invoice draft";
  if (variant === "sow") return "Scope of work draft";
  return "Document draft";
}

export function DocLegalFooter({
  variant = "light",
  freelancerName,
}: {
  variant?: DocVariant;
  freelancerName?: string;
}) {
  const isDoc = variant === "invoice" || variant === "sow";
  const color =
    variant === "dark" ? "var(--text-3)" : isDoc ? "#666" : "#666";
  const border =
    variant === "dark" ? "var(--border)" : "rgba(0,0,0,0.12)";

  return (
    <div
      style={{
        ...footerStyle,
        color,
        borderTopColor: border,
      }}
      role="note"
      aria-label="Document legal notice"
    >
      {isDoc ? (
        <div style={{ fontWeight: 700, marginBottom: 6, letterSpacing: "0.04em" }}>
          {variantLabel(variant)}
          {freelancerName ? ` · Prepared by ${freelancerName}` : ""} — NOT LEGAL ADVICE
        </div>
      ) : null}
      {DOC_EXPORT_DISCLAIMER}
    </div>
  );
}
