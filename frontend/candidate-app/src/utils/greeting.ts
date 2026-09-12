export type GreetingPeriod = "morning" | "afternoon" | "evening";

export interface GreetingData {
  greeting: string;
  emoji: string;
}

export function getGreetingPeriod(): GreetingPeriod {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  return "evening";
}

export const greetingData: Record<GreetingPeriod, GreetingData> = {
  morning: {
    greeting: "Good morning",
    emoji: "☀️",
  },

  afternoon: {
    greeting: "Good afternoon",
    emoji: "🌤️",
  },

  evening: {
    greeting: "Good evening",
    emoji: "🌆",
  },
};