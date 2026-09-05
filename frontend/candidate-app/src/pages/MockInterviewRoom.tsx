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

import { createAudioRecorder, type AudioRecorder } from "../services/audioRecorder";


import { speakText, stopSpeaking } from "../services/textToSpeech";

import { EndMockInterviewModal } from "../components/mock-interview/EndMockInterviewModal";

import { SkipQuestionModal } from "../components/interview/SkipQuestionModal";

/**
 * Runs the live mock interview.
 *
 * Flow:
 * Question generated
 * → AI speaks question
 * → AI finishes speaking
 * → microphone starts
 * → candidate answers
 * → silence detection / manual submit
 * → answer evaluated
 * → next question generated
 * → repeat
 */
export function MockInterviewRoom() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  /*
   * Stores the active audio recorder.
   */
  const recorderRef = useRef<AudioRecorder | null>(null);

  const initialSilenceContextRef =
  useRef<AudioContext | null>(null);

  const initialSilenceAnimationFrameRef =
  useRef<number | null>(null);

  /*
   * Stores when the current recording started.
   */
  const recordingStartedAt = useRef<number | null>(null);

  /*
   * Prevents duplicate answer submissions.
   */
  const isSubmittingRef = useRef(false);

  /*
   * Prevents duplicate skip requests.
   */
  const isSkippingRef = useRef(false);

  /*
   * Prevents the same READY interview from being started
   * multiple times.
   */
  const hasStartedInterviewRef = useRef(false);

  /*
   * Keeps the latest recording function available to the
   * TTS completion callback without making the TTS effect
   * depend on the recording callback.
   */
  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const currentQuestionRef = useRef<MockInterviewQuestion | null>(null);

  const hasCandidateSpokenRef = useRef(false);

  const [currentQuestion, setCurrentQuestion] =
    useState<MockInterviewQuestion | null>(null);

  const [questionNumber, setQuestionNumber] = useState(1);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const [isPreparingRecording, setIsPreparingRecording] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  /*
   * Keep the question ref synchronized with state.
   */
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  /*
   * Load the mock interview.
   */
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

  /*
   * Starts the mock interview and generates Question 1.
   */
  const startMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return startMockInterview(id);
    },

    onSuccess: (response) => {
      const question = response.data.question;

      if (!question) {
        toast.error("The first interview question could not be generated.");

        return;
      }

      currentQuestionRef.current = question;

      setCurrentQuestion(question);

      setQuestionNumber(question.questionNumber);
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

  /*
   * Submits the candidate's recorded answer.
   */
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

  /*
   * Skips the current question.
   */
  const skipMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return skipMockInterviewQuestion(id);
    },

    onSuccess: (response) => {
      if (response.interviewCompleted) {
        stopSpeaking();
        stopRecording();

        navigate(`/candidate/mock-interview/${id}/report`);

        return;
      }

      const nextQuestion = response.data?.nextQuestion;

      if (!nextQuestion) {
        toast.error("The next interview question could not be generated.");

        return;
      }

      currentQuestionRef.current = nextQuestion;

      setCurrentQuestion(nextQuestion);

      setQuestionNumber(nextQuestion.questionNumber);

      setElapsedSeconds(0);
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

  /*
   * Manually ends the mock interview.
   */
  const endMutation = useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error("Mock interview ID is missing.");
      }

      return endMockInterview(id);
    },

    onSuccess: () => {
      stopSpeaking();
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
   * Starts a READY interview exactly once.
   */
  useEffect(() => {
    const interview = interviewQuery.data?.data?.mockInterview;

    if (
      interview?.status === "READY" &&
      !hasStartedInterviewRef.current &&
      !startMutation.isPending
    ) {
      hasStartedInterviewRef.current = true;

      startMutation.mutate();

      return;
    }

    /*
     * If the interview was already completed before
     * this page was opened, go directly to the report.
     */
    if (interview?.status === "COMPLETED") {
      navigate(`/candidate/mock-interview/${id}/report`, {
        replace: true,
      });
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
      if (recordingStartedAt.current !== null) {
        setElapsedSeconds(
          Math.floor((Date.now() - recordingStartedAt.current) / 1000),
        );
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording]);

  /**
   * Stops the Mock Interview-specific initial-silence monitor.
   *
   * This monitor only detects whether the candidate has started speaking.
   * It never submits or interrupts an answer.
   */
  const stopInitialSilenceMonitor = useCallback(() => {
    if (initialSilenceAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(initialSilenceAnimationFrameRef.current);
      initialSilenceAnimationFrameRef.current = null;
    }

    if (initialSilenceContextRef.current) {
      void initialSilenceContextRef.current.close();
      initialSilenceContextRef.current = null;
    }
  }, []);

  /**
   * Monitors only the initial 8 seconds of an answer.
   *
   * Once speech is detected, the monitor stops completely so natural
   * pauses can never auto-submit the candidate's answer.
   */
  const startInitialSilenceMonitor = useCallback(
    (stream: MediaStream) => {
      stopInitialSilenceMonitor();

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);
      const startedAt = Date.now();
      const SPEECH_THRESHOLD = 12;

      initialSilenceContextRef.current = audioContext;

      const checkVolume = () => {
        if (initialSilenceContextRef.current !== audioContext) {
          return;
        }

        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (const value of dataArray) {
          sum += Math.abs(value - 128);
        }

        const averageVolume = sum / dataArray.length;

        if (averageVolume >= SPEECH_THRESHOLD) {
          hasCandidateSpokenRef.current = true;
          stopInitialSilenceMonitor();
          return;
        }

        if (
          Date.now() - startedAt >= 8000 &&
          !hasCandidateSpokenRef.current &&
          !isSubmittingRef.current
        ) {
          setShowSkipPrompt(true);
          stopInitialSilenceMonitor();
          return;
        }

        initialSilenceAnimationFrameRef.current =
          window.requestAnimationFrame(checkVolume);
      };

      void audioContext.resume();
      initialSilenceAnimationFrameRef.current =
        window.requestAnimationFrame(checkVolume);
    },
    [stopInitialSilenceMonitor],
  );

  /**
   * Manually submits the candidate's recorded answer.
   *
   * Silence never submits the answer automatically.
   */
  const submitRecording = useCallback(async () => {
    if (
      isSubmittingRef.current ||
      !recorderRef.current ||
      !id ||
      !currentQuestionRef.current
    ) {
      return;
    }

    if (!hasCandidateSpokenRef.current) {
      setShowSkipPrompt(true);
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      stopInitialSilenceMonitor();

      const recorder = recorderRef.current;
      const audioBlob = await recorder.stop();

      const duration =
        recordingStartedAt.current !== null
          ? Math.max(
              0,
              Math.round((Date.now() - recordingStartedAt.current) / 1000),
            )
          : 0;

      recorderRef.current = null;
      recordingStartedAt.current = null;
      setIsRecording(false);
      setIsPreparingRecording(false);

      const result = await submitMutation.mutateAsync({
        audioBlob,
        duration,
      });

      if (result.interviewCompleted) {
        stopSpeaking();
        navigate(`/candidate/mock-interview/${id}/report`);
        return;
      }

      const nextQuestion = result.data?.nextQuestion;

      if (!nextQuestion) {
        throw new Error("The next interview question was not generated.");
      }

      currentQuestionRef.current = nextQuestion;
      setCurrentQuestion(nextQuestion);
      setQuestionNumber(nextQuestion.questionNumber);
      setElapsedSeconds(0);
    } catch (error: unknown) {
      console.error("Mock interview answer submission failed:", error);

      const axiosError = error as {
        response?: { data?: { message?: string } };
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
  }, [id, navigate, stopInitialSilenceMonitor, submitMutation]);

  /**
   * Starts microphone recording for the current question.
   *
   * The room-local monitor checks only whether the candidate starts speaking.
   * After speech starts, natural pauses are completely ignored.
   */
  const startRecording = useCallback(async () => {
    if (
      isRecording ||
      isPreparingRecording ||
      isProcessing ||
      !currentQuestionRef.current ||
      isSubmittingRef.current
    ) {
      return;
    }

    setIsPreparingRecording(true);

    try {
      setShowSkipPrompt(false);
      hasCandidateSpokenRef.current = false;
      stopInitialSilenceMonitor();

      const recorder = createAudioRecorder();
      recorderRef.current = recorder;

      await recorder.start();

      const stream = recorder.getStream();

      if (!stream) {
        throw new Error("Microphone stream is unavailable.");
      }

      recordingStartedAt.current = Date.now();
      setElapsedSeconds(0);
      setIsPreparingRecording(false);
      setIsRecording(true);

      startInitialSilenceMonitor(stream);
    } catch (error) {
      console.error("Unable to start recording:", error);

      stopInitialSilenceMonitor();
      recorderRef.current?.destroy();
      recorderRef.current = null;
      recordingStartedAt.current = null;
      setIsPreparingRecording(false);
      setIsRecording(false);

      toast.error("Microphone permission is required.");
    }
  }, [
    isPreparingRecording,
    isProcessing,
    isRecording,
    startInitialSilenceMonitor,
    stopInitialSilenceMonitor,
  ]);

  /*
   * Keep the latest recording callback available
   * to the TTS completion handler.
   */
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  /**
   * Stops microphone and Mock Interview-specific initial-silence resources.
   */
  const stopRecording = useCallback(() => {
    stopInitialSilenceMonitor();
    recorderRef.current?.destroy();
    recorderRef.current = null;
    recordingStartedAt.current = null;
    setIsPreparingRecording(false);
    setIsRecording(false);
    setElapsedSeconds(0);
  }, [stopInitialSilenceMonitor]);

  /**
   * Skips the current question without evaluating an answer.
   *
   * This is allowed while recording because the initial-silence modal
   * is displayed while the microphone is active.
   */
  const handleSkip = useCallback(() => {
    if (
      isProcessing ||
      skipMutation.isPending ||
      isSkippingRef.current
    ) {
      return;
    }

    isSkippingRef.current = true;
    setShowSkipPrompt(false);
    stopSpeaking();
    stopRecording();

    skipMutation.mutate(undefined, {
      onSettled: () => {
        isSkippingRef.current = false;
      },
    });
  }, [isProcessing, skipMutation, stopRecording]);

  /**
   * Speaks every newly generated question exactly once.
   *
   * The dependency is ONLY the question text.
   * Changes to recording state, timers, processing state,
   * or React Query state therefore cannot restart TTS.
   */
  useEffect(() => {
    const question = currentQuestion?.question;

    if (!question) {
      return;
    }

    /*
     * Marks whether this particular question is
     * still active.
     *
     * If the candidate moves to another question,
     * old asynchronous TTS callbacks are ignored.
     */
    let isActive = true;

    /*
     * Stop any previous speech before speaking
     * the newly generated question.
     */
    stopSpeaking();

    speakText(
      question,

      /*
       * TTS started.
       */
      () => {
        if (!isActive) {
          return;
        }

        setIsSpeaking(true);
      },

      /*
       * TTS finished.
       *
       * Only now should microphone recording begin.
       */
      () => {
        if (!isActive) {
          return;
        }

        setIsSpeaking(false);

        void startRecordingRef.current?.();
      },
    );

    /*
     * Cleanup happens only when the actual question
     * changes or the component unmounts.
     */
    return () => {
      isActive = false;

      stopSpeaking();

      stopInitialSilenceMonitor();

      recorderRef.current?.destroy();

      recorderRef.current = null;

      recordingStartedAt.current = null;
    };
  }, [currentQuestion?.question, stopInitialSilenceMonitor]);

  /*
   * Stop all resources when leaving the interview room.
   */
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopInitialSilenceMonitor();
      recorderRef.current?.destroy();
      recorderRef.current = null;
      recordingStartedAt.current = null;
    };
  }, [stopInitialSilenceMonitor]);

  /*
   * Initial page loading / first question generation.
   */
  if (interviewQuery.isLoading || startMutation.isPending) {
    return (
      <FullScreenState
        icon={<Loader2 className="h-6 w-6 animate-spin text-[#D98260]" />}
        message="Preparing your mock interview..."
      />
    );
  }

  /*
   * Failed to load the interview or no question
   * could be obtained.
   */
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
      {/* Header */}
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

      {/* Main interview area */}
      <main className="flex flex-1 items-center justify-center overflow-hidden px-5 py-8">
        <div className="w-full max-w-3xl">
          {/* Question number */}
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D98260]">
              Question {questionNumber}
            </span>
          </div>

          {/* Question */}
          <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] px-6 py-10 text-center shadow-2xl sm:px-12">
            <h1 className="text-xl font-medium leading-9 text-[#F2EDE4] sm:text-2xl">
              {currentQuestion.question}
            </h1>
          </div>

          {/* Microphone state */}
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

            {/* Status */}
            <p className="mt-4 text-sm text-[#A9A29A]">
              {isSpeaking
                ? "AI interviewer is speaking..."
                : isProcessing
                  ? "Processing your answer..."
                  : isPreparingRecording
                    ? "Preparing microphone..."
                    : isRecording
                      ? `Listening · ${formatDuration(elapsedSeconds)}`
                      : "Ready"}
            </p>

            {/* Answer actions */}
{!isSpeaking &&
  !isProcessing &&
  !isPreparingRecording &&
  !isRecording && (
    <div className="mt-5 flex items-center justify-center gap-3">
      {/* Start answer */}
      <button
        type="button"
        onClick={() => void startRecording()}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A85C42]"
      >
        <Mic className="h-4 w-4" />
        Start Answer
      </button>

      {/* Skip question */}
      <button
        type="button"
        onClick={handleSkip}
        disabled={skipMutation.isPending}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#3A3530] px-5 py-3 text-sm font-medium text-[#817A72] transition hover:border-[#5A514A] hover:text-[#F2EDE4] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipForward className="h-4 w-4" />
        {skipMutation.isPending
          ? "Skipping..."
          : "Skip Question"}
      </button>
    </div>
  )}

            {/* Manual submit */}
            {isRecording && (
              <button
                type="button"
                onClick={() => void submitRecording()}
                disabled={submitMutation.isPending || isProcessing}
                className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MicOff className="h-4 w-4" />
                Submit Answer
              </button>
            )}

            {/* Skip */}
            {!isSpeaking &&
              !isRecording &&
              !isPreparingRecording &&
              !isProcessing && (
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

      {/* Initial silence modal */}
      {showSkipPrompt && (
        <SkipQuestionModal
          isSkipping={skipMutation.isPending}
          onContinue={() => {
            setShowSkipPrompt(false);
            hasCandidateSpokenRef.current = false;

            const stream = recorderRef.current?.getStream();

            if (stream) {
              startInitialSilenceMonitor(stream);
            }
          }}
          onSkip={() => {
            handleSkip();
          }}
        />
      )}

      {/* End interview modal */}
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

/**
 * Displays a full-screen loading/error state.
 */
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

/**
 * Formats recording duration as MM:SS.
 */
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);

  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
}
