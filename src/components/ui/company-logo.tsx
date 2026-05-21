"use client";

import { useState } from "react";
import { getCompanyLogoUrl } from "@/lib/utils/company-logo";

interface CompanyLogoProps {
  companyName: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ companyName, size = 32, className = "" }: CompanyLogoProps) {
  const [error, setError] = useState(false);
  const logoUrl = getCompanyLogoUrl(companyName, size * 2); // 2x for retina
  // emerald accent for fallback avatar
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    companyName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)
  )}&size=${size * 2}&background=d1fae5&color=047857&bold=true&format=svg`;

  return (
    <img
      src={error ? fallbackUrl : logoUrl}
      alt={companyName}
      width={size}
      height={size}
      className={`rounded-md object-contain bg-white ring-1 ring-slate-200 transition-all duration-200 hover:ring-emerald-300 hover:scale-105 ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
