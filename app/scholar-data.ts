export const GOOGLE_SCHOLAR_USER_ID = "MdGRPEIAAAAJ";
export const GOOGLE_SCHOLAR_PROFILE_URL =
  `https://scholar.google.com/citations?user=${GOOGLE_SCHOLAR_USER_ID}&hl=en`;

export interface ScholarPaperMetric {
  title: string;
  citations: number;
  year?: string;
  scholar_url?: string;
  cited_by_url?: string;
}

export interface ScholarSnapshot {
  total_citations: number;
  h_index: number;
  i10_index: number;
  papers: ScholarPaperMetric[];
  profile_url: string;
  fetched_at: string;
  source: "google-scholar" | "cached";
}

const scholarPaper = (
  title: string,
  citations: number,
  year: string,
  citationId: string,
  citedById = "",
): ScholarPaperMetric => ({
  title,
  citations,
  year,
  scholar_url:
    `${GOOGLE_SCHOLAR_PROFILE_URL}&view_op=view_citation&citation_for_view=` +
    `${GOOGLE_SCHOLAR_USER_ID}:${citationId}`,
  cited_by_url: citedById
    ? `https://scholar.google.com/scholar?oi=bibs&hl=en&cites=${citedById}`
    : "",
});

/**
 * Last verified profile snapshot. The live API replaces this at runtime when
 * Google Scholar is reachable and it remains a safe static-hosting fallback.
 */
export const CACHED_SCHOLAR_SNAPSHOT: ScholarSnapshot = {
  total_citations: 622,
  h_index: 14,
  i10_index: 17,
  profile_url: GOOGLE_SCHOLAR_PROFILE_URL,
  fetched_at: "2026-08-25T10:41:48.523Z",
  source: "cached",
  papers: [
    scholarPaper(
      "Quantum computing applications for Internet of Things",
      81,
      "2024",
      "zYLM7Y9cAGgC",
      "9686432201873605822",
    ),
    scholarPaper(
      "Metaverse for education: Developments, challenges, and future direction",
      68,
      "2025",
      "kNdYIx-mwKoC",
      "6379278039350305310",
    ),
    scholarPaper(
      "QIoTChain: quantum IoT-blockchain fusion for advanced data protection in Industry 4.0",
      65,
      "2024",
      "qjMakFHDy7sC",
      "15831870856063533727",
    ),
    scholarPaper(
      "A review on emergency vehicle management for intelligent transportation systems",
      58,
      "2024",
      "_FxGoFyzp5QC",
      "13729872689521760260",
    ),
    scholarPaper(
      "Unlocking the potential of interconnected blockchains: A comprehensive study of Cosmos blockchain interoperability",
      52,
      "2024",
      "roLk4NBRz8UC",
      "466942265117435416",
    ),
    scholarPaper(
      "Future of connectivity: A comprehensive review of innovations and challenges in 7G smart networks",
      47,
      "2025",
      "KlAtU1dfN6UC",
      "7172045923725479815",
    ),
    scholarPaper(
      "DemocracyGuard: Blockchain-based secure voting framework for digital democracy",
      39,
      "2025",
      "ufrVoPGSRksC",
      "12403159287003757603",
    ),
    scholarPaper(
      "Explorative implementation of quantum key distribution algorithms for secure consumer electronics networks",
      39,
      "2024",
      "W7OEmFMy1HYC",
      "12744333347528424792",
    ),
    scholarPaper(
      "Enhancing security using quantum blockchain in consumer IoT networks",
      38,
      "2024",
      "UebtZRa9Y70C",
      "16854804718286061991",
    ),
    scholarPaper(
      "A comprehensive survey on data converters for IoT applications: Scope, issues and future directions",
      27,
      "2025",
      "0EnyYjriUFMC",
      "7821640531072506724",
    ),
    scholarPaper(
      "V-Track: Blockchain-enabled IoT system for reliable vehicle location verification",
      22,
      "2024",
      "WF5omc3nYNoC",
      "5921717216089011881",
    ),
    scholarPaper(
      "Blockchain-enabled vehicle lifecycle management with predictive maintenance using federated learning",
      17,
      "2024",
      "LkGwnXOMwfcC",
      "10900713872302634975",
    ),
    scholarPaper(
      "Decentralized trust: NFT and blockchain-enabled evidence system using fog computing",
      15,
      "2025",
      "ULOm3_A8WrAC",
      "14148570133583246326",
    ),
    scholarPaper(
      "Blockchain-enabled intrusion detection systems for real-time vehicle monitoring",
      14,
      "2025",
      "4TOpqqG69KYC",
      "3672807562139699312",
    ),
    scholarPaper(
      "Machine Learning Techniques for Wi-Fi CSI-based Recognition and Sensing: A Comprehensive Review",
      12,
      "2026",
      "9ZlFYXVOiuMC",
      "5709288465619362501",
    ),
    scholarPaper(
      "Enhancing security using quantum computing (ESUQC)",
      11,
      "2021",
      "u5HHmVD_uO8C",
      "11280568287610996165",
    ),
    scholarPaper(
      "Blockchain-Based Game Theoretical Framework for V2V and V2G Energy Trading in Carbon-Intelligent Internet of Vehicles",
      10,
      "2025",
      "YOwf2qJgpHMC",
      "12490583310529805986",
    ),
    scholarPaper(
      "Blockchain-Enabled Secure V2V and V2G Energy Trading for Carbon-Aware Internet of Energy Networks",
      2,
      "2025",
      "4DMP91E08xMC",
      "13135934395601803640",
    ),
    scholarPaper(
      "Enhancing Quantum-Resistant Data Privacy in Vehicular Cloud Networks Using NIST-Qualified FALCON Algorithm",
      1,
      "2026",
      "mVmsd5A6BfQC",
      "9536515976185837115",
    ),
    scholarPaper(
      "Blockchain-based framework for global IMEI blacklist management and mobile device theft prevention",
      1,
      "2025",
      "M3ejUd6NZC8C",
      "11113142097322899762",
    ),
    scholarPaper(
      "Enhancing Vehicle Lifecycle Management Through Blockchain-Driven Predictive Maintenance and Federated Learning",
      1,
      "2024",
      "Zph67rFs4hoC",
      "4089043779411409513",
    ),
    scholarPaper(
      "Smart Railway Obstruction Detection System using IoT and Computer Vision",
      0,
      "2026",
      "QIV2ME_5wuYC",
    ),
  ],
};

export function normalizeScholarTitle(title: string): string {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\(\s*ioe\s*\)/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function papersToCitationMap(
  papers: ScholarPaperMetric[],
): Record<string, number> {
  const result: Record<string, number> = {};
  const bestByNormalizedTitle = new Map<string, number>();

  for (const paper of papers) {
    const normalized = normalizeScholarTitle(paper.title);
    const best = Math.max(
      0,
      paper.citations,
      bestByNormalizedTitle.get(normalized) ?? 0,
    );
    bestByNormalizedTitle.set(normalized, best);
  }

  for (const paper of papers) {
    result[paper.title] = bestByNormalizedTitle.get(
      normalizeScholarTitle(paper.title),
    ) ?? paper.citations;
  }
  return result;
}

export function findScholarPaper(
  title: string,
  papers: ScholarPaperMetric[] = CACHED_SCHOLAR_SNAPSHOT.papers,
): ScholarPaperMetric | undefined {
  const normalized = normalizeScholarTitle(title);
  return papers
    .filter((paper) => normalizeScholarTitle(paper.title) === normalized)
    .sort((a, b) => b.citations - a.citations)[0];
}

export function getScholarPaperUrl(title: string): string {
  return findScholarPaper(title)?.scholar_url || GOOGLE_SCHOLAR_PROFILE_URL;
}
