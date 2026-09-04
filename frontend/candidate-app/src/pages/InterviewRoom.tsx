import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FiClock, FiPhoneOff } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  getFirstQuestion,
  submitCandidateAnswer,
  skipCandidateQuestion,
  getNextQuestion,
  getPublicInterview,
  submitInterview,
} from "../services/interview.api";
import interviewerImage from "../assets/interviewer.png";
import { speakText, stopSpeaking } from "../services/textToSpeech";
import {
  createAudioRecorder,
  type AudioRecorder,
} from "../services/audioRecorder";
import {
  createSilenceDetector,
  type SilenceDetector,
} from "../services/silenceDetector";
import { SkipQuestionModal } from "../components/interview/SkipQuestionModal";
import { InterviewTimer } from "../components/interview/InterviewTimer";
import { EndInterviewModal } from "../components/interview/EndInterviewModal";

interface InterviewQuestion {
  _id: string;
  interviewId: string;
  questionNumber: number;
  question: string;
  type: string;
  generatedBy: string;
  candidateAnswer?: string;
  answerTranscript?: string;
  duration?: number;
  score?: number;
  feedback?: string;
  answeredAt?: string;
}

// AI Interviewer room

export function InterviewRoom() {
  const { accessToken } = useParams<{ accessToken: string }>();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [showEndInterviewModal, setShowEndInterviewModal] = useState(false);

  const isSkippingQuestion = useRef(false);

  const recorderRef = useRef<AudioRecorder | null>(null);

  const silenceDetectorRef = useRef<SilenceDetector | null>(null);
  const recordingStartedAt = useRef<number | null>(null);

  const isSubmittingAnswer = useRef(false);

  // fetches the first AI-generated interview question

  const {
    data: interview,
    isLoading: isInterviewLoading,
    isError: isInterviewError,
  } = useQuery({
    queryKey: ["public-interview", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Interview access token is missing.");
      }

      return getPublicInterview(accessToken);
    },
    enabled: !!accessToken,
  });

  const scheduledTime = interview?.scheduledAt
    ? new Date(interview.scheduledAt).getTime()
    : null;

  const timeLeft =
    scheduledTime !== null ? Math.max(0, scheduledTime - now) : null;

  const isBeforeScheduledTime = timeLeft !== null && timeLeft > 0;

  const formatCountdown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // fetch the first interview question

  const {
    data: firstQuestion,
    isLoading: isQuestionLoading,
    isError: isQuestionError,
  } = useQuery({
    queryKey: ["interview-first-question", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Interview access token is missing.");
      }

      return getFirstQuestion(accessToken);
    },
    enabled: !!accessToken && interview?.status === "IN_PROGRESS",
  });

  const [nextQuestion, setNextQuestion] = useState<InterviewQuestion | null>(
    null,
  );

  const currentQuestion = nextQuestion ?? firstQuestion ?? null;

  const questionNumber = currentQuestion?.questionNumber;

  // Handles the moment when the silence detector determines that the candidate has finished answering.

  const handleCandidateSilence = useCallback(async (): Promise<void> => {
    if (
      isSubmittingAnswer.current ||
      !recorderRef.current ||
      !questionNumber ||
      !accessToken
    ) {
      return;
    }

    isSubmittingAnswer.current = true;
    setIsSubmitting(true);

    const submittedQuestionNumber = questionNumber;

    try {
      // Stop silence detection.
      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      // Stop recording and get complete audio.
      const audioBlob = await recorderRef.current.stop();

      setIsRecording(false);

      const duration = recordingStartedAt.current
        ? Math.round((Date.now() - recordingStartedAt.current) / 1000)
        : 0;

      recordingStartedAt.current = null;
      recorderRef.current = null;

      // Clear any previous transcript before showing the new one.
      setTranscript("");

      // Send answer to backend.
      const result = await submitCandidateAnswer(
        accessToken,
        submittedQuestionNumber,
        audioBlob,
        duration,
      );

      const finalTranscript = result?.data?.transcript ?? "";

      setTranscript(finalTranscript);

      if (result?.interviewCompleted) {
        setIsInterviewCompleted(true);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1800));

      const nextResult = await getNextQuestion(accessToken);

      if (nextResult?.interviewCompleted) {
        console.log("Interview completed.");
        return;
      }

      if (nextResult?.data) {
        // Clear old answer only when new question is ready.
        setTranscript("");

        setNextQuestion(nextResult.data);
      }

      console.log("Candidate answer submitted successfully.");
    } catch (error) {
      console.error("Failed to submit candidate answer:", error);

      setIsRecording(false);
    } finally {
      isSubmittingAnswer.current = false;
      setIsSubmitting(false);
    }
  }, [accessToken, questionNumber]);

  // Skips the current question and asks the Interview Service to generate the next one.

  const handleSkipQuestion = useCallback(async (): Promise<void> => {
    // Prevent duplicate skip requests.
    if (isSkippingQuestion.current || !accessToken || !questionNumber) {
      return;
    }

    isSkippingQuestion.current = true;

    try {
      // Stop the silence detector before skipping the question.
      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      // Stop and destroy the current recorder.
      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;

      setIsRecording(false);
      setShowSkipPrompt(false);
      setTranscript("");

      // Tell the Interview Service to skip the current question.
      const result = await skipCandidateQuestion(accessToken, questionNumber);

      // The final question can be skipped and complete the interview.

      if (result?.interviewCompleted) {
        console.log("Interview completed after skipping final question.");
        return;
      }

      if (result?.interviewCompleted) {
        setIsInterviewCompleted(true);
        return;
      }

      if (result?.data?.nextQuestion) {
        setNextQuestion(result.data.nextQuestion);
      }
    } catch (error) {
      console.error("Failed to skip interview question:", error);
    } finally {
      isSkippingQuestion.current = false;
    }
  }, [accessToken, questionNumber]);

  const handleInitialSilence = useCallback(() => {
    setShowSkipPrompt(true);
  }, []);

  // Automatically starts microphone recording after the AI interviewer finishes speaking.

  const startCandidateRecording = useCallback(async (): Promise<void> => {
    if (!questionNumber || isSubmittingAnswer.current) {
      return;
    }

    if (recorderRef.current) {
      return;
    }

    try {
      setShowSkipPrompt(false);
      setTranscript("");

      const recorder = createAudioRecorder();

      recorderRef.current = recorder;

      await recorder.start();

      recordingStartedAt.current = Date.now();

      setIsRecording(true);

      const stream = recorder.getStream();

      if (!stream) {
        throw new Error("Microphone stream is unavailable.");
      }

      const silenceDetector = createSilenceDetector(
        stream,
        handleCandidateSilence,
        handleInitialSilence,
      );

      silenceDetectorRef.current = silenceDetector;

      silenceDetector.start();
    } catch (error) {
      console.error("Failed to start microphone recording:", error);

      setIsRecording(false);

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;
    }
  }, [handleCandidateSilence, handleInitialSilence, questionNumber]);

  const handleInterviewTimeExpired = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      recorderRef.current?.destroy();
      recorderRef.current = null;

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      setIsRecording(false);

      await submitInterview(accessToken);

      setIsInterviewCompleted(true);
    } catch (error) {
      console.error("Failed to submit interview after time expired:", error);
    }
  }, [accessToken]);

  const handleEndInterview = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      stopSpeaking();

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;

      setIsRecording(false);

      await submitInterview(accessToken);

      setShowEndInterviewModal(false);
      setIsInterviewCompleted(true);
    } catch (error) {
      console.error("Failed to end interview:", error);
    }
  }, [accessToken]);

  // Speaks every newly displayed interview question and starts candidate recording afterwards

  useEffect(() => {
    if (!currentQuestion?.question) {
      return;
    }

    speakText(
      currentQuestion.question,

      // AI speech started.
      () => {
        setIsSpeaking(true);
      },

      // AI speech finished.
      () => {
        setIsSpeaking(false);
        void startCandidateRecording();
      },
    );

    // Clean up speech and microphone resources when the question changes
    // or when the interview room is unmounted.
    return () => {
      stopSpeaking();

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;
    };
  }, [currentQuestion?.question, startCandidateRecording]);

  if (isInterviewLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0E1117] text-[#F2F4F7]">
        <p className="text-sm text-[#8B95A5]">Loading interview...</p>
      </div>
    );
  }

  if (isInterviewError || !interview) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0E1117] px-4 text-[#F2F4F7]">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Unable to load interview</h1>

          <p className="mt-2 text-sm text-[#8B95A5]">
            The interview could not be loaded. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (interview?.status === "SCHEDULED" && isBeforeScheduledTime) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[#3A332E] bg-[#1B1917] p-7 text-center shadow-2xl">
          <p className="text-sm font-medium text-[#B9674B]">
            Interview scheduled
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#F2EDE4]">
            {interview.title}
          </h2>

          <p className="mt-2 text-sm text-[#817A72]">{interview.role}</p>

          <div className="mt-7 rounded-xl border border-[#332B27] bg-[#211E1B] p-5">
            <p className="text-sm text-[#9B9188]">Interview starts in</p>

            <p className="mt-2 font-mono text-4xl font-semibold tracking-wider text-[#D98260]">
              {formatCountdown(timeLeft ?? 0)}
            </p>

            <p className="mt-3 text-xs text-[#817A72]">
              You can start the interview when the scheduled time arrives.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isInterviewCompleted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0E1117] px-4 text-[#F2F4F7]">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#151A23] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <span className="text-3xl text-emerald-400">✓</span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold">Interview Completed</h1>

          <p className="mt-3 text-sm leading-relaxed text-[#8B95A5]">
            Thank you for completing the interview. Your responses have been
            submitted successfully.
          </p>

          <p className="mt-6 text-xs text-[#6F7887]">
            You may now safely close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0E1117] text-[#F2F4F7]">
      {/* Interview Header */}

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 lg:px-6">
        <div>
          <h1 className="text-lg font-semibold">AI Interview</h1>

          <div className="mt-1 flex items-center gap-2 text-xs text-[#8B95A5]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Interview in progress
          </div>
        </div>

        {/* Interview timer - actual timer will be connected later */}
        <div className="hidden items-center gap-2 text-sm text-[#AAB2BF] sm:flex">
          <FiClock className="h-4 w-4" />
          {interview?.startedAt && (
            <InterviewTimer
              startedAt={interview.startedAt}
              duration={interview.duration}
              onTimeExpired={handleInterviewTimeExpired}
            />
          )}
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          onClick={() => setShowEndInterviewModal(true)}
        >
          <FiPhoneOff className="h-4 w-4" />
          End Interview
        </button>
      </header>

      {/* main interview area */}

      <main className="grid min-h-0 flex-1 gap-3 overflow-hidden p-2 sm:p-3 lg:grid-cols-[1.05fr_0.95fr] lg:p-4">
        {/* left ai-interview */}

        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#151A23]">
          {/* Replace this image with the final interviewer asset */}

          <img
            src={interviewerImage}
            alt="AI Interviewer"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark overlay keeps the image integrated with the UI */}

          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10]/80 via-transparent to-transparent" />

          {/* Subtle blue glow while the AI is speaking */}

          {isSpeaking && (
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-blue-500/5" />
          )}

          {/* AI interviewer status */}

          <div className="mt-2 rounded-xl border border-blue-500/20 bg-[#10151E] p-3 lg:p-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <div>
              <p className="text-sm font-medium">AI Interviewer</p>

              <p className="text-xs text-[#8B95A5]">
                {isSpeaking
                  ? "Speaking..."
                  : isQuestionLoading
                    ? "Preparing your interview..."
                    : "Ready to interview"}
              </p>
            </div>
          </div>
        </section>

        {/* right - interview action */}

        <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
          {/* current question */}

          <div className="shrink-0 rounded-2xl border border-white/10 bg-[#151A23] p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#8B95A5]">
                  Current Question
                </p>

                <p className="mt-1 text-xs text-[#6F7887]">
                  Question {currentQuestion?.questionNumber ?? 1}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-blue-500/20 bg-[#10151E] p-3.5 lg:p-4">
              <p className="text-base leading-snug font-medium text-[#F2F4F7] lg:text-lg">
                {isQuestionLoading
                  ? "Preparing your first question..."
                  : isQuestionError
                    ? "Unable to load the interview question."
                    : (currentQuestion?.question ??
                      "No question received from the server.")}
              </p>
            </div>

            {/* AI voice status and animated waveform */}

            <div className="mt-2 flex items-center gap-3 text-sm text-blue-400">
              {/* animated voice waveform */}

              <div className="flex h-5 items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 rounded-full bg-blue-400 transition-all ${
                      isSpeaking ? "animate-pulse" : "h-1.5"
                    }`}
                    style={
                      isSpeaking
                        ? {
                            height: `${8 + (bar % 4) * 5}px`,
                            animationDelay: `${bar * 80}ms`,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* current AI state */}

              <span>
                {isQuestionLoading
                  ? "Preparing your interview..."
                  : isSpeaking
                    ? "AI Interviewer is speaking..."
                    : "AI Interviewer is ready"}
              </span>
            </div>
          </div>

          {/* candidate answer */}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151A23] p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Your Answer</p>

              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready
              </div>
            </div>

            {/* Voice interaction area */}

            <div className="mt-2 flex flex-1 flex-col items-center justify-center">
              {/* Explains the current microphone state to the candidate. */}
              <p className="mt-3 text-sm text-[#AAB2BF]">
                {isRecording
                  ? "Listening... speak naturally."
                  : isSpeaking
                    ? "Please wait while the AI interviewer is speaking."
                    : "Your microphone will start automatically"}
              </p>

              {/* Placeholder for live transcription */}

              <div className="mt-3 w-full rounded-xl border border-white/10 bg-[#10151E] p-3">
                <p className="text-xs font-medium text-[#6F7887]">
                  {isSubmitting ? "PROCESSING ANSWER" : "TRANSCRIPTION"}
                </p>

                <p className="mt-2 max-h-16 overflow-y-auto text-sm leading-relaxed text-[#AAB2BF]">
                  {transcript ||
                    (isRecording
                      ? "Listening...your answer is being recorded."
                      : "Your spoken answer will appear here...")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* show the skip prompt when the candidate remains silent initially */}

      {showSkipPrompt && (
        <SkipQuestionModal
          onContinue={() => {
            setShowSkipPrompt(false);
            silenceDetectorRef.current?.resume();
          }}
          onSkip={() => {
            void handleSkipQuestion();
          }}
        />
      )}

      {/* modal */}

      <EndInterviewModal
        isOpen={showEndInterviewModal}
        isSubmitting={isSubmitting}
        onCancel={() => setShowEndInterviewModal(false)}
        onConfirm={() => {
          void handleEndInterview();
        }}
      />
    </div>
  );
}
