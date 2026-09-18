import { useEffect, useState } from "react";
import { ArrowRight, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getMentorAvatarUrl,
  getMentorRatings,
  getMentors,
  type Mentor,
} from "../../services/mentorship.api";

interface MentorCardData {
  mentor: Mentor;
  rating: number;
  totalRatings: number;
  avatarUrl: string | null;
}

export function MentorRecommendations() {
  const navigate = useNavigate();

  const [mentors, setMentors] = useState<MentorCardData[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentors = async () => {
      try {
        setLoading(true);

        const mentorList = await getMentors("");

        const recommendedMentors = mentorList.slice(0, 3);

        const mentorData = await Promise.all(
          recommendedMentors.map(async (mentor) => {
            let rating = 0;
            let totalRatings = 0;
            let avatarUrl: string | null = null;

            try {
              const ratingData = await getMentorRatings(mentor.id);

              rating = ratingData?.averageRating ?? 0;

              totalRatings = ratingData?.totalRatings ?? 0;
            } catch (error) {
              console.error(
                `Failed to load rating for mentor ${mentor.id}:`,
                error,
              );
            }

            if (mentor.avatarFileId) {
              try {
                avatarUrl = await getMentorAvatarUrl(mentor.avatarFileId);
              } catch (error) {
                console.error(
                  `Failed to load avatar for mentor ${mentor.id}:`,
                  error,
                );
              }
            }

            return {
              mentor,
              rating,
              totalRatings,
              avatarUrl,
            };
          }),
        );

        setMentors(mentorData);
      } catch (error) {
        console.error("Failed to load recommended mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMentors();
  }, []);

  const getMentorName = (mentor: Mentor) => {
    const fullName = `${mentor.firstName ?? ""} ${
      mentor.lastName ?? ""
    }`.trim();

    return fullName || mentor.username || "Mentor";
  };

  const getInitials = (mentor: Mentor) => {
    return (
      `${mentor.firstName?.[0] ?? ""}${mentor.lastName?.[0] ?? ""}`
        .trim()
        .toUpperCase() || "M"
    );
  };

  return (
    <section className="mt-6 pb-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Users size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-violet-600">Mentorship</p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Find Your Mentor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Get guidance from experienced professionals who can help you
                grow.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/candidate/mentors")}
            className="hidden items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 sm:flex cursor-pointer"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-slate-100" />

                    <div className="flex-1">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="mt-5 h-8 animate-pulse rounded-lg bg-slate-100" />

                  <div className="mt-4 h-9 animate-pulse rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          ) : mentors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {mentors.map(({ mentor, rating, totalRatings, avatarUrl }) => (
                  <div
                    key={mentor.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  >
                    {/* Mentor Identity */}
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={getMentorName(mentor)}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-2 ring-slate-100">
                          {getInitials(mentor)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {getMentorName(mentor)}
                        </h3>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {mentor.headline || "Experienced Mentor"}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-5 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="text-sm font-semibold text-slate-800">
                          {rating > 0 ? rating.toFixed(1) : "New"}
                        </span>
                      </div>

                      {totalRatings > 0 && (
                        <span className="text-xs text-slate-400">
                          ({totalRatings}{" "}
                          {totalRatings === 1 ? "review" : "reviews"})
                        </span>
                      )}
                    </div>
                    {mentor.mentorProfile?.mentorshipExpertise &&
                      mentor.mentorProfile.mentorshipExpertise.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {mentor.mentorProfile.mentorshipExpertise
                            .slice(0, 2)
                            .map((expertise) => (
                              <span
                                key={expertise}
                                className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700"
                              >
                                {expertise}
                              </span>
                            ))}
                        </div>
                      )}

                    {/* View Profile */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/candidate/mentors/${mentor.id}`)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 cursor-pointer"
                    >
                      View Profile
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile View All */}
              <button
                type="button"
                onClick={() => navigate("/candidate/mentors")}
                className="mt-5 flex items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 sm:hidden"
              >
                View all mentors
                <ArrowRight size={15} />
              </button>
            </>
          ) : (
            /* Empty State */
            <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <Users size={20} />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No mentors available right now
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Check the mentor marketplace to discover available mentors.
              </p>

              <button
                type="button"
                onClick={() => navigate("/candidate/mentors")}
                className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                Explore mentors →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
