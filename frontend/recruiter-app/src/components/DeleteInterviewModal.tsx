import { X, Trash2 } from "lucide-react";

interface DeleteInterviewModalProps {
  interviewTitle: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteInterviewModal({
  interviewTitle,
  isPending,
  onClose,
  onConfirm,
}: DeleteInterviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Delete Interview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close modal"
            className="
              flex h-9 w-9
              cursor-pointer
              items-center justify-center
              rounded-xl
              text-slate-400
              transition-colors
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              "{interviewTitle}"
            </span>
            ?
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="
              cursor-pointer rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm font-medium
              text-slate-600
              transition-colors
              hover:bg-slate-50
              hover:text-slate-900
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="
              flex cursor-pointer
              items-center justify-center gap-2
              rounded-xl
              bg-red-600
              px-4 py-2.5
              text-sm font-semibold
              text-white
              transition-all
              hover:bg-red-700
              hover:shadow-md
              hover:shadow-red-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2 className="h-4 w-4" />

            {isPending ? "Deleting..." : "Delete Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}