
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForgotPassword } from "@/app/authQueries";
import {
  forgotPasswordSchema,
  type ForgotPasswordForm,
} from "@/services/auth.schema";

export function ForgotPassword() {
  const navigate = useNavigate();

  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Send password reset OTP.
  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {

        navigate("/reset-password", {
          state: {
            email: data.email,
          },
        });
      },
    });
  };

  return (
    <div className="w-full max-w-[520px]">
      {/* Heading. */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-[#C47A5E]">
          Account recovery
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#9E978E]">
          Enter the email address associated with your account and
          we'll send you a password reset OTP.
        </p>
      </div>

      {/* Email form. */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
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
            placeholder="you@example.com"
            {...register("email")}
            className="h-14 w-full rounded-lg border border-[#332F2A] bg-[#211F1C] px-4 text-sm text-[#F2EDE4] outline-none transition placeholder:text-[#69635C] focus:border-[#B9674B]"
          />

          {errors.email && (
            <p className="mt-1.5 text-xs text-[#D98569]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* API error. */}
        {forgotPasswordMutation.isError && (
          <p className="text-xs text-[#D98569]">
            Unable to send the reset OTP. Please check your email
            and try again.
          </p>
        )}

        {/* Submit button. */}
        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="h-14 w-full cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {forgotPasswordMutation.isPending
            ? "Sending OTP..."
            : "Send reset OTP"}
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