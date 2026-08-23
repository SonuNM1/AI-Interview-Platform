import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/app/authSlice";
import { useLogin } from "@/app/authQueries";

import { googleLogin } from "@/services/auth.api";
import { loginSchema, type LoginForm } from "@/services/auth.schema";

import { PasswordInput } from "@/components/ui/PasswordInput";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

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

        navigate("/");
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

      // Send the user to the application for their role.
      switch (response.user.role) {
        case "CANDIDATE":
          navigate("/candidate");
          break;

        case "RECRUITER":
          navigate("/recruiter");
          break;

        case "MENTOR":
          navigate("/mentor");
          break;

        case "ADMIN":
          navigate("/admin");
          break;

        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Google login failed:", error);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {errors.email && (
            <p className="mt-1 text-xs text-[#D98569]">
              {errors.email.message}
            </p>
          )}
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
            error={errors.password?.message}
          />
        </div>

        {/* API error */}
        {loginMutation.isError && (
          <p className="text-xs text-[#D98569]">Invalid email or password.</p>
        )}

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
