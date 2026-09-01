import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  X,
  User,
} from "lucide-react";
import { useLocation } from "react-router-dom";

interface RecruiterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function RecruiterSidebar({
  isOpen,
  onClose,
  onNavigate,
}: RecruiterSidebarProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/recruiter",
    },
    {
      label: "Interviews",
      icon: ClipboardList,
      path: "/recruiter/interviews",
    },
    {
      label: "Candidates",
      icon: Users,
      path: "/recruiter/candidates",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/recruiter/settings",
    },
  ];

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    if (path === "/recruiter") {
      return location.pathname === "/recruiter";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-pointer bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-[#2F2B27]
          bg-[#181715]
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}

        <div className="flex h-16 items-center justify-between border-b border-[#2F2B27] px-5">
          <button
            type="button"
            onClick={() => handleNavigate("/recruiter")}
            className="cursor-pointer text-lg font-semibold tracking-tight text-[#F2EDE4]"
          >
            AI Interview
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#8F887F] hover:bg-[#24211E] hover:text-[#F2EDE4] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}

        <div className="px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6962]">
            Recruiter
          </p>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex w-full cursor-pointer items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-left text-sm
                    transition-colors
                    ${
                      active
                        ? "bg-[#2A2521] text-[#F2EDE4]"
                        : "text-[#A9A29A] hover:bg-[#24211E] hover:text-[#F2EDE4]"
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active ? "text-[#D98260]" : ""
                    }`}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile */}

        <div className="mt-auto border-t border-[#2F2B27] p-4">
          <button
            type="button"
            onClick={() => handleNavigate("/recruiter/profile")}
            className={`
      flex w-full cursor-pointer items-center gap-3 rounded-xl
      p-3 text-left transition-colors
      ${
        location.pathname === "/recruiter/profile"
          ? "bg-[#24211E]"
          : "hover:bg-[#24211E]"
      }
    `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B211D]">
              <User
                className="h-[18px] w-[18px] text-[#D98260]"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#F2EDE4]">
                Recruiter
              </p>

              <p className="truncate text-xs text-[#817A72]">View profile</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
