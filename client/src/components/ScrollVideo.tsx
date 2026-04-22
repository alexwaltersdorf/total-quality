/*
 * ScrollVideo — Scroll-driven video scrubbing component
 * The video plays frame-by-frame as the user scrolls.
 * When the video reaches the end, the page continues to the next section.
 * Progress bar features smooth easing, gradient glow, and fade transitions.
 */
import { useRef, useEffect, useState } from "react";

interface ScrollVideoProps {
  src: string;
  alt?: string;
}

export default function ScrollVideo({ src, alt = "Vídeo" }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const smoothRafRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);

  // Smooth interpolation for the progress bar
  useEffect(() => {
    targetProgressRef.current = progress;

    const animate = () => {
      setSmoothProgress((prev) => {
        const diff = targetProgressRef.current - prev;
        if (Math.abs(diff) < 0.001) return targetProgressRef.current;
        return prev + diff * 0.15;
      });
      smoothRafRef.current = requestAnimationFrame(animate);
    };

    smoothRafRef.current = requestAnimationFrame(animate);
    return () => {
      if (smoothRafRef.current) cancelAnimationFrame(smoothRafRef.current);
    };
  }, [progress]);

  // Check if video is already loaded (handles race condition where events fire before mount)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isReady) return;

    const tryReady = () => {
      if (video.readyState >= 2 && !isReady) {
        video.pause();
        video.currentTime = 0;
        setIsReady(true);
      }
    };

    // Check immediately — video may already be loaded from cache
    tryReady();

    // Also listen for events as fallback
    video.addEventListener("loadedmetadata", tryReady);
    video.addEventListener("loadeddata", tryReady);
    video.addEventListener("canplay", tryReady);

    return () => {
      video.removeEventListener("loadedmetadata", tryReady);
      video.removeEventListener("loadeddata", tryReady);
      video.removeEventListener("canplay", tryReady);
    };
  }, [isReady]);

  // Scroll-driven video scrubbing
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !isReady) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollableHeight = container.offsetHeight - windowHeight;

        if (scrollableHeight <= 0) return;

        const scrolled = -rect.top;
        const rawProgress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        setProgress(rawProgress);

        if (video.duration && isFinite(video.duration)) {
          const targetTime = rawProgress * video.duration;
          if (Math.abs(video.currentTime - targetTime) > 0.01) {
            video.currentTime = targetTime;
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady]);

  const pct = smoothProgress * 100;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      {/* Sticky wrapper */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-black">

        {/* ── Progress bar with smooth glow ── */}
        <div className="absolute top-0 left-0 right-0 z-10">
          {/* Track background */}
          <div className="h-1 bg-white/10">
            {/* Filled bar — smooth gradient */}
            <div
              className="h-full relative"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #9B212B 0%, #c9373f 60%, #e04850 100%)",
              }}
            >
              {/* Glow pulse at the leading edge */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(155,33,43,0.9) 0%, rgba(155,33,43,0) 70%)",
                  boxShadow: "0 0 8px 2px rgba(155,33,43,0.5)",
                  opacity: pct > 0.5 && pct < 99.5 ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              />
            </div>
          </div>
          {/* Soft shadow beneath the bar */}
          <div
            className="h-4 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(155,33,43,${0.15 * smoothProgress}) 0%, transparent 100%)`,
              transition: "background 0.3s ease",
            }}
          />
        </div>

        {/* Percentage label — fades in after 5% */}
        <div
          className="absolute top-4 right-4 z-10 font-mono text-xs tabular-nums"
          style={{
            color: `rgba(255,255,255,${Math.min(1, Math.max(0, (smoothProgress - 0.05) * 5))})`,
            transition: "color 0.3s ease",
          }}
        >
          {Math.round(pct)}%
        </div>

        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          aria-label={alt}
        />

        {/* Loading state — only visible when video is NOT ready */}
        {!isReady && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black transition-opacity duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-white/30 border-t-brand rounded-full animate-spin" />
              <span className="text-white/70 text-sm">Carregando vídeo...</span>
            </div>
          </div>
        )}

        {/* Scroll hint — fades out smoothly as user scrolls */}
        {isReady && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce pointer-events-none"
            style={{
              opacity: Math.max(0, 1 - smoothProgress * 20),
              transition: "opacity 0.5s ease-out",
            }}
          >
            <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
              Role para explorar
            </span>
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
