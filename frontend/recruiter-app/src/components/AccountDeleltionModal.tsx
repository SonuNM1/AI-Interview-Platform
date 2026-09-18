import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AccountDeletionModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
}

export function AccountDeletionModal({
  open,
  loading = false,
  onClose,
  onVerify,
}: AccountDeletionModalProps) {
  const [otp, setOtp] = useState("");

  // Reset the OTP whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setOtp("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (otp.length !== 6) return;

    onVerify(otp);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Heading */}
        <div className="pr-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Verify account deletion
          </h2>

          <p className="mt-2 text-sm leading-5 text-slate-500">
            We've sent a 6-digit OTP to your registered email address.
            Enter it below to permanently delete your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* OTP input */}
          <label className="text-sm font-medium text-slate-700">
            Verification code
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, ""))
            }
            placeholder="000000"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg tracking-[0.35em] text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            autoFocus
          />

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}