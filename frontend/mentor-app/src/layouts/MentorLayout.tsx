import { GraduationCap, LayoutDashboard, Settings, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "",
    icon: LayoutDashboard,
  },
  {
    name: "Mentorship Settings",
    path: "settings",
    icon: Settings,
  },
  {
    name: "Profile",
    path: "profile",
    icon: User,
  },
];

export default function MentorLayout() {
  const navigate = useNavigate();

  /*
   * Mentor MFE can run in two places:
   *
   * Standalone:
   * http://localhost:3003
   *
   * Inside Shell:
   * http://localhost:3000/mentor
   *
   * Therefore we calculate the correct base path.
   */
  const isRunningInsideShell =
    window.location.pathname === "/mentor" ||
    window.location.pathname.startsWith("/mentor/");

  const mentorBasePath = isRunningInsideShell ? "/mentor" : "";

  const getNavigationPath = (path: string) => {
    if (!path) {
      return mentorBasePath || "/";
    }

    return `${mentorBasePath}/${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-violet-100 bg-white/90 shadow-xl shadow-violet-100/40 backdrop-blur-xl">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-violet-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
              <GraduationCap size={22} />
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Mentor Portal
              </h1>

              <p className="text-xs text-slate-400">AI Interview Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
              Workspace
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;
              const path = getNavigationPath(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={path}
                  end={item.path === ""}
                  className={({ isActive }) =>
                    [
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200"
                        : "text-slate-500 hover:bg-violet-50 hover:text-violet-700",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="ml-64 flex min-h-screen flex-1 flex-col">
          {/* Topbar */}
          <header className="flex h-20 items-center justify-between border-b border-violet-100 bg-white/80 px-8 shadow-sm backdrop-blur-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                Mentor Workspace
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Manage your mentorship
              </h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(`${mentorBasePath}/profile`)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl"
              aria-label="Open profile"
            >
              <User size={20} />
            </button>
          </header>

          {/* Page */}
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
