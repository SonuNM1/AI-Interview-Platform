import { Outlet } from "react-router-dom";
import { AuthLeftPanel } from "../components/auth/AuthLeftPanel";

export function AuthLayout() {
  return (
    // Auth pages always fit inside the viewport.
    <main className="h-screen w-full overflow-hidden bg-[#171614] text-[#F2EDE4]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[42%_58%]">
        {/* Constant left side for every authentication page. */}
        <AuthLeftPanel />

        {/* Login, Register, Forgot Password, OTP, etc. appear here. */}
        <section className="h-full min-h-0 overflow-hidden bg-[#171614]">
          <div className="h-full overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-6 py-6 sm:px-10">
              <div className="w-full max-w-[560px]">
                <Outlet />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}