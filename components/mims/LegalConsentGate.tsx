"use client";

import { usePathname } from "next/navigation";
import { LegalConsentModal } from "@/components/mims/LegalConsentModal";

/** Shows consent modal on app routes; allows /terms and /privacy to be read without accepting first. */
export function LegalConsentGate() {
  const pathname = usePathname();
  if (pathname === "/terms" || pathname === "/privacy") return null;
  return <LegalConsentModal />;
}
