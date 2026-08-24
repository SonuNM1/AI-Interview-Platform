import type { NavigateFunction } from "react-router-dom";

type UserRole =
  | "CANDIDATE"
  | "RECRUITER"
  | "MENTOR"
  | "ADMIN";

export function navigateByRole(
  navigate: NavigateFunction,
  role: UserRole,
) {
  switch (role) {
    case "CANDIDATE":
      navigate("/candidate");
      break;

    case "RECRUITER":
      navigate("/recruiter");
      break;

    case "MENTOR":
      navigate("/mentor");
      break;

    case "ADMIN":
      navigate("/admin");
      break;

    default:
      navigate("/");
  }
}