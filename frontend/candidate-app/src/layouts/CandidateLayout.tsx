import { useState, type ReactNode } from "react";
import { CandidateSidebar } from "../components/ComponentSidebar";
import { CandidateTopbar } from "../components/CandidateTopbar";

interface CandidateLayoutProps {
  children: ReactNode;
}

export function CandidateLayout({
  children,
}: CandidateLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Candidate MFE does not own the Router.
   * The Shell owns navigation.
   *
   * Dispatching this event lets the Shell navigate
   * without requiring react-router-dom inside the MFE.
   */
  const handleNavigate = (path: string) => {
    window.dispatchEvent(
      new CustomEvent("shell:navigate", {
        detail: { path },
      }),
    );
  };

  return (
    <div className="flex min-h-screen bg-[#151412] text-[#F2EDE4]">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}