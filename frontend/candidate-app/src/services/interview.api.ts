import api from "./api";

// interview returned by the Interview service for the authenticated candidate

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

    createdAt: string ; 
    updatedAt: string ; 
}

// response returned by the candidate itnerviews API 

export interface CandidateInterviewsResponse {
    success: boolean; 
    count: number ; 
    data: CandidateInterview[]
}

// fetch all interviews assigned to the currently authenticated candidate 

export async function getCandidateInterviews(): Promise<CandidateInterview[]> {
    const response = await api.get<CandidateInterviewsResponse>("/candidate/interviews") ; 

    return response.data.data ; 
}

// starts the selected candidate interview using its secure public access token 

export async function startInterview(accessToken: string): Promise<void> {
    await api.post(`/public/interviews/${accessToken}/start`) ; 
}

// fetches the first AI-generated question for an interview thta is already in progress

export async function getFirstQuestion(accessToken: string) {
    const response = await api.post(`/public/interviews/${accessToken}/start-question`) ; 

    return response.data.data ;
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