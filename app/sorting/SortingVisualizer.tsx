"use client";

import React, { useState, useEffect, useRef } from "react";
import { ALGORITHMS, CATEGORIES } from "./algorithms";
import type { AlgorithmCategory, VisualizationType, HatchPattern, SortEvent } from "./types";
import { CodeEditorRunner } from "./CodeEditorRunner";
import { ComparisonDashboard } from "./ComparisonDashboard";
import { QuizAndRecommender } from "./QuizAndRecommender";
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  History,
  Code2,
  BarChart3,
  HelpCircle,
  Maximize2,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles,
  Palette,
  Gauge,
  ArrowUpDown,
  FileSpreadsheet,
  Plus,
  X,
  Trash2,
} from "lucide-react";

export function SortingVisualizer() {
  const [category, setCategory] = useState<AlgorithmCategory>("basic");
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>("bubble");
  const [vizType, setVizType] = useState<VisualizationType>("histogram");
  const [hatchPattern, setHatchPattern] = useState<HatchPattern>("none");

  // Professional Color Customizer & Palette Presets
  const [colorTheme, setColorTheme] = useState<"oceanic" | "neon" | "emerald" | "sunset" | "purple" | "custom">("oceanic");
  const [customDefaultColor, setCustomDefaultColor] = useState<string>("#3b82f6");
  const [customCompareColor, setCustomCompareColor] = useState<string>("#f59e0b");
  const [customSwapColor, setCustomSwapColor] = useState<string>("#ef4444");
  const [customSortedColor, setCustomSortedColor] = useState<string>("#10b981");

  // Array inputs & manual data manager
  const [arrayInput, setArrayInput] = useState<string>("64, 34, 25, 12, 22, 11, 90, 45, 78, 5");
  const [singleElementVal, setSingleElementVal] = useState<string>("");
  const [arraySize, setArraySize] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(20); // 1 = Very Slow (1800ms), 100 = High Speed (5ms)
  const [showValues, setShowValues] = useState<boolean>(true);
  const [isAscending, setIsAscending] = useState<boolean>(true);

  // Playback state
  const [array, setArray] = useState<number[]>([]);
  const [comparedIndices, setComparedIndices] = useState<number[]>([]);
  const [swappedIndices, setSwappedIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);

  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "how" | "complexity" | "applications" | "advantages" | "code" | "execution" | "comparison" | "quiz">("overview");

  // Telemetry
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [writes, setWrites] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>("Ready to sort.");

  const stepsRef = useRef<SortEvent[]>([]);
  const stepIdxRef = useRef<number>(0);
  const isSortingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  const currentAlgo = ALGORITHMS[selectedAlgoId] || ALGORITHMS.bubble;

  // Calculate step delay (Speed 1 = 1800ms slow, Speed 100 = 5ms ultra fast)
  const getDelayFromSpeed = (spd: number) => {
    if (spd <= 10) return Math.round(1800 - spd * 120);
    if (spd <= 50) return Math.round(600 - (spd - 10) * 12.5);
    return Math.max(5, Math.round(100 - (spd - 50) * 1.9));
  };

  const parseArrayInput = (str: string) => {
    const nums = str
      .split(/[\s,]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

    const finalArr = nums.length > 0 ? nums : [64, 34, 25, 12, 22, 11, 90, 45, 78, 5];
    setArray(finalArr);
    setArraySize(finalArr.length);
    resetPlaybackState();
  };

  const handleAddSingleElement = () => {
    const val = parseInt(singleElementVal.trim(), 10);
    if (!isNaN(val)) {
      const updated = [...array, val];
      setArray(updated);
      setArrayInput(updated.join(", "));
      setArraySize(updated.length);
      setSingleElementVal("");
      resetPlaybackState();
    }
  };

  const handleRemoveElementAt = (index: number) => {
    const updated = array.filter((_, i) => i !== index);
    const finalArr = updated.length > 0 ? updated : [10];
    setArray(finalArr);
    setArrayInput(finalArr.join(", "));
    setArraySize(finalArr.length);
    resetPlaybackState();
  };

  const handleClearAllElements = () => {
    setArray([10]);
    setArrayInput("10");
    setArraySize(1);
    resetPlaybackState();
  };

  const resetPlaybackState = () => {
    setComparedIndices([]);
    setSwappedIndices([]);
    setSortedIndices([]);
    setPivotIndex(null);
    setComparisons(0);
    setSwaps(0);
    setWrites(0);
    setElapsedTime(0);
    setCurrentStepMessage("Ready to sort.");
    setIsSorting(false);
    setIsPaused(false);
    isSortingRef.current = false;
    isPausedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    parseArrayInput(arrayInput);
  }, []);

  const handlePresetSelect = (type: "default" | "nearly" | "reverse" | "duplicates" | "negative") => {
    let preset = "64, 34, 25, 12, 22, 11, 90, 45, 78, 5";
    if (type === "nearly") preset = "5, 10, 15, 20, 18, 25, 30, 35";
    else if (type === "reverse") preset = "90, 80, 70, 60, 50, 40, 30, 20, 10";
    else if (type === "duplicates") preset = "20, 10, 20, 30, 10, 40, 20, 5";
    else if (type === "negative") preset = "-10, 25, -3, 18, 0, -7, 12";

    setArrayInput(preset);
    parseArrayInput(preset);
  };

  const handleRandomize = (size: number = arraySize) => {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 260) + 15);
    }
    const str = arr.join(", ");
    setArrayInput(str);
    setArray(arr);
    setArraySize(size);
    resetPlaybackState();
  };

  const generateSortSteps = (): SortEvent[] => {
    const steps: SortEvent[] = [];
    const a = [...array];
    const n = a.length;

    if (selectedAlgoId === "bubble") {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          const comp = isAscending ? a[j] > a[j + 1] : a[j] < a[j + 1];
          steps.push({
            type: "compare",
            indices: [j, j + 1],
            array: [...a],
            message: `Comparing adjacent index [${j}] (${a[j]}) and [${j + 1}] (${a[j + 1]})`,
          });
          if (comp) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            steps.push({
              type: "swap",
              indices: [j, j + 1],
              array: [...a],
              message: `Swapped out-of-order pair: ${a[j + 1]} ↔ ${a[j]}`,
            });
          }
        }
        steps.push({
          type: "sorted",
          indices: [n - 1 - i],
          array: [...a],
          message: `Pass ${i + 1} complete. Largest unplaced element (${a[n - 1 - i]}) locked in final index ${n - 1 - i}.`,
        });
      }
      steps.push({ type: "sorted", indices: [0], array: [...a], message: "Array completely sorted!" });
    } else if (selectedAlgoId === "selection") {
      for (let i = 0; i < n - 1; i++) {
        let targetIdx = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({
            type: "compare",
            indices: [targetIdx, j],
            array: [...a],
            message: `Scanning unsorted range [${i}..${n - 1}]: comparing element at index [${j}] (${a[j]}) with current candidate at index [${targetIdx}] (${a[targetIdx]})`,
          });
          if (isAscending ? a[j] < a[targetIdx] : a[j] > a[targetIdx]) {
            targetIdx = j;
          }
        }
        if (targetIdx !== i) {
          [a[i], a[targetIdx]] = [a[targetIdx], a[i]];
          steps.push({
            type: "swap",
            indices: [i, targetIdx],
            array: [...a],
            message: `Swapped minimum element (${a[i]}) into sorted index [${i}]`,
          });
        }
        steps.push({ type: "sorted", indices: [i], array: [...a], message: `Index [${i}] sorted.` });
      }
      steps.push({ type: "sorted", indices: [n - 1], array: [...a], message: "Array completely sorted!" });
    } else {
      // Default step generator for all algorithms
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          const comp = isAscending ? a[j] > a[j + 1] : a[j] < a[j + 1];
          steps.push({ type: "compare", indices: [j, j + 1], array: [...a], message: `Comparing [${j}] (${a[j]}) and [${j + 1}] (${a[j + 1]})` });
          if (comp) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            steps.push({ type: "swap", indices: [j, j + 1], array: [...a], message: `Swapped ${a[j + 1]} ↔ ${a[j]}` });
          }
        }
        steps.push({ type: "sorted", indices: [n - 1 - i], array: [...a], message: `Locked sorted element ${a[n - 1 - i]}` });
      }
      steps.push({ type: "sorted", indices: [0], array: [...a], message: "Array completely sorted!" });
    }

    return steps;
  };

  const startVisualization = () => {
    if (isSortingRef.current) return;
    const steps = generateSortSteps();
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    setIsSorting(true);
    setIsPaused(false);
    isSortingRef.current = true;
    isPausedRef.current = false;
    const st = Date.now();

    let compCount = 0;
    let swapCount = 0;

    const runStep = () => {
      if (!isSortingRef.current || isPausedRef.current) return;
      if (stepIdxRef.current >= stepsRef.current.length) {
        setIsSorting(false);
        isSortingRef.current = false;
        setComparedIndices([]);
        setSwappedIndices([]);
        setPivotIndex(null);
        setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
        setCurrentStepMessage("Sorting Complete!");
        return;
      }

      const step = stepsRef.current[stepIdxRef.current];
      stepIdxRef.current++;

      setCurrentStepMessage(step.message);
      if (step.type === "compare") {
        compCount++;
        setComparisons(compCount);
        setComparedIndices(step.indices || []);
        setSwappedIndices([]);
      } else if (step.type === "swap" || step.type === "overwrite") {
        swapCount++;
        setSwaps(swapCount);
        setWrites((w) => w + 1);
        setArray(step.array);
        setSwappedIndices(step.indices || []);
        setComparedIndices([]);
      } else if (step.type === "sorted") {
        setSortedIndices((prev) => [...prev, ...(step.indices || [])]);
      }

      setElapsedTime(Date.now() - st);
      const delay = getDelayFromSpeed(speed);
      timerRef.current = setTimeout(runStep, delay);
    };

    runStep();
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
  };

  const filteredAlgos = Object.values(ALGORITHMS).filter((a) => a.category === category);
  const maxVal = Math.max(...array.map((x) => Math.abs(x)), 250);

  const getHatchClass = () => {
    if (hatchPattern === "none") return "";
    return `hatch-${hatchPattern}`;
  };

  const getThemeClass = () => {
    return `theme-${colorTheme}`;
  };

  const getCustomStyle = (isSorted: boolean, isSwap: boolean, isComp: boolean, isPivot: boolean) => {
    if (colorTheme !== "custom") return {};
    if (isSorted) return { background: customSortedColor, borderColor: customSortedColor, boxShadow: `0 0 12px ${customSortedColor}` };
    if (isSwap) return { background: customSwapColor, borderColor: customSwapColor, boxShadow: `0 0 14px ${customSwapColor}` };
    if (isComp) return { background: customCompareColor, borderColor: customCompareColor, boxShadow: `0 0 12px ${customCompareColor}` };
    return { background: customDefaultColor, borderColor: customDefaultColor };
  };

  return (
    <section className="sorting-page">
      <div className="page-intro" style={{ marginBottom: "12px" }}>
        <p className="eyebrow" style={{ fontSize: "0.72rem" }}>Visualize, Understand, Compare, and Execute</p>
        <div className="title-header-row">
          <h1 className="page-intro-title" style={{ fontSize: "1.35rem" }}>Interactive Sorting Algorithm Visualizer</h1>
        </div>
      </div>

      <div className="sorting-workbench">
        {/* Intuitive Colorful Border Control Dashboard for Mobile & Desktop */}
        <div className="sorting-control-panel">
          <div className="control-dashboard-grid">

            {/* Section 1: Algorithm & Category (Cyan-Blue Border) */}
            <div className="control-card-section gradient-border-cyan">
              <div className="control-card-header">
                <span className="control-card-badge cyan-badge">Step 1</span>
                <span className="control-card-title"><BookOpen size={15} color="#06b6d4" /> Algorithm & View</span>
              </div>
              <div className="control-inputs-stack">
                <div className="sorting-select-group">
                  <label>Category</label>
                  <select
                    className="sorting-select"
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as AlgorithmCategory;
                      setCategory(cat);
                      const firstInCat = Object.values(ALGORITHMS).find((a) => a.category === cat);
                      if (firstInCat) setSelectedAlgoId(firstInCat.id);
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sorting-select-group">
                  <label>Algorithm ({filteredAlgos.length})</label>
                  <select className="sorting-select" value={selectedAlgoId} onChange={(e) => setSelectedAlgoId(e.target.value)}>
                    {filteredAlgos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.avgTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sorting-select-group">
                  <label>Visualization Mode</label>
                  <select className="sorting-select" value={vizType} onChange={(e) => setVizType(e.target.value as VisualizationType)}>
                    <option value="histogram">HD Vertical Histogram</option>
                    <option value="horizontal">Horizontal Bars</option>
                    <option value="blocks">Number Blocks</option>
                    <option value="scatter">Scatter Dots</option>
                    <option value="radial">Circular Radial</option>
                    <option value="cells">Array Cells</option>
                  </select>
                </div>

                <div className="card-footer-info">
                  <span className="mini-info-tag">Stable: {currentAlgo.stable ? "Yes" : "No"}</span>
                  <span className="mini-info-tag">Space: {currentAlgo.space}</span>
                  <span className="mini-info-tag">Worst: {currentAlgo.worstTime}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Dataset & Manual Data Manager (Emerald-Teal Border) */}
            <div className="control-card-section gradient-border-emerald">
              <div className="control-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                  <span className="control-card-badge emerald-badge">Step 2</span>
                  <span className="control-card-title"><FileSpreadsheet size={15} color="#10b981" /> Manual Data</span>
                </div>
                <button className="subdomain-copy-btn" style={{ color: "#ef4444" }} onClick={handleClearAllElements} title="Clear All">
                  <Trash2 size={12} /> Clear
                </button>
              </div>

              <div className="control-inputs-stack">
                <div>
                  <div className="compact-inline-add-group">
                    <input
                      type="number"
                      className="sorting-select-inline"
                      placeholder="Add single number e.g. 42"
                      value={singleElementVal}
                      onChange={(e) => setSingleElementVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSingleElement()}
                    />
                    <button className="btn-add-circle-icon" onClick={handleAddSingleElement} title="Add Number to Array">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="chips-container-box" style={{ maxHeight: "72px", overflowY: "auto" }}>
                    {array.map((val, idx) => (
                      <span key={idx} className="array-element-chip">
                        <span className="chip-val">{val}</span>
                        <button className="chip-remove-btn" onClick={() => handleRemoveElementAt(idx)} title="Delete number">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      className="sorting-select"
                      style={{ flex: 1, padding: "6px 8px", fontSize: "0.8rem" }}
                      value={arrayInput}
                      onChange={(e) => {
                        setArrayInput(e.target.value);
                        parseArrayInput(e.target.value);
                      }}
                    />
                    <button className="btn-sort-secondary" style={{ padding: "6px 10px", fontSize: "0.78rem" }} onClick={() => parseArrayInput(arrayInput)}>
                      Apply
                    </button>
                  </div>
                </div>

                <div className="scrollable-presets-row" style={{ marginTop: "2px" }}>
                  <button className="preset-pill-btn" onClick={() => handlePresetSelect("default")}>Default</button>
                  <button className="preset-pill-btn" onClick={() => handlePresetSelect("nearly")}>Nearly</button>
                  <button className="preset-pill-btn" onClick={() => handlePresetSelect("reverse")}>Reverse</button>
                  <button className="preset-pill-btn" onClick={() => handlePresetSelect("duplicates")}>Duplicates</button>
                  <button className="preset-pill-btn" onClick={() => handleRandomize(20)}>Random 20</button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn-sort-secondary" style={{ padding: "4px 8px", fontSize: "0.76rem" }} onClick={() => setIsAscending(!isAscending)}>
                    <ArrowUpDown size={11} /> {isAscending ? "Ascending ↑" : "Descending ↓"}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Color Palette & Visual Styling (Pink-Magenta Border) */}
            <div className="control-card-section gradient-border-pink">
              <div className="control-card-header">
                <span className="control-card-badge pink-badge">Step 3</span>
                <span className="control-card-title"><Palette size={15} color="#ec4899" /> Color Palette & Styling</span>
              </div>
              <div className="control-inputs-stack">
                <div className="theme-pills-wrap">
                  <button className={`theme-pill-btn ${colorTheme === "oceanic" ? "active" : ""}`} onClick={() => setColorTheme("oceanic")}>
                    <span className="theme-dot oceanic-dot"></span> Oceanic
                  </button>
                  <button className={`theme-pill-btn ${colorTheme === "neon" ? "active" : ""}`} onClick={() => setColorTheme("neon")}>
                    <span className="theme-dot neon-dot"></span> Cyberpunk
                  </button>
                  <button className={`theme-pill-btn ${colorTheme === "emerald" ? "active" : ""}`} onClick={() => setColorTheme("emerald")}>
                    <span className="theme-dot emerald-dot"></span> Emerald
                  </button>
                  <button className={`theme-pill-btn ${colorTheme === "sunset" ? "active" : ""}`} onClick={() => setColorTheme("sunset")}>
                    <span className="theme-dot sunset-dot"></span> Sunset
                  </button>
                  <button className={`theme-pill-btn ${colorTheme === "purple" ? "active" : ""}`} onClick={() => setColorTheme("purple")}>
                    <span className="theme-dot purple-dot"></span> Amethyst
                  </button>
                  <button className={`theme-pill-btn ${colorTheme === "custom" ? "active" : ""}`} onClick={() => setColorTheme("custom")}>
                    🎨 Custom Pick
                  </button>
                </div>

                {colorTheme === "custom" ? (
                  <div className="custom-color-picker-box">
                    <div className="custom-box-title">Custom Palette Swatches</div>
                    <div className="custom-pickers-grid">
                      <label className="picker-label">
                        <span>Default</span>
                        <input type="color" className="color-swatch-input" value={customDefaultColor} onChange={(e) => setCustomDefaultColor(e.target.value)} />
                      </label>
                      <label className="picker-label">
                        <span>Compare</span>
                        <input type="color" className="color-swatch-input" value={customCompareColor} onChange={(e) => setCustomCompareColor(e.target.value)} />
                      </label>
                      <label className="picker-label">
                        <span>Swap</span>
                        <input type="color" className="color-swatch-input" value={customSwapColor} onChange={(e) => setCustomSwapColor(e.target.value)} />
                      </label>
                      <label className="picker-label">
                        <span>Sorted</span>
                        <input type="color" className="color-swatch-input" value={customSortedColor} onChange={(e) => setCustomSortedColor(e.target.value)} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="theme-swatches-bar">
                    <span className="swatch-item default-swatch">Default</span>
                    <span className="swatch-item compare-swatch">Compare</span>
                    <span className="swatch-item swap-swatch">Swap</span>
                    <span className="swatch-item sorted-swatch">Sorted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Master Execution & Speed (Gold-Amber Border) */}
            <div className="control-card-section gradient-border-amber highlight-card">
              <div className="control-card-header">
                <span className="control-card-badge amber-badge">Step 4</span>
                <span className="control-card-title"><Gauge size={15} color="#f59e0b" /> Execution & Speed</span>
              </div>
              <div className="control-inputs-stack">
                <div className="sorting-slider-group">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 750, marginBottom: "4px" }}>
                    <span>Speed: {speed}%</span>
                    <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{getDelayFromSpeed(speed)}ms/step</span>
                  </div>
                  <input
                    type="range"
                    className="sorting-slider"
                    min={1}
                    max={100}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  />
                </div>

                <div className="scrollable-presets-row">
                  <button className="preset-pill-btn" onClick={() => setSpeed(5)}>Classroom (5%)</button>
                  <button className="preset-pill-btn" onClick={() => setSpeed(35)}>Normal (35%)</button>
                  <button className="preset-pill-btn" onClick={() => setSpeed(90)}>Turbo (90%)</button>
                </div>

                <div className="master-playback-actions">
                  <button className="btn-sort-primary-lg" onClick={startVisualization} disabled={isSorting && !isPaused}>
                    <Play size={18} /> {isSorting ? "Sorting..." : "Start Animation"}
                  </button>
                  {isSorting && (
                    <button className="btn-sort-secondary-lg" onClick={handlePauseResume}>
                      {isPaused ? <Play size={16} /> : <Pause size={16} />}
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  )}
                  <button className="btn-sort-secondary-lg" onClick={() => resetPlaybackState()}>
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Multi-View Visualization Canvas */}
        <div className={`sorting-canvas-container ${getThemeClass()}`}>
          <div className="sorting-status-bar">
            <div className="sorting-telemetry">
              <span>Comparisons: <strong style={{ color: "#f59e0b" }}>{comparisons}</strong></span>
              <span>Swaps/Writes: <strong style={{ color: "#ef4444" }}>{swaps}</strong></span>
              <span>Time: <strong>{(elapsedTime / 1000).toFixed(2)}s</strong></span>
              <span>Delay: <strong style={{ color: "var(--accent)" }}>{getDelayFromSpeed(speed)}ms</strong></span>
              <span>Algorithm: <strong style={{ color: "var(--accent)" }}>{currentAlgo.name}</strong></span>
              <span>View: <strong style={{ color: "var(--text)" }}>{vizType.toUpperCase()}</strong></span>
            </div>
            <div style={{ fontSize: "0.84rem", fontWeight: 750, color: "var(--text)" }}>{currentStepMessage}</div>
          </div>

          {/* Render selected Visualization Type */}
          {vizType === "histogram" && (
            <div className="histogram-scalable-wrapper">
              {/* Y-Axis Value Scale */}
              <div className="histogram-y-axis">
                <div className="y-tick"><span>{maxVal}</span></div>
                <div className="y-tick"><span>{Math.round(maxVal * 0.75)}</span></div>
                <div className="y-tick"><span>{Math.round(maxVal * 0.50)}</span></div>
                <div className="y-tick"><span>{Math.round(maxVal * 0.25)}</span></div>
                <div className="y-tick"><span>0</span></div>
              </div>

              {/* Background Reference Grid Lines */}
              <div className="histogram-grid-overlay">
                <div className="grid-line grid-line-cyan" style={{ top: "0%" }}></div>
                <div className="grid-line grid-line-emerald" style={{ top: "25%" }}></div>
                <div className="grid-line grid-line-amber" style={{ top: "50%" }}></div>
                <div className="grid-line grid-line-pink" style={{ top: "75%" }}></div>
                <div className="grid-line grid-line-purple" style={{ top: "100%" }}></div>
              </div>

              <div className="sorting-bars-frame">
                {array.map((val, idx) => {
                  const isComp = comparedIndices.includes(idx);
                  const isSwap = swappedIndices.includes(idx);
                  const isSorted = sortedIndices.includes(idx);
                  const isPivot = pivotIndex === idx;

                  let barClass = "default";
                  if (isSorted) barClass = "sorted";
                  else if (isSwap) barClass = "swap";
                  else if (isComp) barClass = "compare";
                  else if (isPivot) barClass = "pivot";

                  const heightPercent = Math.max(8, Math.round((Math.abs(val) / maxVal) * 100));

                  return (
                    <div
                      key={idx}
                      className={`sorting-bar ${barClass} ${getHatchClass()}`}
                      style={{ height: `${heightPercent}%`, ...getCustomStyle(isSorted, isSwap, isComp, isPivot) }}
                    >
                      {showValues && array.length <= 40 && val}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {vizType === "horizontal" && (
            <div className="viz-horizontal-container">
              {array.map((val, idx) => {
                const isComp = comparedIndices.includes(idx);
                const isSwap = swappedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                let barClass = "default";
                if (isSorted) barClass = "sorted";
                else if (isSwap) barClass = "swap";
                else if (isComp) barClass = "compare";

                const widthPercent = Math.max(6, Math.round((Math.abs(val) / maxVal) * 100));
                return (
                  <div key={idx} className="viz-horizontal-row">
                    <span className="viz-row-idx">[{idx}]</span>
                    <div
                      className={`viz-horizontal-bar ${barClass} ${getHatchClass()}`}
                      style={{ width: `${widthPercent}%`, ...getCustomStyle(isSorted, isSwap, isComp, false) }}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {vizType === "blocks" && (
            <div className="viz-blocks-grid">
              {array.map((val, idx) => {
                const isComp = comparedIndices.includes(idx);
                const isSwap = swappedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                let blockClass = "default";
                if (isSorted) blockClass = "sorted";
                else if (isSwap) blockClass = "swap";
                else if (isComp) blockClass = "compare";

                return (
                  <div
                    key={idx}
                    className={`viz-block-item ${blockClass} ${getHatchClass()}`}
                    style={getCustomStyle(isSorted, isSwap, isComp, false)}
                  >
                    <span className="viz-block-val">{val}</span>
                    <span className="viz-block-idx">#{idx}</span>
                  </div>
                );
              })}
            </div>
          )}

          {vizType === "scatter" && (
            <div className="viz-scatter-frame">
              {array.map((val, idx) => {
                const isComp = comparedIndices.includes(idx);
                const isSwap = swappedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                let dotClass = "default";
                if (isSorted) dotClass = "sorted";
                else if (isSwap) dotClass = "swap";
                else if (isComp) dotClass = "compare";

                const bottomPercent = Math.max(6, Math.round((Math.abs(val) / maxVal) * 90));
                const leftPercent = Math.round(((idx + 0.5) / array.length) * 100);

                return (
                  <div
                    key={idx}
                    className={`viz-scatter-dot ${dotClass}`}
                    style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%`, ...getCustomStyle(isSorted, isSwap, isComp, false) }}
                    title={`Index ${idx}: ${val}`}
                  />
                );
              })}
            </div>
          )}

          {vizType === "radial" && (
            <div className="viz-radial-frame">
              {array.map((val, idx) => {
                const isComp = comparedIndices.includes(idx);
                const isSwap = swappedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                let rClass = "default";
                if (isSorted) rClass = "sorted";
                else if (isSwap) rClass = "swap";
                else if (isComp) rClass = "compare";

                const angle = (idx / array.length) * 360;
                const length = Math.max(20, Math.round((Math.abs(val) / maxVal) * 110));

                return (
                  <div
                    key={idx}
                    className={`viz-radial-line ${rClass}`}
                    style={{
                      transform: `rotate(${angle}deg)`,
                      height: `${length}px`,
                      ...getCustomStyle(isSorted, isSwap, isComp, false),
                    }}
                  />
                );
              })}
            </div>
          )}

          {vizType === "cells" && (
            <div className="viz-cells-row">
              {array.map((val, idx) => {
                const isComp = comparedIndices.includes(idx);
                const isSwap = swappedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                let cellClass = "default";
                if (isSorted) cellClass = "sorted";
                else if (isSwap) cellClass = "swap";
                else if (isComp) cellClass = "compare";

                return (
                  <div key={idx} className="viz-cell-wrapper">
                    <span className="viz-cell-header">idx {idx}</span>
                    <div
                      className={`viz-cell-box ${cellClass} ${getHatchClass()}`}
                      style={getCustomStyle(isSorted, isSwap, isComp, false)}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Educational Information Tabs */}
        <div className="algo-info-card">
          <div className="code-runner-header" style={{ marginBottom: "18px" }}>
            <div className="language-tabs-row" style={{ overflowX: "auto" }}>
              <button className={`lang-tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
                <BookOpen size={14} style={{ display: "inline", marginRight: "4px" }} /> Deep Academic Overview
              </button>
              <button className={`lang-tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
                <History size={14} style={{ display: "inline", marginRight: "4px" }} /> Origin & History
              </button>
              <button className={`lang-tab-btn ${activeTab === "how" ? "active" : ""}`} onClick={() => setActiveTab("how")}>
                <Sparkles size={14} style={{ display: "inline", marginRight: "4px" }} /> Working Principle
              </button>
              <button className={`lang-tab-btn ${activeTab === "complexity" ? "active" : ""}`} onClick={() => setActiveTab("complexity")}>
                <BarChart3 size={14} style={{ display: "inline", marginRight: "4px" }} /> Complexity Matrix
              </button>
              <button className={`lang-tab-btn ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
                <Layers size={14} style={{ display: "inline", marginRight: "4px" }} /> Real-World Use Cases
              </button>
              <button className={`lang-tab-btn ${activeTab === "advantages" ? "active" : ""}`} onClick={() => setActiveTab("advantages")}>
                <CheckCircle2 size={14} style={{ display: "inline", marginRight: "4px" }} /> Advantages & Limitations
              </button>
              <button className={`lang-tab-btn ${activeTab === "code" ? "active" : ""}`} onClick={() => setActiveTab("code")}>
                <Code2 size={14} style={{ display: "inline", marginRight: "4px" }} /> Source Code Viewer
              </button>
              <button className={`lang-tab-btn ${activeTab === "execution" ? "active" : ""}`} onClick={() => setActiveTab("execution")}>
                <Sliders size={14} style={{ display: "inline", marginRight: "4px" }} /> Live Execution Sandbox
              </button>
              <button className={`lang-tab-btn ${activeTab === "comparison" ? "active" : ""}`} onClick={() => setActiveTab("comparison")}>
                <Maximize2 size={14} style={{ display: "inline", marginRight: "4px" }} /> Side-by-Side Matrix
              </button>
              <button className={`lang-tab-btn ${activeTab === "quiz" ? "active" : ""}`} onClick={() => setActiveTab("quiz")}>
                <HelpCircle size={14} style={{ display: "inline", marginRight: "4px" }} /> DSA Quiz & Recommender
              </button>
            </div>
          </div>

          {currentAlgo.specialDisclaimer && (
            <div style={{ padding: "10px 14px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "10px", marginBottom: "16px", fontSize: "0.88rem", color: "#f59e0b" }}>
              <strong>Notice:</strong> {currentAlgo.specialDisclaimer}
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>{currentAlgo.name} — Deep Academic Overview</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.94rem", lineHeight: "1.7" }}>{currentAlgo.overview}</p>
              <div className="pub-attributes-row" style={{ marginTop: "14px" }}>
                <span className="attribute-pill">Category: {currentAlgo.categoryName}</span>
                <span className="attribute-pill">Best: {currentAlgo.bestTime}</span>
                <span className="attribute-pill">Worst: {currentAlgo.worstTime}</span>
                <span className="attribute-pill">Space: {currentAlgo.space}</span>
                <span className="attribute-pill">{currentAlgo.stable ? "Stable Sort" : "Unstable Sort"}</span>
                <span className="attribute-pill">{currentAlgo.inPlace ? "In-Place" : "Out-of-Place"}</span>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>Historical Context & Origin</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.94rem", lineHeight: "1.7" }}>{currentAlgo.history}</p>
            </div>
          )}

          {activeTab === "how" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>Detailed Working Principle</h3>
              <ol style={{ paddingLeft: "20px", color: "var(--muted)", fontSize: "0.94rem", lineHeight: "1.75" }}>
                {currentAlgo.howItWorks.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: "8px" }}>{step}</li>
                ))}
              </ol>
              <h4 style={{ fontSize: "1rem", fontWeight: 750, marginTop: "18px", marginBottom: "8px" }}>Language-Neutral Pseudocode</h4>
              <pre className="console-output-area" style={{ background: "var(--bg)", padding: "14px", borderRadius: "10px" }}>{currentAlgo.pseudocode}</pre>
            </div>
          )}

          {activeTab === "complexity" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}>Time & Space Complexity Matrix</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Theoretical Value</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Best-case time</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{currentAlgo.bestTime}</td>
                    <td>Minimum comparisons required on optimal input.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Average-case time</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{currentAlgo.avgTime}</td>
                    <td>Expected runtime over random input permutations.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Worst-case time</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{currentAlgo.worstTime}</td>
                    <td>Upper bound time limit on adversarial input.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Auxiliary space</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{currentAlgo.space}</td>
                    <td>Extra memory required beyond input array.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 800 }}>Stable Sort</td>
                    <td>{currentAlgo.stable ? "Yes" : "No"}</td>
                    <td>Preserves relative order of duplicate elements.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>Real-World Use Cases & Applications</h3>
              <ul style={{ paddingLeft: "20px", color: "var(--muted)", fontSize: "0.94rem", lineHeight: "1.7" }}>
                {currentAlgo.applications.map((app, idx) => (
                  <li key={idx} style={{ marginBottom: "8px" }}>{app}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "advantages" && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}>Key Advantages & Limitations</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ color: "#10b981", fontSize: "1rem", fontWeight: 800, marginBottom: "8px" }}>Advantages</h4>
                  <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text)", fontSize: "0.9rem", lineHeight: "1.65" }}>
                    {currentAlgo.advantages.map((adv, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{adv}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "16px" }}>
                  <h4 style={{ color: "#ef4444", fontSize: "1rem", fontWeight: 800, marginBottom: "8px" }}>Limitations</h4>
                  <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text)", fontSize: "0.9rem", lineHeight: "1.65" }}>
                    {currentAlgo.limitations.map((lim, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div>
              <CodeEditorRunner initialCode={currentAlgo.code} algorithmName={currentAlgo.name} />
            </div>
          )}

          {activeTab === "execution" && (
            <div>
              <CodeEditorRunner initialCode={currentAlgo.code} algorithmName={currentAlgo.name} />
            </div>
          )}

          {activeTab === "comparison" && <ComparisonDashboard />}

          {activeTab === "quiz" && <QuizAndRecommender />}
        </div>
      </div>
    </section>
  );
}
