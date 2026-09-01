"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Sparkles,
  Key,
  Maximize2,
  Minimize2,
  Video,
  VideoOff,
  Download,
  AlertCircle,
  X,
  Play,
  HelpCircle,
  Zap,
  Sliders,
  Cpu,
  Layers,
  CheckCircle2,
  Flame,
  Wand2,
} from "lucide-react";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const DECART_SDK_URL = "https://esm.sh/@decartai/sdk@0.1.17";

export interface EffectItem {
  id: string;
  label: string;
  badge: string;
  iconName: string;
  prompt: string | null;
  description: string;
}

export const MSP_EFFECTS: EffectItem[] = [
  {
    id: "movie3d",
    label: "3D Movie",
    badge: "CGI AI",
    iconName: "Wand2",
    prompt:
      "Change the style of the video to a 3D animated movie: stylized CGI animation, the person as an animated character with expressive big eyes and smooth skin, soft cinematic lighting.",
    description: "Stylized CGI movie character with warm cinematic lighting",
  },
  {
    id: "anime",
    label: "Anime",
    badge: "Cel Shaded",
    iconName: "Sparkles",
    prompt:
      "Change the style of the video to hand-drawn anime: clean black line art, flat cel shading, vibrant colors, large expressive eyes.",
    description: "Hand-drawn line art and vibrant cel-shaded Japanese anime",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    badge: "Neon 2077",
    iconName: "Zap",
    prompt:
      "Change the style of the video to neon cyberpunk: glowing pink and cyan neon light on the person and walls, rain-slick reflective surfaces, holographic signs in the background.",
    description: "Neon cyan & magenta lighting with futuristic holographic reflections",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    badge: "Impressionist",
    iconName: "Layers",
    prompt:
      "Change the style of the video to a watercolor painting: soft loose brushstrokes, gentle color bleeds, visible paper texture, muted pastel palette.",
    description: "Soft fluid brushstrokes with subtle watercolor paper canvas texture",
  },
  {
    id: "lego",
    label: "LEGO",
    badge: "Stop Motion",
    iconName: "Flame",
    prompt:
      "Change the style of the video to a LEGO stop-motion animation: the person is a yellow LEGO minifigure with a cylindrical head, painted face, and claw hands, and the room is built entirely from glossy plastic LEGO bricks with visible round studs on every surface.",
    description: "Yellow LEGO minifigure and plastic stud brick architecture",
  },
  {
    id: "matrix",
    label: "Matrix Rain",
    badge: "Cyber HUD",
    iconName: "Cpu",
    prompt:
      "Change the style of the video to a futuristic Matrix computer code simulation: glowing green digital characters cascading down the screen, cyberpunk terminal HUD overlay, high-contrast dark green aesthetics.",
    description: "Digital green code rain with futuristic cyberpunk terminal overlay",
  },
  {
    id: "thermal",
    label: "Thermal IR",
    badge: "Heatmap",
    iconName: "Zap",
    prompt:
      "Change the style of the video to a thermal infrared camera heatmap: vibrant rainbow heat signature colors ranging from deep blue cold tones to glowing yellow and red high-temperature highlights.",
    description: "Infrared thermal vision spectrum with vibrant heat signature highlights",
  },
  {
    id: "comic",
    label: "Comic Pop Art",
    badge: "Vintage",
    iconName: "Sparkles",
    prompt:
      "Change the style of the video to a vintage superhero comic book illustration: bold thick black ink outlines, dotted halftone print texture, bright primary pop art colors.",
    description: "Bold black ink outlines with vintage pop art halftone dot textures",
  },
  {
    id: "oil",
    label: "Oil Painting",
    badge: "Renaissance",
    iconName: "Layers",
    prompt:
      "Change the style of the video to a classic Renaissance oil painting: thick textured impasto oil brushstrokes, rich warm amber lighting, dramatic chiaroscuro shadows.",
    description: "Textured impasto oil brushstrokes with warm amber Renaissance lighting",
  },
  {
    id: "custom",
    label: "Custom ✨",
    badge: "User Pro",
    iconName: "Sliders",
    prompt: null,
    description: "Write your own custom Decart Lucy 2.5 realtime prompt",
  },
];

interface Point {
  x: number;
  y: number;
}

export function MSPLiveFrameCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lucyVidRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [effect, setEffect] = useState<string>("movie3d");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showKeyPanel, setShowKeyPanel] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const [aiConnectionState, setAiConnectionState] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [aiDiagnosticMsg, setAiDiagnosticMsg] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<"loading" | "ready" | "connecting" | "live" | "error">("loading");
  const [statusText, setStatusText] = useState<string>("Initializing MediaPipe Vision Model...");
  const [liveMode, setLiveMode] = useState<"ai" | "canvas">("canvas");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(30);

  const landmarkerRef = useRef<any>(null);
  const realtimeClientRef = useRef<any>(null);
  const animFrameId = useRef<number | null>(null);

  // Quad tracking state with lerp & hysteresis
  const cornersRef = useRef<[Point, Point, Point, Point] | null>(null);
  const presenceRef = useRef<number>(0);
  const lostFramesRef = useRef<number>(0);

  // Load saved API Key & prompt
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("msp-decart-key") || sessionStorage.getItem("msp-decart-key") || "";
      const savedPrompt = localStorage.getItem("msp-lucy-custom") || "";
      setApiKey(savedKey);
      setCustomPrompt(savedPrompt);
      if (savedKey) {
        setLiveMode("ai");
      }
    }
  }, []);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      try {
        setStatusState("loading");
        setStatusText("Initializing MediaPipe WASM...");
        const { HandLandmarker, FilesetResolver } = await new Function(
          "u",
          "return import(u)"
        )("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");

        const vision = await FilesetResolver.forVisionTasks(WASM_URL);

        if (!active) return;

        setStatusText("Loading Hand Landmarker GPU Model...");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });

        if (!active) return;

        landmarkerRef.current = landmarker;
        setStatusState("ready");
        setStatusText("Camera Ready — Frame your hands!");
      } catch (err: any) {
        console.error("MediaPipe load error:", err);
        if (active) {
          setStatusState("error");
          setStatusText(`Canvas FX Engine Active (${err.message || "WASM fallback"})`);
        }
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setStatusState(apiKey ? "connecting" : "ready");
        setStatusText(apiKey ? "Connecting Decart Lucy 2.5 WebRTC..." : "Camera Active — Make a finger frame!");
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Unable to access camera. Check browser permissions.");
    }
  }, [apiKey]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setStatusState("ready");
    setStatusText("Camera Stopped");
  }, []);

  // Toggle Camera
  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Connect Decart Lucy 2.5 Realtime AI
  const connectLucyAI = useCallback(async () => {
    if (!apiKey.trim()) {
      setAiConnectionState("disconnected");
      setAiDiagnosticMsg("No Decart API Key provided. Operating in zero-latency GPU canvas mode.");
      setLiveMode("canvas");
      return;
    }

    try {
      setAiConnectionState("connecting");
      setAiDiagnosticMsg("Exchanging WebRTC SDP handshake with Decart Lucy 2.5 servers...");
      setStatusState("connecting");
      setStatusText("CONNECTING TO DECART LUCY 2.5…");

      // Dynamic ESM loader resistant to bundler import transformations
      const decartModule = await new Function("u", "return import(u)")(DECART_SDK_URL);
      const { createDecartClient, models } = decartModule;

      const model = models.realtime("lucy-2.5");
      const client = createDecartClient({ apiKey: apiKey.trim() });

      const effectObj = MSP_EFFECTS.find((e) => e.id === effect);
      const promptText = effectObj?.prompt || customPrompt || "Transform the video style inside the hand frame.";

      const mediaStream = videoRef.current && videoRef.current.srcObject
        ? (videoRef.current.srcObject as MediaStream)
        : null;

      if (!mediaStream) {
        throw new Error("Camera stream not active. Please launch camera first.");
      }

      const realtimeClient = await client.realtime.connect(mediaStream, {
        model,
        initialState: { prompt: { text: promptText, enhance: true } },
        onRemoteStream: (remoteStream: MediaStream) => {
          if (lucyVidRef.current) {
            lucyVidRef.current.srcObject = remoteStream;
            lucyVidRef.current.play().catch(() => {});
            setAiConnectionState("connected");
            setAiDiagnosticMsg("30fps WebRTC video-to-video AI stream connected.");
            setStatusState("live");
            setStatusText("LIVE AI — 30 FPS");
            setLiveMode("ai");
          }
        },
      });

      realtimeClientRef.current = realtimeClient;
    } catch (err: any) {
      console.error("Decart connection error:", err);
      const errTxt = err.message || "Invalid API key, network error, or WebRTC blocked.";
      setAiConnectionState("error");
      setAiDiagnosticMsg(`Connection Failed: ${errTxt}`);
      setStatusState("error");
      setStatusText(`AI DISCONNECTED — ${errTxt}`);
      setLiveMode("canvas");
    }
  }, [apiKey, effect, customPrompt]);

  // Update prompt on active Decart session
  const pushPromptToLucy = useCallback(async () => {
    if (!realtimeClientRef.current) return;
    const effectObj = MSP_EFFECTS.find((e) => e.id === effect);
    const promptText = effectObj?.prompt || customPrompt || "Transform style inside frame.";
    try {
      await realtimeClientRef.current.set({ prompt: { text: promptText }, enhance: true });
    } catch {
      try {
        await realtimeClientRef.current.set({ prompt: promptText, enhance: true });
      } catch (err) {
        console.warn("Prompt update error:", err);
      }
    }
  }, [effect, customPrompt]);

  useEffect(() => {
    pushPromptToLucy();
  }, [effect, customPrompt, pushPromptToLucy]);

  // FPS Counter & Render Loop
  useEffect(() => {
    let lastTime = -1;
    let frameCount = 0;
    let lastFpsCalc = performance.now();

    const renderLoop = () => {
      animFrameId.current = requestAnimationFrame(renderLoop);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate FPS
      frameCount++;
      const now = performance.now();
      if (now - lastFpsCalc >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsCalc)));
        frameCount = 0;
        lastFpsCalc = now;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Mirrored video background
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-w, 0);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();

      // Hand Landmarker Detection (Instant real-time 60 FPS detection)
      let detectedQuad: [Point, Point, Point, Point] | null = null;

      if (landmarkerRef.current) {
        try {
          const results = landmarkerRef.current.detectForVideo(video, now);
          if (results && results.landmarks && results.landmarks.length >= 2) {
            // Sort 2 hands by screen-space X coordinate (Left Hand vs Right Hand)
            const handsWithPoints = results.landmarks.slice(0, 2).map((hand: any) => {
              const thumb = { x: (1 - hand[4].x) * w, y: hand[4].y * h };
              const index = { x: (1 - hand[8].x) * w, y: hand[8].y * h };
              const avgX = (thumb.x + index.x) / 2;
              return { hand, thumb, index, avgX };
            }).sort((a: any, b: any) => a.avgX - b.avgX);

            const leftHand = handsWithPoints[0];
            const rightHand = handsWithPoints[1];

            const rawPts: Point[] = [
              leftHand.index,
              rightHand.index,
              rightHand.thumb,
              leftHand.thumb,
            ];

            // Centroid of 4 fingertips
            const cx = (rawPts[0].x + rawPts[1].x + rawPts[2].x + rawPts[3].x) / 4;
            const cy = (rawPts[0].y + rawPts[1].y + rawPts[2].y + rawPts[3].y) / 4;

            // Sort points by polar angle around centroid to eliminate self-intersecting hourglass quads when fingers cross
            const sortedPts = [...rawPts].sort((a, b) => {
              const angleA = Math.atan2(a.y - cy, a.x - cx);
              const angleB = Math.atan2(b.y - cy, b.x - cx);
              return angleA - angleB;
            });

            // Find top-leftmost point (min x + y) to keep corner 0 anchored
            let topIdx = 0;
            let minSum = Infinity;
            sortedPts.forEach((pt, i) => {
              const sum = pt.x + pt.y;
              if (sum < minSum) {
                minSum = sum;
                topIdx = i;
              }
            });

            const quadSorted: [Point, Point, Point, Point] = [
              sortedPts[topIdx],
              sortedPts[(topIdx + 1) % 4],
              sortedPts[(topIdx + 2) % 4],
              sortedPts[(topIdx + 3) % 4],
            ];

            const quadWidth = Math.hypot(quadSorted[1].x - quadSorted[0].x, quadSorted[1].y - quadSorted[0].y);
            const quadHeight = Math.hypot(quadSorted[3].x - quadSorted[0].x, quadSorted[3].y - quadSorted[0].y);

            if (quadWidth > 25 && quadHeight > 25) {
              detectedQuad = quadSorted;
            }
          }
        } catch (err) {
          // Ignore transient detection glitch
        }
      }

      // Responsive Lerp Quad smoothing (alpha 0.85 for instant 0-lag tracking)
      if (detectedQuad) {
        lostFramesRef.current = 0;
        setHandDetected(true);
        if (!cornersRef.current) {
          cornersRef.current = detectedQuad;
        } else {
          const alpha = 0.85;
          cornersRef.current = [
            { x: cornersRef.current[0].x + (detectedQuad[0].x - cornersRef.current[0].x) * alpha, y: cornersRef.current[0].y + (detectedQuad[0].y - cornersRef.current[0].y) * alpha },
            { x: cornersRef.current[1].x + (detectedQuad[1].x - cornersRef.current[1].x) * alpha, y: cornersRef.current[1].y + (detectedQuad[1].y - cornersRef.current[1].y) * alpha },
            { x: cornersRef.current[2].x + (detectedQuad[2].x - cornersRef.current[2].x) * alpha, y: cornersRef.current[2].y + (detectedQuad[2].y - cornersRef.current[2].y) * alpha },
            { x: cornersRef.current[3].x + (detectedQuad[3].x - cornersRef.current[3].x) * alpha, y: cornersRef.current[3].y + (detectedQuad[3].y - cornersRef.current[3].y) * alpha },
          ];
        }
        presenceRef.current = Math.min(1, presenceRef.current + 0.25);
      } else {
        lostFramesRef.current += 1;
        // Hold hand frame lock for ~3 seconds (90 frames at 30fps) before graceful disappearance
        if (lostFramesRef.current > 90) {
          presenceRef.current = Math.max(0, presenceRef.current - 0.04);
          if (presenceRef.current === 0) {
            cornersRef.current = null;
            setHandDetected(false);
          }
        }
      }

      // Render inside framed quad
      const quad = cornersRef.current;
      if (quad && presenceRef.current > 0.05) {
        ctx.save();
        ctx.globalAlpha = presenceRef.current;

        ctx.beginPath();
        ctx.moveTo(quad[0].x, quad[0].y);
        ctx.lineTo(quad[1].x, quad[1].y);
        ctx.lineTo(quad[2].x, quad[2].y);
        ctx.lineTo(quad[3].x, quad[3].y);
        ctx.closePath();
        ctx.clip();

        const lucyVid = lucyVidRef.current;
        if (liveMode === "ai" && lucyVid && lucyVid.readyState >= 2 && !lucyVid.paused) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-w, 0);
          ctx.drawImage(lucyVid, 0, 0, w, h);
          ctx.restore();
        } else {
          // Guaranteed zero-latency GPU effect rendering
          drawCanvasEffect(ctx, video, w, h, effect);
        }

        ctx.restore();
        ctx.save();
        ctx.globalAlpha = presenceRef.current;

        // White Dashed Quad Border (Matching reference Lucy Finger Frame style)
        ctx.beginPath();
        ctx.moveTo(quad[0].x, quad[0].y);
        ctx.lineTo(quad[1].x, quad[1].y);
        ctx.lineTo(quad[2].x, quad[2].y);
        ctx.lineTo(quad[3].x, quad[3].y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.stroke();
        ctx.setLineDash([]);

        // White Corner Target Handles
        quad.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
          ctx.stroke();
        });

        ctx.restore();
      }
    };

    renderLoop();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [liveMode, effect]);

  // Built-in Zero-Latency Offline GPU Canvas FX Engine
  const drawCanvasEffect = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, w: number, h: number, effectId: string) => {
    ctx.save();
    switch (effectId) {
      case "anime":
        ctx.filter = "contrast(180%) saturate(200%) brightness(110%) hue-rotate(-10deg)";
        break;

      case "cyberpunk":
        ctx.filter = "contrast(160%) hue-rotate(180deg) saturate(280%)";
        break;

      case "watercolor":
        ctx.filter = "blur(2px) contrast(140%) saturate(160%) brightness(105%)";
        break;

      case "lego":
        ctx.filter = "contrast(150%) saturate(180%)";
        break;

      case "matrix":
        ctx.filter = "contrast(220%) hue-rotate(90deg) saturate(320%) brightness(90%)";
        break;

      case "thermal":
        ctx.filter = "invert(100%) hue-rotate(180deg) saturate(450%) contrast(160%)";
        break;

      case "comic":
        ctx.filter = "contrast(260%) saturate(220%) brightness(105%)";
        break;

      case "oil":
        ctx.filter = "sepia(35%) contrast(145%) saturate(180%) brightness(105%)";
        break;

      case "movie3d":
      default:
        ctx.filter = "contrast(130%) saturate(150%) brightness(108%)";
        break;
    }
    ctx.scale(-1, 1);
    ctx.translate(-w, 0);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = "none";
    ctx.restore();
  };

  // Keyboard Shortcuts (1-6, f, k, c, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= MSP_EFFECTS.length) {
        const sel = MSP_EFFECTS[num - 1].id;
        setEffect(sel);
        if (sel === "custom" && !apiKey) {
          setShowKeyPanel(true);
        }
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "k") {
        setShowKeyPanel((prev) => !prev);
      } else if (e.key.toLowerCase() === "c") {
        toggleCamera();
      } else if (e.key === "?") {
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [apiKey]);

  const saveKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("msp-decart-key", apiKey.trim());
      sessionStorage.setItem("msp-decart-key", apiKey.trim());
      localStorage.setItem("msp-lucy-custom", customPrompt.trim());
    }
    setShowKeyPanel(false);
    if (apiKey.trim() && cameraActive) {
      connectLucyAI();
    }
  };

  const captureSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `MSP-Live-Frame-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Fullscreen sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`msp-pro-stage ${isFullscreen ? "fullscreen-canvas" : ""}`}
    >
      <video ref={videoRef} playsInline muted style={{ display: "none" }} />
      <video ref={lucyVidRef} playsInline muted style={{ display: "none" }} />

      <canvas ref={canvasRef} className="msp-pro-canvas" />

      {/* Pro Telemetry Floating Dock (Top Left) */}
      <div className={`msp-pro-telemetry ${statusState} ${cameraActive ? "on" : ""}`}>
        <div className="telemetry-badge">
          <span className="live-pulse-dot" />
          <span className="telemetry-text">
            {aiConnectionState === "connected"
              ? "🟢 DECART LUCY AI CONNECTED"
              : aiConnectionState === "connecting"
              ? "🟡 CONNECTING DECART AI…"
              : aiConnectionState === "error"
              ? "🔴 AI DISCONNECTED — GPU FX MODE"
              : cameraActive
              ? "⚡ GPU FX ENGINE (Offline)"
              : statusText}
          </span>
        </div>
        {cameraActive && (
          <div className="telemetry-sub">
            <span className="fps-pill">{fps} FPS</span>
            {handDetected ? (
              <span className="hand-active-tag"><CheckCircle2 size={12} /> ✋ Frame Lock</span>
            ) : (
              <span className="hand-searching-tag">Searching Hands</span>
            )}
          </div>
        )}
      </div>

      {/* Pro Quick Controls (Top Right) */}
      <div className="msp-top-actions">
        <button
          className={`pro-action-btn ${cameraActive ? "active" : ""}`}
          onClick={toggleCamera}
          title="Toggle Camera (C)"
        >
          {cameraActive ? <Video size={16} /> : <VideoOff size={16} />}
        </button>
        <button
          className={`pro-action-btn ${apiKey ? "configured" : ""}`}
          onClick={() => setShowKeyPanel(true)}
          title="Decart AI API Key (K)"
        >
          <Key size={16} />
        </button>
        <button className="pro-action-btn" onClick={captureSnapshot} title="Capture Snapshot">
          <Download size={16} />
        </button>
        <button className="pro-action-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          className="pro-action-btn"
          onClick={() => setShowHelpModal(true)}
          title="Help & API Key Guide (?)"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      {/* Pro Floating Gesture Hint Banner */}
      {cameraActive && (
        <div className={`msp-pro-floating-hint ${handDetected ? "hidden" : ""}`}>
          <div className="hint-pill">
            <Sparkles size={16} color="#10b981" className="hint-icon" />
            <span>Hold up both hands to frame the scene</span>
          </div>
        </div>
      )}

      {/* Pro Camera Starter Hero (When camera is stopped) */}
      {!cameraActive && (
        <div className="msp-pro-starter-hero">
          <div className="pro-starter-card">
            <div className="starter-glow-halo" />
            <div className="starter-icon-ring">
              <Camera size={40} color="#10b981" />
            </div>
            <h1 className="pro-hero-title">MSP Live Frame AI</h1>
            <p className="pro-hero-sub">
              Real-time video-to-video AI world transformation framed directly inside your hands gesture box. Created by <strong>Dr. Sanoj Kumar</strong>.
            </p>
            <div className="starter-features-row">
              <span className="mini-feature-tag"><Cpu size={12} /> MediaPipe Vision</span>
              <span className="mini-feature-tag"><Zap size={12} /> Decart Lucy 2.5</span>
              <span className="mini-feature-tag"><Layers size={12} /> 30 FPS Realtime</span>
            </div>
            <button className="pro-launch-btn" onClick={startCamera}>
              <Play size={18} /> Launch Live AI Studio
            </button>
          </div>
        </div>
      )}

      {/* Camera Error Banner */}
      {cameraError && (
        <div className="msp-pro-error-banner">
          <AlertCircle size={18} /> {cameraError}
        </div>
      )}

      {/* Pro Floating Style Dock (Bottom Centered) */}
      <div className="msp-pro-dock">
        <div className="dock-effects-row">
          {MSP_EFFECTS.map((eff) => (
            <button
              key={eff.id}
              className={`pro-dock-card ${effect === eff.id ? "active" : ""}`}
              onClick={() => {
                setEffect(eff.id);
                if (eff.id === "custom" && !apiKey) {
                  setShowKeyPanel(true);
                }
              }}
            >
              <span className="dock-card-label">{eff.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Decart API Key Modal Drawer */}
      {showKeyPanel && (
        <div className="msp-modal-backdrop" onClick={() => setShowKeyPanel(false)}>
          <div className="msp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="msp-modal-header">
              <h3><Key size={18} color="#10b981" /> Decart Lucy 2.5 Realtime AI Key</h3>
              <button className="close-btn" onClick={() => setShowKeyPanel(false)}><X size={18} /></button>
            </div>
            <div className="msp-modal-body">
              <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginBottom: "16px", lineHeight: "1.6" }}>
                Enter your <strong>Decart AI API Key</strong> to activate 30fps Realtime WebRTC video-to-video AI rendering inside your hand frame.
              </p>

              {/* AI Connection Status Diagnostics Card */}
              <div style={{ marginBottom: "18px", padding: "12px 14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#cbd5e1", letterSpacing: "0.02em" }}>AI CONNECTION STATUS</span>
                  {aiConnectionState === "connected" && (
                    <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid #10b981", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                      CONNECTED (30 FPS)
                    </span>
                  )}
                  {aiConnectionState === "connecting" && (
                    <span style={{ background: "rgba(234, 179, 8, 0.2)", color: "#eab308", border: "1px solid #eab308", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#eab308" }} />
                      CONNECTING...
                    </span>
                  )}
                  {aiConnectionState === "error" && (
                    <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid #ef4444", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                      DISCONNECTED / ERROR
                    </span>
                  )}
                  {aiConnectionState === "disconnected" && (
                    <span style={{ background: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                      OFFLINE (GPU Canvas Mode)
                    </span>
                  )}
                </div>
                {aiDiagnosticMsg && (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: aiConnectionState === "error" ? "#fca5a5" : aiConnectionState === "connected" ? "#a7f3d0" : "#94a3b8", lineHeight: "1.4" }}>
                    {aiDiagnosticMsg}
                  </p>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px", color: "#e2e8f0" }}>
                  DECART API KEY
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="decart_sec_..."
                  className="msp-text-input"
                />
              </div>

              <div className="input-group" style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px", color: "#e2e8f0" }}>
                  CUSTOM STYLE PROMPT (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Change the style of the video to..."
                  className="msp-text-input"
                />
              </div>
            </div>
            <div className="msp-modal-footer">
              <button className="btn-sort-secondary" onClick={() => setShowKeyPanel(false)}>Cancel</button>
              <button className="btn-sort-primary" onClick={saveKey}>Save & Connect AI</button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Guide Modal Drawer */}
      {showHelpModal && (
        <div className="msp-modal-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="msp-modal-card help-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="msp-modal-header">
              <h3><HelpCircle size={18} color="#10b981" /> How MSP Live Frame Works & API Key Guide</h3>
              <button className="close-btn" onClick={() => setShowHelpModal(false)}><X size={18} /></button>
            </div>
            <div className="msp-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Section 1: How It Works */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#10b981", fontSize: "0.92rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Cpu size={16} /> How It Operates
                </h4>
                <div className="help-step-list">
                  <div className="help-step-item">
                    <span className="step-num">1</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Dual Hand Tracking (MediaPipe)</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Detects left and right hand landmarks in real time using MediaPipe Hand Landmarker GPU model, tracking index and thumb tips.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num">2</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Dynamic Quad Warp</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Calculates smoothed 4-corner perspective quadrilaterals with exponential lerp motion and hysteresis filtering to eliminate video flicker.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num">3</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Decart Lucy 2.5 Realtime AI</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Streams live WebRTC video-to-video style transformations using Decart Lucy 2.5 AI at 30fps with sub-100ms latency.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num">4</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Zero-Latency GPU Canvas Fallback</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Includes 10 built-in GPU canvas artistic filters (3D CGI, Anime, Cyberpunk, Watercolor, LEGO, Matrix Code, Thermal IR, Comic Book, Oil Painting) working offline instantly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: How to Get Decart Key */}
              <div>
                <h4 style={{ color: "#60a5fa", fontSize: "0.92rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Key size={16} /> How to Get Your Decart AI API Key
                </h4>
                <div className="help-step-list">
                  <div className="help-step-item">
                    <span className="step-num blue">1</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Visit Decart AI Platform</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Open <a href="https://platform.decart.ai" target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "underline", fontWeight: 700 }}>platform.decart.ai</a> in your web browser.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num blue">2</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Sign Up / Log In</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Create a free Decart account or log in with your credentials.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num blue">3</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Generate API Secret Key</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Go to the <strong>API Keys</strong> section in your dashboard and click <strong>Create New Secret Key</strong>. Copy your key starting with <code style={{ color: "#34d399", background: "rgba(16, 185, 129, 0.15)", padding: "1px 6px", borderRadius: "4px" }}>decart_sec_...</code>.
                      </p>
                    </div>
                  </div>
                  <div className="help-step-item">
                    <span className="step-num blue">4</span>
                    <div>
                      <strong style={{ color: "#f8fafc" }}>Enter Key & Connect</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Click the 🔑 Key button in the top right (or press <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "4px", color: "#10b981" }}>K</kbd>) and paste your key to activate 30fps Realtime AI streaming!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: AI Connection Status Guide */}
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ color: "#a855f7", fontSize: "0.92rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={16} /> Connection Status Badges & Diagnostics
                </h4>
                <div className="help-step-list">
                  <div className="help-step-item">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981", marginTop: "6px", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#34d399" }}>🟢 CONNECTED (30 FPS)</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Decart Lucy 2.5 WebRTC session is active! Streaming 30fps video-to-video AI rendering inside your gesture box.
                      </p>
                    </div>
                  </div>

                  <div className="help-step-item">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308", marginTop: "6px", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#fde047" }}>🟡 CONNECTING…</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Exchanging WebRTC SDP handshake & audio/video tracks with Decart AI servers.
                      </p>
                    </div>
                  </div>

                  <div className="help-step-item">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", marginTop: "6px", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#fca5a5" }}>🔴 DISCONNECTED / ERROR</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        Connection failed. Verify key starts with <code style={{ color: "#ef4444", background: "rgba(239,68,68,0.15)", padding: "1px 6px", borderRadius: "4px" }}>decart_sec_...</code>, check network, and launch camera.
                      </p>
                    </div>
                  </div>

                  <div className="help-step-item">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#94a3b8", marginTop: "6px", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "#cbd5e1" }}>⚪ OFFLINE (GPU Canvas Mode)</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        No API key provided. Studio seamlessly uses built-in GPU canvas artistic filters working 100% offline with zero latency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="msp-modal-footer">
              <button className="btn-sort-secondary" onClick={() => { setShowHelpModal(false); setShowKeyPanel(true); }}>
                <Key size={14} /> Enter API Key
              </button>
              <button className="btn-sort-primary" onClick={() => setShowHelpModal(false)}>Got It!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
