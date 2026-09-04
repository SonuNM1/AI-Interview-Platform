import {
  ArrowRight,
  Clock3,
  History,
  Loader2,
} from "lucide-react";

import type {
  MockInterview,
} from "../../services/mockInterview.api";

interface MockInterviewHistoryProps {
  interviews: MockInterview[];
  isLoading: boolean;
  onViewReport: (id: string) => void;
}

/**
 * Displays previous mock interview attempts and their scores.
 */
export function MockInterviewHistory({
  interviews,
  isLoading,
  onViewReport,
}: MockInterviewHistoryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#1B1917]">

      <div className="border-b border-[#2F2B27] px-5 py-4">
        <div className="flex items-center gap-2">
          <History
            className="h-4 w-4 text-[#D98260]"
            strokeWidth={1.8}
          />

          <h2 className="text-sm font-semibold text-[#F2EDE4]">
            Previous Interviews
          </h2>
        </div>
      </div>

      <div className="divide-y divide-[#2F2B27]">

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-[#817A72]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading history...
          </div>
        ) : interviews.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <History className="mx-auto h-6 w-6 text-[#5F5A54]" />

            <p className="mt-3 text-sm text-[#817A72]">
              No previous mock interviews.
            </p>
          </div>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview._id}
              className="p-5 transition hover:bg-[#211F1C]"
            >
              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#F2EDE4]">
                    Technical Mock Interview
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[#817A72]">
                    <Clock3 className="h-3.5 w-3.5" />

                    {new Date(
                      interview.createdAt,
                    ).toLocaleDateString()}
                  </div>
                </div>

                {interview.score !== undefined && (
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-[#D98260]">
                      {interview.score.toFixed(1)}
                    </p>

                    <p className="text-[10px] text-[#6F6962]">
                      / 10
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">

                <span
                  className={`
                    rounded-full px-2.5 py-1 text-[10px] font-medium
                    ${
                      interview.status === "COMPLETED"
                        ? "bg-[#263128] text-[#8FC49B]"
                        : "bg-[#2A2521] text-[#A9A29A]"
                    }
                  `}
                >
                  {interview.status}
                </span>

                {interview.status === "COMPLETED" && (
                  <button
                    type="button"
                    onClick={() =>
                      onViewReport(interview._id)
                    }
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium text-[#D98260] transition hover:text-[#F2EDE4]"
                  >
                    View Report
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

      </div>
    </section>
  );
}