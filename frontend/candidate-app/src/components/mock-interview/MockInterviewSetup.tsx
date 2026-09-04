import type { ChangeEvent } from "react";
import { useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  Upload,
} from "lucide-react";

interface MockInterviewSetupProps {
  resumeFileName: string | null;
  isUploading: boolean;
  isResumeReady: boolean;
  onResumeSelect: (file: File) => void;
  onStart: () => void;
  isStarting: boolean;
}

/**
 * Allows the candidate to upload a resume and start a mock interview*/

export function MockInterviewSetup({
  resumeFileName,
  isUploading,
  isResumeReady,
  onResumeSelect,
  onStart,
  isStarting,
}: MockInterviewSetupProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canStart =
    isResumeReady &&
    !isUploading &&
    !isStarting;

  /**
   * Validates the selected PDF before starting RAG processing.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      event.target.value = "";
      return;
    }

    onResumeSelect(file);

    event.target.value = "";
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
      {/* Header */}
      <div className="border-b border-[#2F2B27] px-6 py-5">
        <h2 className="text-lg font-semibold text-[#F2EDE4]">
          Start a Mock Interview
        </h2>

        <p className="mt-1 text-sm text-[#817A72]">
          Upload your resume to get personalized technical questions.
        </p>
      </div>

      <div className="p-6">
        {/* Upload area */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#3A342F] bg-[#181715] px-5 py-6 text-left transition hover:border-[#B9674B] hover:bg-[#1D1A18] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2A2420]">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#D98260]" />
            ) : isResumeReady ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Upload
                className="h-5 w-5 text-[#D98260]"
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isUploading ? (
              <>
                <p className="text-sm font-medium text-[#F2EDE4]">
                  Preparing resume...
                </p>

                <p className="mt-1 truncate text-xs text-[#817A72]">
                  {resumeFileName}
                </p>
              </>
            ) : isResumeReady ? (
              <>
                <p className="text-sm font-medium text-[#F2EDE4]">
                  Resume ready
                </p>

                <p className="mt-1 truncate text-xs text-[#817A72]">
                  {resumeFileName}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#F2EDE4]">
                  Upload resume
                </p>

                <p className="mt-1 text-xs text-[#817A72]">
                  PDF only
                </p>
              </>
            )}
          </div>

          {!isUploading && (
            <span className="shrink-0 text-xs font-medium text-[#D98260]">
              {isResumeReady ? "Change" : "Choose file"}
            </span>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Small interview details */}
        <div className="mt-5 flex items-center gap-6 text-xs text-[#817A72]">
          <span>
            <span className="text-[#D7CFC5]">5</span> questions
          </span>

          <span className="h-1 w-1 rounded-full bg-[#4A443E]" />

          <span>
            <span className="text-[#D7CFC5]">Technical</span>
          </span>

          <span className="h-1 w-1 rounded-full bg-[#4A443E]" />

          <span>Resume based</span>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#B9674B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-4 w-4" />

          {isStarting
            ? "Preparing Interview..."
            : "Start Mock Interview"}
        </button>
      </div>
    </section>
  );
}