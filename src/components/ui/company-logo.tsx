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
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    companyName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)
  )}&size=${size * 2}&background=eef2ff&color=4f46e5&bold=true&format=svg`;

  return (
    <img
      src={error ? fallbackUrl : logoUrl}
      alt={companyName}
      width={size}
      height={size}
      className={`rounded-lg object-contain bg-white ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
