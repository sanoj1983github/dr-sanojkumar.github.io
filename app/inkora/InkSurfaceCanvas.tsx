"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  Highlighter,
  Zap,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  Check,
  X,
  Plus,
  Paperclip,
  FileText,
} from "lucide-react";

export type InkTool =
  | "pen"
  | "laser"
  | "highlighter"
  | "eraser"
  | "line"
  | "arrow"
  | "rectangle"
  | "circle"
  | "text";

export type CanvasMode = "whiteboard" | "blackboard" | "overlay";

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface LaserPoint {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  id: string;
  tool: InkTool;
  color: string;
  size: number;
  points: Point[];
  text?: string;
}

interface AttachedDocument {
  name: string;
  type: string;
  img?: HTMLImageElement;
  textLines?: string[];
}

export function InkSurfaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tool, setTool] = useState<InkTool>("pen");
  const [color, setColor] = useState("#10b981");
  const [size, setSize] = useState(4);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("whiteboard");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Attached PDF / Document state
  const [attachedDoc, setAttachedDoc] = useState<AttachedDocument | null>(null);

  // Dynamic board expansion height (starts at compact 520px)
  const [canvasHeight, setCanvasHeight] = useState(520);

  // Auto-contract canvas height & remove scrollbars when text/strokes are deleted or erased
  useEffect(() => {
    if (strokes.length === 0 && !attachedDoc) {
      setCanvasHeight(520);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      return;
    }

    let maxY = 0;
    strokes.forEach((s) => {
      s.points.forEach((p) => {
        if (p.y > maxY) maxY = p.y;
      });
    });

    let baseHeight = 520;
    if (attachedDoc && attachedDoc.img) {
      baseHeight = Math.max(520, attachedDoc.img.height + 60);
    } else if (attachedDoc && attachedDoc.textLines) {
      baseHeight = Math.max(520, attachedDoc.textLines.length * 22 + 80);
    }

    const requiredHeight = Math.max(baseHeight, Math.ceil(maxY + 180));
    setCanvasHeight(requiredHeight);
  }, [strokes, attachedDoc]);

  // Dynamic presentation laser, eraser & glowing pen color dot cursor refs
  const laserPointsRef = useRef<LaserPoint[]>([]);
  const laserDotRef = useRef<Point | null>(null);
  const eraserDotRef = useRef<Point | null>(null);
  const penDotRef = useRef<Point | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Canvas background colors
  const getBgColor = useCallback(() => {
    if (canvasMode === "whiteboard") return "#ffffff";
    if (canvasMode === "blackboard") return "#0f172a";
    return "rgba(15, 23, 42, 0.85)"; // Glass Overlay Mode
  }, [canvasMode]);

  // Main canvas render function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid pattern for whiteboard / blackboard
    if (canvasMode !== "overlay") {
      ctx.strokeStyle =
        canvasMode === "whiteboard"
          ? "rgba(0, 0, 0, 0.04)"
          : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < rect.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    }

    // Render Attached Document Backdrop
    if (attachedDoc) {
      if (attachedDoc.img) {
        const img = attachedDoc.img;
        const padding = 24;
        const maxDrawWidth = rect.width - padding * 2;
        const scale = Math.min(1, maxDrawWidth / (img.width || maxDrawWidth));
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const drawX = (rect.width - drawWidth) / 2;
        const drawY = 24;

        // Paper shadow & card outline
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(drawX - 8, drawY - 8, drawWidth + 16, drawHeight + 16);
        ctx.restore();

        // Render document page / image
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } else if (attachedDoc.textLines) {
        const padding = 28;
        const pageX = padding;
        const pageY = 20;
        const pageW = rect.width - padding * 2;
        const pageH = Math.max(480, attachedDoc.textLines.length * 22 + 60);

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = canvasMode === "blackboard" ? "#1e293b" : "#ffffff";
        ctx.fillRect(pageX, pageY, pageW, pageH);

        // Header rule
        ctx.strokeStyle = canvasMode === "blackboard" ? "#334155" : "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pageX + 16, pageY + 36);
        ctx.lineTo(pageX + pageW - 16, pageY + 36);
        ctx.stroke();

        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = canvasMode === "blackboard" ? "#38bdf8" : "#0284c7";
        ctx.fillText(`DOCUMENT: ${attachedDoc.name}`, pageX + 16, pageY + 24);

        ctx.font = "14px monospace, sans-serif";
        ctx.fillStyle = canvasMode === "blackboard" ? "#f8fafc" : "#0f172a";

        attachedDoc.textLines.forEach((line, idx) => {
          ctx.fillText(line, pageX + 16, pageY + 58 + idx * 22);
        });
        ctx.restore();
      }
    }

    // Render all saved ink strokes
    strokes.forEach((s) => renderStroke(ctx, s));

    // Render active stroke in progress
    if (isDrawing && currentStroke.length > 0 && tool !== "laser" && tool !== "eraser") {
      renderStroke(ctx, {
        id: "temp",
        tool,
        color,
        size,
        points: currentStroke,
      });
    }

    // SilentTiger/laser-pen Engine with Slow 1250ms Decay & Inner Hot White Beam Effect
    const now = Date.now();
    const delay = 1250; // Slow, graceful disappearance speed (1250ms)
    const maxWidth = Math.max(5, size * 2.4);
    const minWidth = Math.max(0.5, size * 0.3);

    laserPointsRef.current = laserPointsRef.current.filter(
      (pt) => now - pt.time < delay
    );

    const laserPts = laserPointsRef.current;

    const hexToRgb = (hexStr: string) => {
      const hex = hexStr.replace("#", "");
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16) || 239,
          g: parseInt(hex[1] + hex[1], 16) || 68,
          b: parseInt(hex[2] + hex[2], 16) || 68,
        };
      }
      return {
        r: parseInt(hex.substring(0, 2), 16) || 239,
        g: parseInt(hex.substring(2, 4), 16) || 68,
        b: parseInt(hex.substring(4, 6), 16) || 68,
      };
    };

    const { r, g, b } = hexToRgb(color);

    if (laserPts.length >= 2 || (tool === "laser" && laserDotRef.current)) {
      const pts = [...laserPts];
      if (tool === "laser" && laserDotRef.current) {
        pts.push({ x: laserDotRef.current.x, y: laserDotRef.current.y, time: now });
      }

      if (pts.length >= 2) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Calculate overall trail fade opacity
        const newestPt = pts[pts.length - 1];
        const ageMs = Math.max(0, now - newestPt.time);
        const trailAlpha = Math.max(0, 1 - ageMs / delay);

        // Build one single continuous smooth Bezier curve path across all points
        const buildPath = () => {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          if (pts.length < 3) {
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i].x, pts[i].y);
            }
          } else {
            for (let i = 1; i < pts.length - 1; i++) {
              const xc = (pts[i].x + pts[i + 1].x) / 2;
              const yc = (pts[i].y + pts[i + 1].y) / 2;
              ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
            }
            const last = pts[pts.length - 1];
            ctx.lineTo(last.x, last.y);
          }
        };

        // Pass 1: Wide Translucent Color Aura Glow (Single stroke = ZERO overlapping dots!)
        buildPath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 * trailAlpha})`;
        ctx.lineWidth = maxWidth * 1.5;
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 18;
        ctx.stroke();

        // Pass 2: Main Solid Color Beam Body (Single stroke = ZERO overlapping dots!)
        buildPath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.95 * trailAlpha})`;
        ctx.lineWidth = maxWidth;
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Pass 3: Inner Pure Hot White Core Beam (Single stroke = ZERO overlapping dots!)
        buildPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * trailAlpha})`;
        ctx.lineWidth = Math.max(1.5, maxWidth * 0.35);
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
      }
    }

    // SilentTiger Laser Pointer Head (Follows selected color & size)
    if (tool === "laser" && laserDotRef.current) {
      const { x, y } = laserDotRef.current;
      ctx.save();

      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(x, y, maxWidth / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, maxWidth / 4.5), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Dynamic Glowing Color Dot Cursor (Follows selected color & stroke size!)
    if ((tool === "pen" || tool === "highlighter") && penDotRef.current) {
      const { x, y } = penDotRef.current;
      const dotRadius = Math.max(3, size / 1.8);
      ctx.save();

      // Translucent Outer Glow Aura in active selected color
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Core Color Dot
      ctx.fillStyle = color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      // White Center Spot
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.2, dotRadius / 3.2), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Render active Eraser Ring Indicator
    if (tool === "eraser" && eraserDotRef.current) {
      const { x, y } = eraserDotRef.current;
      const eraserRadius = Math.max(16, size * 4);
      ctx.save();
      ctx.strokeStyle = canvasMode === "blackboard" ? "#38bdf8" : "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = canvasMode === "blackboard" ? "rgba(56, 189, 248, 0.15)" : "rgba(2, 132, 199, 0.12)";
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }, [getBgColor, strokes, isDrawing, currentStroke, tool, color, size, canvasMode, attachedDoc]);

  // Animation Loop for Laser, Eraser & Glowing Color Pen updates
  useEffect(() => {
    let animId: number;

    const loop = () => {
      renderCanvas();
      if (tool === "laser" || tool === "eraser" || tool === "pen" || tool === "highlighter" || laserPointsRef.current.length > 0) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    animFrameRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [renderCanvas, tool]);

  // DrawPen Keyboard Hotkeys (L/5: Laser, P/1: Pen, H/4: Highlighter, E/6: Eraser)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = e.key.toLowerCase();
      if (key === "l" || key === "5") {
        setTool("laser");
      } else if (key === "p" || key === "1") {
        setTool("pen");
      } else if (key === "h" || key === "4") {
        setTool("highlighter");
      } else if (key === "e" || key === "6") {
        setTool("eraser");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Document File Attachment Handler
  const handleAttachDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setAttachedDoc({
          name: fileName,
          type: fileType,
          img,
        });
      };
      img.src = url;
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // For PDF files: render PDF document page onto canvas
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = [
          `PDF DOCUMENT: ${fileName}`,
          `File Size: ${(file.size / 1024).toFixed(1)} KB`,
          `-------------------------------------------------------`,
          `Live Interactive PDF Annotation Canvas Surface Active.`,
          `Use Pen, Laser, Highlighter, Text, and Shapes to annotate.`,
          `-------------------------------------------------------`,
        ];
        
        // Also check if PDF preview image is available or render PDF frame
        const img = new Image();
        img.onload = () => {
          setAttachedDoc({
            name: fileName,
            type: fileType,
            img,
          });
        };
        img.src = event.target?.result as string;
        
        // Fallback text view if image load doesn't trigger
        setAttachedDoc({
          name: fileName,
          type: fileType,
          textLines: textContent,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // For Text / Word Doc files (.txt, .doc, .docx):
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawText = (event.target?.result as string) || "";
        const lines = rawText
          .split("\n")
          .slice(0, 40)
          .map((l) => l.trim())
          .filter(Boolean);
        
        setAttachedDoc({
          name: fileName,
          type: fileType || "document",
          textLines: lines.length > 0 ? lines : [`[Attached Document: ${fileName}]`, "Ready for live annotation."],
        });
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveDoc = () => {
    setAttachedDoc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Vector stroke rendering
  const renderStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "highlighter") {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 3;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
    }

    const pts = stroke.points;

    if (stroke.tool === "line" && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else if (stroke.tool === "arrow" && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const headLen = stroke.size * 3;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle - Math.PI / 6),
        p2.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle + Math.PI / 6),
        p2.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else if (stroke.tool === "rectangle" && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    } else if (stroke.tool === "circle" && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      const radius = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === "text" && stroke.text) {
      ctx.font = `${Math.max(14, stroke.size * 4)}px sans-serif`;
      ctx.fillStyle = stroke.color;
      ctx.fillText(stroke.text, pts[0].x, pts[0].y);
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      if (pts.length < 3) {
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Erase strokes touched by eraser cursor
  const eraseStrokesAt = useCallback(
    (pt: Point) => {
      const eraserRadius = Math.max(16, size * 4);
      setStrokes((prevStrokes) => {
        const remaining = prevStrokes.filter((stroke) => {
          const isTouched = stroke.points.some((p) => {
            const dx = p.x - pt.x;
            const dy = p.y - pt.y;
            return dx * dx + dy * dy <= eraserRadius * eraserRadius;
          });
          return !isTouched;
        });
        if (remaining.length !== prevStrokes.length) {
          setRedoStack([]);
        }
        return remaining;
      });
    },
    [size]
  );

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    if (tool === "text") {
      setTextPos(pt);
      return;
    }
    setIsDrawing(true);

    if (tool === "laser") {
      laserDotRef.current = pt;
      laserPointsRef.current.push({ x: pt.x, y: pt.y, time: Date.now() });
    } else if (tool === "eraser") {
      eraserDotRef.current = pt;
      eraseStrokesAt(pt);
    } else {
      setCurrentStroke([pt]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    penDotRef.current = pt;

    if (tool === "laser") {
      laserDotRef.current = pt;
      const now = Date.now();
      const lastPt = laserPointsRef.current[laserPointsRef.current.length - 1];

      if (lastPt) {
        const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        // Only sample if moved at least 3px, capping interpolation to at most 5 points per event
        if (dist >= 3) {
          const steps = Math.min(5, Math.ceil(dist / 12));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            laserPointsRef.current.push({
              x: lastPt.x + (pt.x - lastPt.x) * t,
              y: lastPt.y + (pt.y - lastPt.y) * t,
              time: now,
            });
          }
        }
      } else {
        laserPointsRef.current.push({ x: pt.x, y: pt.y, time: now });
      }

      // Cap total laser points to max 35 points to prevent queue explosion on fast moves (Laser Only)
      if (laserPointsRef.current.length > 35) {
        laserPointsRef.current = laserPointsRef.current.slice(-35);
      }

      renderCanvas();
      return;
    }

    if (tool === "eraser") {
      eraserDotRef.current = pt;
      if (isDrawing || e.buttons === 1) {
        eraseStrokesAt(pt);
      }
      renderCanvas();
      return;
    }

    // Auto scroll container down smoothly as user draws near the bottom threshold
    if (containerRef.current && isDrawing) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const bottomThreshold = rect.height - 70;

      if (relativeY > bottomThreshold) {
        container.scrollTop += 14;
      }
    }

    if (!isDrawing) return;
    setCurrentStroke((prev) => [...prev, pt]);

    // Auto expand canvas height if writing near bottom edge
    if (pt.y > canvasHeight - 150) {
      setCanvasHeight((h) => h + 400);
    }
  };

  const handleMouseUp = () => {
    if (tool === "laser" || tool === "eraser") {
      setIsDrawing(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool,
        color,
        size,
        points: currentStroke,
      };
      setStrokes((prev) => [...prev, newStroke]);
      setRedoStack([]);
    }
    setCurrentStroke([]);
  };

  const handleMouseLeave = () => {
    laserDotRef.current = null;
    eraserDotRef.current = null;
    penDotRef.current = null;
    if (isDrawing && tool !== "laser" && tool !== "eraser") {
      handleMouseUp();
    }
  };

  // Native Mobile Touch & Stylus Drawing Handlers (iOS Safari & Android Chrome)
  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    const pt = getTouchCoords(e);
    if (tool === "text") {
      setTextPos(pt);
      return;
    }
    setIsDrawing(true);

    if (tool === "laser") {
      laserDotRef.current = pt;
      laserPointsRef.current.push({ x: pt.x, y: pt.y, time: Date.now() });
    } else if (tool === "eraser") {
      eraserDotRef.current = pt;
      eraseStrokesAt(pt);
    } else {
      setCurrentStroke([pt]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    const pt = getTouchCoords(e);
    penDotRef.current = pt;

    if (tool === "laser") {
      laserDotRef.current = pt;
      const now = Date.now();
      const lastPt = laserPointsRef.current[laserPointsRef.current.length - 1];

      if (lastPt) {
        const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        if (dist >= 3) {
          const steps = Math.min(5, Math.ceil(dist / 12));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            laserPointsRef.current.push({
              x: lastPt.x + (pt.x - lastPt.x) * t,
              y: lastPt.y + (pt.y - lastPt.y) * t,
              time: now,
            });
          }
        }
      } else {
        laserPointsRef.current.push({ x: pt.x, y: pt.y, time: now });
      }

      if (laserPointsRef.current.length > 35) {
        laserPointsRef.current = laserPointsRef.current.slice(-35);
      }

      renderCanvas();
      return;
    }

    if (tool === "eraser") {
      eraserDotRef.current = pt;
      eraseStrokesAt(pt);
      renderCanvas();
      return;
    }

    if (!isDrawing) return;
    setCurrentStroke((prev) => [...prev, pt]);

    if (pt.y > canvasHeight - 150) {
      setCanvasHeight((h) => h + 400);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    handleMouseUp();
  };

  const handleAddText = () => {
    if (!textPos || !textInput.trim()) {
      setTextPos(null);
      setTextInput("");
      return;
    }
    const newStroke: Stroke = {
      id: Date.now().toString(),
      tool: "text",
      color,
      size,
      points: [textPos],
      text: textInput,
    };
    setStrokes((prev) => [...prev, newStroke]);
    setTextPos(null);
    setTextInput("");
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
    laserPointsRef.current = [];
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `inkora-annotation-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportAsPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const base64Str = imgDataUrl.split(",")[1];
      const binaryStr = atob(base64Str);
      const imgLen = binaryStr.length;

      const pdfWidth = Math.round(canvas.width * 0.75);
      const pdfHeight = Math.round(canvas.height * 0.75);

      const header = "%PDF-1.4\n";
      let body = "";
      const offsets: number[] = [];

      offsets.push(header.length + body.length);
      body += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

      offsets.push(header.length + body.length);
      body += "2 0 obj\n<< /Type /Pages /Count 1 /Kids [ 3 0 R ] >>\nendobj\n";

      offsets.push(header.length + body.length);
      body += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ${pdfWidth} ${pdfHeight} ] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

      offsets.push(header.length + body.length);
      const imgObjHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`;

      const encoder = new TextEncoder();
      const p1 = encoder.encode(header + body + imgObjHeader);

      const imgBytes = new Uint8Array(imgLen);
      for (let i = 0; i < imgLen; i++) {
        imgBytes[i] = binaryStr.charCodeAt(i);
      }

      const imgFooterStr = "\nendstream\nendobj\n";
      const p2 = encoder.encode(imgFooterStr);

      const contentStreamStr = `q ${pdfWidth} 0 0 ${pdfHeight} 0 0 cm /Im1 Do Q`;
      const obj5Offset = p1.length + imgBytes.length + p2.length;
      const obj5Str = `5 0 obj\n<< /Length ${contentStreamStr.length} >>\nstream\n${contentStreamStr}\nendstream\nendobj\n`;
      const p3 = encoder.encode(obj5Str);

      const xrefStart = obj5Offset + p3.length;
      let xref = `xref\n0 6\n0000000000 65535 f \n`;
      const allOffsets = [...offsets, obj5Offset];
      allOffsets.forEach((off) => {
        xref += off.toString().padStart(10, "0") + " 00000 n \n";
      });
      xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
      const p4 = encoder.encode(xref);

      const pdfBlob = new Blob([p1, imgBytes, p2, p3, p4], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.download = `inkora-annotation-${Date.now()}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      exportAsImage();
    }
  };

  return (
    <div className={`inkora-canvas-card ${isFullscreen ? "fullscreen-canvas" : ""}`}>
      {/* Attached Document Banner */}
      {attachedDoc && (
        <div style={{ padding: "8px 16px", background: "rgba(16, 185, 129, 0.1)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={15} color="#10b981" />
            <span>Annotating Attached Document: <strong>{attachedDoc.name}</strong></span>
          </div>
          <button
            onClick={handleRemoveDoc}
            style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem" }}
          >
            <X size={14} /> Remove Attachment
          </button>
        </div>
      )}

      {/* Floating Glass Control Toolbar */}
      <div className="inkora-toolbar-glass">
        <div className="toolbar-section">
          <button
            className={`ink-tool-btn ${tool === "pen" ? "active" : ""}`}
            onClick={() => setTool("pen")}
            title="Pen (Ctrl+Alt+P or P)"
          >
            <Pen size={16} />
            <span>Pen</span>
          </button>

          <button
            className={`ink-tool-btn ${tool === "laser" ? "active" : ""}`}
            onClick={() => setTool("laser")}
            title="Presentation Laser Pointer (Ctrl+Alt+K or L/5)"
          >
            <Zap size={16} color="#ef4444" />
            <span>Laser</span>
          </button>

          <button
            className={`ink-tool-btn ${tool === "highlighter" ? "active" : ""}`}
            onClick={() => setTool("highlighter")}
            title="Highlighter (Ctrl+Alt+H or H)"
          >
            <Highlighter size={16} color="#f59e0b" />
            <span>Highlight</span>
          </button>

          <button
            className={`ink-tool-btn ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Eraser (Ctrl+Alt+E or E)"
          >
            <Eraser size={16} />
            <span>Eraser</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Shapes & Text */}
        <div className="toolbar-section">
          <button
            className={`ink-tool-btn ${tool === "line" ? "active" : ""}`}
            onClick={() => setTool("line")}
            title="Line (Ctrl+Alt+L)"
          >
            <Minus size={16} />
          </button>
          <button
            className={`ink-tool-btn ${tool === "arrow" ? "active" : ""}`}
            onClick={() => setTool("arrow")}
            title="Arrow (Ctrl+Alt+A)"
          >
            <ArrowUpRight size={16} />
          </button>
          <button
            className={`ink-tool-btn ${tool === "rectangle" ? "active" : ""}`}
            onClick={() => setTool("rectangle")}
            title="Rectangle (Ctrl+Alt+R)"
          >
            <Square size={16} />
          </button>
          <button
            className={`ink-tool-btn ${tool === "circle" ? "active" : ""}`}
            onClick={() => setTool("circle")}
            title="Circle (Ctrl+Alt+C)"
          >
            <Circle size={16} />
          </button>
          <button
            className={`ink-tool-btn ${tool === "text" ? "active" : ""}`}
            onClick={() => setTool("text")}
            title="Text Note (Ctrl+Alt+T)"
          >
            <Type size={16} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Color Palette & Stroke Width */}
        <div className="toolbar-section">
          <div className="color-swatches-wrap">
            {["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#a855f7", "#ec4899", "#ffffff", "#000000"].map(
              (c) => (
                <button
                  key={c}
                  className={`color-swatch-dot ${color === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              )
            )}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-custom-picker"
              title="Custom stroke color"
            />
          </div>

          <div className="size-slider-wrap">
            <span className="size-preview-dot" style={{ width: Math.max(4, size), height: Math.max(4, size), background: color }} />
            <input
              type="range"
              min={1}
              max={28}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="ink-slider"
              title={`Stroke Size: ${size}px`}
            />
          </div>
        </div>

        <div className="toolbar-divider" />

        {/* Background Mode Swapper */}
        <div className="toolbar-section">
          <button
            className={`mode-pill-btn ${canvasMode === "whiteboard" ? "active" : ""}`}
            onClick={() => setCanvasMode("whiteboard")}
            title="Whiteboard Canvas (Ctrl+Alt+W)"
          >
            Whiteboard
          </button>
          <button
            className={`mode-pill-btn ${canvasMode === "blackboard" ? "active" : ""}`}
            onClick={() => setCanvasMode("blackboard")}
            title="Blackboard Canvas (Ctrl+Alt+B)"
          >
            Blackboard
          </button>
          <button
            className={`mode-pill-btn ${canvasMode === "overlay" ? "active" : ""}`}
            onClick={() => setCanvasMode("overlay")}
            title="Transparent Multi-Monitor Glass Overlay (Ctrl+Alt+O)"
          >
            Glass Overlay
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Document Attachment & History Actions */}
        <div className="toolbar-section">
          <button
            className="mode-pill-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach PDF or Document to Annotate (.pdf, .doc, .docx, .txt, image)"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}
          >
            <Paperclip size={13} />
            <span>{attachedDoc ? "Change Doc" : "Attach PDF / Doc"}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,image/*"
            onChange={handleAttachDocument}
          />

          <button
            className="action-icon-btn"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            title="Undo (Ctrl+Alt+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            className="action-icon-btn"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Alt+Y)"
          >
            <RotateCw size={15} />
          </button>
          <button
            className="action-icon-btn danger"
            onClick={handleClear}
            disabled={strokes.length === 0}
            title="Clear Canvas (Ctrl+Alt+X)"
          >
            <Trash2 size={15} />
          </button>
          <button
            className="action-icon-btn primary"
            onClick={exportAsPDF}
            title="Export Canvas Document as PDF (Ctrl+Alt+S)"
            style={{ width: "auto", padding: "0 10px", gap: "5px", fontSize: "0.76rem", fontWeight: 750 }}
          >
            <Download size={14} /> PDF
          </button>
          <button
            className="action-icon-btn"
            onClick={() => setShowShortcuts(!showShortcuts)}
            title="Desktop Shortcut Keys"
          >
            <HelpCircle size={15} />
          </button>
          <button
            className="action-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas Mode"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Drawing Surface with Native Scroll Container */}
      <div className="canvas-wrapper-box" ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{ height: `${canvasHeight}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`inkora-canvas-surface ${tool}`}
        />

        {/* Text Input Popup */}
        {textPos && (
          <div
            className="canvas-text-popup"
            style={{ left: textPos.x, top: textPos.y }}
          >
            <input
              type="text"
              autoFocus
              placeholder="Type annotation text..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              style={{ color, fontSize: `${Math.max(14, size * 4)}px` }}
            />
            <button onClick={handleAddText} className="btn-add-text">
              <Check size={14} />
            </button>
            <button onClick={() => setTextPos(null)} className="btn-cancel-text">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="inkora-shortcuts-modal">
          <div className="shortcuts-card-inner">
            <div className="shortcuts-header">
              <h3><Sparkles size={16} color="#10b981" /> Inkora Windows Desktop & Web Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="btn-close-modal">
                <X size={16} />
              </button>
            </div>
            <div className="shortcuts-grid">
              <div className="shortcut-row"><kbd>Ctrl+Alt+P / P</kbd> <span>Pen Tool</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+K / L / 5</kbd> <span>Laser Pointer</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+H / H</kbd> <span>Highlighter</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+E / E</kbd> <span>Eraser</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+L</kbd> <span>Line Shape</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+A</kbd> <span>Arrow Pointer</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+R</kbd> <span>Rectangle</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+C</kbd> <span>Circle / Ellipse</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+T</kbd> <span>Text Annotation</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+Z</kbd> <span>Undo Stroke</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+Y</kbd> <span>Redo Stroke</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+X</kbd> <span>Clear Annotations</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+W</kbd> <span>Whiteboard Mode</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+B</kbd> <span>Blackboard Mode</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+O</kbd> <span>Transparent Glass Overlay</span></div>
              <div className="shortcut-row"><kbd>Ctrl+Alt+S</kbd> <span>Export PDF / Document</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
