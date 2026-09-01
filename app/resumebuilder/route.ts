const scholarResumeHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#020617" />
    <link rel="icon" type="image/gif" href="/ResumeBuilder/favicon-animated-transparent.gif?v=6" />
    <link rel="alternate icon" type="image/x-icon" href="/ResumeBuilder/favicon-transparent.ico?v=6" />
    <link rel="alternate icon" type="image/x-icon" sizes="64x64" href="/ResumeBuilder/favicon-64x64.ico?v=6" />
    <link rel="alternate icon" type="image/svg+xml" href="/ResumeBuilder/favicon.svg" />
    <link rel="shortcut icon" href="/ResumeBuilder/favicon-transparent.ico?v=6" />
    <link rel="manifest" href="/ResumeBuilder/site.webmanifest" />
    <title>ScholarResume</title>
    <script src="/ResumeBuilder/live-pdf-renderer.js?v=20260823-chrome-pdf-1"></script>
    <script>window.__SCHOLAR_RESUME_ENTRY__ = "/ResumeBuilder/assets/index-BADIOmQT.js?v=20260823-chrome-pdf-1";</script>
    <script src="/ResumeBuilder/api-bridge.js?v=20260823-chrome-pdf-1"></script>
    <link rel="stylesheet" crossorigin href="/ResumeBuilder/assets/index-JcPN3zOH.css?v=20260823-membership-1" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

export function GET() {
  return new Response(scholarResumeHtml, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
