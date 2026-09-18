import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import axios from "axios";
import {
  requestAccountDeletion,
  verifyAccountDeletion,
} from "../services/user.api";
import { AccountDeletionModal } from "../components/AccountDeleltionModal";

export default function Settings() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Requests an OTP before allowing the recruiter to delete the account
  const requestDeletionMutation = useMutation({
    mutationFn: requestAccountDeletion,

    onSuccess: () => {
      setIsDeleteModalOpen(true);

      toast.success("Verification OTP sent to your email.");
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Failed to send account deletion OTP.");
    },
  });

  // Verifies the OTP and completes account deletion.
  const verifyDeletionMutation = useMutation({
    mutationFn: verifyAccountDeletion,

    onSuccess: async () => {
      setIsDeleteModalOpen(false);

      toast.success("Your account has been deleted.");

      // Authentication is owned by the Shell.
      await window.__AUTH_BRIDGE__?.logout();
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Invalid or expired OTP.");
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold text-violet-600">
          Recruiter Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Manage your recruiter workspace settings.
        </p>
      </div>

      {/* Account & Security */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Account & Security
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage sensitive account actions.
          </p>
        </div>

        {/* Delete Account */}
        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Delete account
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Your account will be disabled after OTP verification.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => requestDeletionMutation.mutate()}
            disabled={requestDeletionMutation.isPending}
            className="shrink-0 cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestDeletionMutation.isPending
              ? "Sending OTP..."
              : "Delete Account"}
          </button>
        </div>
      </div>

      {/* Account deletion OTP modal */}
      <AccountDeletionModal
        open={isDeleteModalOpen}
        loading={verifyDeletionMutation.isPending}
        onClose={() => setIsDeleteModalOpen(false)}
        onVerify={(otp) => verifyDeletionMutation.mutate(otp)}
      />
    </div>
  );
}