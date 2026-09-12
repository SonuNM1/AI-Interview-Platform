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
 * Allows the candidate to upload a resume and start a mock interview
 */
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
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
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
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900">
          Start a Mock Interview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload your resume to get personalized technical questions.
        </p>
      </div>

      <div className="p-6">
        {/* Upload area */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-left transition hover:border-violet-300 hover:bg-violet-50/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
            ) : isResumeReady ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Upload
                className="h-5 w-5 text-violet-600"
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isUploading ? (
              <>
                <p className="text-sm font-semibold text-slate-900">
                  Preparing resume...
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {resumeFileName}
                </p>
              </>
            ) : isResumeReady ? (
              <>
                <p className="text-sm font-semibold text-slate-900">
                  Resume ready
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {resumeFileName}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-900">
                  Upload resume
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PDF only
                </p>
              </>
            )}
          </div>

          {!isUploading && (
            <span className="shrink-0 text-xs font-semibold text-violet-600">
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
        <div className="mt-5 flex items-center gap-6 text-xs text-slate-400">
          <span>
            <span className="font-medium text-slate-700">
              5
            </span>{" "}
            questions
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>
            <span className="font-medium text-slate-700">
              Technical
            </span>
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>Resume based</span>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
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