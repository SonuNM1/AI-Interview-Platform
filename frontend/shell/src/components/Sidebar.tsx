import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", path: "/" },
  { label: "Candidate", path: "/candidate" },
  { label: "Recruiter", path: "/recruiter" },
  { label: "Mentor", path: "/mentor" },
  { label: "Admin", path: "/admin" },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] border-r p-4">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}