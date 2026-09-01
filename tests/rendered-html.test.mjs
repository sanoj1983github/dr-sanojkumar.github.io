import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished academic portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Dr\. Mritunjay Shall Peelam/);
  assert.match(html, /Assistant Professor \(Selection Grade\)/);
  assert.match(html, /Senior Member, IEEE/);
  assert.match(html, /Elevated to the grade of Senior Member, IEEE/);
  assert.match(html, /Aug 23, 2026/);
  assert.match(html, /Last updated: August 23, 2026/);
  assert.match(html, /Publications/);
  assert.match(html, /Teaching/);
  assert.equal((html.match(/class="publication-card compact"/g) ?? []).length, 21);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);

  // Home page has no desktop header brand, but has mobile centered brand
  assert.doesNotMatch(html, /class="desktop-page-brand"/);
  assert.match(html, /class="mobile-page-brand"[^>]*>\s*<strong>Dr\. Mritunjay<\/strong>/);

  // Subpage header menu has desktop-page-brand and mobile-page-brand
  const blogResponse = await render("/blog");
  const blogHtml = await blogResponse.text();
  assert.match(blogHtml, /class="desktop-page-brand"[^>]*>\s*<strong>Dr\. Mritunjay<\/strong>/);
  assert.match(blogHtml, /class="mobile-page-brand"[^>]*>\s*<strong>Dr\. Mritunjay<\/strong>/);

  const cvResponse = await render("/cv");
  const cvHtml = await cvResponse.text();
  assert.equal(cvResponse.status, 200);
  assert.match(cvHtml, /class="cv-membership">Senior Member, IEEE<\/strong>/);
  assert.match(
    cvHtml,
    /href="\/documents\/Dr-Mritunjay-resume\.pdf" download="Dr-Mritunjay-Shall-Peelam-Resume\.pdf"/,
  );
});

test("keeps the implementation independent from the retired theme", async () => {
  const [page, layout, portfolio, styles, scrollControls, liveRefresh, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/ScrollJumpButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/LiveUpdateRefresh.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const combined = `${page}\n${layout}\n${portfolio}\n${scrollControls}\n${liveRefresh}\n${packageJson}`;
  assert.match(combined, /PortfolioApp/);
  assert.doesNotMatch(portfolio, /publications\.slice\(0,\s*5\)/);
  assert.doesNotMatch(portfolio, /Search and filter publications/);
  assert.match(styles, /\.bio\s*\{[^}]*text-align:\s*justify/s);
  assert.match(scrollControls, /Go to top/);
  assert.match(scrollControls, /Go to bottom/);
  assert.match(scrollControls, /is-down/);
  assert.match(scrollControls, /is-up/);
  assert.match(liveRefresh, /setInterval/);
  assert.match(liveRefresh, /visibilitychange/);
  assert.match(layout, /og\.png/);
  assert.match(portfolio, /href="\/vision-pen"[\s\S]*Vision Pen[\s\S]*href="\/resumebuilder"/);
  assert.match(
    portfolio,
    /href="\/resumebuilder"[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"[\s\S]*Scholar Resume/,
  );
  assert.doesNotMatch(portfolio, />\s*Resume Builder\s*</);
  assert.doesNotMatch(combined, /al-folio|jekyll|liquid|react-loading-skeleton/i);
});

test("serves current aggregate and per-paper Google Scholar citations", async () => {
  const response = await render("/api/scholar");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i);

  const snapshot = await response.json();
  assert.ok(snapshot.total_citations >= 622);
  assert.ok(snapshot.h_index >= 14);
  assert.ok(snapshot.i10_index >= 17);
  assert.ok(snapshot.papers.length >= 21);

  const metaverse = snapshot.papers.find((paper) =>
    paper.title.toLowerCase().startsWith("metaverse for education"),
  );
  const quantumIot = snapshot.papers.find(
    (paper) => paper.title === "Quantum computing applications for Internet of Things",
  );
  assert.ok(metaverse.citations >= 68);
  assert.ok(quantumIot.citations >= 81);
  assert.match(quantumIot.scholar_url, /citation_for_view=MdGRPEIAAAAJ:zYLM7Y9cAGgC/);
});

test("uses native Chrome Save as PDF for live resume PDFs", async () => {
  const [liveRenderer, bundlePatch, mobileApi] = await Promise.all([
    readFile(new URL("../public/ResumeBuilder/live-pdf-renderer.js", import.meta.url), "utf8"),
    readFile(new URL("../scripts/patch-scholarresume-pdf.mjs", import.meta.url), "utf8"),
    readFile(new URL("../public/scholarresume-api-sw.js", import.meta.url), "utf8"),
  ]);

  assert.match(liveRenderer, /createElement\("iframe"\)/);
  assert.match(liveRenderer, /frame\.contentWindow/);
  assert.match(liveRenderer, /printWindow\.print\(\)/);
  assert.match(liveRenderer, /application\/x-scholarresume-print-dialog/);
  assert.match(bundlePatch, /downloadWithNativePrint/);
  assert.match(mobileApi, /Chrome's high-quality Save as PDF view/);
  assert.doesNotMatch(liveRenderer, /html2canvas|jsPDF|appendCanvasPages/);
});

test("serves Scholar Resume instead of the generic portfolio route", async () => {
  for (const path of ["/resumebuilder", "/resumebuilder/signup"]) {
    const response = await render(path);
    const html = await response.text();

    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    assert.match(html, /<title>ScholarResume<\/title>/);
    assert.match(html, /live-pdf-renderer\.js\?v=20260823-chrome-pdf-1/);
    assert.match(html, /api-bridge\.js\?v=20260823-chrome-pdf-1/);
    assert.match(html, /src="\/ResumeBuilder\/api-bridge\.js/);
    assert.match(html, /__SCHOLAR_RESUME_ENTRY__ = "\/ResumeBuilder\/assets\/index-BADIOmQT\.js\?v=20260823-chrome-pdf-1"/);
    assert.doesNotMatch(html, /Dr\. Mritunjay Shall Peelam/);
  }
});

test("renders Vision Pen inside the portfolio header and footer", async () => {
  const response = await render("/vision-pen");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="site-header"/);
  assert.match(html, /title="Vision Pen air-writing studio"/);
  assert.match(html, /src="\/vision-pen-studio\/index\.html\?v=20260826-tracking-age"/);
  assert.match(html, /class="site-footer"/);
});

test("opens the single Sampling and Quantization menu above Vision Pen", async () => {
  const response = await render("/filterverse");
  const html = await response.text();
  const source = await readFile(
    new URL("../app/PortfolioApp.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(response.status, 200);
  assert.match(source, /href="\/filterverse"[\s\S]*Filter Verse[\s\S]*href="\/vision-pen"/);
  assert.match(html, /Computer Vision home/);
  assert.match(html, /Sampling and Quantization/);
  assert.match(html, /Processing logic/);
  assert.match(html, /Upload an image and see the result/);
  assert.match(html, /type="file"/);
  assert.match(html, /image\/png,image\/jpeg,image\/webp/);
  assert.doesNotMatch(html, /This menu is kept ready for your next instruction/);
  assert.doesNotMatch(html, /No content added/);
  for (const removedMenu of ["What is Computer Vision", "Overview", "Image Upload", "Filter Explorer", "Applications &amp; Ethics", "Image Formation", "Resolution", "Histograms", "Histogram Matching", "Spatial Filtering", "Learning Center"]) {
    assert.doesNotMatch(html, new RegExp(removedMenu));
  }
  assert.doesNotMatch(html, /217 slides distilled/);
  assert.doesNotMatch(html, /From pixels to visual intelligence/);
  assert.doesNotMatch(html, /Core formulas/);
  assert.doesNotMatch(html, /Image Processing Filter Laboratory/);
});

test("redirects the previous Vision Pen URL to the integrated page", async () => {
  const response = await render("/vision-pen/index.html");

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "http://localhost/vision-pen");
});

test("packages the complete Scholar Resume app on its lowercase public route", async () => {
  const scholarHtml = await readFile(
    new URL("../dist/resumebuilder/index.html", import.meta.url),
    "utf8",
  );
  const scholarScript = await readFile(
    new URL("../dist/resumebuilder/assets/index-BADIOmQT.js", import.meta.url),
    "utf8",
  );
  const scholarStyles = await readFile(
    new URL("../dist/resumebuilder/assets/index-JcPN3zOH.css", import.meta.url),
    "utf8",
  );
  const apiBridge = await readFile(
    new URL("../dist/resumebuilder/api-bridge.js", import.meta.url),
    "utf8",
  );
  const mobileApi = await readFile(
    new URL("../dist/scholarresume-api-sw.js", import.meta.url),
    "utf8",
  );
  const livePdfRenderer = await readFile(
    new URL("../dist/resumebuilder/live-pdf-renderer.js", import.meta.url),
    "utf8",
  );

  assert.match(scholarHtml, /<title>ScholarResume<\/title>/);
  assert.match(scholarHtml, /__SCHOLAR_RESUME_ENTRY__ = "\/resumebuilder\/assets\/index-BADIOmQT\.js\?v=20260823-chrome-pdf-1"/);
  assert.match(scholarHtml, /href="\/resumebuilder\/assets\/index-JcPN3zOH\.css\?v=20260823-membership-1"/);
  assert.match(scholarScript, /\/resumebuilder/);
  assert.doesNotMatch(scholarHtml, /html2canvas|jspdf/i);
  assert.match(scholarHtml, /live-pdf-renderer\.js\?v=20260823-chrome-pdf-1/);
  assert.match(scholarHtml, /api-bridge\.js\?v=20260823-chrome-pdf-1/);
  assert.match(apiBridge, /window\.location\.origin/);
  assert.match(apiBridge, /XMLHttpRequest\.prototype\.open/);
  assert.match(mobileApi, /accounts:signInWithPassword/);
  assert.match(mobileApi, /handleApiRequest/);
  assert.match(mobileApi, /Chrome's high-quality Save as PDF view/);
  assert.match(scholarScript, /x-scholarresume-pdf-engine/);
  assert.match(scholarScript, /window\.ScholarResumeLivePdf/);
  assert.match(scholarScript, /buildResumePdf\(s,\{\.\.\.d,pdfFont:"serif"\}\)/);
  assert.match(livePdfRenderer, /printWindow\.print\(\)/);
  assert.match(livePdfRenderer, /application\/x-scholarresume-print-dialog/);
  assert.doesNotMatch(livePdfRenderer, /html2canvas|jsPDF|appendCanvasPages/);
  assert.match(scholarScript, /application\/x-scholarresume-print-dialog/);
  assert.match(scholarScript, /label:"Professional membership"/);
  assert.match(scholarScript, /Senior Member, IEEE/);
  assert.match(scholarScript, /className:"resume-pdf-membership"/);
  assert.match(scholarScript, /pt\.membership&&nt\(pt\.membership/);
  assert.match(scholarStyles, /\.resume-preview-toolbar/);
  assert.match(scholarStyles, /\.resume-pdf-membership/);
});

test("packages the responsive Vision Pen browser app", async () => {
  const [html, appScript, canvasEngine, handTracker, styles] = await Promise.all([
    readFile(new URL("../dist/vision-pen-studio/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/vision-pen-studio/static/js/app.js", import.meta.url), "utf8"),
    readFile(new URL("../dist/vision-pen-studio/static/js/canvasEngine.js", import.meta.url), "utf8"),
    readFile(new URL("../dist/vision-pen-studio/static/js/handTracker.js", import.meta.url), "utf8"),
    readFile(new URL("../dist/vision-pen-studio/static/css/style.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /VisionPen/);
  assert.match(html, /\.\/static\/css\/style\.css\?v=20260826-tracking-age/);
  assert.match(html, /data-board="black"/);
  assert.match(html, /data-board="white"/);
  assert.match(html, /\.\/static\/js\/app\.js/);
  assert.match(html, /<a[^>]*id="objectDetectionBtn"[^>]*href="\.\/smart-vision\.html\?v=[^"]+"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, />Object Detection<\/span>/);
  assert.match(appScript, /objectDetectionBtn\.addEventListener\('click', \(\) => stopCamera\(\)\)/);
  assert.doesNotMatch(html + appScript, /smartVisionDialog|smartVisionFrame|autostart=1/);
  assert.doesNotMatch(appScript, /yolo-detect|yolo_enabled/);
  assert.match(appScript, /pointerdown/);
  assert.match(canvasEngine, /drawCurve/);
  assert.match(canvasEngine, /maxSpacing/);
  assert.match(handTracker, /cursorVelocity/);
  assert.match(handTracker, /\.\/static\/vendor\/mediapipe-hands/);
  assert.match(styles, /@media \(max-width: 768px\)/);
  assert.match(styles, /\.control-dock\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(styles, /grid-template-areas:\s*"board board"\s*"tools colours"\s*"stroke options"/s);
  assert.match(styles, /\.tool-btn i\s*\{[^}]*font-size:\s*0\.7rem/s);

  // Static builds must ship our current camera app, never a sibling checkout.
  for (const asset of ["index.html", "smart-vision.html", "static/css/smart-vision.css", "static/js/smartVision.js", "static/js/smartVisionCore.mjs", "static/vendor/smart-vision/face/age_gender_model.bin"]) {
    const source = await readFile(new URL(`../public/vision-pen-studio/${asset}`, import.meta.url));
    const packaged = await readFile(new URL(`../dist/vision-pen-studio/${asset}`, import.meta.url));
    assert.deepEqual(packaged, source, asset);
  }
});
