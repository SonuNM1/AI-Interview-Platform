// Browser Speech Recognition API wrapper.
// This keeps microphone/transcription logic outside InterviewRoom.

export interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;

  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;

  onerror:
    | ((event: Event) => void)
    | null;

  onend: (() => void) | null;
}

// Type definition for the browser SpeechRecognition constructor.
type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

// Some browsers expose the API as SpeechRecognition,
// while Chromium-based browsers commonly expose webkitSpeechRecognition.
interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// Creates and configures the browser speech recognition instance.
export function createSpeechRecognition(callbacks: {
  onResult?: (result: {
    transcript: string;
    isFinal: boolean;
  }) => void;

  onEnd?: () => void;

  onError?: (error: string) => void;
}) {
  // Cast window to our small compatibility interface instead of using `any`.
  const speechWindow =
    window as unknown as SpeechRecognitionWindow;

  const SpeechRecognition =
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition;

  // Stop with a clear error if the browser does not support speech recognition.
  if (!SpeechRecognition) {
    throw new Error(
      "Speech recognition is not supported in this browser.",
    );
  }

  const recognition = new SpeechRecognition();

  // Keep listening while the candidate is speaking.
  recognition.continuous = true;

  // Return interim results so we can show live transcription.
  recognition.interimResults = true;

  // Interview language.
  recognition.lang = "en-US";

  // Handle live and final speech recognition results.
  recognition.onresult = (event) => {
    for (
      let index = event.resultIndex;
      index < event.results.length;
      index++
    ) {
      const result = event.results[index];

      callbacks.onResult?.({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
      });
    }
  };

  // Handle microphone/speech recognition errors.
  recognition.onerror = (event) => {
    console.error(
      "Speech recognition error:",
      event,
    );

    callbacks.onError?.(
      "Speech recognition failed.",
    );
  };

  // Notify InterviewRoom when recognition stops.
  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  return recognition;
}