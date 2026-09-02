import { FiClock, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import {
  startInterview,
  type CandidateInterview,
} from "../services/interview.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

interface InterviewStartModalProps {
  interview: CandidateInterview;
  onClose: () => void;
}

/* Displays interview details and asks the candidate for confirmation before starting. */

export function InterviewStartModal({
  interview,
  onClose,
}: InterviewStartModalProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const scheduledTime = interview.scheduledAt
    ? new Date(interview.scheduledAt).getTime()
    : null;

  const timeLeft =
    scheduledTime !== null ? Math.max(0, scheduledTime - now) : null;

  const isBeforeScheduledTime = timeLeft !== null && timeLeft > 0;

  const isPublished = Boolean(interview.accessToken);

  const canStart =
    isPublished &&
    !isBeforeScheduledTime &&
    interview.status !== "COMPLETED" &&
    interview.status !== "CANCELLED";

  const formatCountdown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // starts a new interview or resumes an interview that is already in progress

  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      // if the interview was already started earlier, don't call the start API again

      if (interview.status === "IN_PROGRESS") {
        return {
          success: true,
          alreadyStarted: true,
        };
      }

      if (!interview.accessToken) {
        throw new Error("Interview has not been published yet");
      }

      return await startInterview(interview.accessToken);
    },

    // navigate to the interview room after starting/resuming

    onSuccess: () => {
      window.dispatchEvent(
        new CustomEvent("shell:navigate", {
          detail: {
            path: `/candidate/interview/${interview.accessToken}`,
          },
        }),
      );
    },

    // show a friendly error if the start request actually fails

    onError: (error) => {
      console.error("Failed to start interview:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Unable to start the interview. Please try again.",
        );
        return;
      }

      toast.error("Unable to start the interview. Please try again.");
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#3A332E] bg-[#1B1917] p-6 shadow-2xl sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#B9674B]">
              You're about to begin
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#F2EDE4]">
              {interview.title}
            </h2>

            <p className="mt-2 text-sm text-[#817A72]">{interview.role}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-[#817A72] transition hover:bg-[#24211E] hover:text-[#F2EDE4]"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Interview information */}

        <div className="mt-7 rounded-xl border border-[#332B27] bg-[#211E1B] p-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#B8AFA5]">
            <span className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              {interview.duration} minutes
            </span>

            <span>{interview.totalQuestions} questions</span>

            <span>{interview.type}</span>
          </div>

          {/* Interview skills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {interview.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#3A332E] bg-[#1B1917] px-3 py-1.5 text-xs text-[#B8AFA5]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {interview.scheduledAt && (
          <div className="mt-6 rounded-xl border border-[#332B27] bg-[#211E1B] p-5 text-center">
            {!isPublished ? (
              <>
                <p className="text-sm font-medium text-[#D98260]">
                  Waiting for recruiter
                </p>

                <p className="mt-2 text-sm text-[#817A72]">
                  This interview has not been published yet.
                </p>
              </>
            ) : isBeforeScheduledTime ? (
              <>
                <p className="text-sm text-[#9B9188]">Interview starts in</p>

                <p className="mt-2 font-mono text-3xl font-semibold tracking-wider text-[#D98260]">
                  {formatCountdown(timeLeft ?? 0)}
                </p>

                <p className="mt-2 text-xs text-[#817A72]">
                  You can start the interview when the scheduled time arrives.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#9FD0B4]">
                  Your interview is ready
                </p>

                <p className="mt-1 text-sm text-[#817A72]">
                  The scheduled time has arrived.
                </p>
              </>
            )}
          </div>
        )}

        {/* Candidate guidance */}

        <div className="text-sm leading-6 text-[#9B9188]">
          {interview.status === "IN_PROGRESS"
            ? "You have already started this interview. You can continue from where you left off."
            : ""}
        </div>

        {/* Modal actions */}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[#3A332E] px-5 py-2.5 text-sm font-medium text-[#B8AFA5] transition hover:bg-[#24211E] hover:text-[#F2EDE4]"
          >
            Not Yet
          </button>

          <button
            type="button"
            onClick={() => startInterviewMutation.mutate()}
            disabled={startInterviewMutation.isPending || !canStart}
            className="cursor-pointer rounded-lg bg-[#B9674B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {startInterviewMutation.isPending
              ? "Opening..."
              : interview.status === "IN_PROGRESS"
                ? "Resume Interview"
                : !isPublished
                  ? "Not Published"
                  : isBeforeScheduledTime
                    ? "Not Started Yet"
                    : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
