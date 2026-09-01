export type AlgorithmCategory =
  | "basic"
  | "efficient"
  | "non-comparison"
  | "special";

export type SortEventType =
  | "compare"
  | "swap"
  | "overwrite"
  | "pivot"
  | "select"
  | "partition"
  | "merge"
  | "heapify"
  | "sorted"
  | "message";

export interface SortEvent {
  type: SortEventType;
  indices?: number[];
  values?: number[];
  array: number[];
  message: string;
  comparisons?: number;
  swaps?: number;
  writes?: number;
  recursionDepth?: number;
}

export type VisualizationType =
  | "histogram"
  | "horizontal"
  | "blocks"
  | "scatter"
  | "radial"
  | "cells"
  | "table";

export type HatchPattern =
  | "none"
  | "diagonal"
  | "reverse-diagonal"
  | "crosshatch"
  | "horizontal"
  | "vertical"
  | "dots"
  | "grid"
  | "waves"
  | "zigzag";

export type Language = "cpp" | "c" | "java" | "python";

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: AlgorithmCategory;
  categoryName: string;
  bestTime: string;
  avgTime: string;
  worstTime: string;
  space: string;
  stable: boolean;
  inPlace: boolean;
  adaptive: boolean;
  comparisonBased: boolean;
  tagline: string;
  overview: string;
  history: string;
  howItWorks: string[];
  pseudocode: string;
  code: Record<Language, string>;
  applications: string[];
  advantages: string[];
  limitations: string[];
  specialDisclaimer?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}
