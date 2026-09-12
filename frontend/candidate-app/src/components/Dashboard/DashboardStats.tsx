import { useEffect, useState } from "react";
import { CalendarDays, Mic, Star } from "lucide-react";
import { getCandidateInterviews, type CandidateInterview } from "../../services/interview.api";
import { getMockInterviewHistory, type MockInterview } from "../../services/mockInterview.api";

interface DashboardStatsData {
  upcomingInterviews: number;
  completedMockInterviews: number;
  averageScore: number | null;
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

  const total = scores.reduce((sum, score) => sum + score, 0);

  return Number((total / scores.length).toFixed(1));
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    upcomingInterviews: 0,
    completedMockInterviews: 0,
    averageScore: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const [candidateInterviews, mockInterviewResponse] =
          await Promise.all([
            getCandidateInterviews(),
            getMockInterviewHistory(),
          ]);

        const now = new Date();

        const upcomingInterviews = candidateInterviews.filter(
          (interview) => {
            if (!interview.scheduledAt) {
              return false;
            }

            if (
              interview.status === "COMPLETED" ||
              interview.status === "CANCELLED"
            ) {
              return false;
            }

            return new Date(interview.scheduledAt) > now;
          },
        ).length;

        const mockInterviews = mockInterviewResponse.data;

        const completedMockInterviews = mockInterviews.filter(
          (interview) => interview.status === "COMPLETED",
        ).length;

        const averageScore = calculateAverageScore(
          candidateInterviews,
          mockInterviews,
        );

        setStats({
          upcomingInterviews,
          completedMockInterviews,
          averageScore,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Upcoming Interviews */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Upcoming Interviews
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? "—" : stats.upcomingInterviews}
                </span>

                <span className="text-sm text-slate-500">
                  scheduled
                </span>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <CalendarDays size={20} />
            </div>
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Mock Interviews
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? "—" : stats.completedMockInterviews}
                </span>

                <span className="text-sm text-slate-500">
                  completed
                </span>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Mic size={20} />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Score
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {loading
                    ? "—"
                    : stats.averageScore !== null
                      ? stats.averageScore
                      : "—"}
                </span>

                {stats.averageScore !== null && !loading && (
                  <span className="text-sm text-slate-500">
                    / 10
                  </span>
                )}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star size={20} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}