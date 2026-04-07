"use client";

import { useEffect, useState } from "react";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { ResponseRateChart } from "@/components/analytics/response-rate-chart";
import { TimelineChart } from "@/components/analytics/timeline-chart";
import { ResumePerformance } from "@/components/analytics/resume-performance";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Application Funnel</h2>
          <FunnelChart data={data?.funnel || []} />
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Applications Over Time</h2>
          <TimelineChart data={data?.timeline || []} />
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Response Rate</h2>
          <ResponseRateChart data={data?.responseRate || []} />
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Resume Performance</h2>
          <ResumePerformance data={data?.resumePerformance || []} />
        </div>
      </div>
    </div>
  );
}
