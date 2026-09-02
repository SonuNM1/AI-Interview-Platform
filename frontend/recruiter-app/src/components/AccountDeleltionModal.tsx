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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-[#3A342F] bg-[#181715] p-6 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-[#817A72] transition hover:text-[#F2EDE4]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Heading */}
        <div className="pr-8">
          <h2 className="text-xl font-semibold text-[#F2EDE4]">
            Verify account deletion
          </h2>

          <p className="mt-2 text-sm leading-5 text-[#817A72]">
            We've sent a 6-digit OTP to your registered email address.
            Enter it below to permanently delete your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* OTP input */}
          <label className="text-sm font-medium text-[#D7CFC5]">
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
            className="mt-2 w-full rounded-lg border border-[#3A342F] bg-[#211F1C] px-4 py-3 text-center text-lg tracking-[0.35em] text-[#F2EDE4] outline-none transition focus:border-[#D98260]"
            autoFocus
          />

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#3A342F] px-4 py-2.5 text-sm font-medium text-[#B9B1A8] transition hover:bg-[#24211E]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}