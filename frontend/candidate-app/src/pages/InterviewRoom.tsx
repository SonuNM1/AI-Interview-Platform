import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FiClock, FiMic, FiPhoneOff } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  getFirstQuestion,
  submitCandidateAnswer
} from "../services/interview.api";
import interviewerImage from "../assets/interviewer.png";
import { speakText, stopSpeaking } from "../services/textToSpeech";
import { createSpeechRecognition } from "../services/speechRecognition";

// AI Interviewer room

export function InterviewRoom() {
  const { accessToken } = useParams<{ accessToken: string }>();

  // tracks whethe the AI interviewer is currently speaking

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isRecording, setIsRecording] = useState(false) ; // tracks whether the candidate is currently recording an answer 

  const [transcript, setTranscript] = useState("") ; // stores the candidate's live transcription 

  const [finalTranscript, setFinalTranscript] = useState("") ; 

  const recordingStartTime = useRef<number | null>(null) ; // tracks when the candidate started answering 

  const recognitionRef = useRef<any>(null) ; // holds the browser speech recognition instance

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

  const question = data?.data ?? data;

  // start speaking whenever a new interview question is available

  useEffect(() => {
    if (!question?.question) return;

    speakText(
      question.question,

      // speech started

      () => {
        setIsSpeaking(true);
      },

      // speech finished

      () => {
        setIsSpeaking(false);
      },
    );

    // stop speech when leaving the interviewer room

    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [question?.question]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0E1117] text-[#F2F4F7]">
      {/* Interview Header */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 lg:px-7">
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

      <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-3 sm:p-4 lg:grid-cols-[1.05fr_0.95fr] lg:p-5">

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

          <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl border border-white/10 bg-[#10141BCC] px-4 py-3 backdrop-blur-md">
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

          <div className="shrink-0 rounded-2xl border border-white/10 bg-[#151A23] p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#8B95A5]">
                Current Question
              </p>

              <p className="text-sm text-[#8B95A5]">
                Question {question?.questionNumber ?? 1}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-blue-500/20 bg-[#10151E] p-3.5 lg:p-4">
              <p className="text-lg leading-relaxed font-medium text-[#F2F4F7] lg:text-xl">
                {isLoading
                  ? "Preparing your first question..."
                  : isError
                    ? "Unable to load the interview question."
                    : (question?.question ??
                      "No question received from the server.")}
              </p>
            </div>

            {/* AI voice status and animated waveform */}

            <div className="mt-3 flex items-center gap-4 text-sm text-blue-400">
              {/* animated voice waveform */}

              <div className="flex h-6 items-center gap-1">
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151A23] p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Your Answer</p>

              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready
              </div>
            </div>

            {/* Voice interaction area */}

            <div className="mt-2 flex flex-1 flex-col items-center justify-center">
              <button
                type="button"
                className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/10 text-blue-400 transition hover:bg-blue-500/20"
              >
                <FiMic className="h-8 w-7" />
              </button>

              <p className="mt-3 text-sm text-[#AAB2BF]">
                Your microphone will be used for your answer.
              </p>

              {/* Placeholder for live transcription */}

              <div className="mt-5 w-full rounded-xl border border-white/10 bg-[#10151E] p-4">
                <p className="text-xs font-medium text-[#6F7887]">
                  LIVE TRANSCRIPTION
                </p>

                <p className="mt-3 text-sm leading-relaxed text-[#AAB2BF]">
                  Your spoken answer will appear here...
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
