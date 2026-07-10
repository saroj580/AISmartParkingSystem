"use client";

import { useEffect } from "react";
import { Wallet, Info } from "lucide-react";

/**
 * No online payment gateway is configured — the booking is created as PENDING and stays
 * that way until the lot operator confirms payment (e.g. cash at the gate), which is what
 * actually issues the QR pass.
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
              Pay at the lot
            </span>
          </span>
        </span>
        <span className="font-display text-2xl font-semibold">{totalLabel}</span>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Your space is held once you confirm, but the QR pass only appears after the
        lot operator confirms your payment on arrival.
      </p>
    </div>
  );
}
