import {
  GOOGLE_SCHOLAR_PROFILE_URL,
  ScholarPaperMetric,
  ScholarSnapshot,
  normalizeScholarTitle,
} from "./scholar-data";

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function textContent(html: string): string {
  return decodeHtml(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(tagAttributes: string, name: string): string {
  const match = tagAttributes.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return decodeHtml(match?.[1] ?? match?.[2] ?? "");
}

function absoluteScholarUrl(url: string): string {
  if (!url) return "";
  try {
    return new URL(url, GOOGLE_SCHOLAR_PROFILE_URL).toString();
  } catch {
    return "";
  }
}

function parseMetricValues(html: string): number[] {
  const table = html.match(
    /<table\b[^>]*\bid=["']gsc_rsb_st["'][^>]*>([\s\S]*?)<\/table>/i,
  )?.[1];
  if (!table) return [];

  return Array.from(
    table.matchAll(
      /<td\b[^>]*\bclass=["'][^"']*\bgsc_rsb_std\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi,
    ),
    (match) => Number.parseInt(textContent(match[1]), 10),
  ).filter(Number.isFinite);
}

function parsePapers(html: string): ScholarPaperMetric[] {
  const papers: ScholarPaperMetric[] = [];

  for (const rowMatch of html.matchAll(
    /<tr\b[^>]*\bclass=["'][^"']*\bgsc_a_tr\b[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi,
  )) {
    const row = rowMatch[1];
    const titleMatch = row.match(
      /<a\b([^>]*\bclass=["'][^"']*\bgsc_a_at\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/i,
    );
    if (!titleMatch) continue;

    const citationCell = row.match(
      /<td\b[^>]*\bclass=["'][^"']*\bgsc_a_c\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i,
    )?.[1] ?? "";
    const citedByMatch = citationCell.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
    const yearCell = row.match(
      /<td\b[^>]*\bclass=["'][^"']*\bgsc_a_y\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i,
    )?.[1] ?? "";

    papers.push({
      title: textContent(titleMatch[2]),
      citations: Math.max(
        0,
        Number.parseInt(textContent(citedByMatch?.[2] ?? "0"), 10) || 0,
      ),
      year: textContent(yearCell),
      scholar_url: absoluteScholarUrl(attribute(titleMatch[1], "href")),
      cited_by_url: absoluteScholarUrl(attribute(citedByMatch?.[1] ?? "", "href")),
    });
  }

  const bestByTitle = new Map<string, ScholarPaperMetric>();
  for (const paper of papers) {
    const normalized = normalizeScholarTitle(paper.title);
    const previous = bestByTitle.get(normalized);
    if (!previous || paper.citations > previous.citations) {
      bestByTitle.set(normalized, paper);
    }
  }
  return Array.from(bestByTitle.values());
}

export function parseGoogleScholarProfile(
  html: string,
  fetchedAt = new Date().toISOString(),
): ScholarSnapshot {
  const metrics = parseMetricValues(html);
  const papers = parsePapers(html);
  if (metrics.length < 6 || papers.length === 0) {
    throw new Error("Google Scholar profile response was incomplete");
  }

  return {
    total_citations: metrics[0],
    h_index: metrics[2],
    i10_index: metrics[4],
    papers,
    profile_url: GOOGLE_SCHOLAR_PROFILE_URL,
    fetched_at: fetchedAt,
    source: "google-scholar",
  };
}
