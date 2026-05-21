"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { STATUS_CONFIG, type ApplicationStatus } from "@/lib/constants";

export function FunnelChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: STATUS_CONFIG[d.status as ApplicationStatus]?.label || d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#ecfdf5" }} contentStyle={{ borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} className="transition-opacity duration-200 hover:opacity-80" />
      </BarChart>
    </ResponsiveContainer>
  );
}
