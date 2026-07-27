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

export const createUserProfile = async(data: CreateUserInput) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: data.id 
        }
    }) ; 

    if(existingUser) {
        return existingUser ; 
    }

    return prisma.user.create({
        data: {
            id: data.id, 
            email: data.email 
        }
    })
}

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
            linkedin: data.linkedin
        }
    })
    return user ; 
}

// Get User Profile 

export const getUserProfile = async (data: GetUserInput) => {

    // find user by primary key 

    const user = await prisma.user.findUnique({
        where: {
            id: data.id 
        }
    }) ; 

    // throw error if user doesn't exist 

    if(!user){
        throw new Error("User not found") ; 
    }

    return user ; 
}

// delete user profile form user service database - development only 

export const deleteUserProfile = async (userId: string) => {
    await prisma.user.delete({
        where: {
            id: userId 
        }
    }) ; 

    return {
        deleted: true 
    }
}