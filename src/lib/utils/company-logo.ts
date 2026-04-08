/**
 * Get a company logo URL using Clearbit's free Logo API.
 * No API key required. Falls back to UI Avatars for unknown companies.
 *
 * Usage: <img src={getCompanyLogoUrl("Google")} />
 */
export function getCompanyLogoUrl(companyName: string, size = 64): string {
  if (!companyName) return getFallbackAvatar(companyName, size);

  // Try to derive a domain from the company name
  const domain = companyNameToDomain(companyName);
  if (domain) {
    return `https://logo.clearbit.com/${domain}?size=${size}`;
  }

  return getFallbackAvatar(companyName, size);
}

/**
 * Fallback avatar using UI Avatars (letter-based, no API key needed)
 */
function getFallbackAvatar(name: string, size: number): string {
  const initials = (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=eef2ff&color=4f46e5&bold=true&format=svg`;
}

/**
 * Map common company names to their domains.
 * For unknown companies, derive domain from name.
 */
const KNOWN_DOMAINS: Record<string, string> = {
  google: "google.com",
  microsoft: "microsoft.com",
  amazon: "amazon.com",
  meta: "meta.com",
  facebook: "facebook.com",
  apple: "apple.com",
  netflix: "netflix.com",
  uber: "uber.com",
  airbnb: "airbnb.com",
  spotify: "spotify.com",
  stripe: "stripe.com",
  shopify: "shopify.com",
  twitter: "twitter.com",
  x: "x.com",
  linkedin: "linkedin.com",
  salesforce: "salesforce.com",
  adobe: "adobe.com",
  oracle: "oracle.com",
  ibm: "ibm.com",
  intel: "intel.com",
  nvidia: "nvidia.com",
  tesla: "tesla.com",
  tcs: "tcs.com",
  infosys: "infosys.com",
  wipro: "wipro.com",
  hcl: "hcltech.com",
  cognizant: "cognizant.com",
  accenture: "accenture.com",
  deloitte: "deloitte.com",
  flipkart: "flipkart.com",
  zomato: "zomato.com",
  swiggy: "swiggy.com",
  paytm: "paytm.com",
  razorpay: "razorpay.com",
  freshworks: "freshworks.com",
  zoho: "zoho.com",
  atlassian: "atlassian.com",
  github: "github.com",
  gitlab: "gitlab.com",
  vercel: "vercel.com",
  cloudflare: "cloudflare.com",
  datadog: "datadoghq.com",
  slack: "slack.com",
  notion: "notion.so",
  figma: "figma.com",
  twilio: "twilio.com",
  synup: "synup.com",
};

function companyNameToDomain(name: string): string | null {
  const lower = name.toLowerCase().trim();

  // Check known domains first
  if (KNOWN_DOMAINS[lower]) return KNOWN_DOMAINS[lower];

  // Check if any known company name is a substring
  for (const [key, domain] of Object.entries(KNOWN_DOMAINS)) {
    if (lower.includes(key)) return domain;
  }

  // Try deriving: "Acme Corp" -> "acmecorp.com", "Acme Inc." -> "acme.com"
  const cleaned = lower
    .replace(/\b(inc\.?|ltd\.?|llc\.?|corp\.?|corporation|company|co\.?|pvt\.?|private|limited|technologies|tech|software|solutions|labs?|group|international|global)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  if (cleaned.length >= 2) {
    return `${cleaned}.com`;
  }

  return null;
}
