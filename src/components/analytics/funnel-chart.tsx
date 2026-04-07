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
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
