"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ResponseRateChart({ data }: { data: { week: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: "#059669" }} activeDot={{ r: 5, fill: "#059669" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
