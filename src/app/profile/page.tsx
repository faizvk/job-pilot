"use client";

import { useEffect, useState } from "react";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { WorkHistoryForm } from "@/components/profile/work-history-form";
import { EducationForm } from "@/components/profile/education-form";
import { SkillsManager } from "@/components/profile/skills-manager";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

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

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "work", label: "Work History" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-6">
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
      </div>
    </div>
  );
}
