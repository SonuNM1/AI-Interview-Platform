import { Link } from "react-router-dom";
import { logoutFromShell } from "shell/auth";

export default function CandidateNavbar() {
  return (
    <header className="border-b border-[#332F2A] bg-[#1B1917]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/candidate"
          className="text-lg font-semibold tracking-tight text-[#F2EDE4]"
        >
          AI Interview
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/candidate/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#D7CFC5] transition hover:bg-[#292622]"
          >
            Candidate
          </Link>

          <button
            type="button"
            onClick={logoutFromShell}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#D7CFC5] transition hover:bg-[#292622]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}