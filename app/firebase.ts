import {
  CACHED_SCHOLAR_SNAPSHOT,
  papersToCitationMap,
  normalizeScholarTitle,
  type ScholarSnapshot,
} from "./scholar-data";

/**
 * Firebase visitor counter — mirrors the reference site (portfolio-6a1b9)
 * Tracks combined views + clicks against Firebase Realtime Database.
 * Also exposes Scholar metrics subscription.
 */

// ─── Firebase SDK (imported at module level so they can be tree-shaken) ─────

let firebaseInitialized = false;
let db: ReturnType<typeof import("firebase/database").getDatabase> | null = null;
let viewsRef: ReturnType<typeof import("firebase/database").ref> | null = null;
let clicksRef: ReturnType<typeof import("firebase/database").ref> | null = null;
let scholarRef: ReturnType<typeof import("firebase/database").ref> | null = null;

const firebaseConfig = {
  apiKey: "AIzaSyDaV2ARQU9EwLKo3mN02VoIiwm4w7jksOo",
  authDomain: "portfolio-6a1b9.firebaseapp.com",
  databaseURL: "https://portfolio-6a1b9-default-rtdb.firebaseio.com",
  projectId: "portfolio-6a1b9",
  appId: "1:604162259556:web:9388758fb2a3c61d977d71",
};

// Storage keys (matching reference site)
const PENDING_VIEWS_KEY = "visitor-counter:pending-views:site-total";
const PENDING_CLICKS_KEY = "visitor-counter:pending-clicks:site-total";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseCounterValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  if (value && typeof value === "object" && "count" in value) {
    return parseCounterValue((value as { count: unknown }).count);
  }
  return 0;
}

function getPending(key: string): number {
  try {
    return parseCounterValue(window.localStorage.getItem(key));
  } catch {
    return 0;
  }
}

function setPending(key: string, count: number) {
  try {
    const safe = parseCounterValue(count);
    if (safe <= 0) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(safe));
  } catch {
    // ignore
  }
}

// ─── Initializer ────────────────────────────────────────────────────────────

async function initFirebase() {
  if (firebaseInitialized) return;
  firebaseInitialized = true;

  try {
    const { getApps, getApp, initializeApp } = await import("firebase/app");
    const { getDatabase, ref } = await import("firebase/database");

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
    viewsRef = ref(db, "visitor-counter/site-total-views");
    clicksRef = ref(db, "visitor-counter/site-total-clicks");
    scholarRef = ref(db, "visitor-counter/scholar-metrics/current");
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface VisitorCounterCallbacks {
  onTotal: (total: number) => void;
}

export interface ScholarMetrics {
  total_citations?: number;
  h_index?: number;
  i10_index?: number;
}

let scholarApiRequest: Promise<ScholarSnapshot | null> | null = null;

function fetchScholarApi(): Promise<ScholarSnapshot | null> {
  if (scholarApiRequest) return scholarApiRequest;

  scholarApiRequest = fetch("/api/scholar", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      ) {
        return null;
      }
      const value = (await response.json()) as Partial<ScholarSnapshot>;
      if (
        !Number.isFinite(value.total_citations) ||
        !Number.isFinite(value.h_index) ||
        !Number.isFinite(value.i10_index) ||
        !Array.isArray(value.papers)
      ) {
        return null;
      }
      return value as ScholarSnapshot;
    })
    .catch(() => null);

  return scholarApiRequest;
}

let latestViews = 14280;
let latestClicks = 570;
let hasQueuedView = false;
let flushingViews = false;
let flushingClicks = false;

const activeCounterSubscribers = new Set<(total: number) => void>();

function computeTotal() {
  return latestViews + latestClicks + getPending(PENDING_VIEWS_KEY) + getPending(PENDING_CLICKS_KEY);
}

function broadcastTotal() {
  const total = computeTotal();
  activeCounterSubscribers.forEach((fn) => fn(total));
}

export function subscribeVisitorCounter(cb: VisitorCounterCallbacks): () => void {
  if (typeof window === "undefined") return () => {};

  activeCounterSubscribers.add(cb.onTotal);
  cb.onTotal(computeTotal());

  let unsubViews: (() => void) | undefined;
  let unsubClicks: (() => void) | undefined;
  let destroyed = false;

  const flushViews = async () => {
    if (flushingViews || !viewsRef) return;
    const delta = getPending(PENDING_VIEWS_KEY);
    if (delta <= 0) return;
    flushingViews = true;
    try {
      const { runTransaction } = await import("firebase/database");
      const result = await runTransaction(viewsRef, (cur) => ({
        count: Math.max(14280, parseCounterValue(cur) + delta),
        updated_at: new Date().toISOString(),
      }));
      if (result.snapshot.exists()) {
        latestViews = Math.max(14280, parseCounterValue(result.snapshot.val()));
      }
      setPending(PENDING_VIEWS_KEY, Math.max(0, getPending(PENDING_VIEWS_KEY) - delta));
      broadcastTotal();
    } catch {
      // keep pending for next sync
    } finally {
      flushingViews = false;
      if (getPending(PENDING_VIEWS_KEY) > 0) setTimeout(flushViews, 800);
    }
  };

  const flushClicks = async () => {
    if (flushingClicks || !clicksRef) return;
    const delta = getPending(PENDING_CLICKS_KEY);
    if (delta <= 0) return;
    flushingClicks = true;
    try {
      const { runTransaction } = await import("firebase/database");
      const result = await runTransaction(clicksRef, (cur) => ({
        count: Math.max(570, parseCounterValue(cur) + delta),
        updated_at: new Date().toISOString(),
      }));
      if (result.snapshot.exists()) {
        latestClicks = Math.max(570, parseCounterValue(result.snapshot.val()));
      }
      setPending(PENDING_CLICKS_KEY, Math.max(0, getPending(PENDING_CLICKS_KEY) - delta));
      broadcastTotal();
    } catch {
      // keep pending for next sync
    } finally {
      flushingClicks = false;
      if (getPending(PENDING_CLICKS_KEY) > 0) setTimeout(flushClicks, 800);
    }
  };

  const queueView = () => {
    if (hasQueuedView) return;
    hasQueuedView = true;
    setPending(PENDING_VIEWS_KEY, getPending(PENDING_VIEWS_KEY) + 1);
    broadcastTotal();
    void flushViews();
  };

  const queueClick = (e: MouseEvent) => {
    if (!e.isTrusted) return;
    setPending(PENDING_CLICKS_KEY, getPending(PENDING_CLICKS_KEY) + 1);
    broadcastTotal();
    void flushClicks();
  };

  const onVisibility = () => {
    if (document.visibilityState !== "visible") return;
    if (getPending(PENDING_VIEWS_KEY) > 0) void flushViews();
    if (getPending(PENDING_CLICKS_KEY) > 0) void flushClicks();
  };

  const onOnline = () => {
    if (getPending(PENDING_VIEWS_KEY) > 0) void flushViews();
    if (getPending(PENDING_CLICKS_KEY) > 0) void flushClicks();
  };

  // Flush any leftover pending counts from previous sessions
  if (getPending(PENDING_VIEWS_KEY) > 0) void flushViews();
  if (getPending(PENDING_CLICKS_KEY) > 0) void flushClicks();

  // Immediate REST fetch for instantaneous synchronized count across all devices
  fetch("https://portfolio-6a1b9-default-rtdb.firebaseio.com/visitor-counter/site-total-views.json")
    .then((res) => res.json())
    .then((d) => {
      if (!destroyed && d) {
        latestViews = Math.max(14280, parseCounterValue(d));
        broadcastTotal();
      }
    })
    .catch(() => {});

  fetch("https://portfolio-6a1b9-default-rtdb.firebaseio.com/visitor-counter/site-total-clicks.json")
    .then((res) => res.json())
    .then((d) => {
      if (!destroyed && d) {
        latestClicks = Math.max(570, parseCounterValue(d));
        broadcastTotal();
      }
    })
    .catch(() => {});

  // Start Firebase
  initFirebase().then(async () => {
    if (destroyed) return;
    if (!viewsRef || !clicksRef) return;

    try {
      const { onValue } = await import("firebase/database");

      unsubViews = onValue(
        viewsRef,
        (snap) => {
          if (snap.exists()) {
            latestViews = Math.max(14280, parseCounterValue(snap.val()));
            broadcastTotal();
          }
        },
        () => {}
      );

      unsubClicks = onValue(
        clicksRef,
        (snap) => {
          if (snap.exists()) {
            latestClicks = parseCounterValue(snap.val());
            broadcastTotal();
          }
        },
        () => {}
      );

      queueView();
    } catch (e) {
      console.warn("Firebase subscribe error:", e);
    }
  });

  document.addEventListener("click", queueClick, { passive: true, capture: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", onOnline);

  return () => {
    destroyed = true;
    activeCounterSubscribers.delete(cb.onTotal);
    unsubViews?.();
    unsubClicks?.();
    document.removeEventListener("click", queueClick, true);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("online", onOnline);
  };
}

export function subscribeScholarMetrics(cb: (m: ScholarMetrics) => void): () => void {
  if (typeof window === "undefined") return () => {};

  let unsub: (() => void) | undefined;
  let destroyed = false;

  const extractMetrics = (d: any, useVerifiedFloor = true) => {
    if (!d) return;
    const src = d.author_metrics || d;
    const total_citations = Math.max(
      useVerifiedFloor ? CACHED_SCHOLAR_SNAPSHOT.total_citations : 0,
      parseCounterValue(src.total_citations ?? src.citations ?? src.citation_count),
    );
    const h_index = Math.max(
      useVerifiedFloor ? CACHED_SCHOLAR_SNAPSHOT.h_index : 0,
      parseCounterValue(src.h_index ?? src.hindex),
    );
    const i10_index = Math.max(
      useVerifiedFloor ? CACHED_SCHOLAR_SNAPSHOT.i10_index : 0,
      parseCounterValue(src.i10_index ?? src.i10index),
    );
    if (total_citations > 0 || h_index > 0 || i10_index > 0) {
      cb({ total_citations, h_index, i10_index });
    }
  };

  cb({
    total_citations: CACHED_SCHOLAR_SNAPSHOT.total_citations,
    h_index: CACHED_SCHOLAR_SNAPSHOT.h_index,
    i10_index: CACHED_SCHOLAR_SNAPSHOT.i10_index,
  });

  void fetchScholarApi().then((snapshot) => {
    if (!destroyed && snapshot) extractMetrics(snapshot, false);
  });

  // Immediate REST fetch for instantaneous live rendering
  fetch("https://portfolio-6a1b9-default-rtdb.firebaseio.com/visitor-counter/scholar-metrics/current.json")
    .then((res) => res.json())
    .then((d) => {
      if (!destroyed) extractMetrics(d);
    })
    .catch(() => {});

  initFirebase().then(async () => {
    if (destroyed || !scholarRef) return;
    try {
      const { onValue } = await import("firebase/database");
      unsub = onValue(
        scholarRef,
        (snap) => {
          if (!snap.exists()) return;
          extractMetrics(snap.val());
        },
        () => {}
      );
    } catch {}
  });

  return () => {
    destroyed = true;
    unsub?.();
  };
}

const DEFAULT_PUBLICATION_CITATIONS = papersToCitationMap(
  CACHED_SCHOLAR_SNAPSHOT.papers,
);

function mergeCitationMaps(
  base: Record<string, number>,
  updates: Record<string, number>,
): Record<string, number> {
  const merged = { ...base };
  const baseTitles = Object.keys(base);

  Object.entries(updates).forEach(([title, count]) => {
    const safeCount = parseCounterValue(count);
    merged[title] = Math.max(merged[title] ?? 0, safeCount);
    const normalized = normalizeScholarTitle(title);
    baseTitles.forEach((baseTitle) => {
      if (normalizeScholarTitle(baseTitle) === normalized) {
        merged[baseTitle] = Math.max(merged[baseTitle] ?? 0, safeCount);
      }
    });
  });

  return merged;
}

function sanitizeFirebaseKey(key: string): string {
  return key.replace(/[.#$\[\]\/]/g, "_");
}

export function subscribePublicationCitations(cb: (m: Record<string, number>) => void): () => void {
  if (typeof window === "undefined") return () => {};

  let unsub: (() => void) | undefined;
  let destroyed = false;

  const handlePubData = (d: any) => {
    if (!d || typeof d !== "object") return;
    const map: Record<string, number> = {};
    const items = d.publications || d.articles || d;
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        if (item.title && (item.citations !== undefined || item.num_citations !== undefined)) {
          map[item.title] = parseCounterValue(item.citations ?? item.num_citations);
        }
      });
    } else if (typeof items === "object") {
      Object.entries(items).forEach(([key, val]) => {
        if (typeof val === "number") {
          map[key] = val;
          Object.keys(DEFAULT_PUBLICATION_CITATIONS).forEach((origTitle) => {
            if (sanitizeFirebaseKey(origTitle) === key) {
              map[origTitle] = val;
            }
          });
        } else if (val && typeof val === "object" && "citations" in val) {
          const parsed = parseCounterValue((val as any).citations);
          map[key] = parsed;
          Object.keys(DEFAULT_PUBLICATION_CITATIONS).forEach((origTitle) => {
            if (sanitizeFirebaseKey(origTitle) === key) {
              map[origTitle] = parsed;
            }
          });
        }
      });
    }
    if (Object.keys(map).length > 0) {
      cb(mergeCitationMaps(DEFAULT_PUBLICATION_CITATIONS, map));
    }
  };

  // Immediate initial callback with defaults
  cb(DEFAULT_PUBLICATION_CITATIONS);

  void fetchScholarApi().then((snapshot) => {
    if (!destroyed && snapshot) {
      cb(
        mergeCitationMaps(
          DEFAULT_PUBLICATION_CITATIONS,
          papersToCitationMap(snapshot.papers),
        ),
      );
    }
  });

  // Fetch from Firebase RTDB
  fetch("https://portfolio-6a1b9-default-rtdb.firebaseio.com/visitor-counter/publication-citations.json")
    .then((res) => res.json())
    .then((d) => {
      if (!destroyed && d) handlePubData(d);
    })
    .catch(() => {});

  initFirebase().then(async () => {
    if (destroyed || !db) return;
    try {
      const { ref, onValue } = await import("firebase/database");
      const pubRef = ref(db, "visitor-counter/publication-citations");

      unsub = onValue(
        pubRef,
        (snap) => {
          try {
            if (!snap.exists()) {
              cb(DEFAULT_PUBLICATION_CITATIONS);
              return;
            }
            handlePubData(snap.val());
          } catch (e) {
            console.warn("Error processing publication citations:", e);
          }
        },
        () => {}
      );
    } catch {}
  });

  return () => {
    destroyed = true;
    unsub?.();
  };
}

export async function updatePublicationCitation(title: string, count: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await initFirebase();
    if (!db) return;
    const { ref, update } = await import("firebase/database");
    const pubRef = ref(db, "visitor-counter/publication-citations");
    const safeKey = sanitizeFirebaseKey(title);
    await update(pubRef, { [safeKey]: count });
  } catch (e) {
    console.warn("Failed to update publication citation:", e);
  }
}
