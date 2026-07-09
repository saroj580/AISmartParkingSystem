"use client";

import { useEffect } from "react";
import { BadgeCheck, Wallet, Info } from "lucide-react";

/**
 * Demo payment step — no payment gateway is wired up, so every booking is
 * hardcoded as paid. Confirming the booking marks it paid instantly and
 * generates the QR pass.
 */
export function PaymentStep({
  totalLabel,
  onValidChange,
}: {
  totalLabel: string;
  onValidChange: (valid: boolean) => void;
}) {
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[15px] font-semibold">Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your total and confirm the booking.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface-muted p-5">
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-brand-subtle text-brand-subtle-foreground">
            <Wallet className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium">Amount due</span>
            <span className="block text-xs text-muted-foreground">
              Charged on confirmation
            </span>
          </span>
        </span>
        <span className="font-display text-2xl font-semibold">{totalLabel}</span>
      </div>

      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-available/30 bg-available-subtle/50 p-4">
        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-available" />
        <div className="text-sm">
          <p className="font-medium text-available">Payment auto-approved</p>
          <p className="mt-0.5 text-muted-foreground">
            This environment runs without a payment gateway — your booking is
            marked as paid the moment you confirm it.
          </p>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5" />
        Your QR pass is generated immediately after confirmation.
      </p>
    </div>
  );
}