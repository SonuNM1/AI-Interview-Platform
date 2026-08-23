import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Loading } from "@/components/Loading";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ForgotPassword } from "@/app/pages/ForgotPassword";
import { Login } from "@/app/pages/Login";
import { Register } from "@/app/pages/Register";
import { ResetPassword } from "@/app/pages/ResetPassword";
import { VerifyEmail } from "@/app/pages/VerifyEmail";
import { NotFound } from "@/app/pages/NotFound";

// Candidate is loaded remotely from the Candidate MFE.

const CandidateApp = lazy(() => import("candidate/App"));

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
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/reset-password" element={<div>Reset Password</div>} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/candidate/*" element={<CandidateApp />} />

            <Route path="/recruiter/*" element={<div>Recruiter App</div>} />

            <Route path="/mentor/*" element={<div>Mentor App</div>} />

            <Route path="/admin/*" element={<div>Admin App</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
