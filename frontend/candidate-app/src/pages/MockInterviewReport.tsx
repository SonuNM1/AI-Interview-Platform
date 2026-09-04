import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import { useParams } from "react-router-dom";

import {
  getMockInterview,
} from "../services/mockInterview.api";

import { useState } from "react";

/**
 * Displays the completed mock interview report and
 * question-by-question performance analytics.
 */
export function MockInterviewReport() {
  const { id } = useParams<{
    id: string;
  }>();

  const [expandedQuestion, setExpandedQuestion] =
    useState<string | null>(null);

  const query = useQuery({
    queryKey: ["mock-interview-report", id],
    queryFn: () => {
      if (!id) {
        throw new Error(
          "Mock interview ID is missing.",
        );
      }

      return getMockInterview(id);
    },
    enabled: !!id,
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#141311] text-sm text-[#817A72]">
        Loading report...
      </div>
    );
  }

  if (
    query.isError ||
    !query.data?.data
  ) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#141311] text-sm text-red-400">
        Unable to load report.
      </div>
    );
  }

  const {
    mockInterview,
    questions,
    report,
  } = query.data.data;

  const answeredQuestions =
    questions.filter(
      (question) =>
        question.answeredAt,
    );

  const averageDuration =
    answeredQuestions.length > 0
      ? answeredQuestions.reduce(
          (sum, question) =>
            sum + (question.duration ?? 0),
          0,
        ) / answeredQuestions.length
      : 0;

  const skippedQuestions =
    questions.filter(
      (question) =>
        question.candidateAnswer ===
        "Skipped",
    ).length;

  return (
    <div className="min-h-full bg-[#141311] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D98260]">
            Mock Interview
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[#F2EDE4]">
            Interview Results
          </h1>

          <p className="mt-1 text-sm text-[#817A72]">
            Review your performance and identify areas
            to improve.
          </p>
        </div>

        {/* Score */}
        <section className="grid gap-4 md:grid-cols-4">

          <StatCard
            icon={<Target />}
            label="Overall Score"
            value={`${(
              report?.overallScore ??
              mockInterview.score ??
              0
            ).toFixed(1)}/10`}
          />

          <StatCard
            icon={<CheckCircle2 />}
            label="Questions Answered"
            value={`${answeredQuestions.length}/${questions.length}`}
          />

          <StatCard
            icon={<Clock3 />}
            label="Average Answer"
            value={formatDuration(
              Math.round(
                averageDuration,
              ),
            )}
          />

          <StatCard
            icon={<TrendingUp />}
            label="Skipped"
            value={String(
              skippedQuestions,
            )}
          />

        </section>

        {report && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <ReportSection title="Strengths">
              <ul className="space-y-3">
                {report.strengths.map(
                  (strength) => (
                    <li
                      key={strength}
                      className="flex gap-2 text-sm leading-6 text-[#CFC7BD]"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#8FC49B]" />
                      {strength}
                    </li>
                  ),
                )}
              </ul>
            </ReportSection>

            <ReportSection title="Areas to Improve">
              <ul className="space-y-3">
                {report.weaknesses.map(
                  (weakness) => (
                    <li
                      key={weakness}
                      className="flex gap-2 text-sm leading-6 text-[#CFC7BD]"
                    >
                      <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-400" />
                      {weakness}
                    </li>
                  ),
                )}
              </ul>
            </ReportSection>

            <div className="lg:col-span-2">
              <ReportSection title="Summary">
                <p className="text-sm leading-7 text-[#CFC7BD]">
                  {report.summary}
                </p>

                <div className="mt-5">
                  <span className="rounded-full bg-[#2A2420] px-3 py-1.5 text-xs font-semibold text-[#D98260]">
                    {report.recommendation}
                  </span>
                </div>
              </ReportSection>
            </div>

          </div>
        )}

        {/* Question analytics */}
        
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#1B1917]">

          <div className="border-b border-[#2F2B27] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#F2EDE4]">
              Question Performance
            </h2>
          </div>

          <div className="divide-y divide-[#2F2B27]">

            {questions.map(
              (question) => {
                const expanded =
                  expandedQuestion ===
                  question._id;

                return (
                  <div
                    key={question._id}
                    className="px-5 py-5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedQuestion(
                          expanded
                            ? null
                            : question._id,
                        )
                      }
                      className="flex w-full cursor-pointer items-center gap-4 text-left"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2A2420] text-xs font-semibold text-[#D98260]">
                        {question.questionNumber}
                      </span>

                      <span className="min-w-0 flex-1 truncate text-sm text-[#D7CFC5]">
                        {question.question}
                      </span>

                      <span className="shrink-0 text-sm font-semibold text-[#D98260]">
                        {(question.score ?? 0).toFixed(1)}/10
                      </span>

                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-[#817A72]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#817A72]" />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-5 ml-12 space-y-5">

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5A54]">
                            Question
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#D7CFC5]">
                            {question.question}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5A54]">
                            Your Answer
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#A9A29A]">
                            {question.candidateAnswer ||
                              "No answer provided."}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5A54]">
                            AI Feedback
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#A9A29A]">
                            {question.feedback ||
                              "No feedback available."}
                          </p>
                        </div>

                      </div>
                    )}
                  </div>
                );
              },
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A2420] text-[#D98260]">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5A54]">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-[#F2EDE4]">
        {value}
      </p>
    </div>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-5">
      <h2 className="mb-4 text-sm font-semibold text-[#F2EDE4]">
        {title}
      </h2>

      {children}
    </section>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}m ${String(
    remaining,
  ).padStart(2, "0")}s`;
}