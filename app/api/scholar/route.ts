import { parseGoogleScholarProfile } from "../../google-scholar-parser";
import {
  CACHED_SCHOLAR_SNAPSHOT,
  GOOGLE_SCHOLAR_PROFILE_URL,
} from "../../scholar-data";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET(): Promise<Response> {
  try {
    const upstream = await fetch(`${GOOGLE_SCHOLAR_PROFILE_URL}&pagesize=100`, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!upstream.ok) {
      throw new Error(`Google Scholar returned ${upstream.status}`);
    }

    const snapshot = parseGoogleScholarProfile(await upstream.text());
    return Response.json(snapshot, { headers: RESPONSE_HEADERS });
  } catch {
    return Response.json(CACHED_SCHOLAR_SNAPSHOT, {
      headers: {
        ...RESPONSE_HEADERS,
        "Cache-Control": "public, max-age=900",
        "X-Scholar-Source": "cached",
      },
    });
  }
}
