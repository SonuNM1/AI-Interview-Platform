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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-6 shadow-2xl">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7A3327]/20">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[#F2EDE4]">
          End Mock Interview?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#817A72]">
          Your interview will end now. Your report will be
          generated using the questions you have answered or
          skipped so far.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isEnding}
            className="cursor-pointer rounded-lg border border-[#403A34] px-4 py-2.5 text-sm font-medium text-[#D7CFC5] transition hover:bg-[#24211E] disabled:opacity-50"
          >
            Continue Interview
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isEnding}
            className="cursor-pointer rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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