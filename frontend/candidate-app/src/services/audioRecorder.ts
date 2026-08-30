/* Handles microphone recording using the browser's MediaRecorder API. Its only responsibility is:

1. Request microphone permission.
2. Start recording.
3. Stop recording.
4. Return the recorded audio as a Blob */

export interface AudioRecorder {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  isRecording: () => boolean;

  getStream: () => MediaStream | null; // exposes tthe active microphone stream to the silence detector

  destroy: () => void;
}

/*
 * Creates a reusable microphone recorder.
 *
 * We keep the MediaRecorder instance inside this service instead of
 * putting recording implementation details directly inside InterviewRoom.
 */
export function createAudioRecorder(): AudioRecorder {
  let mediaRecorder: MediaRecorder | null = null;

  // Stores all audio chunks produced while recording.
  let audioChunks: Blob[] = [];

  // Stores the active microphone stream.
  let mediaStream: MediaStream | null = null;

  /*
   * Starts microphone recording.
   *
   * Calling this function also triggers the browser's microphone
   * permission prompt the first time it is used.
   */
  const start = async (): Promise<void> => {
    // Prevent accidentally starting two recordings at the same time.
    if (mediaRecorder?.state === "recording") {
      return;
    }

    /*
     * Ask the browser for microphone access.
     *
     * We only request audio. No camera permission is required.
     */
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Reset chunks before starting a new recording.
    audioChunks = [];

    /*
     * MediaRecorder converts the microphone stream into audio chunks.
     *
     * Browser support is generally good for WebM/Opus.
     */
    mediaRecorder = new MediaRecorder(mediaStream);

    // Store every chunk generated during the recording.
    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Start capturing microphone audio.
    mediaRecorder.start();
  };

  /*
   * Stops recording and returns the complete recording as a Blob.
   */
  const stop = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        reject(new Error("No active recording."));
        return;
      }

      /*
       * When MediaRecorder finishes, combine all audio chunks
       * into a single WebM audio Blob.
       */
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder?.mimeType || "audio/webm",
        });

        // Stop every microphone track so the browser releases the mic.
        mediaStream?.getTracks().forEach((track) => track.stop());

        mediaStream = null;
        mediaRecorder = null;
        audioChunks = [];

        resolve(audioBlob);
      };

      // Stop the MediaRecorder.
      mediaRecorder.stop();
    });
  };

  /*
   * Allows the UI to check whether recording is currently active.
   */
  const isRecording = (): boolean => {
    return mediaRecorder?.state === "recording";
  };

  const getStream = (): MediaStream | null => {
    return mediaStream ; 
  }

  /*
   * Completely releases microphone resources.
   *
   * This is useful when the candidate leaves the interview page.
   */
  const destroy = (): void => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    mediaStream?.getTracks().forEach((track) => track.stop());

    mediaRecorder = null;
    mediaStream = null;
    audioChunks = [];
  };

  return {
    start,
    stop,
    isRecording,
    getStream,
    destroy,
  };
}
