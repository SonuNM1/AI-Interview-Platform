import api from "./api";

/* Uploads a resume specifically for Mock Interview RAG processing*/

export async function uploadMockInterviewResume(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/rag/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}