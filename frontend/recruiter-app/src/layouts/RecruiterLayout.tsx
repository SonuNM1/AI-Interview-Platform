import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import { RecruiterSidebar } from "../components/RecruiterSidebar";
import { RecruiterTopbar } from "../components/RecruiterTopbar";

export function RecruiterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#151412] text-[#F2EDE4]">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={navigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <RecruiterTopbar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={navigate}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}