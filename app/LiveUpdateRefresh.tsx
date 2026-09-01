"use client";

import { useEffect } from "react";

const UPDATE_CHECK_INTERVAL = 10_000;
const CHECK_DEBOUNCE = 1_000;

function getAssetSignature(root: ParentNode) {
  const buildId =
    root.querySelector("meta[name='build-id']")?.getAttribute("content") ?? "";

  const assets = Array.from(
    root.querySelectorAll("script[src], link[rel='stylesheet'][href]"),
  )
    .map(
      (element) =>
        element.getAttribute("src") ?? element.getAttribute("href") ?? "",
    )
    .filter(
      (asset) =>
        asset.includes("/assets/") ||
        asset.includes("/_next/") ||
        asset.includes(".js") ||
        asset.includes(".css"),
    )
    .sort()
    .join("|");

  return `${buildId}::${assets}`;
}

function createFreshUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("__portfolio_refresh", Date.now().toString());
  return url;
}

export function LiveUpdateRefresh() {
  useEffect(() => {
    // Disable auto-refresh in development mode or localhost to prevent reload loops
    if (
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ) {
      return;
    }

    const currentSignature = getAssetSignature(document);
    const abortController = new AbortController();
    let checking = false;
    let lastCheckAt = 0;

    const checkForUpdate = async () => {
      const now = Date.now();
      if (checking || now - lastCheckAt < CHECK_DEBOUNCE) return;

      checking = true;
      lastCheckAt = now;

      try {
        const freshUrl = createFreshUrl();
        const response = await fetch(freshUrl, {
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          signal: abortController.signal,
        });

        if (!response.ok) return;

        const nextDocument = new DOMParser().parseFromString(
          await response.text(),
          "text/html",
        );
        const nextSignature = getAssetSignature(nextDocument);

        if (
          currentSignature &&
          nextSignature &&
          currentSignature !== nextSignature
        ) {
          console.log("New build update detected! Refreshing page...");
          window.location.reload();
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.info("The latest portfolio version will be checked again.");
        }
      } finally {
        checking = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkForUpdate();
    };

    const initialCheck = window.setTimeout(() => void checkForUpdate(), 2_000);
    const periodicCheck = window.setInterval(
      () => void checkForUpdate(),
      UPDATE_CHECK_INTERVAL,
    );

    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      abortController.abort();
      window.clearTimeout(initialCheck);
      window.clearInterval(periodicCheck);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
