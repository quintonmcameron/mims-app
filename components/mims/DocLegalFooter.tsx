import type { CSSProperties } from "react";
import { DOC_EXPORT_DISCLAIMER } from "@/lib/mims/legal";

const footerStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.12)",
  fontSize: 10,
  color: "#666",
  lineHeight: 1.55,
  fontWeight: 500,
};

export function DocLegalFooter({ variant = "light" }: { variant?: "light" | "dark" }) {
  const color = variant === "dark" ? "var(--text-3)" : "#666";
  const border = variant === "dark" ? "var(--border)" : "rgba(0,0,0,0.12)";
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
      {DOC_EXPORT_DISCLAIMER}
    </div>
  );
}
