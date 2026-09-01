"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export function LottieIcon({
  path,
  className = "",
  speed = 1,
  ariaHidden = true,
  style,
}: {
  path: string;
  className?: string;
  speed?: number;
  ariaHidden?: boolean;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;

    void import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;

      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path,
      });
      animation.setSpeed(speed);
      destroy = () => animation.destroy();
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [path, speed]);

  return (
    <span
      ref={containerRef}
      className={`lottie-icon ${className}`}
      aria-hidden={ariaHidden}
      style={style}
    />
  );
}
