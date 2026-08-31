
export interface AudioRecorder {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  isRecording: () => boolean;

  getStream: () => MediaStream | null; 
  destroy: () => void;
}

export function createAudioRecorder(): AudioRecorder {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let mediaStream: MediaStream | null = null;

  const start = async (): Promise<void> => {
    if (mediaRecorder?.state === "recording") {
      return;
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    audioChunks = [];

    const mimeType = MediaRecorder.isTypeSupported(
      "audio/webm;codecs=opus",
    )
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType,
    });

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
  };

  const stop = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        reject(new Error("No active recording."));
        return;
      }

      const recorder = mediaRecorder;

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: recorder.mimeType || "audio/webm",
        });

        mediaStream?.getTracks().forEach((track) => {
          track.stop();
        });

        mediaStream = null;
        mediaRecorder = null;
        audioChunks = [];

        resolve(audioBlob);
      };

      recorder.stop();
    });
  };

  const isRecording = (): boolean => {
    return mediaRecorder?.state === "recording";
  };

  const getStream = (): MediaStream | null => {
    return mediaStream;
  };

  const destroy = (): void => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });

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
