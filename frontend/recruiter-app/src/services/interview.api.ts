import api from "./api";

export interface Interview {
  _id: string;
  title: string;
  description?: string;
  role: string;
  skills: string[];
  duration: number;
  totalQuestions: number;
  scheduledAt: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  experience?: number;
  type: "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "DSA";
  candidateId: string;
  createdBy: string;
  status: string;
  accessToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewData {
  title: string;
  description?: string;
  role: string;
  skills: string[];
  duration: number;
  totalQuestions?: number;
  scheduledAt: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  experience?: number;
  type: "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "DSA";
  candidateId: string;
}

export interface UpdateInterviewData { 
  title?: string; 
  description?: string; 
  role?: string; 
  skills?: string[]; 
  duration?: number; 
  scheduledAt?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD"; 
  type?: "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "DSA"; 
}

export interface CandidateSearchResult {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "RECRUITER" | "CANDIDATE";
  location: string | null;
  headline: string | null;
}

// Fetch all interviews created by the logged-in recruiter

export async function getInterviews(): Promise<Interview[]> {
  const response = await api.get("/interviews");

  return response.data.data;
}

// Create and assign an interview to a candidate.

export async function createInterview(
  data: CreateInterviewData,
): Promise<Interview> {
  const response = await api.post("/interviews", data);

  return response.data.data;
}

// Update an existing interview.

export async function updateInterview(
  id: string,
  data: UpdateInterviewData,
): Promise<Interview> {
  const response = await api.put(`/interviews/${id}`, data);

  return response.data.data;
}

// Delete an interview.

export async function deleteInterview(id: string): Promise<void> {
  await api.delete(`/interviews/${id}`);
}

// Publish an interview and generate its public share link.

export async function publishInterview(
  id: string,
): Promise<{
  shareLink: string;
  interview: Interview;
}> {
  const response = await api.patch(`/interviews/${id}/publish`);

  return {
    shareLink: response.data.shareLink,
    interview: response.data.data,
  };
}

// search candidates for recruiter interview assignment 

export async function searchCandidates(
  query: string 
): Promise<CandidateSearchResult[]> {
  
  const response = await api.get("/users/candidates/search", {
    params: {
      q: query
    }
  })

  return response.data.data ; 

}