import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1C1A17] px-6 text-[#F2EDE4]">
      <div className="w-full max-w-[520px] text-center">
        <p className="mb-3 text-sm font-medium text-[#C47A5E]">
          404
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#9E978E]">
          The page you're looking for doesn't exist or may have
          been moved.
        </p>

        <Link
          to="/"
          className="mt-7 flex h-12 w-full items-center justify-center rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
        >
          Go to home
        </Link>
      </div>
    </main>
  );
}