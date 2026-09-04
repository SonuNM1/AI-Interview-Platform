import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Mic2 } from "lucide-react";
import { toast } from "sonner";

import {
  createMockInterview,
  getMockInterviewHistory,
} from "../services/mockInterview.api";

import { uploadMockInterviewResume } from "../services/rag.api";

import { MockInterviewSetup } from "../components/mock-interview/MockInterviewSetup";
import { MockInterviewHistory } from "../components/mock-interview/MockInterviewHistory";

export function MockInterview() {
  const navigate = useNavigate();

  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["mock-interview-history"],
    queryFn: getMockInterviewHistory,
  });

  /**
   * Uploads the resume to RAG and waits for processing to complete.
   */
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMockInterviewResume(file),

    onSuccess: (response) => {
      const document = response.data;

      if (!document?._id) {
        setDocumentId(null);
        toast.error("Resume processing failed.");
        return;
      }

      setDocumentId(document._id);
      setResumeFileName(document.fileName ?? null);

      toast.success("Resume ready.");
    },

    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setDocumentId(null);

      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unable to process your resume.",
      );
    },
  });

  /**
   * Handles resume selection and starts RAG processing.
   */
  const handleResumeSelect = (file: File) => {
    setResumeFileName(file.name);
    setDocumentId(null);

    uploadMutation.mutate(file);
  };

  /**
   * Creates the mock interview using the generated RAG document.
   */
  const createMutation = useMutation({
    mutationFn: () => {
      if (!documentId) {
        throw new Error(
          "Please upload and process your resume before starting.",
        );
      }

      return createMockInterview(documentId);
    },

    onSuccess: (response) => {
      navigate(`/candidate/mock-interview/${response.data._id}`);
    },

    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unable to create mock interview.",
      );
    },
  });

  return (
    <div className="min-h-full bg-[#141311] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2A2420]">
              <Mic2
                className="h-5 w-5 text-[#D98260]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#F2EDE4]">
                Mock Interview
              </h1>

              <p className="mt-1 text-sm text-[#817A72]">
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <MockInterviewSetup
            resumeFileName={resumeFileName}
            isUploading={uploadMutation.isPending}
            isResumeReady={!!documentId}
            onResumeSelect={handleResumeSelect}
            onStart={() => createMutation.mutate()}
            isStarting={createMutation.isPending}
          />

          <MockInterviewHistory
            interviews={historyQuery.data?.data ?? []}
            isLoading={historyQuery.isLoading}
            onViewReport={(id) =>
              navigate(`/candidate/mock-interview/${id}/report`)
            }
          />
        </div>
      </div>
    </div>
  );
}