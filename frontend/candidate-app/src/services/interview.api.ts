import api from "./api";

export interface PublicInterview {
  title: string;
  description?: string;
  role: string;
  skills: string[];
  duration: number;
  totalQuestions: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "DSA";
  status:
    | "DRAFT"
    | "PUBLISHED"
    | "SCHEDULED"
    | "PAUSED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  scheduledAt?: string;
  startedAt?: string;
}
export interface CandidateInterview {
    _id: string ; 

    title: string ; 
    description?: string ; 

    role: string ; 
    skills: string[] ; 

    duration: number ; 
    totalQuestions: number ; 

    difficulty: "EASY" | "MEDIUM" | "HARD" ; 

    type: "TECHNICAL" | "HR" | "SYSTEM_DESIGN" | "DSA" ; 

    status: | "DRAFT" | "PUBLISHED" | "SCHEDULED" | "PAUSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

    candidateId: string ; 
    createdBy: string ; 

    accessToken: string ; 
    expiresAt?: string | null ; 

    score?: number ; 
    startedAt?: string | null ; 
    completedAt?: string | null ; 

    scheduledAt?: string | null;

    createdAt: string ; 
    updatedAt: string ; 
}
export interface CandidateInterviewsResponse {
    success: boolean; 
    count: number ; 
    data: CandidateInterview[]
}

export async function getPublicInterview(
  accessToken: string,
): Promise<PublicInterview> {
  const response = await api.get(
    `/public/interviews/${accessToken}`,
  );

  return response.data.data;
}

// fetch all interviews assigned to the currently authenticated candidate 

export async function getCandidateInterviews(): Promise<CandidateInterview[]> {
    const response = await api.get<CandidateInterviewsResponse>("/candidate/interviews") ; 

    return response.data.data ; 
}

// starts the selected candidate interview using its secure public access token 

export async function startInterview(accessToken: string): Promise<void> {
    const response = await api.post(`/public/interviews/${accessToken}/start`) ; 

    return response.data ; 
}

// fetches the first AI-generated question for an interview thta is already in progress

export async function getFirstQuestion(accessToken: string) {
    const response = await api.post(`/public/interviews/${accessToken}/start-question`) ; 

    return response.data.data ;
}

// Fetches the next question after the current answer has been submitted.
export async function getNextQuestion(accessToken: string) {
  const response = await api.post(
    `/public/interviews/${accessToken}/questions/next`,
  );

  return response.data;
}

// submit the candidate's spoken answer for the current question 

export async function submitCandidateAnswer(
    accessToken: string, 
    questionNumber: number, 
    audioBlob: Blob, 
    duration: number 
) {
    const formData = new FormData() ; // creatig multipart/form-data because we are uploading the audio file

    // attach the recorded WebM audio 

    formData.append(
        "audio", 
        audioBlob, 
        `question-${questionNumber}.webm`
    )

    formData.append("questionNumber", String(questionNumber)) ; // attach interview metadata 

    formData.append("duration", String(duration)) ; 

    // send the audio and metadata to the Interview Service 

    const response = await api.post(
    `/public/interviews/${accessToken}/questions/answer`,
    formData,
  );

    return response.data ; // returning the backend response 
}

export async function submitInterview(
  accessToken: string,
) {
  const response = await api.post(
    `/public/interviews/${accessToken}/submit`,
  );

  return response.data;
}

// Tell the Interview Service that the candidate wants to skip the current question.

export async function skipCandidateQuestion(
  accessToken: string,
  questionNumber: number,
) {

  const response = await api.post(
    `/public/interviews/${accessToken}/questions/skip`,
    {
      questionNumber,
    },
  );

  return response.data;
}
