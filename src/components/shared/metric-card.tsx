import { cn } from "@/lib/cn";
import { Sparkline } from "@/components/charts/sparkline";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  invertDelta?: boolean;
  trend?: number[];
  trendColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaLabel = "vs last period",
  invertDelta = false,
  trend,
  trendColor = "#2a78d6",
  icon,
  className,
}: MetricCardProps) {
  const isUp = (delta ?? 0) >= 0;
  const isGood = invertDelta ? !isUp : isUp;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-xs",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-display text-[28px] font-semibold leading-none tracking-tight">
          {value}
        </span>
        {trend && (
          <div className="mb-0.5 h-8 w-20 shrink-0">
            <Sparkline data={trend} color={trendColor} height={32} />
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              isGood ? "text-available" : "text-full",
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
