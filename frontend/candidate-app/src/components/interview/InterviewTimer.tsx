import { useEffect, useState } from "react";

interface InterviewTimerProps {
  startedAt: string;
  duration: number;
  onTimeExpired: () => void;
}

export function InterviewTimer({
  startedAt,
  duration,
  onTimeExpired,
}: InterviewTimerProps) {
  const durationMs = duration * 60 * 1000;

  const calculateRemaining = () => {
    const elapsed =
      Date.now() - new Date(startedAt).getTime();

    return Math.max(0, durationMs - elapsed);
  };

  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    let expired = false;

    const updateTimer = () => {
      const nextRemaining = calculateRemaining();

      setRemaining(nextRemaining);

      if (nextRemaining <= 0 && !expired) {
        expired = true;
        onTimeExpired();
      }
    };

    const timeout = window.setTimeout(updateTimer, 0);

    const interval = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [startedAt, durationMs, onTimeExpired]);

  const totalSeconds = Math.floor(remaining / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <span
      className={
        remaining <= 60 * 1000
          ? "font-semibold text-red-400"
          : ""
      }
    >
      {String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  );
}