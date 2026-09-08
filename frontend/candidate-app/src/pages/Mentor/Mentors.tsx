import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  MapPin,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getMentorAvatarUrl,
  getMentorRatings,
  getMentors,
  type Mentor,
} from "../../services/mentorship.api";

export function Mentors() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch enabled mentors. Search is still handled by the existing backend API.
  const mentorsQuery = useQuery({
    queryKey: ["mentors", searchTerm],
    queryFn: () => getMentors(searchTerm),
  });

  const mentors = mentorsQuery.data ?? [];

  // Fetch ratings for the mentors currently visible on the marketplace.
  const ratingQueries = useQueries({
    queries: mentors.map((mentor) => ({
      queryKey: ["mentor-ratings", mentor.id],
      queryFn: () => getMentorRatings(mentor.id),
    })),
  });

  // Fetch temporary signed URLs for private mentor profile pictures.
  const avatarQueries = useQueries({
    queries: mentors.map((mentor) => ({
      queryKey: ["mentor-avatar", mentor.id, mentor.avatarFileId],
      queryFn: () => getMentorAvatarUrl(mentor.avatarFileId!),
      enabled: Boolean(mentor.avatarFileId),
    })),
  });

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Keep the existing search behaviour while trimming unnecessary spaces.
    setSearchTerm(search.trim());
  };

  const getInitials = (mentor: Mentor) => {
    return (
      `${mentor.firstName?.[0] ?? ""}${mentor.lastName?.[0] ?? ""}`
        .trim()
        .toUpperCase() || "M"
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <section className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <Users size={13} />

          Mentor Marketplace
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Find the right mentor
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Learn from experienced professionals and get practical
          guidance for your career and technical growth.
        </p>
      </section>

      {/* =========================================================
          SEARCH
      ========================================================= */}
      <form
        onSubmit={handleSearch}
        className="mb-10"
      >
        <div className="relative max-w-3xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, expertise, role, location..."
            className="
              w-full
              rounded-2xl
              border border-slate-200
              bg-white
              py-3.5
              pl-11
              pr-28
              text-sm
              text-slate-900
              shadow-sm
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-violet-400
              focus:ring-4
              focus:ring-violet-100
            "
          />

          <button
            type="submit"
            className="
              absolute
              right-1.5
              top-1.5
              rounded-xl
              bg-violet-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-violet-700
              cursor-pointer 
            "
          >
            Search
          </button>
        </div>
      </form>

      {/* =========================================================
          LOADING
      ========================================================= */}
      {mentorsQuery.isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-[300px]
                animate-pulse
                rounded-3xl
                border border-slate-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <div className="h-16 w-16 rounded-full bg-slate-100" />

              <div className="mt-5 h-5 w-40 rounded bg-slate-100" />

              <div className="mt-3 h-4 w-52 rounded bg-slate-100" />

              <div className="mt-6 h-4 w-full rounded bg-slate-100" />

              <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          ERROR
      ========================================================= */}
      {mentorsQuery.isError && (
        <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load mentors
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Something went wrong while loading the mentor marketplace.
            Please try again.
          </p>
        </div>
      )}

      {/* =========================================================
          NO RESULTS
      ========================================================= */}
      {!mentorsQuery.isLoading &&
        !mentorsQuery.isError &&
        mentors.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Users size={24} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No mentors found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any mentors matching your search.
              Try another name, skill, role, or location.
            </p>
          </div>
        )}

      {/* =========================================================
          MENTOR LIST
      ========================================================= */}
      {!mentorsQuery.isLoading &&
        !mentorsQuery.isError &&
        mentors.length > 0 && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                  Marketplace
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Available mentors
                </h2>
              </div>

              <span className="text-sm text-slate-400">
                {mentors.length}{" "}
                {mentors.length === 1 ? "mentor" : "mentors"}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {mentors.map((mentor, index) => {
                const ratingData = ratingQueries[index]?.data;
                const avatarUrl = avatarQueries[index]?.data;

                const initials = getInitials(mentor);

                return (
                  <article
                    key={mentor.id}
                    className="
                      group
                      rounded-3xl
                      border border-slate-200
                      bg-white
                      p-6
                      shadow-sm
                      transition-all
                      duration-200
                      hover:border-violet-200
                    "
                  >
                    {/* Mentor identity */}
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-16
                          w-16
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-full
                          bg-gradient-to-br
                          from-violet-100
                          via-indigo-50
                          to-fuchsia-100
                          text-xl
                          font-semibold
                          text-violet-600
                        "
                      >
                        {avatarUrl ? (
                          // Display the temporary signed URL generated by the File Service.
                          <img
                            src={avatarUrl}
                            alt={`${mentor.firstName ?? "Mentor"} profile`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {mentor.firstName || "Mentor"}{" "}
                          {mentor.lastName || ""}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                          {mentor.headline || "Experienced mentor"}
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="
                          mt-1
                          shrink-0
                          text-slate-300
                          transition
                          group-hover:translate-x-1
                          group-hover:text-violet-500
                        "
                      />
                    </div>

                    {/* Rating + location on the same horizontal line */}
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="font-semibold">
                          {ratingData?.averageRating?.toFixed(1) ?? "0.0"}
                        </span>

                        <span className="text-slate-400">
                          ({ratingData?.totalRatings ?? 0})
                        </span>
                      </div>

                      {mentor.location && (
                        <div className="flex max-w-[50%] items-center gap-1.5 truncate text-slate-500">
                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {mentor.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expertise only - intentionally no bio on marketplace */}
                    <div className="mt-5 flex min-h-[52px] flex-wrap content-start gap-2">
                      {mentor.mentorProfile?.mentorshipExpertise
                        ?.slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="
                              rounded-full
                              bg-gradient-to-r
                              from-violet-50
                              to-indigo-50
                              px-3
                              py-1.5
                              text-xs
                              font-medium
                              text-violet-700
                            "
                          >
                            {skill}
                          </span>
                        ))}
                    </div>

                    {/* Pricing + action */}
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-400">
                            Monthly mentorship
                          </p>

                          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            ₹
                            {mentor.mentorProfile
                              ?.monthlyMentorshipAmount ?? 0}

                            <span className="ml-1 text-sm font-normal text-slate-400">
                              / month
                            </span>
                          </p>
                        </div>

                        <Link
                          to={`/candidate/mentors/${mentor.id}`}
                          className="
                            shrink-0
                            text-sm
                            font-semibold
                            text-violet-600
                            transition
                            hover:text-violet-800
                          "
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
    </div>
  );
}