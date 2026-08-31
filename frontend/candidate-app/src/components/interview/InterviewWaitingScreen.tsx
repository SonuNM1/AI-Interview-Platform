import { useEffect, useState } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";

interface InterviewWaitingScreenProps {
  scheduledAt: string;
  duration: number;
  title?: string;
  onStart: () => void;
  isStarting?: boolean;
}

export function InterviewWaitingScreen({
  scheduledAt,
  duration,
  title = "AI Interview",
  onStart,
  isStarting = false,
}: InterviewWaitingScreenProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const scheduledTime = new Date(scheduledAt).getTime();
      const currentTime = Date.now();

      return Math.max(0, scheduledTime - currentTime);
    };

    const interval = window.setInterval(() => {
      setRemaining(calculateRemaining());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [scheduledAt]);

  const totalSeconds = Math.floor(remaining / 1000);

  const days = Math.floor(totalSeconds / 86400);

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  const isReady = remaining === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1117] px-4 text-[#F2F4F7]">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#151A23] p-8 text-center shadow-2xl">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
          <FiClock className="h-6 w-6 text-blue-400" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold">
          {title}
        </h1>

        {isReady ? (
          <>
            <p className="mt-3 text-sm text-[#8B95A5]">
              Your interview is ready to begin.
            </p>

            <button
              type="button"
              onClick={onStart}
              disabled={isStarting}
              className="mt-8 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting
                ? "Starting Interview..."
                : "Start Interview"}
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-[#8B95A5]">
              Your interview is scheduled for:
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#8B95A5]">
              <FiCalendar className="h-4 w-4" />

              <span>
                {new Date(scheduledAt).toLocaleString()}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3">
              <CountdownBox
                value={days}
                label="Days"
              />

              <CountdownBox
                value={hours}
                label="Hours"
              />

              <CountdownBox
                value={minutes}
                label="Minutes"
              />

              <CountdownBox
                value={seconds}
                label="Seconds"
              />
            </div>

            <p className="mt-6 text-xs text-[#6F7887]">
              Duration: {duration} minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface CountdownBoxProps {
  value: number;
  label: string;
}

function CountdownBox({
  value,
  label,
}: CountdownBoxProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#10151E] px-3 py-4">
      <p className="text-2xl font-semibold">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#6F7887]">
        {label}
      </p>
    </div>
  );
}