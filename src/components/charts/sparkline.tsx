"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({
  data,
  color = "#2a78d6",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const points = data.map((value, i) => ({ i, value }));
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
