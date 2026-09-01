import { Routes, Route } from "react-router-dom";

import { RecruiterLayout } from "./layouts/RecruiterLayout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Interviews from "./pages/Interviews";
import Candidates from "./pages/Candidates";
import Settings from "./pages/Settings";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RecruiterLayout />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route
          path="/interviews"
          element={<Interviews />}
        />

        <Route
          path="/candidates"
          element={<Candidates />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>
    </Routes>
  );
}