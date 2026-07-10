"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { QrStatusBadge } from "@/components/shared/status-badge";
import type { QrStatus } from "@/types/domain";

export function QrPassCard({
  imageDataUrl,
  code,
  qrStatus,
  helperText,
}: {
  imageDataUrl: string;
  code: string;
  qrStatus: QrStatus;
  helperText: string;
}) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleCopy() {
    // The async Clipboard API needs a secure context (HTTPS or localhost) — it silently
    // fails over plain HTTP on a LAN IP, which is how this app often gets tested. Fall back
    // to selecting the text + the older execCommand API, which works without one.
    try {
      await navigator.clipboard.writeText(code);
      onCopied();
      return;
    } catch {
      // fall through to the legacy fallback below
    }

    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
      try {
        const ok = document.execCommand("copy");
        if (ok) {
          onCopied();
          return;
        }
      } catch {
        // fall through to manual-selection guidance
      }
    }

    toast.info("Couldn't copy automatically — the code below is selected, press Ctrl+C / Cmd+C to copy it.");
  }

  function onCopied() {
    setCopied(true);
    toast.success("QR code copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center rounded-[var(--radius-xl)] border border-border bg-card p-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageDataUrl} alt="Booking QR pass" className="w-48 rounded-[var(--radius-md)]" />
      <div className="mt-4">
        <QrStatusBadge status={qrStatus} />
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">{helperText}</p>

      <div className="mt-4 flex w-full flex-col gap-1.5">
        <label className="text-[11px] font-medium text-muted-foreground">
          Code for manual entry at the scanner
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            readOnly
            value={code}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-surface-muted px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground"
          />
          <button
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
