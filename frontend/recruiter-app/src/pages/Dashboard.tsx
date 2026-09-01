export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div>
        <p className="text-sm font-medium text-[#D98260]">
          Recruiter Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EDE4] sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#817A72]">
          Manage your interviews, candidates, and hiring
          workflow from one place.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#332B27] bg-[#1B1917] p-6">
          <p className="text-sm text-[#817A72]">
            Total Interviews
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#F2EDE4]">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-[#332B27] bg-[#1B1917] p-6">
          <p className="text-sm text-[#817A72]">
            Active Interviews
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#F2EDE4]">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-[#332B27] bg-[#1B1917] p-6">
          <p className="text-sm text-[#817A72]">
            Candidates
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#F2EDE4]">
            0
          </p>
        </div>
      </div>
    </div>
  );
}