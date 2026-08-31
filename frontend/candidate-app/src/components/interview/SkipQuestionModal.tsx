interface SkipQuestionModalProps {
  onContinue: () => void;
  onSkip: () => void;
  isSkipping?: boolean;
}

export function SkipQuestionModal({
  onContinue,
  onSkip,
  isSkipping = false,
}: SkipQuestionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171B23] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#F2F4F7]">
          Need help with this question?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#AAB2BF]">
          You haven't started answering yet. If you don't
          know the answer, you can skip this question and
          continue with the interview.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onContinue}
            disabled={isSkipping}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[#F2F4F7] transition hover:bg-white/5 disabled:opacity-50"
          >
            Continue Answer
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={isSkipping}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {isSkipping ? "Skipping..." : "Skip Question"}
          </button>
        </div>
      </div>
    </div>
  );
}