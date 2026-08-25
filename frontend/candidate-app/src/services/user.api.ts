

// User profile returned by the user service 

import api from "./api";

export interface UserProfile {
    id: string ; 
    email: string ; 

    username: string | null ; 

    firstName: string | null ; 
    lastName: string | null ; 

    phone: string | null ; 

    avatarFileId: string | null ; 
    resumeFileId: string | null ; 

    bio: string | null ; 
    github: string | null ; 
    linkedin: string | null ; 

    location: string | null ; 
    headline: string | null ; 

    deletedAt: string | null ; 

    createdAt: string ; 
    updatedAt: string ; 
}

// Fetch the currently authenticated candidate's complete user profile 

export async function getMyProfile(): Promise<UserProfile> {
    const response = await api.get("/user/me") ; 

    return response.data.data; 
}