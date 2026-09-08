import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import {
  getMentor,
  getMentorAvatarUrl,
  getMentorRatings,
} from "../../services/mentorship.api";

export function MentorProfile() {
  const { mentorId } = useParams<{ mentorId: string }>();

  const mentorQuery = useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: () => getMentor(mentorId!),
    enabled: Boolean(mentorId),
  });

  const mentor = mentorQuery.data;

  console.log("Mentor profile data:", mentor);
  console.log("Mentor avatarFileId:", mentor?.avatarFileId);

  const ratingsQuery = useQuery({
    queryKey: ["mentor-ratings", mentorId],
    queryFn: () => getMentorRatings(mentorId!),
    enabled: Boolean(mentorId),
  });

  const avatarQuery = useQuery({
    queryKey: ["mentor-avatar", mentorId, mentor?.avatarFileId],
    queryFn: () => {
      console.log("Mentor avataFileId being requested: ", mentor?.avatarFileId);

      return getMentorAvatarUrl(mentor!.avatarFileId!);
    },
    enabled: Boolean(mentor?.avatarFileId),
  });

  if (mentorQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        {/* Keep loading simple instead of creating many skeleton cards. */}
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-slate-100" />

          <div className="mt-8 h-52 rounded-3xl bg-slate-100" />

          <div className="mt-10 h-8 w-64 rounded bg-slate-100" />

          <div className="mt-4 h-5 w-96 max-w-full rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (mentorQuery.isError || !mentor) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          to="/candidate/mentors"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
        >
          <ArrowLeft size={16} />
          Back to mentors
        </Link>

        <div className="mt-8 rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Mentor not found</h1>

          <p className="mt-2 text-sm text-slate-500">
            This mentor may no longer be available in the marketplace.
          </p>
        </div>
      </div>
    );
  }

  const ratings = ratingsQuery.data;

  const initials =
    `${mentor.firstName?.[0] ?? ""}${mentor.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "M";

  return (
    <div className="mx-auto max-w-6xl">
      {/* =========================================================
          BACK
      ========================================================= */}
      <Link
        to="/candidate/mentors"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-slate-500
          transition
          hover:text-violet-600
        "
      >
        <ArrowLeft size={16} />
        Back to mentors
      </Link>

      {/* =========================================================
          PROFILE HEADER
      ========================================================= */}
      <section
        className="
          relative
          mt-7
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-br
          from-violet-600
          via-indigo-600
          to-fuchsia-600
          px-7
          py-8
          text-white
          shadow-xl
          shadow-violet-200/50
          sm:px-9
        "
      >
        {/* Decorative background shapes match the Mentor MFE style. */}
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div
            className="
              flex
              h-28
              w-28
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border-4
              border-white/30
              bg-white
              text-3xl
              font-bold
              text-violet-600
              shadow-xl
            "
          >
            {avatarQuery.data ? (
              // Display the mentor's private profile image through its signed URL.
              <img
                src={avatarQuery.data}
                alt={`${mentor.firstName ?? "Mentor"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {mentor.firstName || "Mentor"} {mentor.lastName || ""}
              </h1>

              {mentor.mentorProfile?.mentorshipEnabled && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-emerald-400/15
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-emerald-100
                    ring-1
                    ring-emerald-300/20
                  "
                >
                  <CheckCircle2 size={13} />
                  Available
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-white/80 sm:text-base">
              {mentor.headline || "Experienced mentor"}
            </p>

            {/* Rating + location on one horizontal line */}
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-amber-300 text-amber-300" />

                <span className="font-semibold text-white">
                  {ratings?.averageRating?.toFixed(1) ?? "0.0"}
                </span>

                <span>
                  {ratings?.totalRatings ?? 0}{" "}
                  {ratings?.totalRatings === 1 ? "review" : "reviews"}
                </span>
              </div>

              {mentor.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {mentor.location}
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              {mentor.github && (
                <a
                  href={mentor.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-white
                    transition
                    hover:bg-white/20
                  "
                >
                  <FaGithub size={17} />
                </a>
              )}

              {mentor.linkedin && (
                <a
                  href={mentor.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-white
                    transition
                    hover:bg-white/20
                  "
                >
                  <FaLinkedin size={17} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT
      ========================================================= */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* Main profile information */}
        <main>
          {/* About */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
              About
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Get to know your mentor
            </h2>

            {mentor.bio ? (
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                {mentor.bio}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                This mentor hasn't added an introduction yet.
              </p>
            )}
          </section>

          {/* Expertise */}
          <section className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
              Expertise
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Areas I can help with
            </h2>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {mentor.mentorProfile?.mentorshipExpertise?.map((skill) => (
                <span
                  key={skill}
                  className="
                      rounded-full
                      border border-violet-100
                      bg-gradient-to-r
                      from-violet-50
                      to-indigo-50
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-violet-700
                    "
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                  Reviews
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  What candidates say
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Star size={16} className="fill-amber-400 text-amber-400" />

                <span className="font-semibold text-slate-900">
                  {ratings?.averageRating?.toFixed(1) ?? "0.0"}
                </span>
              </div>
            </div>

            {!ratings?.ratings?.length ? (
              <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-8">
                <p className="text-sm text-slate-500">
                  No reviews yet. Be one of the first candidates to work with
                  this mentor.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {ratings.ratings.map((review) => (
                  <div key={review.id} className="py-6 first:pt-0">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={15}
                          className={
                            index < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }
                        />
                      ))}
                    </div>

                    {review.review && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        "{review.review}"
                      </p>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      Verified candidate review
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* =======================================================
            SUBSCRIPTION
        ======================================================= */}
        <aside>
          <div
            className="
              sticky
              top-24
              rounded-3xl
              border border-violet-100
              bg-white
              p-6
              shadow-sm
            "
          >
            <p className="text-sm font-semibold text-violet-600">
              Monthly mentorship
            </p>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                ₹{mentor.mentorProfile?.monthlyMentorshipAmount ?? 0}
              </span>

              <span className="text-sm text-slate-400">/ month</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Get personalized guidance, mentorship conversations, and career
              support directly from this mentor.
            </p>

            <button
              type="button"
              disabled={!mentor.mentorProfile?.mentorshipEnabled}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-900
                px-5
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:bg-slate-300
              "
            >
              {mentor.mentorProfile?.mentorshipEnabled
                ? "Subscribe"
                : "Currently unavailable"}

              {mentor.mentorProfile?.mentorshipEnabled && (
                <ArrowRight size={16} />
              )}
            </button>

            <div className="my-6 h-px bg-slate-100" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck size={18} className="text-emerald-500" />
                Secure monthly subscription
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Direct mentorship access
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
