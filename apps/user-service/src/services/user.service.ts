import prisma from "../utils/prisma.js";
import {
  indexCandidate,
  removeCandidateFromIndex,
  searchCandidates as searchCandidatesInElastic 
} from "./elasticsearch.service.js";

interface CreateUserInput {
  id: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE";
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

export const createUserProfile = async (data: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: data.id,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      id: data.id,
      email: data.email,
      role: data.role,
    },
  });

  // only candidates are stored in the candidate search index

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

  if(user.role === "CANDIDATE") {
    await removeCandidateFromIndex(userId) ; 
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
  return searchCandidatesInElastic(query) ; 
}