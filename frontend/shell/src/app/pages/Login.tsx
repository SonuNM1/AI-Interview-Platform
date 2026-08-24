import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/Toast";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/app/authSlice";
import { useLogin } from "@/app/authQueries";
import { navigateByRole } from "@/app/authNavigation";
import { googleLogin } from "@/services/auth.api";
import { loginSchema, type LoginForm } from "@/services/auth.schema";

import { PasswordInput } from "@/components/ui/PasswordInput";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loginMutation = useLogin();

  const { register, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onInvalid = () => {
    toast.error("Please enter a valid email and password");
  };

  // Login with email and password.

  const onSubmit = (data: LoginForm) => {
  loginMutation.mutate(data, {
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      toast.success("Signed in successfully.");

      navigateByRole(navigate, response.user.role);
    },

    onError: () => {
      toast.error("Invalid email or password.");
    },
  });
};

  // Google login.

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const response = await googleLogin(idToken);

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      toast.success("Signed in successfully.");
      navigateByRole(navigate, response.user.role);
    } catch (error) {
      console.error("Google login failed:", error);

      toast.error("No account found. Please register first.")
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-6">
        <p className="mb-1.5 text-sm font-medium text-[#C47A5E]">
          Welcome back
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          Sign in to your account
        </h1>

        <p className="mt-2 text-sm text-[#9E978E]">
          Continue your journey with AI Interview Platform.
        </p>
      </div>

      {/* Google login */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) {
              handleGoogleLogin(response.credential);
            }
          }}
          onError={() => console.error("Google login failed")}
          theme="filled_black"
          size="medium"
          text="signin_with"
          shape="rectangular"
          width="320"
        />
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#332F2A]" />

        <span className="text-xs text-[#706A63]">OR</span>

        <div className="h-px flex-1 bg-[#332F2A]" />
      </div>

      {/* Email/password form */}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-[#C8C0B7]"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="h-12 w-full rounded-md border border-[#332F2A] bg-[#201E1B] px-4 text-sm text-[#F2EDE4] outline-none placeholder:text-[#69635C] transition focus:border-[#B9674B]"
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-medium text-[#C8C0B7]"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="cursor-pointer text-xs text-[#C47A5E] transition hover:text-[#D99A83]"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordInput
            registration={register("password")}
            placeholder="Enter your password"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-12 w-full cursor-pointer rounded-md bg-[#B9674B] text-sm font-semibold text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Register */}
      <p className="mt-5 text-center text-xs text-[#817A72]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="cursor-pointer font-medium text-[#C47A5E] hover:text-[#D99A83]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
