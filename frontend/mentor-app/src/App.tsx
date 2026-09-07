import "./index.css";

import { Route, Routes } from "react-router-dom";
import MentorLayout from "./layouts/MentorLayout";
import Dashboard from "./pages/Dashboard";
import MentorshipSettings from "./pages/MentorshipSettings";
import Profile from "./pages/Profile";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<MentorLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="settings" element={<MentorshipSettings />} />

          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </>
  );
}
