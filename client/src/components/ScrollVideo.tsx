/*
 * ScrollVideo — Scroll-driven video scrubbing component
 * The video plays frame-by-frame as the user scrolls.
 * When the video reaches the end, the page continues to the next section.
 */
import { useRef, useEffect, useState, useCallback } from "react";

interface ScrollVideoProps {
  src: string;
  alt?: string;
}

export default function ScrollVideo({ src, alt = "Vídeo" }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Wait for video metadata to load
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // Ensure video is paused — we control playback via scroll
    video.pause();
    // Set to first frame
    video.currentTime = 0;
    setIsReady(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !isReady) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how far we've scrolled through the container
        // The sticky video occupies the viewport while we scroll through the tall container
        const scrollableHeight = container.offsetHeight - windowHeight;
        
        if (scrollableHeight <= 0) return;

        // How far into the container we are (0 = top just reached viewport, 1 = bottom leaving viewport)
        const scrolled = -rect.top;
        const rawProgress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        setProgress(rawProgress);

        // Map scroll progress to video time
        if (video.duration && isFinite(video.duration)) {
          const targetTime = rawProgress * video.duration;
          // Only update if difference is significant to avoid jank
          if (Math.abs(video.currentTime - targetTime) > 0.01) {
            video.currentTime = targetTime;
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      {/* Sticky wrapper — video stays fixed in viewport while scrolling through container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 z-10 h-1 bg-black/20">
          <div
            className="h-full bg-brand transition-[width] duration-100 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain"
          aria-label={alt}
        />

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-3 border-white/30 border-t-brand rounded-full animate-spin" />
              <span className="text-white/70 text-sm">Carregando vídeo...</span>
            </div>
          </div>
        )}

        {/* Scroll hint at bottom — only show at start */}
        {isReady && progress < 0.05 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Role para explorar</span>
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
