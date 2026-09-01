"use client";

import React, { useState } from "react";
import type { QuizQuestion } from "./types";
import { HelpCircle, Sparkles, CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which sorting algorithm guarantees O(n log n) time complexity in the worst-case scenario while sorting in-place with O(1) auxiliary space?",
    options: ["Quick Sort", "Heap Sort", "Merge Sort", "Bubble Sort"],
    correctIndex: 1,
    explanation: "Heap Sort constructs a max-heap and has O(n log n) worst-case time with O(1) auxiliary space.",
    difficulty: "Beginner",
  },
  {
    id: 2,
    question: "Which algorithm is adaptive and achieves O(n) linear time complexity for an already sorted array when early-exit optimization is enabled?",
    options: ["Selection Sort", "Insertion Sort", "Heap Sort", "Quick Sort"],
    correctIndex: 1,
    explanation: "Insertion Sort (and optimized Bubble Sort) runs in O(n) time when the input is already sorted.",
    difficulty: "Beginner",
  },
  {
    id: 3,
    question: "Why is Quick Sort often preferred over Merge Sort for in-memory array sorting despite having an O(n²) worst-case time complexity?",
    options: [
      "Quick Sort is always stable",
      "Quick Sort has superior cache locality and requires only O(log n) stack space",
      "Quick Sort does not use comparisons",
      "Quick Sort works in linear time",
    ],
    correctIndex: 1,
    explanation: "Quick Sort operates in-place, benefiting from CPU cache locality and minimal auxiliary space.",
    difficulty: "Intermediate",
  },
  {
    id: 4,
    question: "What is the primary constraint when using Counting Sort for integer data?",
    options: [
      "Input array must contain negative numbers only",
      "The range of key values k must be bounded and manageable relative to n",
      "Input size n must be a power of two",
      "The array must be pre-sorted",
    ],
    correctIndex: 1,
    explanation: "Counting Sort creates a count array of size k+1, so key range k must be O(n) for linear efficiency.",
    difficulty: "Intermediate",
  },
];

export function QuizAndRecommender() {
  const [activeTab, setActiveTab] = useState<"quiz" | "recommender">("quiz");

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Recommender state
  const [dataSize, setDataSize] = useState<string>("small");
  const [isNearlySorted, setIsNearlySorted] = useState<string>("yes");
  const [needStability, setNeedStability] = useState<string>("yes");
  const [memoryLimit, setMemoryLimit] = useState<string>("inplace");
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const handleSelectOption = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    if (idx === QUIZ_QUESTIONS[currentIdx].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowAnswer(false);
    setQuizFinished(false);
  };

  const handleRecommend = () => {
    if (dataSize === "small" && isNearlySorted === "yes") {
      setRecommendation("Insertion Sort — Ideal for small, nearly sorted datasets with O(n) linear performance, O(1) space, and stability.");
    } else if (memoryLimit === "strict") {
      setRecommendation("Heap Sort — Guarantees O(n log n) worst-case time with strict O(1) in-place space usage.");
    } else if (needStability === "yes") {
      setRecommendation("Merge Sort / TimSort — Provides guaranteed O(n log n) performance while preserving the relative order of duplicate keys.");
    } else {
      setRecommendation("Quick Sort — Fast in-place general-purpose algorithm with excellent cache performance for random data.");
    }
  };

  const q = QUIZ_QUESTIONS[currentIdx];

  return (
    <div className="quiz-recommender-box">
      <div className="code-runner-header" style={{ marginBottom: "18px" }}>
        <div className="language-tabs-row">
          <button className={`lang-tab-btn ${activeTab === "quiz" ? "active" : ""}`} onClick={() => setActiveTab("quiz")}>
            <HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> Interactive DSA Quiz
          </button>
          <button className={`lang-tab-btn ${activeTab === "recommender" ? "active" : ""}`} onClick={() => setActiveTab("recommender")}>
            <Sparkles size={14} style={{ display: "inline", marginRight: "4px" }} /> Algorithm Recommender
          </button>
        </div>
      </div>

      {activeTab === "quiz" ? (
        <div>
          {!quizFinished ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.82rem", color: "var(--muted)" }}>
                <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
                <span className="attribute-pill">{q.difficulty}</span>
              </div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 750, marginBottom: "16px", color: "var(--text)" }}>{q.question}</h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {q.options.map((opt, idx) => {
                  let borderCol = "var(--border)";
                  let bgCol = "var(--bg)";
                  if (showAnswer) {
                    if (idx === q.correctIndex) {
                      borderCol = "#10b981";
                      bgCol = "rgba(16, 185, 129, 0.12)";
                    } else if (idx === selectedOption) {
                      borderCol = "#ef4444";
                      bgCol = "rgba(239, 68, 68, 0.12)";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      className="quiz-option-btn"
                      style={{ border: `1px solid ${borderCol}`, background: bgCol }}
                      onClick={() => handleSelectOption(idx)}
                    >
                      <span>{opt}</span>
                      {showAnswer && idx === q.correctIndex && <CheckCircle size={16} color="#10b981" />}
                      {showAnswer && idx === selectedOption && idx !== q.correctIndex && <XCircle size={16} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div style={{ marginTop: "16px", padding: "12px", background: "var(--surface)", borderLeft: "4px solid var(--accent)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.88rem", margin: 0, color: "var(--text)" }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                  <button className="btn-sort-primary" style={{ marginTop: "12px", padding: "6px 14px", fontSize: "0.82rem" }} onClick={handleNextQuestion}>
                    Next Question <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>Quiz Completed! 🎉</h3>
              <p style={{ fontSize: "1rem", color: "var(--accent)", fontWeight: 750 }}>
                Your Score: {score} / {QUIZ_QUESTIONS.length}
              </p>
              <button className="btn-sort-primary" style={{ marginTop: "14px" }} onClick={handleResetQuiz}>
                <RefreshCw size={14} /> Try Quiz Again
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 750, marginBottom: "14px" }}>Answer a few questions to get the optimal algorithm choice:</h4>
          <div className="sorting-controls-grid" style={{ marginBottom: "16px" }}>
            <div className="sorting-select-group">
              <label>Dataset Size</label>
              <select className="sorting-select" value={dataSize} onChange={(e) => setDataSize(e.target.value)}>
                <option value="small">Small (n ≤ 30)</option>
                <option value="medium">Medium (30 &lt; n ≤ 10,000)</option>
                <option value="large">Massive (n &gt; 10,000)</option>
              </select>
            </div>
            <div className="sorting-select-group">
              <label>Is Data Nearly Sorted?</label>
              <select className="sorting-select" value={isNearlySorted} onChange={(e) => setIsNearlySorted(e.target.value)}>
                <option value="yes">Yes (Nearly Sorted)</option>
                <option value="no">No (Random)</option>
              </select>
            </div>
            <div className="sorting-select-group">
              <label>Is Stability Required?</label>
              <select className="sorting-select" value={needStability} onChange={(e) => setNeedStability(e.target.value)}>
                <option value="yes">Yes (Preserve relative order)</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <button className="btn-sort-primary" onClick={handleRecommend}>
            <Sparkles size={15} /> Recommend Algorithm
          </button>

          {recommendation && (
            <div style={{ marginTop: "18px", padding: "16px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.4)", borderRadius: "12px" }}>
              <h4 style={{ color: "#10b981", fontSize: "0.95rem", fontWeight: 800, marginBottom: "6px" }}>Recommended Choice:</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text)" }}>{recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
