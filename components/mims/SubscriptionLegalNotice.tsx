import { autoRenewalDisclosure } from "@/lib/mims/legal";

/**
 * Place directly above your Subscribe / checkout button when billing ships.
 * California Auto-Renewal Law requires this visible before payment.
 */
export function SubscriptionLegalNotice({
  planPrice,
  billingPeriod = "month",
}: {
  planPrice: string;
  billingPeriod?: string;
}) {
  return (
    <p
      style={{
        margin: "0 0 12px",
        fontSize: 11,
        color: "var(--text-3)",
        lineHeight: 1.55,
      }}
    >
      {autoRenewalDisclosure(planPrice, billingPeriod)}
    </p>
  );
}
