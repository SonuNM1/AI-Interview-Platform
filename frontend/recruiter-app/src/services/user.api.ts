import api from "./api";

export interface UserProfile {
  id: string;
  email: string;

  username: string | null;

  firstName: string | null;
  lastName: string | null;

  phone: string | null;

  avatarFileId: string | null;
  resumeFileId: string | null;

  bio: string | null;
  github: string | null;
  linkedin: string | null;

  location: string | null;
  headline: string | null;

  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileData {
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

export interface FileMetadata {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  size: number;
  bucket: string;
  key: string;
  url: string;
  etag: string;
  uploadedBy: string;
  isPublic: boolean;
}

// fetch logged-in recruiter profile 

export async function getMyProfile(): Promise<UserProfile> {
    const response = await api.get("/users/me") ; 

    return response.data.data ; 
}

// update logged-in recruiter's profile 

export async function updateMyProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const currentProfile = await getMyProfile() ; 

    const response = await api.patch(`/users/${currentProfile.id}`, data) ; 

    return response.data.data ; 
}

// upload recruiter avatar 

export async function uploadAvatar(
  file: File,
): Promise<UserProfile> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.patch(
    "/users/me/avatar",
    formData,
  );

  return response.data.data;
}

// Get temporary signed URL for avatar/file 

export async function getFileSignedUrl(
  fileId: string,
): Promise<string> {
  const response = await api.get(
    `/files/signed-url/${fileId}`,
  );

  return response.data.data.url;
}

// get file metadata 

export async function getFileMetadata(
  fileId: string,
): Promise<FileMetadata> {
  const response = await api.get(
    `/files/${fileId}`,
  );

  return response.data.data;
}

// Requests an OTP before deleting the recruiter account

export async function requestAccountDeletion() {
  const response = await api.post("/auth/delete-account/request");

  return response.data;
}

// Verifies the OTP and deletes the recruiter account

export async function verifyAccountDeletion(otp: string) {
  const response = await api.post("/auth/delete-account/verify", {
    otp,
  });

  return response.data;
}