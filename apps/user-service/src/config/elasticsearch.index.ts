import prisma from "../utils/prisma.js";
import { elasticsearchClient } from "./elasticSearch.js";

export const CANDIDATE_INDEX = "candidates";

// Create the candidate index with an explicit Elasticsearch mapping.

export async function initializeCandidateIndex() {
  const exists = await elasticsearchClient.indices.exists({
    index: CANDIDATE_INDEX,
  });

  if (exists) {
    return;
  }

  await elasticsearchClient.indices.create({
    index: CANDIDATE_INDEX,

    mappings: {
      properties: {
        id: {
          type: "keyword",
        },

        email: {
          type: "keyword",
        },

        username: {
          type: "keyword",
        },

        firstName: {
          type: "text",
        },

        lastName: {
          type: "text",
        },

        role: {
          type: "keyword",
        },

        location: {
          type: "text",
        },

        headline: {
          type: "text",
        },
      },
    },
  });

  console.log("✅ Candidate Elasticsearch index created");
}

// Populate Elasticsearch with candidates already present in PostgreSQL.
export async function indexExistingCandidates() {
  const candidates = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      deletedAt: null,
    },
  });

  for (const candidate of candidates) {
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
    });
  }

  console.log(
    `✅ Indexed ${candidates.length} existing candidates`,
  );
}