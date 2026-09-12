import { AlertTriangle } from "lucide-react";

interface EndMockInterviewModalProps {
  open: boolean;
  isEnding: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirms manual interview termination before generating
 * the candidate's partial-interview report.
 */
export function EndMockInterviewModal({
  open,
  isEnding,
  onCancel,
  onConfirm,
}: EndMockInterviewModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          End Mock Interview?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your interview will end now. Your report will be
          generated using the questions you have answered or
          skipped so far.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isEnding}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue Interview
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isEnding}
            className="cursor-pointer rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEnding
              ? "Ending..."
              : "End Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}