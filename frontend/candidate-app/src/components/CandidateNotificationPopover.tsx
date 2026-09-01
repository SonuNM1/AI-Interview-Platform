import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiClock } from "react-icons/fi";
import { getCandidateInterviews } from "../services/interview.api";

interface CandidateNotificationPopoverProps {
  onNavigate: (path: string) => void;
}

function formatInterviewTime(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getTimeUntil(scheduledAt: string) {
  const difference = new Date(scheduledAt).getTime() - Date.now();

  if (difference <= 0) {
    return "Starting now";
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 60) {
    return `Starts in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `Starts in ${hours}h ${remainingMinutes}m`
      : `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = Math.floor(hours / 24);

  return `Starts in ${days} day${days === 1 ? "" : "s"}`;
}

export function CandidateNotificationPopover({
  onNavigate,
}: CandidateNotificationPopoverProps) {
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["candidate-interviews"],
    queryFn: getCandidateInterviews,
  });

  const upcomingInterviews = interviews
    .filter(
      (interview) => interview.status === "SCHEDULED" && interview.scheduledAt,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#181715] shadow-2xl">
      <div className="border-b border-[#2F2B27] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#F2EDE4]">Notifications</h2>
      </div>

      {isLoading ? (
        <div className="px-4 py-8 text-center text-sm text-[#8F887F]">
          Loading notifications...
        </div>
      ) : upcomingInterviews.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-[#F2EDE4]">No upcoming interviews</p>

          <p className="mt-1 text-xs text-[#8F887F]">You're all caught up.</p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {upcomingInterviews.map((interview) => (
            <button
              key={interview._id}
              type="button"
              onClick={() =>
                onNavigate(`/candidate/interview/${interview.accessToken}`)
              }
              className="w-full border-b border-[#2F2B27] px-4 py-4 text-left transition hover:bg-[#24211E]"
            >
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D98260]/10">
                  <FiCalendar className="h-4 w-4 text-[#D98260]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#D98260]">
                    Upcoming Interview
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#F2EDE4]">
                    {interview.title}
                  </p>

                  <p className="mt-1 text-xs text-[#8F887F]">
                    {interview.role}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A9A29A]">
                    <FiClock className="h-3.5 w-3.5" />

                    <span>{formatInterviewTime(interview.scheduledAt!)}</span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-[#D98260]">
                    {getTimeUntil(interview.scheduledAt!)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
