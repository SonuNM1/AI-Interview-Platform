import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import {
  getCandidateInterviews,
  type CandidateInterview,
} from "../../services/interview.api";

import {
  getMockInterviewHistory,
  type MockInterview,
} from "../../services/mockInterview.api";

interface Recommendation {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

interface RecommendationData {
  averageScore: number | null;
  latestMockScore: number | null;
  recommendation: Recommendation | null;
}

function calculateAverageScore(
  interviews: CandidateInterview[],
  mockInterviews: MockInterview[],
): number | null {
  const interviewScores = interviews
    .filter(
      (interview) =>
        interview.status === "COMPLETED" && typeof interview.score === "number",
    )
    .map((interview) => interview.score as number);

  const mockScores = mockInterviews
    .filter(
      (interview) =>
        interview.status === "COMPLETED" && typeof interview.score === "number",
    )
    .map((interview) => interview.score as number);

  const scores = [...interviewScores, ...mockScores];

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return Number((total / scores.length).toFixed(1));
}

function getLatestMockScore(mockInterviews: MockInterview[]): number | null {
  const scoredMocks = mockInterviews
    .filter((interview) => typeof interview.score === "number")
    .sort((a, b) => {
      const dateA = a.completedAt ?? a.updatedAt ?? a.createdAt;

      const dateB = b.completedAt ?? b.updatedAt ?? b.createdAt;

      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  if (scoredMocks.length === 0) {
    return null;
  }

  return scoredMocks[0].score as number;
}

function generateRecommendation(
  averageScore: number | null,
  latestMockScore: number | null,
): Recommendation | null {
  if (averageScore === null && latestMockScore === null) {
    return {
      title: "Start your first mock interview",
      description:
        "Complete a mock interview to get your first performance score and personalized recommendations.",
      icon: BrainCircuit,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    };
  }

  if (latestMockScore !== null && latestMockScore < 6) {
    return {
      title: "Improve your interview performance",
      description:
        "Your recent mock interview score shows there is room for improvement. Focus on giving clear, structured and complete answers.",
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    };
  }

  if (latestMockScore !== null && latestMockScore < 8) {
    return {
      title: "Improve your interview performance",
      description:
        "You're making good progress. Focus on making your answers more structured, specific and confident to improve your score further.",
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    };
  }

  return {
    title: "Keep up your strong performance",
    description:
      "Your recent interview performance is looking strong. Keep practicing consistently and focus on giving clear and confident answers.",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  };
}

export function AIRecommendations() {
  const [data, setData] = useState<RecommendationData>({
    averageScore: null,
    latestMockScore: null,
    recommendation: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        setLoading(true);

        const [candidateInterviews, mockInterviewResponse] = await Promise.all([
          getCandidateInterviews(),
          getMockInterviewHistory(),
        ]);

        const mockInterviews = mockInterviewResponse.data;

        const averageScore = calculateAverageScore(
          candidateInterviews,
          mockInterviews,
        );

        const latestMockScore = getLatestMockScore(mockInterviews);

        const recommendation = generateRecommendation(
          averageScore,
          latestMockScore,
        );

        setData({
          averageScore,
          latestMockScore,
          recommendation,
        });
      } catch (error) {
        console.error("Failed to load AI recommendation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendation();
  }, []);

  if (loading) {
    return (
      <section className="mt-6 pb-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header Skeleton */}
          <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div>
              <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-6 w-72 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          {/* Recommendation Skeleton */}
          <div className="p-6">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  if (!data.recommendation) {
    return null;
  }

  const recommendation = data.recommendation;
  const Icon = recommendation.icon;

  return (
    <section className="mt-6 pb-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <BrainCircuit size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-violet-600">
              AI Recommendations
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Personalized suggestion for you
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Based on your recent interview performance.
            </p>
          </div>
        </div>

        {/* Single Recommendation */}
        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50 to-white p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                {/* Recommendation Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${recommendation.iconBg} ${recommendation.iconColor}`}
                >
                  <Icon size={21} />
                </div>

                {/* Recommendation Content */}
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {recommendation.title}
                  </p>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                    {recommendation.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.location.assign("/candidate/mock-interview")
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-md cursor-pointer"
              >
                Practice now
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
