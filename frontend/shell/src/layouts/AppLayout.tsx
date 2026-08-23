import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex">
        <Sidebar />

        {/* React Router renders the active route here */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}