(function installScholarResumeLivePdf(global) {
  "use strict";

  var LOCAL_HOSTS = /^(?:localhost|127\.0\.0\.1|::1)$/i;
  var PRINT_DIALOG_TYPE = "application/x-scholarresume-print-dialog";

  function shouldHandle() {
    return !LOCAL_HOSTS.test(global.location.hostname);
  }

  function safeTitle(value) {
    var base = String(value || "ScholarResume")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return (base || "ScholarResume") + "-Resume";
  }

  async function waitForDocumentAssets(printWindow) {
    var documentRef = printWindow.document;
    if (documentRef.fonts && documentRef.fonts.ready) {
      await documentRef.fonts.ready.catch(function ignoreFontError() {});
    }

    await Promise.all(
      Array.from(documentRef.images).map(function waitForImage(image) {
        if (image.complete) return Promise.resolve();
        if (typeof image.decode === "function") {
          return image.decode().catch(function ignoreDecodeError() {});
        }
        return new Promise(function wait(resolve) {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }),
    );

    await new Promise(function nextPaint(resolve) {
      printWindow.requestAnimationFrame(function firstFrame() {
        printWindow.requestAnimationFrame(resolve);
      });
    });
  }

  async function createPdf(options) {
    if (!options || !options.html) {
      throw new Error("The live PDF preview is empty.");
    }

    var frame = global.document.createElement("iframe");
    frame.title = "ScholarResume high-quality PDF";
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.left = "-12000px";
    frame.style.top = "0";
    frame.style.width = "794px";
    frame.style.height = "1123px";
    frame.style.border = "0";
    frame.style.pointerEvents = "none";
    global.document.body.appendChild(frame);

    var printWindow = frame.contentWindow;
    if (!printWindow) {
      frame.remove();
      throw new Error("The high-quality PDF preview could not be opened.");
    }

    try {
      printWindow.document.open();
      printWindow.document.write(options.html);
      printWindow.document.close();
      printWindow.document.title = safeTitle(options.fileName);
      await waitForDocumentAssets(printWindow);
      printWindow.addEventListener(
        "afterprint",
        function closeAfterPrint() {
          frame.remove();
        },
        { once: true },
      );
      printWindow.focus();
      printWindow.print();
      global.setTimeout(function removePrintedFrame() {
        frame.remove();
      }, 1000);

      return new Blob([], { type: PRINT_DIALOG_TYPE });
    } catch (error) {
      frame.remove();
      throw error;
    }
  }

  global.ScholarResumeLivePdf = Object.freeze({
    createPdf: createPdf,
    shouldHandle: shouldHandle,
  });
})(window);
