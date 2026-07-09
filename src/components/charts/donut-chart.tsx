"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useThemeColors } from "@/components/charts/use-theme-colors";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatNumber } from "@/lib/format";

interface DonutDatum {
  name: string;
  value: number;
  colorIndex: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 200,
}: {
  data: DonutDatum[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  const { series } = useThemeColors();

  return (
    <div className="relative" style={{ height: size, width: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={3}
            stroke="var(--surface)"
            strokeWidth={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={series[d.colorIndex % series.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                formatValue={(v) => formatNumber(v)}
                payload={payload?.map((p) => ({
                  name: p.name as string,
                  value: p.value as number,
                  color: series[
                    (p.payload as DonutDatum).colorIndex % series.length
                  ],
                }))}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-2xl font-semibold tracking-tight">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-muted-foreground">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
