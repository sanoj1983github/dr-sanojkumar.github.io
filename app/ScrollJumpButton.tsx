"use client";

import { useEffect, useState } from "react";

type ScrollDirection = "down" | "up";

type ScrollState = {
  canScroll: boolean;
  direction: ScrollDirection;
};

function getScrollMetrics() {
  return {
    scrollTop: window.scrollY || document.documentElement.scrollTop || 0,
    scrollHeight: document.documentElement.scrollHeight || 0,
    viewportHeight: window.innerHeight || 0,
  };
}

function getScrollState(): ScrollState {
  const { scrollTop, scrollHeight, viewportHeight } = getScrollMetrics();
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);

  return {
    canScroll: maxScroll > 180,
    direction: scrollTop < maxScroll / 2 ? "down" : "up",
  };
}

export function ScrollJumpButton({ pageKey }: { pageKey: string }) {
  const [state, setState] = useState<ScrollState>({
    canScroll: false,
    direction: "down",
  });

  useEffect(() => {
    const update = () => setState(getScrollState());

    update();
    const timer = window.setTimeout(update, 250);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pageKey]);

  const handleClick = () => {
    const { scrollHeight, viewportHeight } = getScrollMetrics();
    const top =
      state.direction === "down"
        ? Math.max(0, scrollHeight - viewportHeight)
        : 0;

    window.scrollTo({ top, behavior: "smooth" });
  };

  if (!state.canScroll) return null;

  const goingDown = state.direction === "down";

  return (
    <button
      type="button"
      className={`scroll-jump-button ${goingDown ? "is-down" : "is-up"}`}
      onClick={handleClick}
      aria-label={goingDown ? "Go to bottom" : "Go to top"}
      title={goingDown ? "Go to bottom" : "Go to top"}
    >
      <svg
        className="svgIcon"
        viewBox="0 0 384 512"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
      </svg>
    </button>
  );
}
