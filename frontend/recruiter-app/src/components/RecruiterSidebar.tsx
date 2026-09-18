import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  X,
  User,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner"; 

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

    if(path === "/recruiter/candidates") {
      toast.info("Candidates page is yet to be implemented.") ; 

      onClose() ; 
      return ; 
    }

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
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            cursor-pointer
            bg-slate-900/30
            backdrop-blur-[1px]
            lg:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-slate-200
          bg-white
          shadow-xl shadow-slate-200/40
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto
          lg:w-64
          lg:translate-x-0
          lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            onClick={() => handleNavigate("/recruiter")}
            className="
              cursor-pointer
              text-lg
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              AI Interview
            </span>
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              flex h-9 w-9
              cursor-pointer
              items-center justify-center
              rounded-xl
              text-slate-500
              transition-colors
              hover:bg-violet-50
              hover:text-violet-600
              lg:hidden
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                    flex w-full cursor-pointer
                    items-center gap-3
                    rounded-xl
                    px-3 py-2.5
                    text-left text-sm
                    transition-all
                    ${
                      active
                        ? "bg-gradient-to-r from-violet-50 to-indigo-50 font-semibold text-violet-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active
                        ? "text-violet-600"
                        : "text-slate-400"
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
        <div className="shrink-0 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() =>
              handleNavigate("/recruiter/profile")
            }
            className={`
              flex w-full cursor-pointer
              items-center gap-3
              rounded-xl
              p-3
              text-left
              transition-colors
              ${
                location.pathname === "/recruiter/profile"
                  ? "bg-violet-50"
                  : "hover:bg-slate-50"
              }
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100">
              <User
                className="h-[18px] w-[18px] text-violet-600"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Recruiter
              </p>

              <p className="truncate text-xs text-slate-500">
                View profile
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}