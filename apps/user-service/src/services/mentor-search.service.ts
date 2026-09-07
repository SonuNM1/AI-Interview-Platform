import { MENTOR_INDEX } from "../config/elasticsearch.index.js";
import { elasticsearchClient } from "../config/elasticSearch.js";

export interface MentorDocument {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;

  // Marketplace-specific searchable fields.

  mentorshipExpertise: string[];

  // Only enabled mentors should appear in marketplace search.

  mentorshipEnabled: boolean;
}

// Creates the mentors index with an explicit mapping the first time. Elasticsearch is asked to work with the mentor marketplace.

export const ensureMentorIndex = async () => {
  // Check whether the mentors index already exists.

  const exists = await elasticsearchClient.indices.exists({
    index: MENTOR_INDEX,
  });

  // Nothing else is required when the index already exists.

  if (exists) {
    return;
  }

  // Create the index with fields suited for mentor marketplace search.

  await elasticsearchClient.indices.create({
    index: MENTOR_INDEX,

    mappings: {
      properties: {
        // User ID is used to fetch the current record from PostgreSQL.

        id: {
          type: "keyword",
        },

        // Email is an exact-value field.

        email: {
          type: "keyword",
        },

        // Text fields are searchable by Elasticsearch.

        username: {
          type: "text",
        },

        firstName: {
          type: "text",
        },

        lastName: {
          type: "text",
        },

        headline: {
          type: "text",
        },

        bio: {
          type: "text",
        },

        location: {
          type: "text",
        },

        // Expertise contains technologies such as React, Node.js, AWS, etc.

        mentorshipExpertise: {
          type: "text",
        },

        // Only enabled mentors should appear in marketplace search.

        mentorshipEnabled: {
          type: "boolean",
        },
      },
    },
  });
};

// Add or update a mentor in Elasticsearch

export const indexMentor = async (mentor: MentorDocument) => {
  await ensureMentorIndex(); // make sure the mentor index exists before indexing the document

  await elasticsearchClient.index({
    index: MENTOR_INDEX,
    id: mentor.id,

    document: {
      id: mentor.id,
      email: mentor.email,
      username: mentor.username,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      headline: mentor.headline,
      bio: mentor.bio,
      location: mentor.location,
      mentorshipExpertise: mentor.mentorshipExpertise,
      mentorshipEnabled: mentor.mentorshipEnabled,
    },

    refresh: true,
  });
};

// Remove a mentor from Elasticsearch

export const removeMentorFromIndex = async (mentorId: string) => {
  try {
    await elasticsearchClient.delete({
      index: MENTOR_INDEX,
      id: mentorId,
    });
  } catch (error: unknown) {
    // Elasticsearch returns 404 when the document does not exist.

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
};

// Search enabled mentors

export const searchMentors = async (query: string) => {
  await ensureMentorIndex(); // make sure the mentors index exists before searching it

  const result = await elasticsearchClient.search<MentorDocument>({
    index: MENTOR_INDEX,

    size: 20,

    query: {
      bool: {
        filter: [
          {
            term: {
              mentorshipEnabled: true,
            },
          },
        ],

        must: [
          {
            multi_match: {
              query,
              fields: [
                "firstName^4",
                "lastName^4",
                "username^3",
                "headline^3",
                "mentorshipExpertise^4",
                "bio",
                "location",
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
    .filter((mentor): mentor is MentorDocument => mentor !== undefined);
};
