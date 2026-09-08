import api from "./api";

export interface MentorProfileSettings {
  mentorId: string;
  monthlyMentorshipAmount: number;
  mentorshipExpertise: string[];
  mentorshipEnabled: boolean;
}

export interface MentorUserProfile {
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
}

export const getMyMentorProfile = async (): Promise<MentorProfileSettings | null> => {
    const response = await api.get("/users/mentors/me");

    return response.data.data;
  };

export const updateMyMentorProfile = async (
  data: {
    monthlyMentorshipAmount: number;
    mentorshipExpertise: string[];
    mentorshipEnabled: boolean;
  },
): Promise<MentorProfileSettings> => {
  const response = await api.patch(
    "/users/mentors/me",
    data,
  );

  return response.data.data;
};

export const getMyProfile =
  async (): Promise<MentorUserProfile> => {
    const response = await api.get("/users/me");

    return response.data.data;
  };

export const updateMyProfile = async (
  data: {
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    headline?: string;
    location?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
  },
): Promise<MentorUserProfile> => {
  const currentProfile = await getMyProfile() ; 

  const response = await api.patch(`/users/${currentProfile.id}`, data) ; 

  return response.data.data;
};

export const updateMyAvatar = async (
  file: File,
): Promise<MentorUserProfile> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.patch(
    "/users/me/avatar",
    formData,
  );

  return response.data.data;
};

// Get a temporary signed URL so the browser can display a private avatar stored through the File Service 

export const getFileSignedUrl = async (
  fileId: string  
): Promise<string> => {
  const response = await api.get(`/files/signed-url/${fileId}`) ; 

  return response.data.data.url ; 
}