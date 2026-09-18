import { Bell, Menu, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.api";
import { NotificationPopover } from "./NotificationPopover";
import { useState } from "react";

interface RecruiterTopbarProps {
  onMenuClick: () => void;
  onNavigate: (path: string) => void;
}

export function RecruiterTopbar({
  onMenuClick,
  onNavigate,
}: RecruiterTopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["recruiter-notifications"],
    queryFn: getNotifications,
  });

  const unreadCount =
    data?.data?.filter((notification) => !notification.isRead).length ?? 0;

  return (
    <header
      className="
        sticky top-0 z-20
        flex h-16 shrink-0
        items-center justify-between
        border-b border-slate-200
        bg-white/95
        px-4
        backdrop-blur
        sm:px-6
      "
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="
            flex h-9 w-9 cursor-pointer
            items-center justify-center
            rounded-xl
            text-slate-500
            transition-colors
            hover:bg-violet-50
            hover:text-violet-600
            lg:hidden
          "
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Recruiter Dashboard
          </p>

          <p className="hidden text-xs text-slate-500 sm:block"></p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setIsNotificationsOpen((current) => !current)
            }
            aria-label="Notifications"
            className="
              relative flex h-10 w-10 cursor-pointer
              items-center justify-center
              rounded-xl
              text-slate-500
              transition-colors
              hover:bg-violet-50
              hover:text-violet-600
            "
          >
            <Bell
              className="h-[19px] w-[19px]"
              strokeWidth={1.8}
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute right-1.5 top-1.5
                  flex min-h-4 min-w-4
                  items-center justify-center
                  rounded-full
                  bg-violet-600
                  px-1
                  text-[9px]
                  font-semibold
                  text-white
                "
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <NotificationPopover
              onNavigate={(path) => {
                setIsNotificationsOpen(false);
                onNavigate(path);
              }}
            />
          )}
        </div>

        {/* Profile */}

        <div className="group relative">
          <button
            type="button"
            onClick={() => onNavigate("/recruiter/profile")}
            aria-label="Open profile"
            className="
              flex h-10 w-10 cursor-pointer
              items-center justify-center
              rounded-xl
              text-slate-500
              transition-colors
              hover:bg-violet-50
              hover:text-violet-600
            "
          >
            <User
              className="h-[20px] w-[20px]"
              strokeWidth={1.8}
            />
          </button>

          <span
            className="
              pointer-events-none absolute right-0 top-12
              whitespace-nowrap rounded-lg
              border border-slate-200
              bg-white
              px-2.5 py-1.5
              text-[11px]
              text-slate-700
              opacity-0
              shadow-lg shadow-slate-200/50
              transition-opacity
              group-hover:opacity-100
            "
          >
            Profile
          </span>
        </div>
      </div>
    </header>
  );
}