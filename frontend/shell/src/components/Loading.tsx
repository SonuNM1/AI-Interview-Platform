import { Lottie } from "lottie-react";
import loadingAnimation from "@/assets/animations/loading.json";

interface LoadingProps {
  message?: string;
}

export function Loading({
  message = "Loading...",
}: LoadingProps) {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3">
      <Lottie
        src={loadingAnimation}
        loop
        autoplay
        className="h-28 w-28"
      />

      <p className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}