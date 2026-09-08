import api from "./api";

export interface MentorProfile {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarFileId: string | null;
  bio: string | null;
  github: string | null;
   linkedin: string | null;
  location: string | null;
  headline: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorMarketplaceProfile {
  mentorId: string;
  monthlyMentorshipAmount: number;
  mentorshipExpertise: string[];
  mentorshipEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Mentor extends MentorProfile {
  mentorProfile: MentorMarketplaceProfile | null;
}

// Mentor rating summary and individual reviews.
export interface MentorRatings {
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

// get mentors available for mentorship 

export const getMentors = async (
  query = "",
): Promise<Mentor[]> => {
  const response = await api.get("/users/mentors", {
    params: query.trim()
      ? { q: query.trim() }
      : undefined,
  });

  return response.data.data;
};

// get one mentors' public profile 

export const getMentor = async (
    mentorId: string 
): Promise<Mentor> => {
    const response = await api.get(`/users/mentors/${mentorId}`) ; 

    return response.data.data ; 
}

// get ratings and reviews for a mentor 

export const getMentorRatings = async (
  mentorId: string 
): Promise<MentorRatings> => {
  const response = await api.get(`/users/mentors/${mentorId}/ratings`) ; 

  return response.data.data ; 
}

// get a temporary signed URL for a private mentor avatar 

export const getMentorAvatarUrl = async (
  fileId: string 
): Promise<string> => {
  const response = await api.get(`/files/signed-url/${fileId}`) ; 

  return response.data.data.url ; 
}