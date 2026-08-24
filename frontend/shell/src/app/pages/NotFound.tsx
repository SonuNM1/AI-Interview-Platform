import { useNavigate } from "react-router-dom";
import pageNotFoundIllustration from "@/assets/animations/page-not-found-illustration.png";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-[#0B0A0F] px-6">
      <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center">
        {/* Illustration */}
        <div className="w-full max-w-[680px]">
          <img
            src={pageNotFoundIllustration}
            alt="404 page not found illustration"
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="-mt-2 flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C87555]">
            Page not found
          </p>

          <h1 className="mt-4 whitespace-nowrap text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-none tracking-tight text-[#F2EDE4]">
            We couldn't find that page
          </h1>

          <p className="mt-4 whitespace-nowrap text-sm text-[#918A82] sm:text-base">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-7 flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-7 text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 10.5L12 3L21 10.5V21H14.5V15H9.5V21H3V10.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Go to home
          </button>
        </div>
      </div>
    </main>
  );
}