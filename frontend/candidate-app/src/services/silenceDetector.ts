export interface SilenceDetector {
  start: () => void;
  stop: () => void;
}

/*
 * Creates a microphone silence detector.
 *
 * There are TWO different silence situations:
 *
 * 1. Candidate has never spoken.
 *    After INITIAL_SILENCE_DURATION we show the
 *    "Don't know? Skip question" prompt.
 *
 * 2. Candidate has spoken.
 *    After SILENCE_DURATION we consider the answer finished.
 */
export function createSilenceDetector(
  stream: MediaStream,
  onSilence: () => void,
  onInitialSilence: () => void,
): SilenceDetector {
  const audioContext = new AudioContext();

  const source =
    audioContext.createMediaStreamSource(stream);

  const analyser =
    audioContext.createAnalyser();

  analyser.fftSize = 512;

  source.connect(analyser);

  const dataArray = new Uint8Array(
    analyser.fftSize,
  );

  // Candidate has to remain silent this long AFTER speaking.
  const SILENCE_DURATION = 2500;

  // Candidate has never spoken.
  // After this period we show the skip prompt.
  const INITIAL_SILENCE_DURATION = 6000;

  const SILENCE_THRESHOLD = 12;

  let animationFrameId: number | null = null;

  let silenceStartedAt: number | null = null;

  let recordingStartedAt: number | null = null;

  let hasSpoken = false;

  let initialSilencePromptShown = false;

  let started = false;

  const checkVolume = (): void => {
    if (!started) {
      return;
    }

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (const value of dataArray) {
      sum += Math.abs(value - 128);
    }

    const averageVolume =
      sum / dataArray.length;

    const isSilent =
      averageVolume < SILENCE_THRESHOLD;

    if (isSilent) {
      if (silenceStartedAt === null) {
        silenceStartedAt = Date.now();
      }

      const silentDuration =
        Date.now() - silenceStartedAt;

      /*
       * Candidate has not spoken anything yet.
       *
       * Do NOT submit an empty answer.
       * Instead notify InterviewRoom so it can show
       * the skip prompt.
       */
      if (
        !hasSpoken &&
        !initialSilencePromptShown &&
        recordingStartedAt !== null &&
        Date.now() - recordingStartedAt >=
          INITIAL_SILENCE_DURATION
      ) {
        initialSilencePromptShown = true;

        onInitialSilence();
      }

      /*
       * Candidate has already spoken.
       *
       * Normal pause detection.
       */
      if (
        hasSpoken &&
        silentDuration >= SILENCE_DURATION
      ) {
        started = false;

        onSilence();

        return;
      }
    } else {
      /*
       * Candidate is speaking.
       */
      hasSpoken = true;

      /*
       * Reset silence timer whenever speech is detected.
       */
      silenceStartedAt = null;
    }

    animationFrameId =
      requestAnimationFrame(checkVolume);
  };

  const start = (): void => {
    if (started) {
      return;
    }

    started = true;

    silenceStartedAt = null;
    recordingStartedAt = Date.now();
    hasSpoken = false;
    initialSilencePromptShown = false;

    checkVolume();
  };

  const stop = (): void => {
    started = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    void audioContext.close();
  };

  return {
    start,
    stop,
  };
}