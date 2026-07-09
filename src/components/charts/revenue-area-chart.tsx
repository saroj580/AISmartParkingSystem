"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/components/charts/use-theme-colors";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatCompact } from "@/lib/format";
import type { TimePoint } from "@/types/domain";

export function RevenueAreaChart({
  data,
  primaryLabel = "This period",
  secondaryLabel = "Previous period",
  valuePrefix = "₹",
}: {
  data: TimePoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  valuePrefix?: string;
}) {
  const { series, grid, muted } = useThemeColors();
  const hasSecondary = data.some((d) => d.secondary !== undefined);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={series[0]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={muted} stopOpacity={0.35} />
              <stop offset="100%" stopColor={muted} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={grid}
            strokeDasharray="0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: muted, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: muted, fontSize: 12 }}
            tickFormatter={(v) => `${valuePrefix}${formatCompact(v)}`}
            width={52}
          />
          <Tooltip
            cursor={{ stroke: grid, strokeWidth: 1 }}
            content={({ active, label, payload }) => (
              <ChartTooltip
                active={active}
                label={label}
                formatValue={(v) => `${valuePrefix}${v.toLocaleString()}`}
                payload={payload?.map((p) => ({
                  name:
                    p.dataKey === "value" ? primaryLabel : secondaryLabel,
                  value: p.value as number,
                  color: p.dataKey === "value" ? series[0] : muted,
                }))}
              />
            )}
          />
          {hasSecondary && (
            <Area
              type="monotone"
              dataKey="secondary"
              stroke={muted}
              strokeWidth={2}
              fill="url(#revSecondary)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={series[0]}
            strokeWidth={2}
            fill="url(#revPrimary)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
