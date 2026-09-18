export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-violet-600">
          Recruiter Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your interviews, candidates, and hiring
          workflow from one place.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Interviews
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Interviews
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Candidates
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>
      </div>
    </div>
  );
}