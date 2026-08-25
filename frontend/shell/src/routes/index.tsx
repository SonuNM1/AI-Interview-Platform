import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Loading } from "@/components/Loading";
import { AuthLayout } from "@/layouts/AuthLayout";

import { ForgotPassword } from "@/app/pages/ForgotPassword";
import { Login } from "@/app/pages/Login";
import { Register } from "@/app/pages/Register";
import { ResetPassword } from "@/app/pages/ResetPassword";
import { VerifyEmail } from "@/app/pages/VerifyEmail";
import { NotFound } from "@/app/pages/NotFound";

import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

const CandidateApp = lazy(() => import("candidate/App"));
const RecruiterApp = lazy(() => import("recruiter/App"));
const MentorApp = lazy(() => import("mentor/App"));

function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">AI Interview Platform</h1>

      <p className="mt-2 text-muted-foreground">Welcome to the platform.</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading message="Loading application..." />}>
        <Routes>
          {/* Public authentication routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Route>

          {/* Public home */}
          <Route path="/" element={<Home />} />

          {/* Candidate */}
          <Route element={<ProtectedRoute allowedRole="CANDIDATE" />}>
            <Route path="/candidate/*" element={<CandidateApp />} />
          </Route>

          {/* Recruiter */}
          <Route element={<ProtectedRoute allowedRole="RECRUITER" />}>
            <Route path="/recruiter/*" element={<RecruiterApp />} />
          </Route>

          {/* Mentor */}
          <Route element={<ProtectedRoute allowedRole="MENTOR" />}>
            <Route path="/mentor/*" element={<MentorApp />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
            <Route path="/admin/*" element={<div>Admin App</div>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
