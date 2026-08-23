import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function PasswordInput({
  placeholder = "Enter your password",
  error,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          {...registration}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="h-12 w-full rounded-md border border-[#332F2A] bg-[#201E1B] px-4 pr-12 text-sm text-[#F2EDE4] outline-none placeholder:text-[#69635C] transition focus:border-[#B9674B]"
        />

        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#8F887F] transition hover:bg-[#2A2723] hover:text-[#D7CFC5]"
          aria-label={
            showPassword ? "Hide password" : "Show password"
          }
        >
          {showPassword ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8" />
              <path d="M6.6 6.6C4.7 7.9 3.3 9.8 2 12c1 4 5 8 10 8 1.7 0 3.2-.4 4.6-1.1" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-[#D98569]">
          {error}
        </p>
      )}
    </div>
  );
}