import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  IndianRupee,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import {
  getMyMentorProfile,
  type MentorProfileSettings,
} from "../services/mentor.api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] =
    useState<MentorProfileSettings | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyMentorProfile();

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load mentor profile:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="text-sm text-slate-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 px-8 py-10 text-white shadow-2xl shadow-violet-200/60 sm:px-10">
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="absolute right-24 top-20 h-24 w-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />

        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Sparkles size={14} />

            Mentor Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Help someone become
            <br />
            their best developer.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            Manage your mentorship profile, showcase your
            expertise, and connect with candidates looking
            for guidance.
          </p>

          {!profile && (
            <Link
              to="/mentor/settings"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Set up mentorship
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {!profile ? (
        /* Empty state */
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Sparkles size={22} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Your mentorship profile isn't ready yet
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Add your monthly mentorship price and the
              technologies you can help candidates with.
              Once enabled, your profile can appear in the
              mentor marketplace.
            </p>

            <Link
              to="/mentor/settings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Configure profile
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8">
            <Users
              size={28}
              className="text-violet-600"
            />

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Grow as a mentor
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your expertise can help developers prepare for
              interviews, improve their skills, and build
              better careers.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Stats */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Price */}
            <div className="group rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/60">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:scale-110">
                  <IndianRupee size={21} />
                </div>

                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                  MONTHLY
                </span>
              </div>

              <p className="mt-6 text-sm font-medium text-slate-500">
                Mentorship Price
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                ₹{profile.monthlyMentorshipAmount}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                per candidate / month
              </p>
            </div>

            {/* Expertise */}
            <div className="group rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/60">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition group-hover:scale-110">
                  <Tags size={21} />
                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                  SKILLS
                </span>
              </div>

              <p className="mt-6 text-sm font-medium text-slate-500">
                Expertise Areas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {profile.mentorshipExpertise.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                technologies you mentor in
              </p>
            </div>

            {/* Status */}
            <div className="group rounded-3xl border border-fuchsia-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-100/60 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-2xl",
                    profile.mentorshipEnabled
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {profile.mentorshipEnabled ? (
                    <CircleCheck size={21} />
                  ) : (
                    <CircleX size={21} />
                  )}
                </div>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    profile.mentorshipEnabled
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  MARKETPLACE
                </span>
              </div>

              <p className="mt-6 text-sm font-medium text-slate-500">
                Profile Status
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {profile.mentorshipEnabled
                  ? "Active"
                  : "Disabled"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {profile.mentorshipEnabled
                  ? "Candidates can discover you"
                  : "Profile hidden from candidates"}
              </p>
            </div>
          </section>

          {/* Main content */}
          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Expertise card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                    Your strengths
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    What you mentor in
                  </h2>
                </div>

                <Link
                  to="/mentor/settings"
                  className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {profile.mentorshipExpertise.map(
                  (expertise) => (
                    <div
                      key={expertise}
                      className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-sm font-medium text-violet-700"
                    >
                      {expertise}
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Marketplace card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-7 text-white shadow-xl">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    {profile.mentorshipEnabled ? (
                      <CircleCheck
                        size={21}
                        className="text-emerald-300"
                      />
                    ) : (
                      <CircleX
                        size={21}
                        className="text-white/60"
                      />
                    )}
                  </div>

                  <span className="text-xs font-medium text-white/50">
                    MARKETPLACE
                  </span>
                </div>

                <h2 className="mt-7 text-xl font-bold">
                  {profile.mentorshipEnabled
                    ? "You're visible to candidates"
                    : "Your profile is currently hidden"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  {profile.mentorshipEnabled
                    ? "Candidates can discover your profile and subscribe to your mentorship."
                    : "Enable mentorship from settings when you're ready to accept candidates."}
                </p>

                <Link
                  to="/mentor/settings"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Manage settings
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom info */}
          <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                  Ready to mentor?
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Keep your profile fresh and useful.
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Candidates are more likely to connect when
                  your expertise and profile are up to date.
                </p>
              </div>

              <Link
                to="/mentor/profile"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                View Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}