import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import { Mic2 } from "lucide-react";

interface CandidateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

/* Candidate application sidebar - The Candidate MFE does not own routing. Navigation is delegated to the Shell through onNavigate().
 */

export function CandidateSidebar({
  isOpen,
  onClose,
  onNavigate,
}: CandidateSidebarProps) {
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
      label: "Resume",
      path: "/candidate/resume",
      icon: FileText,
    },
    {
      label: "Mentor Chat",
      path: "/candidate/chat",
      icon: MessageCircle,
    },
    {
      label: "Mock Interview", 
      path: "/candidate/mock-interview", 
      icon: Mic2
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-30
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex flex-col
          overflow-hidden
          border-r border-[#2F2B27]
          bg-[#181715]

          shadow-[8px_0_30px_rgba(0,0,0,0.12)]

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
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className={`
            flex h-[72px]
            shrink-0
            items-center
            border-b border-[#2F2B27]
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
                font-semibold
                tracking-[-0.02em]
                text-[#F2EDE4]
              "
            >
              AI Interview
            </button>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
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
              rounded-lg
              text-[#817A72]
              transition-colors
              hover:bg-[#27231F]
              hover:text-[#F2EDE4]
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
              rounded-lg
              text-[#817A72]
              transition-colors
              hover:bg-[#27231F]
              hover:text-[#F2EDE4]
              lg:hidden
            "
          >
            <X className="!h-[18px] !w-[18px]" />
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F5A54]">
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

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <div className="shrink-0 border-t border-[#2F2B27] px-3 py-4">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F5A54]">
              Account
            </p>
          )}

          <SidebarItem
            label="Profile"
            collapsed={collapsed}
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

/* =============================================================
   SIDEBAR ITEM
============================================================= */

interface SidebarItemProps {
  label: string;
  collapsed: boolean;
  icon: ReactNode;
  onClick: () => void;
}

/**
 * Individual sidebar navigation item.
 */
function SidebarItem({
  label,
  collapsed,
  icon,
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
        rounded-lg
        text-left

        text-[14px]
        font-medium
        text-[#918A82]

        transition-all
        duration-150

        hover:bg-[#24211E]
        hover:text-[#F2EDE4]

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#B9674B]/50

        ${
          collapsed
            ? "justify-center px-2 py-3"
            : "gap-3 px-3 py-[11px]"
        }
      `}
    >
      {/* Icon */}
      <span
        className="
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          text-[#777169]
          transition-colors
          duration-150

          group-hover:text-[#D98260]
        "
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