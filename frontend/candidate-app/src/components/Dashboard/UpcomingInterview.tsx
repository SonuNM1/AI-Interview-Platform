import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Video,
} from "lucide-react";

import {
  getCandidateInterviews,
  type CandidateInterview,
} from "../../services/interview.api";

export function UpcomingInterview() {
  const navigate = useNavigate();

  const [interview, setInterview] =
    useState<CandidateInterview | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcomingInterview = async () => {
      try {
        setLoading(true);

        const interviews = await getCandidateInterviews();

        const now = new Date();

        const upcoming = interviews
          .filter((item) => {
            if (!item.scheduledAt) {
              return false;
            }

            if (
              item.status === "COMPLETED" ||
              item.status === "CANCELLED"
            ) {
              return false;
            }

            return new Date(item.scheduledAt) > now;
          })
          .sort(
            (a, b) =>
              new Date(a.scheduledAt!).getTime() -
              new Date(b.scheduledAt!).getTime(),
          );

        setInterview(upcoming[0] ?? null);
      } catch (error) {
        console.error(
          "Failed to load upcoming interview:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingInterview();
  }, []);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const getDifficultyLabel = (
    difficulty: CandidateInterview["difficulty"],
  ) => {
    return (
      difficulty.charAt(0) +
      difficulty.slice(1).toLowerCase()
    );
  };

  const handleViewInterview = () => {
    if (!interview?.accessToken) {
      return;
    }

    navigate(`/interview/${interview.accessToken}`);
  };

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">
            Next Scheduled Interview
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate("/candidate/interviews")}
          className="group flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition-colors hover:text-indigo-600 cursor-pointer"
        >
          View all
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-1/3 rounded bg-slate-200" />
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />

            <div className="flex gap-4">
              <div className="h-12 flex-1 rounded-xl bg-slate-200" />
              <div className="h-12 flex-1 rounded-xl bg-slate-200" />
              <div className="h-12 flex-1 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ) : interview ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <Video size={13} />
                    {interview.type.replace("_", " ")}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {getDifficultyLabel(interview.difficulty)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
                  {interview.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {interview.role}
                </p>

                {interview.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {interview.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <CalendarDays
                      size={17}
                      className="text-violet-600"
                    />

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {formatDate(interview.scheduledAt!)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <Clock3
                      size={17}
                      className="text-indigo-600"
                    />

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Time
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {formatTime(interview.scheduledAt!)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <Clock3
                      size={17}
                      className="text-fuchsia-600"
                    />

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Duration
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {interview.duration} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 lg:pl-6">
                <button
                  type="button"
                  onClick={handleViewInterview}
                  disabled={!interview.accessToken}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                >
                  View Interview
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CalendarDays size={22} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No upcoming interviews
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            You're all caught up. New interviews assigned by
            recruiters will appear here automatically.
          </p>

          <button
            type="button"
            onClick={() => navigate("/candidate/interviews")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 cursor-pointer"
          >
            View All Interviews
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}