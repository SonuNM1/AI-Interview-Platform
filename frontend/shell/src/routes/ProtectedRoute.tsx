import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

type UserRole =
  | "CANDIDATE"
  | "RECRUITER"
  | "MENTOR"
  | "ADMIN";

interface ProtectedRouteProps {
  allowedRole?: UserRole;
}

export function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const location = useLocation();

  const { user, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  // User is not logged in.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // User is authenticated but does not have permission
  // to access this role-specific application.
  if (allowedRole && user.role !== allowedRole) {
    switch (user.role) {
      case "CANDIDATE":
        return <Navigate to="/candidate" replace />;

      case "RECRUITER":
        return <Navigate to="/recruiter" replace />;

      case "MENTOR":
        return <Navigate to="/mentor" replace />;

      case "ADMIN":
        return <Navigate to="/admin" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}