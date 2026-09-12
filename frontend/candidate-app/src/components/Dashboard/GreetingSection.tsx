import { useEffect, useState } from "react";
import { getGreetingPeriod, greetingData, type GreetingPeriod } from "../../utils/greeting";

interface GreetingSectionProps {
  firstName: string;
}

export function GreetingSection({
  firstName,
}: GreetingSectionProps) {
  const [period, setPeriod] = useState<GreetingPeriod>(
    getGreetingPeriod(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getGreetingPeriod());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const greeting = greetingData[period];

  return (
    <section className="flex items-center justify-between px-1 py-0">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xl">{greeting.emoji}</span>

          <span className="text-sm font-medium text-violet-600">
            Candidate Dashboard
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {greeting.greeting}, {firstName}
        </h1>
      </div>

      <div className="hidden text-4xl md:block">
        {greeting.emoji}
      </div>
    </section>
  );
}