import prisma from "../utils/prisma.js";

interface CreateUserInput {
  id: string;
  email: string;
}

interface updateUserInput {
  id: string;
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

  return prisma.user.create({
    data: {
      id: data.id,
      email: data.email,
    },
  });
};

export const updateUserProfile = async (data: updateUserInput) => {
  const user = await prisma.user.update({
    where: {
      id: data.id,
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      headline: data.headline,
      location: data.location,
      bio: data.bio,
      github: data.github,
      linkedin: data.linkedin,
    },
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
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

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

export const updateUserResume = async (
    data: {
        userId: string; 
        resumeFileId: string; 
    }
) => {
    return prisma.user.update({
        where: {
            id: data.userId, 
        },
        data: {
            resumeFileId: data.resumeFileId
        }
    })
}

// return the user's current resume file id 

export const getUserResumeFileId = async (
    userId: string 
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId, 
        }, 
        select: {
            resumeFileId: true 
        }
    }) ; 

    if(!user) {
        throw new Error("User not found") ; 
    }
    return user.resumeFileId ; 
}

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
