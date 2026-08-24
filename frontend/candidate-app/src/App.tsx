import { useEffect, useState } from "react";

import { CandidateLayout } from "./layouts/CandidateLayout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";

function getPage() {
  return window.location.pathname === "/candidate/profile"
    ? "profile"
    : "dashboard";
}

export default function App() {
  const [page, setPage] = useState(getPage);

  useEffect(() => {
    const handleNavigation = () => {
      setPage(getPage());
    };

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return (
    <CandidateLayout>
      {page === "profile" ? <Profile /> : <Dashboard />}
    </CandidateLayout>
  );
}