import { Bell, User } from "lucide-react";
import { CandidateNotificationPopover } from "./CandidateNotificationPopover";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.api";

interface CandidateTopbarProps {
  onMenuClick: () => void;
  onNavigate: (path: string) => void;
}

export function CandidateTopbar({ onNavigate }: CandidateTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const { data } = useQuery({
    queryKey: ["candidate-notifications"],
    queryFn: getNotifications,
  });

  const notifications = data?.data ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <header
      className="
        sticky top-0 z-20
        flex h-16
        items-center justify-between
        border-b border-[#2F2B27]
        bg-[#181715]/95
        px-4
        backdrop-blur
        sm:px-6
      "
    >
      <div className="ml-auto flex items-center gap-1">
        {/* Notification bell with upcoming interview popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((previous) => !previous)}
            aria-label="Notifications"
            className="
        relative
        flex h-10 w-10
        items-center justify-center
        rounded-lg
        text-[#8F887F]
        transition-colors
        hover:bg-[#24211E]
        hover:text-[#F2EDE4]
        cursor-pointer
      "
          >
            <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span
                className="
      absolute
      right-[7px]
      top-[6px]
      flex
      h-4
      min-w-4
      items-center
      justify-center
      rounded-full
      bg-[#D98260]
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

          {showNotifications && (
            <CandidateNotificationPopover onNavigate={onNavigate} />
          )}
        </div>

        {/* Candidate profile */}
        <button
          type="button"
          onClick={() => onNavigate("/candidate/profile")}
          aria-label="Open profile"
          className="
      flex h-10 w-10
      items-center justify-center
      rounded-lg
      text-[#8F887F]
      transition-colors
      hover:bg-[#24211E]
      hover:text-[#F2EDE4]
      cursor-pointer
    "
        >
          <User className="h-[20px] w-[20px]" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
