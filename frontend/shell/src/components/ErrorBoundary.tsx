import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

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
        <main className="flex min-h-screen items-center justify-center bg-[#151412] px-5 text-[#F2EDE4]">
          <section className="w-full max-w-lg text-center">

            {/* Error icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#B9674B]/30 bg-[#B9674B]/10">
              <span className="text-2xl font-semibold text-[#D98260]">
                !
              </span>
            </div>

            {/* Heading */}
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B9674B]">
                Unexpected error
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Something went wrong
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#9E978E]">
                We couldn't load this page right now.
                Please try again, or return to the home page.
              </p>
            </div>

            {/* Actions */}
            <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="h-12 flex-1 rounded-lg bg-[#B9674B] px-5 text-sm font-semibold text-[#F8F3EC] transition hover:bg-[#C87555]"
              >
                Try again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="h-12 flex-1 rounded-lg border border-[#332F2A] bg-[#211F1C] px-5 text-sm font-medium text-[#D7CFC5] transition hover:border-[#B9674B]/50 hover:bg-[#25221F]"
              >
                Go to home
              </button>
            </div>

          </section>
        </main>
      );
    }

    return this.props.children;
  }
}