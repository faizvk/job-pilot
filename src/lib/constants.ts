export const APPLICATION_STATUSES = [
  "saved", "applied", "phone_screen", "interview", "offer", "accepted", "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  saved: { label: "Saved", color: "text-gray-700", bgColor: "bg-gray-100" },
  applied: { label: "Applied", color: "text-blue-700", bgColor: "bg-blue-100" },
  phone_screen: { label: "Phone Screen", color: "text-purple-700", bgColor: "bg-purple-100" },
  interview: { label: "Interview", color: "text-amber-700", bgColor: "bg-amber-100" },
  offer: { label: "Offer", color: "text-green-700", bgColor: "bg-green-100" },
  accepted: { label: "Accepted", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100" },
};

export const WORK_TYPES = ["remote", "hybrid", "onsite"] as const;
export const SKILL_CATEGORIES = ["technical", "soft", "language", "tool"] as const;
export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export const FOLLOW_UP_TYPES = ["follow_up", "thank_you", "check_in"] as const;
export const DEFAULT_USER_ID = "default-user";
