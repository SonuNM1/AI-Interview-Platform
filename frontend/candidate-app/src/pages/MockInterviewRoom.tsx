import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Loader2, Mic, MicOff, PhoneOff, SkipForward } from "lucide-react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  endMockInterview,
  getMockInterview,
  skipMockInterviewQuestion,
  startMockInterview,
  submitMockInterviewAnswer,
  type MockInterviewQuestion,
} from "../services/mockInterview.api";

import {
  createAudioRecorder,
  type AudioRecorder,
} from "../services/audioRecorder";

import {
  createSilenceDetector,
  type SilenceDetector,
} from "../services/silenceDetector";

import { speakText, stopSpeaking } from "../services/textToSpeech";

import { EndMockInterviewModal } from "../components/mock-interview/EndMockInterviewModal";
import { SkipQuestionModal } from "../components/interview/SkipQuestionModal";

/**
 * Runs the live mock interview.
 * Handles TTS, automatic recording, silence detection, skipping and completion.
 */
export function MockInterviewRoom() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const recordingStartedAt = useRef<number | null>(null);

  const isSubmittingRef = useRef(false);

  const isSkippingRef = useRef(false);

  const [currentQuestion, setCurrentQuestion] =
    useState<MockInterviewQuestion | null>(null);

  const [questionNumber, setQuestionNumber] = useState(1);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  const interviewQuery = useQuery({
    queryKey: ["mock-interview", id],

    queryFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return getMockInterview(id);
    },

    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return startMockInterview(id);
    },

    onSuccess: (response) => {
      setCurrentQuestion(response.data.question);

      setQuestionNumber(response.data.question.questionNumber);
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
          "Unable to start mock interview.",
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({
      audioBlob,
      duration,
    }: {
      audioBlob: Blob;
      duration: number;
    }) => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return submitMockInterviewAnswer(id, audioBlob, duration);
    },
  });

  const skipMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return skipMockInterviewQuestion(id);
    },

    onSuccess: (response) => {
      if (response.interviewCompleted) {
        navigate(`/candidate/mock-interview/${id}/report`);
        return;
      }

      const nextQuestion = response.data?.nextQuestion;

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setQuestionNumber(nextQuestion.questionNumber);
        setElapsedSeconds(0);
      }
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
          "Unable to skip question.",
      );
    },
  });

  const endMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return endMockInterview(id);
    },

    onSuccess: () => {
      stopRecording();

      navigate(`/candidate/mock-interview/${id}/report`);
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
          "Unable to end mock interview.",
      );
    },
  });

  /**
   * Starts a READY mock interview automatically.
   */
  useEffect(() => {
    const interview = interviewQuery.data?.data?.mockInterview;

    if (
      interview?.status === "READY" &&
      !startMutation.isPending &&
      !startMutation.isSuccess
    ) {
      startMutation.mutate();
    }

    if (interview?.status === "COMPLETED") {
      navigate(`/candidate/mock-interview/${id}/report`, { replace: true });
    }
  }, [interviewQuery.data, id, navigate, startMutation]);

  /**
   * Keeps track of the current answer duration.
   */
  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      if (recordingStartedAt.current) {
        setElapsedSeconds(
          Math.floor((Date.now() - recordingStartedAt.current) / 1000),
        );
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording]);

  /**
   * Submits the current recorded answer and loads the next question.
   */
  const submitRecording = useCallback(async () => {
    if (
      isSubmittingRef.current ||
      !recorderRef.current ||
      !id ||
      !currentQuestion
    ) {
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      const audioBlob = await recorderRef.current.stop();

      const duration = recordingStartedAt.current
        ? Math.round((Date.now() - recordingStartedAt.current) / 1000)
        : 0;

      recorderRef.current = null;
      recordingStartedAt.current = null;

      setIsRecording(false);

      const result = await submitMutation.mutateAsync({
        audioBlob,
        duration,
      });

      if (result.interviewCompleted) {
        navigate(`/candidate/mock-interview/${id}/report`);
        return;
      }

      const nextQuestion = result.data?.nextQuestion;

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);

        setQuestionNumber(nextQuestion.questionNumber);

        setElapsedSeconds(0);
      }
    } catch (error: unknown) {
      console.error("Mock interview answer submission failed:", error);

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
          "Unable to submit your answer.",
      );
    } finally {
      isSubmittingRef.current = false;
      setIsProcessing(false);
    }
  }, [currentQuestion, id, navigate, submitMutation]);

  /**
   * Shows the skip prompt when the candidate has not started speaking.
   */
  const handleInitialSilence = useCallback(() => {
    setShowSkipPrompt(true);
  }, []);

  /**
   * Starts recording after the AI finishes speaking.
   */
  const startRecording = useCallback(async () => {
    if (
      isRecording ||
      isProcessing ||
      !currentQuestion ||
      isSubmittingRef.current
    ) {
      return;
    }

    try {
      setShowSkipPrompt(false);

      const recorder = createAudioRecorder();

      recorderRef.current = recorder;

      await recorder.start();

      recordingStartedAt.current = Date.now();

      setElapsedSeconds(0);

      

      const detector = createSilenceDetector(
        stream,
        submitRecording,
        handleInitialSilence,
      );

      silenceDetectorRef.current = detector;

      detector.start();
    } catch (error) {
      console.error("Unable to start recording:", error);

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;

      setIsRecording(false);

      toast.error("Microphone permission is required.");
    }
  }, [
    currentQuestion,
    handleInitialSilence,
    isProcessing,
    isRecording,
    submitRecording,
  ]);

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  /**
   * Stops all microphone and silence detector resources.
   */
  function stopRecording() {
    silenceDetectorRef.current?.stop();
    silenceDetectorRef.current = null;

    recorderRef.current?.destroy();
    recorderRef.current = null;

    recordingStartedAt.current = null;

    setIsRecording(false);
  }

  /**
   * Skips the current question without displaying evaluation feedback.
   */
  const handleSkip = useCallback(() => {
    if (
      isRecording ||
      isProcessing ||
      skipMutation.isPending ||
      isSkippingRef.current
    ) {
      return;
    }

    isSkippingRef.current = true;
    setShowSkipPrompt(false);

    skipMutation.mutate(undefined, {
      onSettled: () => {
        isSkippingRef.current = false;
      },
    });
  }, [isProcessing, isRecording, skipMutation]);

  /**
 * Speaks each new question once and starts recording after the AI finishes speaking.
 */
useEffect(() => {
  const question = currentQuestion?.question;

  if (!question) {
    return;
  }

  let isActive = true;

  // Stop any previous speech before speaking the new question.
  stopSpeaking();

  speakText(
    question,

    () => {
      if (!isActive) {
        return;
      }

      setIsSpeaking(true);
    },

    () => {
      if (!isActive) {
        return;
      }

      setIsSpeaking(false);

      void startRecordingRef.current?.();
    },
  );

  return () => {
    isActive = false;

    stopSpeaking();

    silenceDetectorRef.current?.stop();
    silenceDetectorRef.current = null;

    recorderRef.current?.destroy();
    recorderRef.current = null;

    recordingStartedAt.current = null;

    setIsSpeaking(false);
    setIsRecording(false);
  };
}, [currentQuestion?.question]);

  if (interviewQuery.isLoading || startMutation.isPending) {
    return (
      <FullScreenState
        icon={<Loader2 className="h-6 w-6 animate-spin text-[#D98260]" />}
        message="Preparing your mock interview..."
      />
    );
  }

  if (interviewQuery.isError || !currentQuestion) {
    return (
      <FullScreenState
        icon={<MicOff className="h-6 w-6 text-red-400" />}
        message="Unable to load the mock interview."
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#141311] text-[#F2EDE4]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#2F2B27] px-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold">Mock Interview</p>

          <p className="text-xs text-[#6F6962]">
            Question {questionNumber} of 5
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEndModalOpen(true)}
          disabled={isProcessing || endMutation.isPending}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PhoneOff className="h-4 w-4" />
          End Interview
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-hidden px-5 py-8">
        <div className="w-full max-w-3xl">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D98260]">
              Question {questionNumber}
            </span>
          </div>

          <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] px-6 py-10 text-center shadow-2xl sm:px-12">
            <h1 className="text-xl font-medium leading-9 text-[#F2EDE4] sm:text-2xl">
              {currentQuestion.question}
            </h1>
          </div>

          <div className="mt-10 flex flex-col items-center">
            <div
              className={`
                flex h-20 w-20 items-center justify-center rounded-full transition
                ${
                  isRecording
                    ? "bg-[#7A3327] ring-4 ring-[#D98260]/20"
                    : "bg-[#2A2420]"
                }
              `}
            >
              {isRecording ? (
                <Mic className="h-8 w-8 text-[#F2EDE4]" />
              ) : (
                <MicOff className="h-8 w-8 text-[#D98260]" />
              )}
            </div>

            <p className="mt-4 text-sm text-[#A9A29A]">
              {isSpeaking
                ? "AI interviewer is speaking..."
                : isProcessing
                  ? "Processing your answer..."
                  : isRecording
                    ? `Listening · ${formatDuration(elapsedSeconds)}`
                    : "Preparing microphone..."}
            </p>

            {!isSpeaking && !isProcessing && !isRecording && (
              <button
                type="button"
                onClick={() => void startRecording()}
                className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A85C42]"
              >
                <Mic className="h-4 w-4" />
                Start Answer
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={() => void submitRecording()}
                className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A85C42]"
              >
                <MicOff className="h-4 w-4" />
                Submit Answer
              </button>
            )}

            {!isSpeaking && !isRecording && !isProcessing && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={skipMutation.isPending}
                className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-medium text-[#817A72] transition hover:text-[#F2EDE4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SkipForward className="h-3.5 w-3.5" />

                {skipMutation.isPending ? "Skipping..." : "Skip Question"}
              </button>
            )}
          </div>
        </div>
      </main>

      {showSkipPrompt && (
        <SkipQuestionModal
          onContinue={() => {
            setShowSkipPrompt(false);
            silenceDetectorRef.current?.resume();
          }}
          onSkip={() => {
            handleSkip();
          }}
        />
      )}

      <EndMockInterviewModal
        open={isEndModalOpen}
        isEnding={endMutation.isPending}
        onCancel={() => setIsEndModalOpen(false)}
        onConfirm={() => {
          stopSpeaking();
          stopRecording();
          setIsEndModalOpen(false);
          endMutation.mutate();
        }}
      />
    </div>
  );
}

function FullScreenState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#141311]">
      <div className="flex items-center gap-3 text-sm text-[#817A72]">
        {icon}
        {message}
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
}
