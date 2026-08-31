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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171B23] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#F2F4F7]">
          End Interview?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#AAB2BF]">
          Are you sure you want to end the interview?
          Your answers submitted so far will be saved and
          evaluated.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[#F2F4F7] hover:bg-white/5"
          >
            Continue Interview
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
          >
            {isSubmitting ? "Ending..." : "End Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}