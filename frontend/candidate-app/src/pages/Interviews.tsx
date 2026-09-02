import { useQuery } from "@tanstack/react-query";
import {
  getCandidateInterviews,
  type CandidateInterview,
} from "../services/interview.api";
import { useState } from "react";
import { InterviewStartModal } from "../components/InterviewStartModal";

/* Displays all interviews assigned to the authenticated candidate. */

export function Interviews() {
  const [selectedInterview, setSelectedInterview] =
    useState<CandidateInterview | null>(null); // stores the interview currently selected by the candidate

  const {
    data: interviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["candidate-interviews"],
    queryFn: getCandidateInterviews,
  });

  if (isLoading) {
    return <div className="p-8 text-[#817A72]">Loading interviews...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-400">Failed to load interviews.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 p-6 sm:p-8">
      {/* Page heading */}

      <div>
        <p className="text-sm font-medium text-[#B9674B]">
          Your Interview Space
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          My Interviews
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[#817A72]"></p>
      </div>

      {/* Interview list */}

      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-[#332B27] bg-[#1B1917] px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-[#F2EDE4]">
            You're all caught up
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817A72]">
            You don't have any interviews assigned right now. New opportunities
            will appear here when they're ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="rounded-2xl border border-[#332B27] bg-[#1B1917] p-6 transition-colors duration-200 hover:border-[#514039] hover:bg-[#1E1B19] sm:p-7"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Interview information */}
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight text-[#F2EDE4]">
                    {interview.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#817A72]">
                    {interview.role}
                  </p>
                </div>

                {/* Interview status */}

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    interview.status === "IN_PROGRESS"
                      ? "bg-blue-500/10 text-blue-300"
                      : interview.status === "COMPLETED"
                        ? "bg-white/5 text-[#8B95A5]"
                        : interview.status === "CANCELLED"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-[#25352D] text-[#9FD0B4]"
                  }`}
                >
                  {interview.status === "IN_PROGRESS"
                    ? "In Progress"
                    : interview.status === "COMPLETED"
                      ? "Completed"
                      : interview.status === "CANCELLED"
                        ? "Cancelled"
                        : interview.status === "SCHEDULED"
                          ? "Scheduled"
                          : "Ready"}
                </span>
              </div>

              {/* Interview metadata */}

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#9B9188]">
                <span>{interview.type}</span>

                <span>{interview.duration} min</span>

                <span>{interview.totalQuestions} questions</span>
              </div>

              {interview.scheduledAt && (
                <div className="mt-3 text-sm text-[#A9A29A]">
                  Scheduled for{" "}
                  <span className="font-medium text-[#D98260]">
                    {new Date(interview.scheduledAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              )}

              {/* Interview skills */}

              <div className="mt-5 flex flex-wrap gap-2">
                {interview.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#3A332E] bg-[#211E1B] px-3 py-1.5 text-xs text-[#B8AFA5]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Interview action */}

              <div className="mt-7 flex items-center justify-between border-t border-[#302A26] pt-5">
                <p className="text-sm text-[#817A72]">
                  {interview.status === "COMPLETED"
                    ? "This interview has been completed."
                    : interview.status === "IN_PROGRESS"
                      ? "Your interview is currently in progress."
                      : interview.status === "SCHEDULED"
                        ? "Your interview is scheduled."
                        : interview.status === "CANCELLED"
                          ? "This interview has been cancelled."
                          : "Ready when you are."}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedInterview(interview)}
                  disabled={
                    interview.status === "COMPLETED" ||
                    interview.status === "CANCELLED"
                  }
                  className="cursor-pointer rounded-lg bg-[#B9674B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {interview.status === "IN_PROGRESS"
                    ? "Resume Interview"
                    : interview.status === "COMPLETED"
                      ? "Completed"
                      : interview.status === "CANCELLED"
                        ? "Cancelled"
                        : interview.status === "SCHEDULED"
                          ? "View Interview"
                          : "Start Interview"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview start confirmation modal */}

      {selectedInterview && (
        <InterviewStartModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}
