"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function TimelineChart({ data }: { data: { week: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip cursor={{ fill: "#ecfdf5" }} contentStyle={{ borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} className="transition-opacity duration-200 hover:opacity-80" />
      </BarChart>
    </ResponsiveContainer>
  );
}
