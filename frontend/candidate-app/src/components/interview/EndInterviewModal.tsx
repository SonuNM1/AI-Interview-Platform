interface EndInterviewModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EndInterviewModal({
  isOpen,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: EndInterviewModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">
          End Interview?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Are you sure you want to end the interview? Your answers submitted so
          far will be saved and evaluated.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue Interview
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Ending..." : "End Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}