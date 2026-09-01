"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  ArrowLeft
} from "lucide-react";

export interface ResumeData {
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    website: string;
    location: string;
    photo?: string;
  };
  summary: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    specialization: string;
    start: string;
    end: string;
    score: string;
    thesisTitle?: string;
  }>;
  experience: Array<{
    organization: string;
    role: string;
    start: string;
    end: string;
    details: string;
  }>;
  publications: Array<{
    title: string;
    journal: string;
    year: string;
    impactFactor: string;
    quartile: string;
    doi: string;
  }>;
  awards: Array<{
    title: string;
    organization: string;
    year: string;
    detail: string;
  }>;
}

const defaultResumeData: ResumeData = {
  personal: {
    fullName: "Dr. Mritunjay Shall Peelam",
    headline: "Assistant Professor (Selection Grade) & Research Faculty | Ph.D. BITS Pilani",
    email: "mritunjay.iete@gmail.com",
    phone: "+91-8745080986",
    website: "https://dr-mritunjaysp.com",
    location: "Dehradun, Uttarakhand & Mirzapur, UP, India",
  },
  summary:
    "Ph.D. scholar from BITS Pilani specializing in Blockchain Interoperability, Quantum IoT Security, Post-Quantum Cryptography, and Intelligent Transportation Systems. Author of multiple Q1 IEEE/Elsevier journal articles with high citation impact.",
  skills: [
    "Blockchain Protocols (PoA, IBC, Cosmos)",
    "Post-Quantum Cryptography (FALCON)",
    "Quantum Key Distribution (QKD)",
    "Edge AI & Federated Learning",
    "Intelligent Transportation Systems (ITS)",
    "Python",
    "C / C++",
    "Solidty",
    "Linux Kernel & OS",
    "Vite / Next.js / TypeScript"
  ],
  education: [
    {
      institution: "Birla Institute of Technology and Science (BITS), Pilani",
      degree: "Ph.D. in Electrical & Electronics Engineering",
      specialization: "Blockchain & Intelligent Transportation Systems",
      start: "2020",
      end: "2025",
      score: "Ph.D. Awarded",
      thesisTitle: "Blockchain-Based Secure Frameworks for Intelligent Transportation Systems",
    },
    {
      institution: "M.Tech in Electronics & Communication Engineering",
      degree: "Master of Technology (M.Tech)",
      specialization: "Embedded Systems & Signal Processing",
      start: "2016",
      end: "2018",
      score: "9.2 CGPA (Gold Medalist)",
    },
  ],
  experience: [
    {
      organization: "UPES Dehradun",
      role: "Assistant Professor (Selection Grade) & Research Faculty",
      start: "2024",
      end: "Present",
      details: "Teaching Software Engineering, OS, and Data Structures. Supervising undergraduate and doctoral research projects in Blockchain & Quantum Security.",
    },
    {
      organization: "BITS Pilani",
      role: "Graduate Research & Teaching Assistant",
      start: "2020",
      end: "2024",
      details: "Conducted high-impact research published in Q1 IEEE/Elsevier journals. Assisted in curriculum labs and research colloquiums.",
    },
  ],
  publications: [
    {
      title: "Quantum computing applications for Internet of Things",
      journal: "IET Quantum Communication",
      year: "2024",
      impactFactor: "3.8",
      quartile: "Q1",
      doi: "10.1049/qtc2.12089",
    },
    {
      title: "QIoTChain: Quantum IoT-blockchain fusion for advanced data protection in Industry 4.0",
      journal: "Elsevier Computers & Electrical Engineering",
      year: "2025",
      impactFactor: "4.3",
      quartile: "Q1",
      doi: "10.1016/j.compeleceng.2024.109201",
    },
    {
      title: "DemocracyGuard: Blockchain-based secure voting framework for digital democracy",
      journal: "Wiley Security and Privacy",
      year: "2025",
      impactFactor: "3.2",
      quartile: "Q1",
      doi: "10.1002/spy2.392",
    },
  ],
  awards: [
    {
      title: "Best Researcher Award",
      organization: "International Research Excellence Forum",
      year: "2026",
      detail: "Recognized for high-impact research contributions in Blockchain & Post-Quantum IoT Security.",
    },
    {
      title: "Wiley Top Viewed Article 2025",
      organization: "Wiley & Sons",
      year: "2026",
      detail: "DemocracyGuard research paper awarded top readership distinction.",
    },
  ],
};

export function ResumeBuilderApp() {
  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scholar-resume:data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return defaultResumeData;
  });

  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "skills" | "education" | "experience" | "publications" | "awards">("personal");
  const [newSkill, setNewSkill] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("scholar-resume:data", JSON.stringify(data));
    }
  }, [data]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleReset = () => {
    if (confirm("Reset resume content back to default template?")) {
      setData(defaultResumeData);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="resume-builder-root" style={{ minHeight: "100vh", padding: "1.5rem 1rem", background: "var(--site-bg, #090d16)", color: "#f8fafc" }}>
      {/* Top Header Controls */}
      <header style={{ maxWidth: "1200px", margin: "0 auto 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText className="text-blue-400" size={24} /> ScholarResume Builder
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={handleReset} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#cbd5e1", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RotateCcw size={15} /> Reset Template
          </button>
          <button onClick={handlePrint} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg, #0284c7, #2563eb)", color: "#ffffff", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)" }}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </header>

      {/* Main Grid: Left Editor & Right Live Resume Preview */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Editor Box */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.25rem" }}>
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.75rem", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { id: "personal", label: "Personal" },
              { id: "summary", label: "Summary" },
              { id: "skills", label: "Skills" },
              { id: "education", label: "Education" },
              { id: "experience", label: "Experience" },
              { id: "publications", label: "Papers" },
              { id: "awards", label: "Awards" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "#0284c7" : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Form Contents */}
          {activeTab === "personal" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Full Name</label>
              <input value={data.personal.fullName} onChange={(e) => setData({ ...data, personal: { ...data.personal, fullName: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />

              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Title / Headline</label>
              <input value={data.personal.headline} onChange={(e) => setData({ ...data, personal: { ...data.personal, headline: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />

              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Email Address</label>
              <input value={data.personal.email} onChange={(e) => setData({ ...data, personal: { ...data.personal, email: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />

              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Phone Number</label>
              <input value={data.personal.phone} onChange={(e) => setData({ ...data, personal: { ...data.personal, phone: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />

              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Website URL</label>
              <input value={data.personal.website} onChange={(e) => setData({ ...data, personal: { ...data.personal, website: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />

              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Location</label>
              <input value={data.personal.location} onChange={(e) => setData({ ...data, personal: { ...data.personal, location: e.target.value } })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />
            </div>
          )}

          {activeTab === "summary" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Research Summary</label>
              <textarea rows={6} value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} style={{ padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff", lineHeight: 1.5 }} />
            </div>
          )}

          {activeTab === "skills" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Add Technical / Research Skill</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="e.g. Quantum Cryptography" style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", background: "#090d16", border: "1px solid #334155", color: "#fff" }} />
                <button onClick={addSkill} style={{ padding: "0.5rem 1rem", background: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}><Plus size={16} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                {data.skills.map((skill, index) => (
                  <span key={index} style={{ padding: "0.3rem 0.6rem", background: "rgba(2,132,199,0.2)", border: "1px solid rgba(2,132,199,0.4)", borderRadius: "6px", fontSize: "0.8rem", color: "#e2e8f0", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    {skill}
                    <Trash2 size={12} style={{ cursor: "pointer", color: "#f87171" }} onClick={() => removeSkill(index)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.education.map((edu, index) => (
                <div key={index} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem", background: "#090d16" }}>
                  <input placeholder="Institution" value={edu.institution} onChange={(e) => {
                    const next = [...data.education];
                    next[index].institution = e.target.value;
                    setData({ ...data, education: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                  <input placeholder="Degree" value={edu.degree} onChange={(e) => {
                    const next = [...data.education];
                    next[index].degree = e.target.value;
                    setData({ ...data, education: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                </div>
              ))}
            </div>
          )}

          {activeTab === "experience" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.experience.map((exp, index) => (
                <div key={index} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem", background: "#090d16" }}>
                  <input placeholder="Organization" value={exp.organization} onChange={(e) => {
                    const next = [...data.experience];
                    next[index].organization = e.target.value;
                    setData({ ...data, experience: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                  <input placeholder="Role" value={exp.role} onChange={(e) => {
                    const next = [...data.experience];
                    next[index].role = e.target.value;
                    setData({ ...data, experience: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                </div>
              ))}
            </div>
          )}

          {activeTab === "publications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.publications.map((pub, index) => (
                <div key={index} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem", background: "#090d16" }}>
                  <input placeholder="Paper Title" value={pub.title} onChange={(e) => {
                    const next = [...data.publications];
                    next[index].title = e.target.value;
                    setData({ ...data, publications: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                  <input placeholder="Journal / Conference" value={pub.journal} onChange={(e) => {
                    const next = [...data.publications];
                    next[index].journal = e.target.value;
                    setData({ ...data, publications: next });
                  }} style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                </div>
              ))}
            </div>
          )}

          {activeTab === "awards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.awards.map((award, index) => (
                <div key={index} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem", background: "#090d16" }}>
                  <input placeholder="Award Title" value={award.title} onChange={(e) => {
                    const next = [...data.awards];
                    next[index].title = e.target.value;
                    setData({ ...data, awards: next });
                  }} style={{ width: "100%", padding: "0.4rem", marginBottom: "0.4rem", borderRadius: "4px", background: "#0f172a", border: "1px solid #334155", color: "#fff" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Resume Document Paper Preview */}
        <div ref={previewRef} className="print-area" style={{ background: "#ffffff", color: "#0f172a", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", fontFamily: "serif" }}>
          {/* Header */}
          <header style={{ borderBottom: "2px solid #0284c7", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
            <h1 style={{ fontSize: "1.85rem", margin: "0 0 0.25rem", color: "#0f172a", fontWeight: 700 }}>{data.personal.fullName}</h1>
            <p style={{ fontSize: "0.95rem", color: "#0284c7", fontWeight: 600, margin: "0 0 0.75rem" }}>{data.personal.headline}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85rem", color: "#475569" }}>
              {data.personal.email && <span>✉ {data.personal.email}</span>}
              {data.personal.phone && <span>📞 {data.personal.phone}</span>}
              {data.personal.website && <span>🌐 {data.personal.website}</span>}
              {data.personal.location && <span>📍 {data.personal.location}</span>}
            </div>
          </header>

          {/* Research Summary */}
          {data.summary && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Research Summary
              </h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6, margin: 0, color: "#334155" }}>{data.summary}</p>
            </section>
          )}

          {/* Key Expertise */}
          {data.skills.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Key Technical & Research Expertise
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {data.skills.map((skill, index) => (
                  <span key={index} style={{ padding: "0.2rem 0.5rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem", color: "#1e293b", fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Education
              </h2>
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem" }}>
                    <span>{edu.institution}</span>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>{edu.start} - {edu.end}</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#0284c7" }}>{edu.degree} — {edu.specialization}</div>
                  {edu.score && <div style={{ fontSize: "0.825rem", color: "#475569" }}>Grade/Status: <strong>{edu.score}</strong></div>}
                  {edu.thesisTitle && <div style={{ fontSize: "0.825rem", color: "#475569" }}>Thesis: {edu.thesisTitle}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Academic & Professional Experience
              </h2>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem" }}>
                    <span>{exp.organization}</span>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>{exp.start} - {exp.end}</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", fontStyle: "italic", color: "#0284c7", marginBottom: "0.25rem" }}>{exp.role}</div>
                  <p style={{ fontSize: "0.875rem", margin: 0, color: "#334155", lineHeight: 1.5 }}>{exp.details}</p>
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {data.publications.length > 0 && (
            <section style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Select Research Publications
              </h2>
              {data.publications.map((pub, i) => (
                <div key={i} style={{ marginBottom: "0.6rem", fontSize: "0.875rem", lineHeight: 1.5, color: "#334155" }}>
                  <strong>[{i + 1}] {pub.title}</strong>. <em>{pub.journal}</em> ({pub.year}). <span style={{ color: "#0284c7", fontWeight: 600 }}>{pub.quartile} (IF: {pub.impactFactor})</span>. DOI: {pub.doi}
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {data.awards.length > 0 && (
            <section>
              <h2 style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", margin: "0 0 0.5rem" }}>
                Honors & Recognitions
              </h2>
              {data.awards.map((award, i) => (
                <div key={i} style={{ marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  <strong>{award.title}</strong> — <em>{award.organization}</em> ({award.year}). <span style={{ color: "#475569" }}>{award.detail}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
