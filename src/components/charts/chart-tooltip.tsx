import { cn } from "@/lib/cn";

interface ChartTooltipProps {
  active?: boolean;
  label?: React.ReactNode;
  payload?: { name: string; value: number; color?: string }[];
  formatValue?: (v: number) => string;
}

export function ChartTooltip({
  active,
  label,
  payload,
  formatValue = (v) => v.toLocaleString(),
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && (
        <div className="mb-1.5 font-medium text-foreground">{label}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn("size-2 rounded-full")}
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {formatValue(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
