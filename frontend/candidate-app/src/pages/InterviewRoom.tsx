import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FiClock, FiPhoneOff } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  getFirstQuestion,
  submitCandidateAnswer,
  skipCandidateQuestion,
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

  const [isSpeaking, setIsSpeaking] = useState(false); // tracks whethe the AI interviewer is currently speaking

  const [isRecording, setIsRecording] = useState(false); // tracks whether the candidate is currently recording an answer

  const [transcript, setTranscript] = useState(""); // stores the transcript returned by the Interview service after the candidate's audio has been processed

  const [showSkipPrompt, setShowSkipPrompt] = useState(false); // shows the "dont know/skip" prompt when the candidate has not spoken for several seconds

  const isSkippingQuestion = useRef(false); // prevents multiple skip requests

  const recorderRef = useRef<AudioRecorder | null>(null); // keeps the audio recorder instance alive across renders

  const silenceDetectorRef = useRef<SilenceDetector | null>(null);

  // sores when candidate recording started. Used to calculate answer duration

  const recordingStartedAt = useRef<number | null>(null);

  // prevents multiple silence events froom submitting the same answer more than once

  const isSubmittingAnswer = useRef(false);

  // fetches the first AI-generated interview question

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interview-first-question", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Interview access token is missing.");
      }
      return getFirstQuestion(accessToken);
    },
    enabled: !!accessToken,
  });

  const [nextQuestion, setNextQuestion] = useState<InterviewQuestion | null>(
    null,
  );

  const currentQuestion = nextQuestion ?? data ?? null;

  const questionNumber = currentQuestion?.questionNumber;

  // handles the moment when the silence detector determines that the candidate has finished answering

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

    const submittedQuestionNumber = questionNumber;

    try {
      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      const audioBlob = await recorderRef.current.stop();

      setIsRecording(false);

      const duration = recordingStartedAt.current
        ? Math.round((Date.now() - recordingStartedAt.current) / 1000)
        : 0;

      recordingStartedAt.current = null;
      recorderRef.current = null;

      const result = await submitCandidateAnswer(
        accessToken,
        submittedQuestionNumber,
        audioBlob,
        duration,
      );

      setTranscript(result?.data?.transcript ?? ""); // Show transcript returned by backend.

      // Interview finished.

      if (result?.interviewCompleted) {
        console.log("Interview completed");
        return;
      }

      // Move to the next question.

      if (result?.data?.nextQuestion) {
        setNextQuestion(result.data.nextQuestion);
        setTranscript("");
      }

      console.log("Candidate answer submitted successfully");
    } catch (error) {
      console.error("Failed to submit candidate answer:", error);

      setIsRecording(false);
    } finally {
      isSubmittingAnswer.current = false;
    }
  }, [accessToken, currentQuestion]);

  // candidate has not spoken for the initial waiting period. Do not submit an empty answer

  const handleInitialSilence = useCallback(() => {
    setShowSkipPrompt(true);
  }, []);

  const handleSkipQuestion = useCallback(async (): Promise<void> => {
    if (isSkippingQuestion.current || !accessToken || !questionNumber) {
      return;
    }

    isSkippingQuestion.current = true;

    try {
      // Stop microphone detection.
      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      // Stop and destroy current recorder.
      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;

      setIsRecording(false);
      setShowSkipPrompt(false);
      setTranscript("");

      // Tell backend to mark this question as skipped.
      const result = await skipCandidateQuestion(accessToken, questionNumber);

      if (result?.interviewCompleted) {
        console.log("Interview completed after skipping final question.");

        return;
      }

      // Backend generates the next question.
      if (result?.data?.nextQuestion) {
        setNextQuestion(result.data.nextQuestion);
      }
    } catch (error) {
      console.error("Failed to skip interview question:", error);
    } finally {
      isSkippingQuestion.current = false;
    }
  }, [accessToken, currentQuestion]);

  // automatically starts microphone recording after the AI interviewer finishes speaking

  const startCandidateRecording = useCallback(async (): Promise<void> => {
    if (!questionNumber) return;

    if (recorderRef.current) return;

    try {
      setShowSkipPrompt(false);

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

      recorderRef.current?.destroy();
      recorderRef.current = null;
    }
  }, [handleCandidateSilence, handleInitialSilence, currentQuestion]);

  // start speaking whenever a new interview question is available

  useEffect(() => {
    if (!currentQuestion?.question) {
      return;
    }

    speakText(
      currentQuestion.question,

      () => {
        setIsSpeaking(true);
      },

      () => {
        setIsSpeaking(false);
        void startCandidateRecording();
      },
    );

    return () => {
      stopSpeaking();

      silenceDetectorRef.current?.stop();
      silenceDetectorRef.current = null;

      recorderRef.current?.destroy();
      recorderRef.current = null;

      recordingStartedAt.current = null;

      setIsSpeaking(false);
      setIsRecording(false);
    };
  }, [currentQuestion, startCandidateRecording]);

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
          00:00
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
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
                  : isLoading
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
              <p className="text-sm font-medium text-[#8B95A5]">
                Current Question
              </p>

              <p className="text-base leading-snug font-medium text-[#F2F4F7] lg:text-lg">
                {isLoading ? "Preparing your first question..." : isError ? "Unable to load the interview question" : currentQuestion?.question ?? "No question received from the server."}
            </div>

            <div className="mt-3 rounded-xl border border-blue-500/20 bg-[#10151E] p-3.5 lg:p-4">
              <p className="text-base leading-snug font-medium text-[#F2F4F7] lg:text-lg">
                {isLoading
                  ? "Preparing your first question..."
                  : isError
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
                {isLoading
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
                  LIVE TRANSCRIPTION
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
    </div>
  );
}
