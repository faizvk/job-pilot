export const APPLICATION_STATUSES = [
  "saved", "applied", "phone_screen", "interview", "offer", "accepted", "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  saved: { label: "Saved", color: "text-gray-600", bgColor: "bg-gray-50 ring-1 ring-inset ring-gray-500/10" },
  applied: { label: "Applied", color: "text-indigo-700", bgColor: "bg-indigo-50 ring-1 ring-inset ring-indigo-600/10" },
  phone_screen: { label: "Phone Screen", color: "text-violet-700", bgColor: "bg-violet-50 ring-1 ring-inset ring-violet-600/10" },
  interview: { label: "Interview", color: "text-amber-700", bgColor: "bg-amber-50 ring-1 ring-inset ring-amber-600/10" },
  offer: { label: "Offer", color: "text-emerald-700", bgColor: "bg-emerald-50 ring-1 ring-inset ring-emerald-600/10" },
  accepted: { label: "Accepted", color: "text-green-700", bgColor: "bg-green-50 ring-1 ring-inset ring-green-600/10" },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-50 ring-1 ring-inset ring-red-600/10" },
};

export const WORK_TYPES = ["remote", "hybrid", "onsite"] as const;
export const SKILL_CATEGORIES = ["technical", "soft", "language", "tool"] as const;
export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export const FOLLOW_UP_TYPES = ["follow_up", "thank_you", "check_in"] as const;
export const DEFAULT_USER_ID = "default-user";
