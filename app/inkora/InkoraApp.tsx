"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  ChevronRight,
  Focus,
  WandSparkles,
  Search,
  Share2,
  ShieldCheck,
  Zap,
  Cloud,
  ArrowRight,
  MousePointer2,
  Sparkles,
  CircleCheckBig,
  Globe2,
  Lock,
  UserCheck,
  LogIn,
  UserPlus,
  ExternalLink,
  Layers,
} from "lucide-react";
import { InkSurfaceCanvas } from "./InkSurfaceCanvas";

const featureCards = [
  {
    icon: Focus,
    eyebrow: "Focus Canvas",
    title: "A calm place for loud ideas.",
    copy: "Distraction-free transparent overlay canvas keeps your annotations front and center across all monitors.",
    badge: "Multi-Monitor",
  },
  {
    icon: WandSparkles,
    eyebrow: "Smart Catmull-Rom Smoothing",
    title: "Inks that feel naturally fluid.",
    copy: "Catmull-Rom spline interpolation converts raw stylus & touch points into ultra-smooth vector curves.",
    badge: "Spline Engine",
  },
  {
    icon: Search,
    eyebrow: "Instant Annotation Recall",
    title: "Capture every screen idea.",
    copy: "Draw anywhere, save snapshots, and search across every saved annotation session with single-key shortcuts.",
    badge: "Quick Capture",
  },
  {
    icon: Share2,
    eyebrow: "PDF & PNG Export",
    title: "From live sketch to shareable document.",
    copy: "Export high-resolution transparent PNG images or single-page PDF annotation documents instantly.",
    badge: "Vector Export",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Capture Anywhere",
    copy: "Press Ctrl+Alt+P to invoke the glass overlay and sketch anywhere on your desktop or browser instantly.",
  },
  {
    number: "02",
    title: "Shape & Annotate",
    copy: "Use smart shapes, laser pointers, highlighters, and text callouts with automatic pressure-speed smoothing.",
  },
  {
    number: "03",
    title: "Export & Share",
    copy: "Save as PNG/PDF, copy to clipboard, or minimize to the Windows notification tray seamlessly.",
  },
];

export function InkoraApp() {
  const [copied, setCopied] = useState(false);
  const [downloadCount, setDownloadCount] = useState(1428);
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "done">("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);

  const subdomainUrl = "https://dr-mritunjaysp.com/inkora";

  const handleCopySubdomain = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInstaller = () => {
    setDownloadState("working");
    setDownloadCount((prev) => prev + 1);

    const link = document.createElement("a");
    link.href = "/downloads/Inkora-Setup-1.0.0-x64.exe";
    link.download = "Inkora-Setup-1.0.0-x64.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadState("done"), 800);
    setTimeout(() => setDownloadState("idle"), 3000);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccess(true);
    setTimeout(() => {
      setShowAuthModal(false);
      setAuthSuccess(false);
    }, 1500);
  };

  return (
    <section className="sorting-page inkora-page">
      {/* Page Intro Header */}
      <div className="page-intro" style={{ marginBottom: "12px" }}>
        <p className="eyebrow" style={{ fontSize: "0.72rem" }}>
          Modern Multi-Monitor Desktop Ink Platform & Web Canvas
        </p>
        <div className="title-header-row">
          <h1 className="page-intro-title" style={{ fontSize: "1.35rem" }}>
            Inkora PenApp — Screen Annotation & Whiteboard System
          </h1>
        </div>
      </div>


      {/* Main Interactive Web Canvas & Ink Studio Workbench */}
      <div className="sorting-workbench" style={{ marginTop: "8px", gap: "8px" }}>
        <div className="sorting-control-panel" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#10b981" /> Interactive Live Web Ink Surface
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                Draw with smooth Catmull-Rom splines, test highlighters, laser pointer, shapes, and export PNG directly in browser.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-sort-primary"
                style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                onClick={handleDownloadInstaller}
                disabled={downloadState === "working"}
              >
                <Download size={14} />
                {downloadState === "working" ? "Downloading..." : "Download Windows App (.exe)"}
              </button>
              <button
                className="btn-sort-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 12px" }}
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
              >
                <LogIn size={14} /> Sign In
              </button>
            </div>
          </div>

          {/* Render Interactive Live Canvas */}
          <InkSurfaceCanvas />
        </div>

        {/* Product Highlights Trust Strip */}
        <div className="trust-strip-box" style={{ marginTop: "8px" }}>
          <div className="trust-item">
            <Check size={15} color="#10b981" /> <span>Transparent Multi-Monitor Overlay</span>
          </div>
          <div className="trust-item">
            <Check size={15} color="#10b981" /> <span>Catmull-Rom Spline Anti-Jitter</span>
          </div>
          <div className="trust-item">
            <Check size={15} color="#10b981" /> <span>16+ Global System Hotkeys</span>
          </div>
        </div>

        {/* Inkora Feature Cards Showcase */}
        <div className="projects-showcase-grid" style={{ marginTop: "8px", gap: "8px" }}>
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div className="project-feature-card" key={feat.title} style={{ padding: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="project-badge-tag">{feat.badge}</span>
                    <Icon size={18} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px 0" }}>{feat.title}</h3>
                  <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{feat.copy}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow & Desktop App Showcase Section */}
        <div className="algo-info-card" style={{ marginTop: "8px", padding: "14px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span className="section-kicker" style={{ color: "#10b981", fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Native Windows 10/11 Architecture
            </span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "4px" }}>
              From First Mouse/Stylus Touch to Multi-Screen Masterpiece
            </h2>
          </div>

          <div className="algo-info-grid" style={{ gap: "10px" }}>
            {workflowSteps.map((step) => (
              <div className="algo-stat-box" key={step.number} style={{ textAlign: "left", padding: "14px" }}>
                <span className="algo-stat-label" style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 900 }}>
                  Step {step.number}
                </span>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 800, margin: "4px 0 6px 0" }}>{step.title}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: 1.45 }}>{step.copy}</p>
              </div>
            ))}
          </div>

          {/* Showcase Image Banner */}
          <div style={{ marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg)" }}>
            <img
              src="/inkora-studio.png"
              alt="Inkora App Studio Visual"
              style={{ width: "100%", height: "auto", display: "block", maxHeight: "380px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Windows Setup Download Banner Card */}
        <div className="control-card-section highlight-card" style={{ padding: "16px", marginTop: "8px", minHeight: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="control-card-badge emerald-badge">Windows 10/11 Installer</span>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "8px 0 4px 0" }}>
                Get Inkora Desktop App (.exe)
              </h2>
              <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0 }}>
                Includes 64-bit Windows setup package, multi-monitor transparent glass overlay, Catmull-Rom anti-jitter, system tray support, and offline annotation mode.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn-sort-primary-lg"
                style={{ padding: "12px 24px", fontSize: "0.95rem" }}
                onClick={handleDownloadInstaller}
                disabled={downloadState === "working"}
              >
                <Download size={18} />
                {downloadState === "working" ? "Preparing Setup..." : "Download Inkora Setup (73 MB)"}
              </button>
              <span style={{ fontSize: "0.74rem", color: "var(--muted)", textAlign: "center" }}>
                Free 1.0 Beta • 100% Offline & Private
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal (Login / Sign Up) */}
      {showAuthModal && (
        <div className="inkora-shortcuts-modal">
          <div className="shortcuts-card-inner" style={{ maxWidth: "420px" }}>
            <div className="shortcuts-header">
              <h3>
                {authMode === "login" ? <LogIn size={16} color="#10b981" /> : <UserPlus size={16} color="#10b981" />}
                {authMode === "login" ? " Sign In to Inkora Account" : " Create Free Inkora Account"}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="btn-close-modal">
                ✕
              </button>
            </div>

            {authSuccess ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#10b981", fontWeight: 750 }}>
                <Check size={32} style={{ margin: "0 auto 10px auto", display: "block" }} />
                Successfully authenticated! Welcome to Inkora.
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 750, color: "var(--muted)", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="sorting-select"
                    style={{ padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 750, color: "var(--muted)", marginBottom: "4px" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="sorting-select"
                    style={{ padding: "8px 12px" }}
                  />
                </div>
                <button type="submit" className="btn-sort-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "4px" }}>
                  {authMode === "login" ? "Log In" : "Sign Up"}
                </button>
                <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: "6px" }}>
                  {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 750, cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  >
                    {authMode === "login" ? "Sign Up" : "Log In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
