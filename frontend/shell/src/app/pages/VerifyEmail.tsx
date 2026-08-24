import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/Toast";
import { resendOTP, verifyEmail } from "@/services/auth.api";

interface VerifyEmailState {
  userId: string;
  email: string;
}

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as VerifyEmailState | null;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Registration should always provide the user ID and email.

  if (!state?.userId || !state?.email) {
    return (
      <div className="w-full max-w-[520px]">
        {/* Explain why the verification page cannot be used directly. */}
        <p className="mb-2 text-sm font-medium text-[#C47A5E]">
          Email verification
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4]">
          Verify your email
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#9E978E]">
          To verify your email, first create an account. After registration,
          we'll send a 6-digit verification code to your email and take you here
          automatically.
        </p>

        {/* Clear primary action instead of plain text. */}
        <Link
          to="/register"
          className="mt-7 flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
        >
          Create an account
        </Link>

        {/* Secondary navigation. */}
        <p className="mt-5 text-center text-sm text-[#706A63]">
          Already have an account?{" "}
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

  // Verify the email OTP.
  const handleVerify = async () => {
    if (otp.length !== 6) {
  toast.error("Enter the 6-digit verification code.");
  return;
}

    try {
      setLoading(true);

      await verifyEmail({
        userId: state.userId,
        otp,
      });

      toast.success("Email verified successfully.");

      navigate("/login", {
        replace: true,
        state: {
          email: state.email,
          verified: true,
        },
      });
    } catch (error) {
      console.error("Email verification failed:", error);

      toast.error("Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Request another OTP.
  const handleResend = async () => {
    try {
      setResending(true);

      await resendOTP(state.email);
      toast.success("A new verification code has been sent.");
    } catch (error) {
      console.error("OTP resend failed:", error);
      toast.error("Unable to resend the verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[520px]">
      {/* Page heading. */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-[#C47A5E]">Almost there</p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#9E978E]">
          We sent a 6-digit verification code to
        </p>

        <p className="mt-1 text-sm font-medium text-[#D7CFC5]">{state.email}</p>
      </div>

      {/* OTP input. */}
      <div>
        <label
          htmlFor="otp"
          className="mb-2 block text-sm font-medium text-[#D7CFC5]"
        >
          Verification code
        </label>

        <input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 6);

            setOtp(value);
          }}
          placeholder="Enter 6-digit code"
          className="h-14 w-full rounded-lg border border-[#332F2A] bg-[#211F1C] px-4 text-center text-lg tracking-[0.45em] text-[#F2EDE4] outline-none transition placeholder:tracking-normal placeholder:text-[#706A63] focus:border-[#B9674B]"
        />
      </div>

      {/* Verify button. */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
        className="mt-5 h-14 w-full cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify email"}
      </button>

      {/* Resend OTP. */}
      <div className="mt-5 text-center">
        <p className="text-sm text-[#706A63]">Didn't receive the code?</p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mt-1 cursor-pointer text-sm font-medium text-[#D98260] hover:text-[#E29370] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>

      {/* Back to registration. */}
      <p className="mt-6 text-center text-sm text-[#706A63]">
        Wrong email?{" "}
        <Link
          to="/register"
          className="font-medium text-[#D98260] hover:text-[#E29370]"
        >
          Create a new account
        </Link>
      </p>
    </div>
  );
}
