import api from "./api";

// Types 

export type MockInterviewStatus =
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface MockInterview {
  _id: string;
  userId: string;
  documentId: string;
  status: MockInterviewStatus;
  totalQuestions: number;
  currentQuestion: number;
  score?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RagDocument {
  _id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  extractedText: string;
  status: "PROCESSING" | "READY" | "FAILED";
}

export interface MockInterviewQuestion {
  _id: string;
  mockInterviewId: string;
  questionNumber: number;
  question: string;
  candidateAnswer?: string;
  answerTranscript?: string;
  score?: number;
  feedback?: string;
  askedAt: string;
  answeredAt?: string;
  duration?: number;
  answerProcessing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockInterviewReport {
  _id: string;
  mockInterviewId: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  recommendation:
    | "Strong"
    | "Good"
    | "Needs Improvement";
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockInterviewDetails {
  mockInterview: MockInterview;
  questions: MockInterviewQuestion[];
  report: MockInterviewReport | null;
}

// Response types 

interface MockInterviewResponse {
  success: boolean;
  data: MockInterview;
}

interface StartMockInterviewResponse {
  success: boolean;
  data: {
    mockInterview: MockInterview;
    question: MockInterviewQuestion;
  };
}

interface MockInterviewDetailsResponse {
  success: boolean;
  data: MockInterviewDetails;
}

interface MockInterviewHistoryResponse {
  success: boolean;
  data: MockInterview[];
}

// API Functions 

// Creates a new mock interview using the selected resume.

export async function createMockInterview(
  documentId: string,
) {
  const response =
    await api.post<MockInterviewResponse>(
      "/mock-interviews",
      {
        documentId,
      },
    );

  return response.data;
}

// Fetches the candidate's previous mock interviews.
export async function getMockInterviewHistory() {
  const response =
    await api.get<MockInterviewHistoryResponse>(
      "/mock-interviews/history",
    );

  return response.data;
}

// Starts a mock interview and generates Question 1.
export async function startMockInterview(
  mockInterviewId: string,
) {
  const response =
    await api.post<StartMockInterviewResponse>(
      `/mock-interviews/${mockInterviewId}/start`,
    );

  return response.data;
}

// Submits the candidate's recorded audio answer.
export async function submitMockInterviewAnswer(
  mockInterviewId: string,
  audioBlob: Blob,
  duration: number,
) {
  const formData = new FormData();

  // The backend expects the audio under the "audio" field.
  formData.append(
    "audio",
    audioBlob,
    "mock-interview-answer.webm",
  );

  // The backend stores the candidate's speaking duration.
  formData.append(
    "duration",
    String(duration),
  );

  const response = await api.post(
    `/mock-interviews/${mockInterviewId}/answer`,
    formData,
  );

  return response.data;
}

// Skips the current question and records it as 0/10.
export async function skipMockInterviewQuestion(
  mockInterviewId: string,
) {
  const response = await api.post(
    `/mock-interviews/${mockInterviewId}/skip`,
  );

  return response.data;
}

// Manually ends the mock interview and generates its report.
export async function endMockInterview(
  mockInterviewId: string,
) {
  const response = await api.post(
    `/mock-interviews/${mockInterviewId}/end`,
  );

  return response.data;
}

// Fetches one mock interview with all generated questions and report.
export async function getMockInterview(
  mockInterviewId: string,
) {
  const response =
    await api.get<MockInterviewDetailsResponse>(
      `/mock-interviews/${mockInterviewId}`,
    );

  return response.data;
}

// Fetches the final report for a completed mock interview.
export async function getMockInterviewReport(
  mockInterviewId: string,
) {
  const response = await api.get(
    `/mock-interviews/${mockInterviewId}/report`,
  );

  return response.data;
}

// Fetches the RAG document created from the candidate's existing uploaded resume.
export async function getResumeRagDocument(
  fileId: string,
): Promise<RagDocument> {
  const response = await api.get(
    `/rag/document/resume/${fileId}`,
  );

  return response.data.data;
}