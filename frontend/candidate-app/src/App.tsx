import "./index.css";
import { Routes, Route } from "react-router-dom";
import { CandidateLayout } from "./layouts/CandidateLayout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <CandidateLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </CandidateLayout>

      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
