export interface DashboardStats {
  totalApplications: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  weeklyGoal: { target: number; achieved: number };
}

export interface ActivityItem {
  id: string;
  applicationId: string;
  companyName: string;
  jobTitle: string;
  fromStatus: string;
  toStatus: string;
  changedAt: string;
}

export interface JdAnalysis {
  extractedSkills: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  experienceRequirements: string[];
  keywords: string[];
}

export interface QuickApplyState {
  step: number;
  jobDescription: string;
  analysis: JdAnalysis | null;
  selectedResumeId: string;
  tailoredContent: string;
  coverLetterContent: string;
  applicationData: {
    companyName: string;
    jobTitle: string;
    jobUrl: string;
    location: string;
    workType: string;
    salaryMin: number | null;
    salaryMax: number | null;
  };
}
