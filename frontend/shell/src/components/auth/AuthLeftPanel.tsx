import heroImage from "@/assets/hero.png";

export function AuthLeftPanel() {
  return (
    <section className="relative hidden h-full overflow-hidden border-r border-[#332F2A] bg-[#1C1A17] lg:block">
      <div className="relative flex h-full flex-col px-10 py-8">
        {/* Application branding. */}
        <div>
          <div className="flex items-center gap-2">
            {/* Logo icon (bar-chart mark). */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
            >
              <rect x="2" y="12" width="5" height="10" rx="1.5" fill="#B9674B" />
              <rect x="9.5" y="6" width="5" height="16" rx="1.5" fill="#C97C50" />
              <rect x="17" y="2" width="5" height="20" rx="1.5" fill="#E0925C" />
            </svg>

            <h1 className="text-2xl font-semibold tracking-tight text-[#F2EDE4]">
              AI Interview Platform
            </h1>
          </div>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#A9A197]">
            Practice interviews, improve your skills, and connect with
            opportunities.
          </p>
        </div>

        {/* AI visual. */}
        <div className="relative flex flex-1 items-center justify-center">
          {/* Single soft copper ring behind the robot. */}
          <div className="absolute h-[340px] w-[340px] rounded-full border border-[#B9674B]/20 blur-[1px]" />

          {/* Soft glow fill so the ring fades rather than looking hard-edged. */}
          <div className="absolute h-[340px] w-[340px] rounded-full bg-[#B9674B]/5 blur-[60px]" />

          {/* Small decorative dots (subtle, matches reference). */}
          <div className="absolute h-1.5 w-1.5 rounded-full bg-[#B9674B]/50 -translate-x-[210px] -translate-y-[150px]" />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-[#B9674B]/40 -translate-x-[230px] translate-y-[40px]" />
          <div className="absolute h-1 w-1 rounded-full bg-[#B9674B]/30 -translate-x-[170px] translate-y-[170px]" />

          {/* Robot container. */}
          <div className="relative z-10 flex h-[330px] w-[330px] items-center justify-center">
            <img
              src={heroImage}
              alt="AI assistant"
              className="relative z-10 w-[250px] object-contain"
            />
          </div>
        </div>

        {/* Product statement. */}
        <div className="border-l-2 border-[#B9674B] pl-4">
          <p className="text-sm font-medium text-[#D7CFC5]">
            Smarter preparation.
          </p>

          <p className="mt-1 text-xs text-[#8F887F]">
            Human expertise, AI intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}