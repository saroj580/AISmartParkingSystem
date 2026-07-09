"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, LogIn, LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPERATOR_BOOKINGS } from "@/data/operator-bookings";
import { cn } from "@/lib/cn";

interface ScanResult {
  id: string;
  bookingNumber: string;
  driverName: string;
  lotName: string;
  action: "check-in" | "check-out";
  success: boolean;
  time: string;
}

export default function QrScannerPage() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);

  function handleScan() {
    if (!code.trim()) return;
    setScanning(true);
    setTimeout(() => {
      const booking = OPERATOR_BOOKINGS[Math.floor(Math.random() * OPERATOR_BOOKINGS.length)]!;
      const success = Math.random() > 0.12;
      const action: ScanResult["action"] = Math.random() > 0.5 ? "check-in" : "check-out";
      setResults((prev) => [
        {
          id: `${Date.now()}`,
          bookingNumber: booking.bookingNumber,
          driverName: booking.driverName ?? "Unknown",
          lotName: booking.lotName,
          action,
          success,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 8));
      setScanning(false);
      setCode("");
    }, 900);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="QR scanner"
        description="Scan or enter a booking code to check vehicles in and out."
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
            Camera scanning is simulated in this preview. Enter a code manually below.
          </p>

          <div className="flex w-full flex-col gap-1.5">
            <Label htmlFor="code">Booking code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="PK-8F2A9C"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
              <Button onClick={handleScan} disabled={scanning}>
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
                      {r.driverName}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{r.bookingNumber}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{r.lotName}</p>
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

      <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-xs text-muted-foreground">
        Tip: try scanning {OPERATOR_BOOKINGS[0]?.bookingNumber} — sample booking codes work in this demo.
      </div>
    </div>
  );
}
