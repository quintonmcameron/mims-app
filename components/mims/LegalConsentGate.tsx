"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const LegalConsentModal = dynamic(
  () => import("@/components/mims/LegalConsentModal").then((m) => m.LegalConsentModal),
  { ssr: false },
);

/** Shows consent modal on app routes; allows /terms and /privacy to be read without accepting first. */
export function LegalConsentGate() {
  const pathname = usePathname();
  if (pathname === "/terms" || pathname === "/privacy") return null;
  return <LegalConsentModal />;
}
