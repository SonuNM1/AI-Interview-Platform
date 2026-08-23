import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useResetPassword } from "@/app/authQueries";

import {
  resetPasswordSchema,
  type ResetPasswordForm,
} from "@/services/auth.schema";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { toast } from "@/components/ui/toast";

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const resetPasswordMutation = useResetPassword();

  // Get the email passed from the forgot-password page.
  const email = location.state?.email || "";

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
    },
  });

  // Reset the password.
  const onSubmit = (data: ResetPasswordForm) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset successfully.");

        setSuccess(true);
      },

      onError: () => {
        toast.error(
          "Unable to reset your password. Please check your OTP and try again.",
        );
      },
    });
  };

  // Show a helpful message if the page was opened directly.
  if (!email) {
    return (
      <div className="w-full max-w-[520px]">
        {/* Page heading. */}
        <div>
          <p className="mb-2 text-sm font-medium text-[#C47A5E]">
            Password recovery
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4]">
            Request a reset code first
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#9E978E]">
            Enter your email address first so we can send you a
            verification code to reset your password.
          </p>
        </div>

        {/* Primary action. */}
        <Link
          to="/forgot-password"
          className="mt-7 flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
        >
          Request a reset code
        </Link>

        {/* Secondary action. */}
        <p className="mt-5 text-center text-sm text-[#706A63]">
          <Link
            to="/login"
            className="font-medium text-[#D98260] hover:text-[#E29370]"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  // Show the success state after the password is reset.
  if (success) {
    return (
      <div className="w-full max-w-[520px]">
        {/* Success message. */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#C47A5E]">
            Password updated
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
            You're all set.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#9E978E]">
            Your password has been successfully reset. You can now
            sign in with your new password.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="h-14 w-full cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px]">
      {/* Page heading. */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-[#C47A5E]">
          Account recovery
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#9E978E]">
          Enter the OTP sent to your email and create a new
          password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email. */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-medium text-[#C8C0B7]"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            className="h-14 w-full rounded-lg border border-[#332F2A] bg-[#211F1C] px-4 text-sm text-[#F2EDE4] outline-none transition placeholder:text-[#69635C] focus:border-[#B9674B]"
          />
        </div>

        {/* OTP. */}
        <div>
          <label
            htmlFor="otp"
            className="mb-2 block text-xs font-medium text-[#C8C0B7]"
          >
            Verification code
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            {...register("otp")}
            className="h-14 w-full rounded-lg border border-[#332F2A] bg-[#211F1C] px-4 text-sm tracking-[0.3em] text-[#F2EDE4] outline-none transition placeholder:tracking-normal placeholder:text-[#69635C] focus:border-[#B9674B]"
          />
        </div>

        {/* New password. */}
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-xs font-medium text-[#C8C0B7]"
          >
            New password
          </label>

          <PasswordInput
            registration={register("newPassword")}
            placeholder="Create a new password"
            error=""
          />
        </div>

        {/* Submit. */}
        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="h-14 w-full cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetPasswordMutation.isPending
            ? "Resetting password..."
            : "Reset password"}
        </button>
      </form>

      {/* Back to login. */}
      <p className="mt-6 text-center text-sm text-[#706A63]">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-medium text-[#D98260] hover:text-[#E29370]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}