import { useState, useEffect, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import { getConversations } from "../services/chat.api";

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const conversations = await getConversations();

        const totalUnread = conversations.reduce(
          (total, conversation) => total + (conversation.unreadCount ?? 0),
          0,
        );

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Failed to load chat unread count:", error);
      }
    };

    loadUnreadCount();
  }, [currentPath]);

  // Mentorship starts expanded whenever the user is inside
  // the mentorship marketplace or chat section.
  const [mentorshipOpen, setMentorshipOpen] = useState(
    currentPath.startsWith("/candidate/mentors") ||
      currentPath.startsWith("/candidate/chat"),
  );

  const navigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
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

      {/* Sidebar */}
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
        {/* Header */}
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
                cursor-pointer
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
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="
              hidden
              h-9
              w-9
              shrink-0
              cursor-pointer
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
              cursor-pointer
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

        {/* Navigation */}
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
            {/* Dashboard */}
            <SidebarItem
              label="Dashboard"
              collapsed={collapsed}
              active={currentPath === "/candidate"}
              icon={
                <Home
                  className="!h-[19px] !w-[19px] shrink-0"
                  strokeWidth={1.7}
                />
              }
              onClick={() => navigate("/candidate")}
            />

            {/* Interviews */}
            <SidebarItem
              label="Interviews"
              collapsed={collapsed}
              active={currentPath.startsWith("/candidate/interviews")}
              icon={
                <CalendarDays
                  className="!h-[19px] !w-[19px] shrink-0"
                  strokeWidth={1.7}
                />
              }
              onClick={() => navigate("/candidate/interviews")}
            />

            {/* Mock Interview */}
            <SidebarItem
              label="Mock Interview"
              collapsed={collapsed}
              active={currentPath.startsWith("/candidate/mock-interview")}
              icon={<span className="text-[18px] leading-none">🎙️</span>}
              onClick={() => navigate("/candidate/mock-interview")}
            />

            {/* =================================================
                MENTORSHIP
            ================================================= */}
            <div>
              <button
                type="button"
                onClick={() => {
                  // When sidebar is collapsed, clicking the icon
                  // directly opens the mentorship marketplace.
                  if (collapsed) {
                    navigate("/candidate/mentors");
                    return;
                  }

                  setMentorshipOpen((value) => !value);
                }}
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
                    currentPath.startsWith("/candidate/mentors") ||
                    currentPath.startsWith("/candidate/chat")
                      ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-900"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }

                  ${
                    collapsed
                      ? "justify-center px-2 py-3"
                      : "gap-3 px-3 py-[11px]"
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    ${
                      currentPath.startsWith("/candidate/mentors") ||
                      currentPath.startsWith("/candidate/chat")
                        ? "text-violet-600"
                        : "text-slate-400 group-hover:text-violet-600"
                    }
                  `}
                >
                  <MessageCircle
                    className="!h-[19px] !w-[19px]"
                    strokeWidth={1.7}
                  />
                </span>

                {!collapsed && (
                  <>
                    <span className="flex-1">Mentorship</span>

                    <ChevronDown
                      className={`
                        h-4
                        w-4
                        transition-transform
                        ${mentorshipOpen ? "rotate-180" : ""}
                      `}
                    />
                  </>
                )}
              </button>

              {/* Mentorship children */}
              {!collapsed && mentorshipOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate("/candidate/mentors")}
                    className={`
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      rounded-lg
                      px-3
                      py-2
                      text-left
                      text-xs
                      font-medium
                      transition-colors
                      ${
                        currentPath === "/candidate/mentors"
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    Discover Mentors
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/candidate/chat")}
                    className={`
    flex
    w-full
    cursor-pointer
    items-center
    rounded-lg
    px-3
    py-2
    text-left
    text-xs
    font-medium
    transition-colors
    ${
      currentPath.startsWith("/candidate/chat")
        ? "bg-violet-50 text-violet-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }
  `}
                  >
                    <span className="flex-1">My Mentors / Chats</span>

                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Account */}
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
            active={currentPath.startsWith("/candidate/profile")}
            icon={
              <User
                className="!h-[19px] !w-[19px] shrink-0"
                strokeWidth={1.7}
              />
            }
            onClick={() => navigate("/candidate/profile")}
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

        ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-[11px]"}

        ${
          active
            ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
    >
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

      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
