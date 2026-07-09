"use client";

import { FileText, Download, TrendingUp, Building2, Users, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const REPORT_TYPES = [
  { icon: TrendingUp, title: "Revenue report", description: "GMV, platform fees, and payouts by operator." },
  { icon: Building2, title: "Operator performance", description: "Occupancy, ratings, and churn by operator." },
  { icon: Users, title: "Driver activity", description: "Signups, retention, and booking frequency." },
  { icon: ShieldCheck, title: "Compliance audit", description: "Refunds, disputes, and policy violations." },
];

const HISTORY = [
  { id: "r1", name: "Revenue report — June 2026", type: "Revenue", generatedAt: "2026-07-01", size: "482 KB" },
  { id: "r2", name: "Operator performance — Q2 2026", type: "Operator", generatedAt: "2026-06-30", size: "1.1 MB" },
  { id: "r3", name: "Driver activity — June 2026", type: "Driver", generatedAt: "2026-07-01", size: "760 KB" },
  { id: "r4", name: "Compliance audit — May 2026", type: "Compliance", generatedAt: "2026-06-02", size: "298 KB" },
];

export default function AdminReportsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Reports" description="Generate and download platform-wide reports." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_TYPES.map((r) => (
          <div key={r.title} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-5">
            <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-brand-subtle text-brand-subtle-foreground">
              <r.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-1 w-fit"
              onClick={() => toast.success(`Generating ${r.title.toLowerCase()}…`)}
            >
              <FileText className="size-3.5" />
              Generate
            </Button>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold">Report history</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Size</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {HISTORY.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell><Badge variant="outline" size="sm">{h.type}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{h.generatedAt}</TableCell>
                <TableCell className="text-muted-foreground">{h.size}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toast.success(`Downloading ${h.name}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
                  >
                    <Download className="size-3.5" />
                    Download
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
