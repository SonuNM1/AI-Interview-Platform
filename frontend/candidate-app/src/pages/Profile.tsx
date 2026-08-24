export function Profile() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#B9674B]">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Profile
        </h1>

        <p className="mt-2 text-sm text-[#9E978E]">
          View and manage your account information.
        </p>
      </div>

      <div className="rounded-xl border border-[#332F2A] bg-[#1B1917] p-6">
        <div>
          <p className="text-xs text-[#706A63]">Name</p>
          <p className="mt-1 text-sm text-[#F2EDE4]">
            Candidate
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs text-[#706A63]">Email</p>
          <p className="mt-1 text-sm text-[#F2EDE4]">
            —
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs text-[#706A63]">Role</p>
          <p className="mt-1 text-sm text-[#F2EDE4]">
            Candidate
          </p>
        </div>
      </div>
    </div>
  );
}