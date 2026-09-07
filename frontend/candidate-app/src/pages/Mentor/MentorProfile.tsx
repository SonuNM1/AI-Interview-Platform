import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getMentor } from "../../services/mentorship.api";
import api from "../../services/api";

interface MentorRatings {
  averageRating: number;
  totalRatings: number;
  ratings: {
    id: string;
    candidateId: string;
    rating: number;
    review: string | null;
    createdAt: string;
  }[];
}

const getMentorRatings = async (
  mentorId: string,
): Promise<MentorRatings> => {
  const response = await api.get(
    `/users/mentors/${mentorId}/ratings`,
  );

  return response.data.data;
};

export function MentorProfile() {
  const { mentorId } = useParams();

  const mentorQuery = useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: () => getMentor(mentorId!),
    enabled: Boolean(mentorId),
  });

  const ratingsQuery = useQuery({
    queryKey: ["mentor-ratings", mentorId],
    queryFn: () =>
      getMentorRatings(mentorId!),
    enabled: Boolean(mentorId),
  });

  if (mentorQuery.isLoading) {
    return (
      <div className="p-6 text-gray-400">
        Loading mentor...
      </div>
    );
  }

  if (
    mentorQuery.isError ||
    !mentorQuery.data
  ) {
    return (
      <div className="p-6 text-red-400">
        Mentor not found.
      </div>
    );
  }

  const mentor = mentorQuery.data;

  const name =
    [mentor.firstName, mentor.lastName]
      .filter(Boolean)
      .join(" ") || "Mentor";

  const profile = mentor.mentorProfile;
  const ratings = ratingsQuery.data;

  return (
    <div className="p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-[#1c1b19] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 text-3xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-semibold">
                {name}
              </h1>

              {mentor.headline && (
                <p className="mt-1 text-gray-400">
                  {mentor.headline}
                </p>
              )}

              {mentor.location && (
                <p className="mt-1 text-sm text-gray-500">
                  {mentor.location}
                </p>
              )}

              {ratings && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span>
                    ⭐ {ratings.averageRating.toFixed(1)}
                  </span>

                  <span className="text-gray-500">
                    ({ratings.totalRatings} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {mentor.bio && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                About
              </h2>

              <p className="mt-3 leading-7 text-gray-400">
                {mentor.bio}
              </p>
            </section>
          )}

          {profile && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                Mentorship Expertise
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.mentorshipExpertise.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-sm"
                    >
                      {skill}
                    </span>
                  ),
                )}
              </div>
            </section>
          )}

          {ratings &&
            ratings.ratings.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold">
                  Reviews
                </h2>

                <div className="mt-4 space-y-4">
                  {ratings.ratings.map(
                    (rating) => (
                      <div
                        key={rating.id}
                        className="border-b border-white/10 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {"⭐".repeat(
                              rating.rating,
                            )}
                          </span>
                        </div>

                        {rating.review && (
                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {rating.review}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

          {profile && (
            <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Monthly mentorship
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  ₹
                  {profile.monthlyMentorshipAmount.toLocaleString(
                    "en-IN",
                  )}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / month
                  </span>
                </p>
              </div>

              <button
                type="button"
                className="rounded-xl bg-white px-6 py-3 font-medium text-black hover:bg-gray-200"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}