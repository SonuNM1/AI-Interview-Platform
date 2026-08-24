import type { ReactNode } from "react";
import CandidateNavbar from "../components/CandidateNavbar";

interface CandidateLayoutProps {
  children: ReactNode;
}

export function CandidateLayout({
  children,
}: CandidateLayoutProps) {
  return (
    <div className="min-h-screen bg-[#151412] text-[#F2EDE4]">
      <CandidateNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}