import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";

import { register, googleLogin } from "@/services/auth.api";

import {
  registerSchema,
  type RegisterForm,
} from "@/services/auth.schema";

import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/app/authSlice";
import { toast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Role =
  | "CANDIDATE"
  | "RECRUITER"
  | "MENTOR";

const roles: {
  value: Role;
  label: string;
}[] = [
  {
    value: "CANDIDATE",
    label: "Candidate",
  },
  {
    value: "RECRUITER",
    label: "Recruiter",
  },
  {
    value: "MENTOR",
    label: "Mentor",
  },
];

export function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [selectedRole, setSelectedRole] =
    useState<Role>("CANDIDATE");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      role: "CANDIDATE",
    },
  });

  // Register using email/password.
  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      const response = await register({
        ...data,
        role: selectedRole,
      });

      toast.success("Account created. Check your email for the verification code.")

      console.log(
        "Registration successful:",
        response,
      );

      navigate("/verify-email", {
        state: {
          userId: response.data.id, 
          email: data.email,
        },
      });
    } catch (error) {
      console.error(
        "Registration failed:",
        error,
      );

      toast.error("Unable to create your account. Please check your details and try again.")
    } finally {
      setLoading(false);
    }
  };

  // Register using Google.
  //
  // Your current backend endpoint requires the role,
  // so this remains unchanged.
  const handleGoogleSuccess = async (
    credential: string,
  ) => {
    try {
      setGoogleLoading(true);

      const response = await googleLogin(
        credential,
        selectedRole,
      );

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Google registration failed:",
        error,
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[710px]">
      {/* Heading */}
      <div>
        <p className="text-sm font-medium text-[#B9674B]">
          Get started
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F2EDE4]">
          Create your account
        </h1>

        <p className="mt-3 text-sm text-[#8F887F]">
          Join AI Interview Platform and start your
          journey.
        </p>
      </div>

      {/* Role selection */}
      <div className="mt-7">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#D7CFC5]">
          I am a...
        </p>

        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => {
            const isSelected =
              selectedRole === role.value;

            return (
              <button
                key={role.value}
                type="button"
                onClick={() =>
                  setSelectedRole(role.value)
                }
                className={`cursor-pointer rounded-lg border px-4 py-4 text-sm transition ${
                  isSelected
                    ? "border-[#B9674B] bg-[#B9674B]/10 text-[#D98260]"
                    : "border-[#332F2A] bg-[#211F1C] text-[#A9A197] hover:border-[#B9674B]/50 hover:text-[#D7CFC5]"
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Google registration */}
      <div className="mt-5 flex justify-center">
        <div
          className={
            googleLoading
              ? "pointer-events-none opacity-60"
              : ""
          }
        >
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                handleGoogleSuccess(
                  response.credential,
                );
              }
            }}
            onError={() => {
              console.error(
                "Google registration failed",
              );
            }}
            width="400"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#332F2A]" />

        <span className="text-xs text-[#706A63]">
          OR
        </span>

        <div className="h-px flex-1 bg-[#332F2A]" />
      </div>

      {/* Registration form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-medium text-[#D7CFC5]"
          >
            Email
          </label>

          <input
            id="register-email"
            {...registerField("email")}
            type="email"
            placeholder="you@example.com"
            className="h-14 w-full rounded-lg border border-[#332F2A] bg-[#211F1C] px-4 text-sm text-[#F2EDE4] outline-none transition placeholder:text-[#706A63] focus:border-[#B9674B]"
          />

          {errors.email && (
            <p className="mt-1 text-xs text-[#D98260]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-medium text-[#D7CFC5]"
          >
            Password
          </label>

          <PasswordInput
            registration={registerField("password")}
            placeholder="Create a password"
            error={errors.password?.message}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-14 w-full cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-[#706A63]">
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