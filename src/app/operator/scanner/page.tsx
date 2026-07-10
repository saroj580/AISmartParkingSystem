"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, LogIn, LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { apiErrorMessage } from "@/lib/api-error";

interface ScanResult {
  id: string;
  bookingNumber: string;
  driverName: string;
  lotName: string;
  vehiclePlate: string;
  action: "check-in" | "check-out";
  success: boolean;
  message?: string;
  time: string;
}

async function callScanApi(action: "check-in" | "check-out", code: string) {
  const res = await fetch(`/api/v1/qr/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok && !!json?.success, json };
}

export default function QrScannerPage() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);

  async function handleScan() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setScanning(true);

    try {
      // No manual "check in vs check out" toggle to get wrong — try check-in first, and if
      // the QR simply isn't in the right state for that (e.g. it's already checked in), the
      // vehicle is almost certainly leaving, so retry as a check-out automatically.
      let action: "check-in" | "check-out" = "check-in";
      let { ok, json } = await callScanApi(action, trimmed);

      if (!ok && json?.error?.code === "BAD_REQUEST" && /status:/i.test(json?.error?.message ?? "")) {
        action = "check-out";
        ({ ok, json } = await callScanApi(action, trimmed));
      }

      if (!ok) {
        setResults((prev) => [
          {
            id: `${Date.now()}`,
            bookingNumber: "—",
            driverName: "—",
            lotName: "—",
            vehiclePlate: "—",
            action,
            success: false,
            message: apiErrorMessage(json, "Scan failed"),
            time: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 8));
        return;
      }

      const booking = json.data;
      setResults((prev) => [
        {
          id: `${Date.now()}`,
          bookingNumber: booking.bookingNumber,
          driverName: booking.driverName ?? "Unknown",
          lotName: booking.lotName ?? "—",
          vehiclePlate: booking.vehiclePlate ?? "—",
          action,
          success: true,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 8));
    } finally {
      setScanning(false);
      setCode("");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="QR scanner"
        description="Scan or enter a booking's QR code to check vehicles in and out."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-border bg-card p-8">
          <div
            className={cn(
              "relative flex size-56 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border-2 border-dashed border-border-strong bg-surface-muted",
              scanning && "border-brand",
            )}
          >
            <ScanLine className={cn("size-16 text-muted-foreground", scanning && "animate-pulse text-brand")} />
            {scanning && (
              <div className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse bg-brand" />
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Camera scanning isn&apos;t wired up yet — paste the QR code&apos;s value below. It&apos;s issued
            once a booking is confirmed and paid. We&apos;ll automatically check the vehicle in or out
            based on its current status.
          </p>

          <div className="flex w-full flex-col gap-1.5">
            <Label htmlFor="code">QR code value</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="Paste the signed QR token"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
              <Button onClick={handleScan} disabled={scanning || !code.trim()}>
                {scanning ? "Scanning…" : "Scan"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <p className="mb-3 text-[13px] font-semibold">Recent scans</p>
          {results.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No scans yet this session
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      r.success ? "bg-available-subtle text-available" : "bg-full-subtle text-full",
                    )}
                  >
                    {r.success ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">
                      {r.success ? r.driverName : "Scan failed"}
                      {r.success && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{r.bookingNumber}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.success ? `${r.lotName} · ${r.vehiclePlate}` : r.message}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {r.action === "check-in" ? <LogIn className="size-3.5" /> : <LogOut className="size-3.5" />}
                    {r.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
