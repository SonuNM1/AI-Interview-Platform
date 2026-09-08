import { Bell, User } from "lucide-react";
import { CandidateNotificationPopover } from "./CandidateNotificationPopover";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.api";

interface CandidateTopbarProps {
  onMenuClick: () => void;
  onNavigate: (path: string) => void;
}

export function CandidateTopbar({
  onNavigate,
}: CandidateTopbarProps) {
  const [showNotifications, setShowNotifications] =
    useState(false);

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
        sticky
        top-0
        z-20
        flex
        h-[72px]
        items-center
        justify-between
        border-b border-slate-200
        bg-white/90
        px-4
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      {/* Keep the right-side actions exactly as before. */}
      <div className="ml-auto flex items-center gap-2">

        {/* =======================================================
            NOTIFICATIONS
        ======================================================= */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous,
              )
            }
            aria-label="Notifications"
            className="
              relative
              flex
              h-10
              w-10
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
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
                  absolute
                  right-[6px]
                  top-[5px]
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-600
                  px-1
                  text-[9px]
                  font-bold
                  text-white
                  ring-2
                  ring-white
                "
              >
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <CandidateNotificationPopover
              onNavigate={onNavigate}
            />
          )}
        </div>

        {/* =======================================================
            CANDIDATE PROFILE
        ======================================================= */}
        <button
          type="button"
          onClick={() =>
            onNavigate("/candidate/profile")
          }
          aria-label="Open profile"
          className="
            flex
            h-10
            w-10
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-400
            shadow-sm
            transition-all
            hover:border-violet-200
            hover:bg-violet-50
            hover:text-violet-600
          "
        >
          <User
            className="h-[20px] w-[20px]"
            strokeWidth={1.8}
          />
        </button>
      </div>
    </header>
  );
}