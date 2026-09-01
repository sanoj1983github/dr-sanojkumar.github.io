(function bridgeScholarResumeApi() {
  var localBackendPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1):4000(?=\/|$)/i;
  var isLocalPage = /^(?:localhost|127\.0\.0\.1|::1)$/i.test(window.location.hostname);
  var entryScript = window.__SCHOLAR_RESUME_ENTRY__;

  function loadScholarResume() {
    if (!entryScript || document.querySelector("script[data-scholar-resume-entry]")) return;
    var script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "anonymous";
    script.src = entryScript;
    script.setAttribute("data-scholar-resume-entry", "true");
    document.head.appendChild(script);
  }

  function sameOriginApiUrl(value) {
    if (typeof value !== "string") return value;
    return localBackendPattern.test(value)
      ? value.replace(localBackendPattern, window.location.origin)
      : value;
  }

  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(method, url) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = sameOriginApiUrl(url);
    return originalOpen.apply(this, args);
  };

  if (typeof window.fetch === "function") {
    var originalFetch = window.fetch.bind(window);
    window.fetch = function fetch(input, init) {
      if (typeof input === "string") {
        return originalFetch(sameOriginApiUrl(input), init);
      }
      if (input instanceof Request) {
        return originalFetch(
          new Request(sameOriginApiUrl(input.url), input),
          init,
        );
      }
      return originalFetch(input, init);
    };
  }

  if (isLocalPage || !("serviceWorker" in navigator)) {
    loadScholarResume();
    return;
  }

  navigator.serviceWorker
    .register("/scholarresume-api-sw.js?v=20260823-chrome-pdf-1", { scope: "/" })
    .then(function waitUntilControlled() {
      if (navigator.serviceWorker.controller) return;
      return new Promise(function waitForController(resolve) {
        var timeout = window.setTimeout(resolve, 3000);
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          function controlled() {
            window.clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    })
    .then(loadScholarResume)
    .catch(loadScholarResume);
})();
