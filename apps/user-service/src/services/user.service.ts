import prisma from "../utils/prisma.js";
import {
  indexCandidate,
  removeCandidateFromIndex,
  searchCandidates as searchCandidatesInElastic,
} from "./elasticsearch.service.js";
import axios from "axios";
import {
  indexMentor,
  removeMentorFromIndex,
  searchMentors,
} from "./mentor-search.service.js";

interface CreateUserInput {
  id: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE" | "MENTOR";
}

interface updateUserInput {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  headline?: string;
  location?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
}

interface GetUserInput {
  id: string;
}

interface updateUserAvatarInput {
  userId: string;
  avatarFileId: string;
}

interface CreateMentorRatingInput {
  mentorId: string;
  candidateId: string;
  rating: number;
  review?: string;
}
interface UpdateMentorProfileInput {
  mentorId: string;
  monthlyMentorshipAmount: number;
  mentorshipExpertise: string[];
  mentorshipEnabled: boolean;
}

// Data submitted by a mentor when configuring their marketplace profile
interface UpdateMentorProfileInput {
  mentorId: string;
  monthlyMentorshipAmount: number;
  mentorshipExpertise: string[];
  mentorshipEnabled: boolean;
}

export const createUserProfile = async (data: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: data.id,
    },
  });

  if (existingUser) {
    // keep the user service profile synchronized with Auth Service

    const updatedUser = await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data.email,
        role: data.role,
      },
    });

    // only candidates belong in the candidate search index

    if (updatedUser.role === "CANDIDATE") {
      await indexCandidate({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        location: updatedUser.location,
        headline: updatedUser.headline,
      });
    }
    return updatedUser;
  }

  const user = await prisma.user.create({
    data: {
      id: data.id,
      email: data.email,
      role: data.role,
    },
  });

  // only candidates are stored in the candidate search index

  if (user.role === "CANDIDATE") {
    await indexCandidate({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      location: user.location,
      headline: user.headline,
    });
  }

  return user;
};

export const updateUserProfile = async (data: updateUserInput) => {
  const user = await prisma.user.update({
    where: {
      id: data.id,
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      phone: data.phone,
      headline: data.headline,
      location: data.location,
      bio: data.bio,
      github: data.github,
      linkedin: data.linkedin,
    },
  });

  // keep Elasticsearch synchronized with the latest candidate profile

  if (user.role === "CANDIDATE") {
    await indexCandidate({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      location: user.location,
      headline: user.headline,
    });
  }

  return user;
};

// Get User Profile

export const getUserProfile = async (data: GetUserInput) => {
  // find user by primary key

  const user = await prisma.user.findUnique({
    where: {
      id: data.id,
    },
  });

  // throw error if user doesn't exist

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// delete user profile form user service database - development only

export const deleteUserProfile = async (userId: string) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (user.role === "CANDIDATE") {
    await removeCandidateFromIndex(userId);
  }

  return {
    deleted: true,
  };
};

// updating the logged-in user's avatar. Stores only the file service fileId

export const updateUserAvatar = async (data: updateUserAvatarInput) => {
  const user = await prisma.user.update({
    where: {
      id: data.userId,
    },

    data: {
      avatarFileId: data.avatarFileId,
    },
  });

  return user;
};

// Update the user's resume file id

export const updateUserResume = async (data: {
  userId: string;
  resumeFileId: string;
}) => {
  return prisma.user.update({
    where: {
      id: data.userId,
    },
    data: {
      resumeFileId: data.resumeFileId,
    },
  });
};

// return the user's current resume file id

export const getUserResumeFileId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      resumeFileId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user.resumeFileId;
};

// returns the user's current avatar fie id

export const getUserAvatarFileId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      avatarFileId: true,
    },
  });
  if (!user) {
    throw new Error("User not found.");
  }

  return user.avatarFileId;
};

// search candidates using ElasticSearch instead of PostgreSQL text filtering

export const searchCandidateProfiles = async (query: string) => {
  return searchCandidatesInElastic(query);
};

// Returns a mentor profile using the existing user model

export const getMentorProfile = async (mentorId: string) => {
  // make sure the requested user is actually an active mentor

  const mentor = await prisma.user.findFirst({
    where: {
      id: mentorId,
      role: "MENTOR",
      deletedAt: null,
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  // marketplace settings are stored separately from the main user record

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: {
      mentorId,
    },
  });

  return {
    ...mentor,
    mentorProfile,
  };
};

// Returns mentors available in the marketplace. When a search query is provided, Elasticsearch performs the discovery.

export const getMentorProfiles = async (
  query?: string,
) => {
  const normalizedQuery = query?.trim();

  // No search term means we return all currently enabled mentors

  if (!normalizedQuery) {
    const mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
        deletedAt: null,
        mentorProfile: {
          is: {
            mentorshipEnabled: true,
          },
        },
      },

      include: {
        mentorProfile: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return mentors;
  }

  // Elasticsearch handles mentor name, expertise, headline, bio, username, and location search.

  const searchResults =
    await searchMentors(normalizedQuery);

  // Nothing matched the search.

  if (searchResults.length === 0) {
    return [];
  }

  // Extract the mentor IDs returned by Elasticsearch.

  const mentorIds = searchResults
    .map((mentor) => mentor.id)
    .filter(Boolean);

  // Fetch the current source of truth from PostgreSQL


  const mentors = await prisma.user.findMany({
    where: {
      id: {
        in: mentorIds,
      },
      role: "MENTOR",
      deletedAt: null,
      mentorProfile: {
        is: {
          mentorshipEnabled: true,
        },
      },
    },

    include: {
      mentorProfile: true,
    },
  });

  // PostgreSQL does not guarantee the Elasticsearch ranking order, so restore the Elasticsearch order before returning the response.

  const mentorMap = new Map(
    mentors.map((mentor) => [
      mentor.id,
      mentor,
    ]),
  );

  return mentorIds
    .map((mentorId) => mentorMap.get(mentorId))
    .filter(
      (
        mentor,
      ): mentor is (typeof mentors)[number] =>
        mentor !== undefined,
    );
};

// Creates or updates the marketplace settings for the authenticated mentor

export const updateMentorProfile = async (
  data: UpdateMentorProfileInput,
) => {

  // Verify that the authenticated user is actually a mentor.
  
  const mentor = await prisma.user.findFirst({
    where: {
      id: data.mentorId,
      role: "MENTOR",
      deletedAt: null,
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  // The monthly price must be a positive integer because the payment service will eventually use this value in INR.

  if (
    !Number.isInteger(
      data.monthlyMentorshipAmount,
    ) ||
    data.monthlyMentorshipAmount <= 0
  ) {
    throw new Error(
      "Monthly mentorship amount must be a positive integer",
    );
  }

  // Remove empty expertise values before storing them.
  
  const expertise = data.mentorshipExpertise
    .map((item) => item.trim())
    .filter(Boolean);

  // A mentor needs at least one expertise area to appear as a useful marketplace profile.

  if (expertise.length === 0) {
    throw new Error(
      "At least one mentorship expertise is required",
    );
  }

  // Create the marketplace profile if it does not exist, otherwise update the existing profile.

  const mentorProfile =
    await prisma.mentorProfile.upsert({
      where: {
        mentorId: data.mentorId,
      },

      create: {
        mentorId: data.mentorId,
        monthlyMentorshipAmount:
          data.monthlyMentorshipAmount,
        mentorshipExpertise: expertise,
        mentorshipEnabled:
          data.mentorshipEnabled,
      },

      update: {
        monthlyMentorshipAmount:
          data.monthlyMentorshipAmount,
        mentorshipExpertise: expertise,
        mentorshipEnabled:
          data.mentorshipEnabled,
      },
    });

  // Keep Elasticsearch synchronized with the latest mentor data.
  
  await indexMentor({
    id: mentor.id,
    email: mentor.email,
    username: mentor.username,
    firstName: mentor.firstName,
    lastName: mentor.lastName,
    headline: mentor.headline,
    bio: mentor.bio,
    location: mentor.location,
    mentorshipExpertise: expertise,
    mentorshipEnabled:
      data.mentorshipEnabled,
  });

  // Return the saved marketplace profile.
  
  return mentorProfile;
};

// Returns the marketplace settings belonging to the authenticated mentor.

export const getMyMentorProfile = async (
  mentorId: string,
) => {

  // Verify that the authenticated user is a mentor.
  
  const mentor = await prisma.user.findFirst({
    where: {
      id: mentorId,
      role: "MENTOR",
      deletedAt: null,
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  // Fetch the separate marketplace configuration.
  
  return prisma.mentorProfile.findUnique({
    where: {
      mentorId,
    },
  });
};



// checks the Payment service before allowing a candidate to review a mentor they have paid for

const verifyMentorPurchase = async (candidateId: string, mentorId: string) => {
  const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;

  if (!paymentServiceUrl) {
    throw new Error("PAYMENT_SERVICE_URL is not configured");
  }

  const response = await axios.get(
    `${paymentServiceUrl}/api/v1/internal/subscriptions/eligibility`,
    {
      params: {
        candidateId,
        mentorId,
      },
      headers: {
        "x-internal-service": "user-service",
      },
    },
  );

  return response.data?.eligible === true;
};

// Creates or updates a mentor rating after verifying that the candidate has purchased the mentor's plan

export const createMentorRating = async (data: CreateMentorRatingInput) => {
  const mentor = await prisma.user.findFirst({
    where: {
      id: data.mentorId,
      role: "MENTOR",
      deletedAt: null,
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  if (data.mentorId === data.candidateId) {
    throw new Error("You cannot rate yourself");
  }

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const eligible = await verifyMentorPurchase(data.candidateId, data.mentorId);

  if (!eligible) {
    throw new Error("You can only rate mentors whose plan you have purchased");
  }

  return prisma.mentorRating.upsert({
    where: {
      mentorId_candidateId: {
        mentorId: data.mentorId,
        candidateId: data.candidateId,
      },
    },
    create: {
      mentorId: data.mentorId,
      candidateId: data.candidateId,
      rating: data.rating,
      review: data.review,
    },

    update: {
      rating: data.rating,
      review: data.review,
    },
  });
};

// returns the ratings and aggregate rating information for a mentor

export const getMentorRatings = async (mentorId: string) => {
  const mentor = await prisma.user.findFirst({
    where: {
      id: mentorId,
      role: "MENTOR",
      deletedAt: null,
    },
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  const ratings = await prisma.mentorRating.findMany({
    where: {
      mentorId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalRatings = ratings.length;

  const averageRating =
    totalRatings === 0
      ? 0
      : Number(
          (
            ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
          ).toFixed(1),
        );

  return {
    averageRating,
    totalRatings,
    ratings,
  };
};
