import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CandidateSidebar } from "../components/ComponentSidebar";
import { CandidateTopbar } from "../components/CandidateTopbar";

interface CandidateLayoutProps {
  children: ReactNode;
}

export function CandidateLayout({
  children,
}: CandidateLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  // InterviewRoom is a focused experience.
  // Keep its existing dark experience unchanged.
  const isInterviewRoom = location.pathname.includes(
    "/candidate/interview/",
  );

  // Interview room gets the entire viewport.
  if (isInterviewRoom) {
    return (
      <div className="h-screen overflow-hidden bg-[#0E1117]">
        {children}
      </div>
    );
  }

  /*
   * Candidate MFE does not own the Router.
   * The Shell owns navigation.
   *
   * Dispatching this event lets the Shell navigate without
   * requiring react-router-dom navigation ownership inside the MFE.
   */
  const handleNavigate = (path: string) => {
    window.dispatchEvent(
      new CustomEvent("shell:navigate", {
        detail: { path },
      }),
    );
  };

  // Keep the existing interview-room fallback unchanged.
  if (isInterviewRoom) {
    return (
      <div className="min-h-screen bg-[#0E1117] text-[#F2F4F7]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <CandidateSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <CandidateTopbar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* Main Candidate workspace */}
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}