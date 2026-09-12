import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mic,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  getCandidateInterviews,
  type CandidateInterview,
} from "../../services/interview.api";

import {
  getMockInterviewHistory,
  type MockInterview,
} from "../../services/mockInterview.api";

interface MockScoreItem {
  id: string;
  score: number;
  date: string;
}

interface ActivityItem {
  id: string;
  title: string;
  type: "Completed" | "Scheduled" | "In Progress";
  date: string;
}

interface PerformanceData {
  averageScore: number | null;
  mockScores: MockScoreItem[];
  activity: ActivityItem[];
}

function calculateAverageScore(
  interviews: CandidateInterview[],
  mockInterviews: MockInterview[],
): number | null {
  const interviewScores = interviews
    .filter(
      (interview) =>
        interview.status === "COMPLETED" &&
        typeof interview.score === "number",
    )
    .map((interview) => interview.score as number);

  const mockScores = mockInterviews
    .filter(
      (interview) =>
        interview.status === "COMPLETED" &&
        typeof interview.score === "number",
    )
    .map((interview) => interview.score as number);

  const scores = [...interviewScores, ...mockScores];

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce(
    (sum, score) => sum + score,
    0,
  );

  return Number((total / scores.length).toFixed(1));
}

/**
 * Returns the 4 most recent mock interviews that actually
 * have a numeric score.
 *
 * We intentionally do not require COMPLETED here because the
 * graph is meant to show previous scored mock attempts.
 */
function getPreviousMockScores(
  mockInterviews: MockInterview[],
): MockScoreItem[] {
  return mockInterviews
    .filter(
      (interview) =>
        typeof interview.score === "number",
    )
    .sort((a, b) => {
      const dateA =
        a.completedAt ??
        a.updatedAt ??
        a.createdAt;

      const dateB =
        b.completedAt ??
        b.updatedAt ??
        b.createdAt;

      return (
        new Date(dateA).getTime() -
        new Date(dateB).getTime()
      );
    })
    .slice(-4)
    .map((interview) => ({
      id: interview._id,
      score: interview.score as number,
      date:
        interview.completedAt ??
        interview.updatedAt ??
        interview.createdAt,
    }));
}

/**
 * Combines normal candidate interviews and mock interviews
 * into a single recent activity feed.
 */
function getActivityItems(
  interviews: CandidateInterview[],
  mockInterviews: MockInterview[],
): ActivityItem[] {
  const interviewActivities: ActivityItem[] =
    interviews
      .filter(
        (interview) =>
          interview.status === "COMPLETED" ||
          interview.status === "SCHEDULED" ||
          interview.status === "IN_PROGRESS",
      )
      .map((interview) => {
        let type: ActivityItem["type"];

        if (interview.status === "COMPLETED") {
          type = "Completed";
        } else if (
          interview.status === "SCHEDULED"
        ) {
          type = "Scheduled";
        } else {
          type = "In Progress";
        }

        return {
          id: `interview-${interview._id}`,
          title: interview.title,
          type,
          date:
            interview.completedAt ??
            interview.scheduledAt ??
            interview.startedAt ??
            interview.updatedAt ??
            interview.createdAt,
        };
      });

  const mockActivities: ActivityItem[] =
    mockInterviews
      .filter(
        (interview) =>
          interview.status === "COMPLETED" ||
          interview.status === "IN_PROGRESS",
      )
      .map((interview) => ({
        id: `mock-${interview._id}`,
        title: "Mock Interview",
        type:
          interview.status === "COMPLETED"
            ? "Completed"
            : "In Progress",
        date:
          interview.completedAt ??
          interview.startedAt ??
          interview.updatedAt ??
          interview.createdAt,
      }));

  return [
    ...interviewActivities,
    ...mockActivities,
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime(),
    )
    .slice(0, 4);
}

function formatActivityDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function PerformanceOverview() {
  const [performance, setPerformance] =
    useState<PerformanceData>({
      averageScore: null,
      mockScores: [],
      activity: [],
    });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setLoading(true);

        const [
          candidateInterviews,
          mockInterviewResponse,
        ] = await Promise.all([
          getCandidateInterviews(),
          getMockInterviewHistory(),
        ]);

        const mockInterviews =
          mockInterviewResponse.data;

        const averageScore = calculateAverageScore(
          candidateInterviews,
          mockInterviews,
        );

        const mockScores =
          getPreviousMockScores(mockInterviews);

        const activity = getActivityItems(
          candidateInterviews,
          mockInterviews,
        );

        setPerformance({
          averageScore,
          mockScores,
          activity,
        });
      } catch (error) {
        console.error(
          "Failed to load performance data:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Your Performance
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Performance Overview
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Trophy size={20} />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* =====================================================
              LEFT PANEL
          ====================================================== */}
          <div className="px-6 py-7 lg:col-span-3 lg:border-r lg:border-slate-200">
            {/* Average Score */}
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Score
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  {loading
                    ? "—"
                    : performance.averageScore !== null
                      ? performance.averageScore
                      : "—"}
                </span>

                {!loading &&
                  performance.averageScore !== null && (
                    <span className="text-base font-medium text-slate-400">
                      / 10
                    </span>
                  )}
              </div>
            </div>

            {/* Score Progress */}
            <div className="mt-9">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Score Progress
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your last 4 mock interview scores
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp size={18} />
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="mt-7 flex h-48 items-end gap-4">
                  {[45, 60, 55, 75].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-xl bg-slate-200"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    ),
                  )}
                </div>
              ) : performance.mockScores.length > 0 ? (
                <div className="mt-7">
                  {/* Bars */}
                  <div className="flex h-48 items-end gap-4">
                    {performance.mockScores.map(
                      (item, index) => {
                        const height = Math.max(
                          item.score * 10,
                          8,
                        );

                        return (
                          <div
                            key={item.id}
                            className="group flex h-full flex-1 flex-col justify-end"
                          >
                            <div className="relative flex flex-1 items-end justify-center">
                              {/* Tooltip */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
                                {item.score} / 10
                              </div>

                              {/* Bar */}
                              <div
                                className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-violet-600 to-indigo-500 transition-all duration-300 group-hover:from-violet-700 group-hover:to-indigo-600"
                                style={{
                                  height: `${height}%`,
                                }}
                              />
                            </div>

                            {/* Score */}
                            <div className="mt-3 text-center">
                              <p className="text-xs font-semibold text-slate-700">
                                {item.score}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Mock {index + 1}
                              </p>
                            </div>
                          </div>
                        );
                      },
                    )}

                    {/* Empty Slots
                        Visually keeps the graph balanced when
                        fewer than 4 real scored attempts exist.
                        No fake score/value is displayed.
                    */}
                    {Array.from({
                      length:
                        4 -
                        performance.mockScores.length,
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex h-full flex-1 flex-col justify-end"
                      >
                        <div className="flex flex-1 items-end justify-center">
                          <div className="w-full max-w-12 rounded-t-xl bg-slate-100" />
                        </div>

                        <div className="mt-3 text-center">
                          <p className="text-xs font-medium text-slate-300">
                            —
                          </p>

                          <p className="mt-1 text-[10px] text-slate-300">
                            Mock{" "}
                            {performance.mockScores.length +
                              index +
                              1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-violet-600" />

                      <span className="text-xs text-slate-400">
                        Mock interview scores
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {performance.mockScores.length}{" "}
                      scored{" "}
                      {performance.mockScores.length === 1
                        ? "attempt"
                        : "attempts"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-7 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <TrendingUp size={21} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No mock interview scores yet
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    Complete a mock interview to start
                    tracking your score progress.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              RIGHT PANEL
          ====================================================== */}
          <div className="px-6 py-7 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Interview Activity
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your recent interview activity
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <CalendarDays size={18} />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="mt-7 space-y-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

                    <div className="flex-1">
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />

                      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : performance.activity.length > 0 ? (
              <div className="mt-7">
                <div className="space-y-5">
                  {performance.activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3"
                    >
                      {/* Status Icon */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          item.type === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : item.type === "Scheduled"
                              ? "bg-violet-50 text-violet-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {item.type === "Completed" ? (
                          <CheckCircle2 size={17} />
                        ) : item.type ===
                          "Scheduled" ? (
                          <CalendarDays size={17} />
                        ) : (
                          <Clock3 size={17} />
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.type}
                          </p>

                          <span className="shrink-0 text-[11px] text-slate-400">
                            {formatActivityDate(
                              item.date,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All */}
                <button
                  type="button"
                  onClick={() =>
                    window.location.assign(
                      "/candidate/interviews",
                    )
                  }
                  className="mt-7 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700"
                >
                  View all interviews →
                </button>
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Mic size={22} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No interview activity
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  Your interview and mock interview
                  activity will appear here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.assign(
                      "/candidate/interviews",
                    )
                  }
                  className="mt-4 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700"
                >
                  View interviews →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}