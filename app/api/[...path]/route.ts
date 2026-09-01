type ApiRouteContext = {
  params: Promise<{ path?: string[] }>;
};

const DEFAULT_BACKEND_URL = "http://127.0.0.1:4000";

async function proxyScholarResumeApi(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  const { path = [] } = await context.params;
  const backendUrl = (
    process.env.SCHOLARRESUME_BACKEND_URL || DEFAULT_BACKEND_URL
  ).replace(/\/$/, "");
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(
    `/api/${path.map(encodeURIComponent).join("/")}${sourceUrl.search}`,
    `${backendUrl}/`,
  );

  const headers = new Headers(request.headers);
  for (const name of ["connection", "content-length", "host"]) {
    headers.delete(name);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);
    for (const name of [
      "connection",
      "content-encoding",
      "content-length",
      "transfer-encoding",
    ]) {
      responseHeaders.delete(name);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { error: "ScholarResume service is temporarily unavailable" },
      { status: 503 },
    );
  }
}

export const GET = proxyScholarResumeApi;
export const POST = proxyScholarResumeApi;
export const PUT = proxyScholarResumeApi;
export const PATCH = proxyScholarResumeApi;
export const DELETE = proxyScholarResumeApi;
export const OPTIONS = proxyScholarResumeApi;
