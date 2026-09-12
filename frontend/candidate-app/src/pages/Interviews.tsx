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
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading interviews...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-red-500">
          Failed to load interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-10 p-6 sm:p-8">
        {/* Page heading */}

        <div>
          <p className="text-sm font-semibold text-violet-600">
            Your Interview Space
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Interviews
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500"></p>
        </div>

        {/* Interview list */}

        {interviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              You're all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any interviews assigned right now. New
              opportunities will appear here when they're ready.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/60 sm:p-7"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Interview information */}

                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {interview.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {interview.role}
                    </p>
                  </div>

                  {/* Interview status */}

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      interview.status === "IN_PROGRESS"
                        ? "bg-indigo-50 text-indigo-600"
                        : interview.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-500"
                          : interview.status === "CANCELLED"
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
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

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span>{interview.type}</span>

                  <span>{interview.duration} min</span>

                  <span>{interview.totalQuestions} questions</span>
                </div>

                {interview.scheduledAt && (
                  <div className="mt-3 text-sm text-slate-500">
                    Scheduled for{" "}
                    <span className="font-semibold text-violet-600">
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
                      className="rounded-full border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Interview action */}

                <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-500">
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
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  );
}