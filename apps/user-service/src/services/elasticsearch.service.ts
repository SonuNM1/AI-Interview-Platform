
import { CANDIDATE_INDEX } from "../config/elasticsearch.index.js";
import { elasticsearchClient } from "../config/elasticSearch.js";

export interface CandidateDocument {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE";
  location: string | null;
  headline: string | null;
}

// Add or update a candidate in the Elasticsearch index.
export async function indexCandidate(
  candidate: CandidateDocument,
) {
  if (candidate.role !== "CANDIDATE") {
    return;
  }

  await elasticsearchClient.index({
    index: CANDIDATE_INDEX,
    id: candidate.id,

    document: {
      id: candidate.id,
      email: candidate.email,
      username: candidate.username,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      role: candidate.role,
      location: candidate.location,
      headline: candidate.headline,
    },

    refresh: true,
  });
}

// Remove a candidate from the Elasticsearch index.
export async function removeCandidateFromIndex(
  userId: string,
) {
  try {
    await elasticsearchClient.delete({
      index: CANDIDATE_INDEX,
      id: userId,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 404
    ) {
      return;
    }

    throw error;
  }
}

// Search candidates by username, email, first name, or last name.
export async function searchCandidates(
  query: string,
) {
  const result = await elasticsearchClient.search<CandidateDocument>({
    index: CANDIDATE_INDEX,

    size: 10,

    query: {
      bool: {
        filter: [
          {
            term: {
              role: "CANDIDATE",
            },
          },
        ],

        must: [
          {
            multi_match: {
              query,
              fields: [
                "username^4",
                "email^4",
                "firstName^2",
                "lastName^2",
              ],
              fuzziness: "AUTO",
            },
          },
        ],
      },
    },
  });

  return result.hits.hits
    .map((hit) => hit._source)
    .filter(
      (candidate): candidate is CandidateDocument =>
        candidate !== undefined,
    );
}