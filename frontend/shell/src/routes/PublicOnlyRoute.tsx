import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

export function PublicOnlyRoute() {
  const user = useAppSelector(
    (state) => state.auth.user,
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  if (isAuthenticated && user) {
    switch (user.role) {
      case "CANDIDATE":
        return (
          <Navigate
            to="/candidate"
            replace
          />
        );

      case "RECRUITER":
        return (
          <Navigate
            to="/recruiter"
            replace
          />
        );

      case "MENTOR":
        return (
          <Navigate
            to="/mentor"
            replace
          />
        );

      case "ADMIN":
        return (
          <Navigate
            to="/admin"
            replace
          />
        );

      default:
        return (
          <Navigate
            to="/"
            replace
          />
        );
    }
  }

  return <Outlet />;
}