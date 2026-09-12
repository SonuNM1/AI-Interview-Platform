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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">
          Need help with this question?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          You haven't started answering yet. If you don't know the answer, you
          can skip this question and continue with the interview.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onContinue}
            disabled={isSkipping}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue Answer
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={isSkipping}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSkipping ? "Skipping..." : "Skip Question"}
          </button>
        </div>
      </div>
    </div>
  );
}