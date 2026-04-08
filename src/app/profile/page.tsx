"use client";

import { useEffect, useState } from "react";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { WorkHistoryForm } from "@/components/profile/work-history-form";
import { EducationForm } from "@/components/profile/education-form";
import { SkillsManager } from "@/components/profile/skills-manager";
import { QuickCopyPanel } from "@/components/profile/quick-copy-panel";
import { IntegrationsPanel } from "@/components/profile/integrations-panel";
import { Copy } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCopyPanel, setShowCopyPanel] = useState(false);

  const fetchProfile = () => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (data: any) => {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchProfile();
  };

  if (loading) return <div className="h-96 rounded-xl animate-shimmer" />;

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "work", label: "Work History" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "integrations", label: "Integrations" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your info is used for job matching, resume tailoring, and quick-fill</p>
        </div>
        <button
          onClick={() => setShowCopyPanel(!showCopyPanel)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showCopyPanel
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-xs"
          }`}
        >
          <Copy className="w-4 h-4" /> Quick Copy
        </button>
      </div>

      {/* Quick Copy Panel */}
      {showCopyPanel && profile && (
        <QuickCopyPanel profile={profile} />
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-xs font-medium text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-6">
        {activeTab === "personal" && (
          <PersonalInfoForm profile={profile} onSave={handleUpdateProfile} />
        )}
        {activeTab === "work" && (
          <WorkHistoryForm
            workHistory={profile?.workHistory || []}
            onRefresh={fetchProfile}
          />
        )}
        {activeTab === "education" && (
          <EducationForm
            education={profile?.education || []}
            onRefresh={fetchProfile}
          />
        )}
        {activeTab === "skills" && (
          <SkillsManager
            skills={profile?.skills || []}
            onRefresh={fetchProfile}
          />
        )}
        {activeTab === "integrations" && (
          <IntegrationsPanel />
        )}
      </div>
    </div>
  );
}
