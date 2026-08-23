import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("React Error Boundary:", error);
    console.error("Component Stack:", info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#1C1A17] px-6 text-[#F2EDE4]">
          <div className="w-full max-w-[520px] text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#B9674B]/30 bg-[#B9674B]/10">
              <span className="text-xl text-[#D98260]">
                !
              </span>
            </div>

            <p className="mb-2 text-sm font-medium text-[#C47A5E]">
              Something went wrong
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              We couldn't load this page.
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#9E978E]">
              An unexpected error occurred while loading the
              application. You can try again or return to the
              home page.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="h-12 flex-1 cursor-pointer rounded-lg bg-[#B9674B] text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
              >
                Try again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="h-12 flex-1 cursor-pointer rounded-lg border border-[#332F2A] bg-[#211F1C] text-sm font-semibold text-[#D7CFC5] transition hover:border-[#B9674B]/50"
              >
                Go to home
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}