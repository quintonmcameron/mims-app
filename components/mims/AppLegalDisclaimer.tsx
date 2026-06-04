import type { CSSProperties } from "react";
import { APP_DISCLAIMER } from "@/lib/mims/legal";

const baseStyle: CSSProperties = {
  marginTop: 28,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.04)",
  fontSize: 11,
  color: "var(--text-3)",
  opacity: 0.72,
  lineHeight: 1.65,
  textAlign: "center",
  marginBottom: 0,
};

export function AppLegalDisclaimer({
  style,
  className,
}: {
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <p className={className} style={{ ...baseStyle, ...style }}>
      {APP_DISCLAIMER} By using MIMS, you agree to the{" "}
      <a href="/terms" style={{ color: "var(--gold)", textDecoration: "none" }}>
        Terms
      </a>{" "}
      and{" "}
      <a href="/privacy" style={{ color: "var(--gold)", textDecoration: "none" }}>
        Privacy Policy
      </a>
      .
    </p>
  );
}
