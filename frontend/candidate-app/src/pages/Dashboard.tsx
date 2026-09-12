import { useEffect, useState } from "react";
import { getMyProfile, type UserProfile } from "../services/user.api";
import { GreetingSection } from "../components/Dashboard/GreetingSection";
import { UpcomingInterview } from "../components/Dashboard/UpcomingInterview";
import { DashboardStats } from "../components/Dashboard/DashboardStats";
import { PerformanceOverview } from "../components/Dashboard/PerformanceOverview";

export function Dashboard() {

  const [profile, setProfile] = useState<UserProfile | null>(null) ; 

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile() ; 
        setProfile(data) ; 
      } catch (error) {
        console.error("Failed to fetch user profile: ", error)
      }
    }
    fetchProfile() ; 
  }, [])

  const firstName = profile?.firstName || "there" ; 

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-6 pt-0 md:px-8 md:pb-8 md:pt-0">
      <div className="mx-auto max-w-7xl">
        <GreetingSection firstName={firstName} />
        
        <DashboardStats/>
        <UpcomingInterview/>
        <PerformanceOverview/>
      </div>
    </div>
  );
}