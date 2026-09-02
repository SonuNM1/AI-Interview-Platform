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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2F2B27] bg-[#181715]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2F2B27] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#F2EDE4]">
              Delete Interview
            </h2>

            <p className="mt-1 text-sm text-[#817A72]">
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-[#817A72] transition-colors hover:bg-[#24211E] hover:text-[#F2EDE4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-[#A9A29A]">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#F2EDE4]">
              "{interviewTitle}"
            </span>
            ?
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#2F2B27] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg border border-[#2F2B27] px-4 py-2.5 text-sm text-[#A9A29A] transition-colors hover:bg-[#24211E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {isPending ? "Deleting..." : "Delete Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}