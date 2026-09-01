import { Bell, Menu, User } from "lucide-react";
import { CandidateNotificationPopover } from "./CandidateNotificationPopover";
import { useState } from "react";

interface CandidateTopbarProps {
  onMenuClick: () => void;
  onNavigate: (path: string) => void;
}

export function CandidateTopbar({
  onMenuClick,
  onNavigate,
}: CandidateTopbarProps) {
  
  const [showNotifications, setShowNotifications] = useState(false);

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
      <div className="flex items-center gap-3">
        {/* Mobile sidebar button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            text-[#8F887F]
            transition-colors
            hover:bg-[#24211E]
            hover:text-[#F2EDE4]
            lg:hidden
          "
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </button>

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

            <span
              className="
        absolute
        right-[9px]
        top-[8px]
        h-1.5
        w-1.5
        rounded-full
        bg-[#D98260]
      "
            />
          </button>

          {showNotifications && (
            <CandidateNotificationPopover onNavigate={onNavigate} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onNavigate("/candidate/notifications")}
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

          <span
            className="
              absolute
              right-[9px]
              top-[8px]
              h-1.5
              w-1.5
              rounded-full
              bg-[#D98260]
            "
          />
        </button>

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
