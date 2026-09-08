import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Users,
  X,
} from "lucide-react";
import { Mic2 } from "lucide-react";

interface CandidateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function CandidateSidebar({
  isOpen,
  onClose,
  onNavigate,
}: CandidateSidebarProps) {
  const currentPath = window.location.pathname;

  const [collapsed, setCollapsed] = useState(false);

  const navigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/candidate",
      icon: Home,
    },
    {
      label: "Interviews",
      path: "/candidate/interviews",
      icon: CalendarDays,
    },
    {
      label: "Mock Interview",
      path: "/candidate/mock-interview",
      icon: Mic2,
    },
    {
      // Mentorship remains the main marketplace entry point.
      label: "Mentorship",
      path: "/candidate/mentors",
      icon: Users,
    },
  ];

  return (
    <>
      {/* =========================================================
          MOBILE BACKDROP
      ========================================================= */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-30
            bg-slate-900/20
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-40
          flex
          flex-col
          overflow-hidden
          border-r border-slate-200
          bg-white
          shadow-[8px_0_30px_rgba(15,23,42,0.04)]

          transition-[width,transform]
          duration-200
          ease-out

          lg:static
          lg:z-auto
          lg:translate-x-0

          ${collapsed ? "lg:w-[76px]" : "lg:w-[250px]"}

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =======================================================
            HEADER
        ======================================================= */}
        <div
          className={`
            flex
            h-[72px]
            shrink-0
            items-center
            border-b border-slate-200
            ${collapsed ? "justify-center px-3" : "px-5"}
          `}
        >
          {!collapsed && (
            <button
              type="button"
              onClick={() => navigate("/candidate")}
              className="
                min-w-0
                flex-1
                truncate
                text-left
                text-[17px]
                font-bold
                tracking-[-0.03em]
                text-slate-900
              "
            >
              AI Interview
            </button>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={() =>
              setCollapsed((value) => !value)
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              hidden
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              hover:bg-violet-50
              hover:text-violet-600
              lg:flex
            "
          >
            {collapsed ? (
              <ChevronRight className="!h-[17px] !w-[17px]" />
            ) : (
              <ChevronLeft className="!h-[17px] !w-[17px]" />
            )}
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              hover:bg-violet-50
              hover:text-violet-600
              lg:hidden
            "
          >
            <X className="!h-[18px] !w-[18px]" />
          </button>
        </div>

        {/* =======================================================
            NAVIGATION
        ======================================================= */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p
              className="
                mb-3
                px-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-400
              "
            >
              Workspace
            </p>
          )}

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <SidebarItem
                  key={item.path}
                  label={item.label}
                  collapsed={collapsed}
                  active={
                    item.path === "/candidate"
                      ? currentPath === "/candidate"
                      : currentPath.startsWith(item.path)
                  }
                  icon={
                    <Icon
                      className="
                        !h-[19px]
                        !w-[19px]
                        shrink-0
                      "
                      strokeWidth={1.7}
                    />
                  }
                  onClick={() => navigate(item.path)}
                />
              );
            })}
          </div>
        </nav>

        {/* =======================================================
            ACCOUNT
        ======================================================= */}
        <div className="shrink-0 border-t border-slate-200 px-3 py-4">
          {!collapsed && (
            <p
              className="
                mb-3
                px-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-400
              "
            >
              Account
            </p>
          )}

          <SidebarItem
            label="Profile"
            collapsed={collapsed}
            active={currentPath.startsWith(
              "/candidate/profile",
            )}
            icon={
              <User
                className="
                  !h-[19px]
                  !w-[19px]
                  shrink-0
                "
                strokeWidth={1.7}
              />
            }
            onClick={() =>
              navigate("/candidate/profile")
            }
          />
        </div>
      </aside>
    </>
  );
}

/* ===============================================================
   SIDEBAR ITEM
=============================================================== */

interface SidebarItemProps {
  label: string;
  collapsed: boolean;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}

/*
 * Individual sidebar item.
 *
 * Only visual styling is handled here.
 * Navigation behaviour remains unchanged.
 */
function SidebarItem({
  label,
  collapsed,
  icon,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        group
        flex
        w-full
        cursor-pointer
        items-center
        rounded-xl
        text-left
        text-[14px]
        font-medium
        transition-all
        duration-150

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-violet-500/30

        ${
          collapsed
            ? "justify-center px-2 py-3"
            : "gap-3 px-3 py-[11px]"
        }

        ${
          active
            ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
    >
      {/* Icon */}
      <span
        className={`
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          transition-colors
          duration-150

          ${
            active
              ? "text-violet-600"
              : "text-slate-400 group-hover:text-violet-600"
          }
        `}
      >
        {icon}
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="truncate">
          {label}
        </span>
      )}
    </button>
  );
}