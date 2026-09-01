"use client";

import React, { useState } from "react";
import { ALGORITHMS } from "./algorithms";
import { Play, RotateCcw, BarChart3, CheckCircle2 } from "lucide-react";

export function ComparisonDashboard() {
  const [algo1, setAlgo1] = useState<string>("bubble");
  const [algo2, setAlgo2] = useState<string>("quick");
  const [algo3, setAlgo3] = useState<string>("merge");

  const [inputStr, setInputStr] = useState<string>("64, 34, 25, 12, 22, 11, 90, 45, 78, 5");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleRunComparison = () => {
    setIsComparing(true);
    const nums = inputStr
      .split(/[\s,]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

    const arr = nums.length > 0 ? nums : [64, 34, 25, 12, 22, 11, 90, 45, 78, 5];
    const n = arr.length;

    setTimeout(() => {
      const algos = [algo1, algo2, algo3].filter(Boolean);
      const computedResults = algos.map((id) => {
        const info = ALGORITHMS[id] || ALGORITHMS.bubble;
        let comparisons = 0;
        let swaps = 0;

        if (id === "bubble") {
          comparisons = (n * (n - 1)) / 2;
          swaps = Math.floor(comparisons * 0.45);
        } else if (id === "selection") {
          comparisons = (n * (n - 1)) / 2;
          swaps = n - 1;
        } else if (id === "insertion") {
          comparisons = Math.floor((n * (n - 1)) / 4);
          swaps = comparisons;
        } else if (id === "quick") {
          comparisons = Math.floor(n * Math.log2(n) * 1.39);
          swaps = Math.floor(comparisons * 0.35);
        } else if (id === "merge") {
          comparisons = Math.floor(n * Math.log2(n));
          swaps = Math.floor(n * Math.log2(n));
        } else {
          comparisons = Math.floor(n * Math.log2(n) * 1.2);
          swaps = Math.floor(comparisons * 0.4);
        }

        return {
          id,
          name: info.name,
          bestTime: info.bestTime,
          avgTime: info.avgTime,
          worstTime: info.worstTime,
          space: info.space,
          stable: info.stable ? "Yes" : "No",
          inPlace: info.inPlace ? "Yes" : "No",
          comparisons,
          swaps,
          sortedArray: [...arr].sort((a, b) => a - b),
        };
      });

      setResults(computedResults);
      setIsComparing(false);
    }, 400);
  };

  return (
    <div className="comparison-dashboard-box">
      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
        <BarChart3 size={18} color="var(--accent)" /> Multi-Algorithm Side-by-Side Comparison
      </h3>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "18px" }}>
        Select up to 3 sorting algorithms to compare their operation count, theoretical time & space complexity, and stability on identical dataset inputs.
      </p>

      <div className="sorting-controls-grid" style={{ marginBottom: "18px" }}>
        <div className="sorting-select-group">
          <label>Algorithm 1</label>
          <select className="sorting-select" value={algo1} onChange={(e) => setAlgo1(e.target.value)}>
            {Object.values(ALGORITHMS).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.avgTime})
              </option>
            ))}
          </select>
        </div>

        <div className="sorting-select-group">
          <label>Algorithm 2</label>
          <select className="sorting-select" value={algo2} onChange={(e) => setAlgo2(e.target.value)}>
            {Object.values(ALGORITHMS).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.avgTime})
              </option>
            ))}
          </select>
        </div>

        <div className="sorting-select-group">
          <label>Algorithm 3</label>
          <select className="sorting-select" value={algo3} onChange={(e) => setAlgo3(e.target.value)}>
            {Object.values(ALGORITHMS).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.avgTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
          Test Dataset Array (Comma-Separated):
        </label>
        <input
          type="text"
          className="sorting-select"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          placeholder="e.g. 64, 34, 25, 12, 22, 11, 90, 45, 78, 5"
        />
      </div>

      <div className="sorting-actions-row">
        <button className="btn-sort-primary" onClick={handleRunComparison} disabled={isComparing}>
          <Play size={16} /> {isComparing ? "Running Comparison..." : "Run Side-by-Side Comparison"}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: "24px", overflowX: "auto" }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Best Time</th>
                <th>Avg Time</th>
                <th>Worst Time</th>
                <th>Space</th>
                <th>Stable</th>
                <th>In-Place</th>
                <th>Est. Comparisons</th>
                <th>Est. Swaps / Writes</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 800, color: "var(--text)" }}>
                    <CheckCircle2 size={14} color="#10b981" style={{ display: "inline", marginRight: "6px" }} />
                    {r.name}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{r.bestTime}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{r.avgTime}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{r.worstTime}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{r.space}</td>
                  <td>{r.stable}</td>
                  <td>{r.inPlace}</td>
                  <td style={{ fontWeight: 750, color: "#f59e0b" }}>{r.comparisons}</td>
                  <td style={{ fontWeight: 750, color: "#ef4444" }}>{r.swaps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
