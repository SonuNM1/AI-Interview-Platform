import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useState } from "react";
import { getMentors } from "../../services/mentorship.api";

export function Mentors() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: mentors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mentors", searchTerm],
    queryFn: () => getMentors(searchTerm),
  });

  const handleSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setSearchTerm(search.trim());
  };

  return (
    <div className="p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Find a Mentor
          </h1>

          <p className="mt-2 text-gray-400">
            Learn from experienced professionals
            and get personalized guidance.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-8 flex max-w-2xl gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, skill, technology..."
              className="w-full rounded-xl border border-white/10 bg-[#1c1b19] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-gray-500 focus:border-white/25"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200"
          >
            Search
          </button>
        </form>

        {isLoading && (
          <p className="text-gray-400">
            Finding mentors...
          </p>
        )}

        {isError && (
          <p className="text-red-400">
            Failed to load mentors.
          </p>
        )}

        {!isLoading &&
          !isError &&
          !mentors?.length && (
            <div className="rounded-xl border border-white/10 bg-[#1c1b19] p-8 text-center">
              <h2 className="text-lg font-medium">
                No mentors found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try searching for another skill or
                mentor name.
              </p>
            </div>
          )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mentors?.map((mentor) => {
            const name =
              [
                mentor.firstName,
                mentor.lastName,
              ]
                .filter(Boolean)
                .join(" ") || "Mentor";

            const profile =
              mentor.mentorProfile;

            return (
              <Link
                key={mentor.id}
                to={`/candidate/mentors/${mentor.id}`}
                className="rounded-2xl border border-white/10 bg-[#1c1b19] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-semibold">
                    {name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">
                      {name}
                    </h2>

                    {mentor.headline && (
                      <p className="mt-1 truncate text-sm text-gray-400">
                        {mentor.headline}
                      </p>
                    )}
                  </div>
                </div>

                {mentor.bio && (
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-400">
                    {mentor.bio}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {profile?.mentorshipExpertise.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-gray-500">
                    Monthly
                  </span>

                  <span className="font-semibold">
                    ₹
                    {profile?.monthlyMentorshipAmount.toLocaleString(
                      "en-IN",
                    )}
                    /month
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}