"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";
import {
  Aperture,
  ArrowRight,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Layers3,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { menuItems } from "./menu-structure";
import "./filterverse-shell.css";

const MAX_PREVIEW_EDGE = 1400;

type ResultDetails = {
  width: number;
  height: number;
  sampledWidth: number;
  sampledHeight: number;
};

export function FilterVerseShell() {
  const activeItem = menuItems[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageUrlRef = useRef<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [samplingPercent, setSamplingPercent] = useState(50);
  const [quantizationLevels, setQuantizationLevels] = useState(16);
  const [resultDetails, setResultDetails] = useState<ResultDetails | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    let cancelled = false;
    const image = new window.Image();

    image.onload = () => {
      if (cancelled || !canvasRef.current) return;

      const previewScale = Math.min(1, MAX_PREVIEW_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * previewScale));
      const height = Math.max(1, Math.round(image.naturalHeight * previewScale));
      const sampledWidth = Math.max(1, Math.round(width * samplingPercent / 100));
      const sampledHeight = Math.max(1, Math.round(height * samplingPercent / 100));
      const sampledCanvas = document.createElement("canvas");
      const sampledContext = sampledCanvas.getContext("2d", { willReadFrequently: true });
      const resultCanvas = canvasRef.current;
      const resultContext = resultCanvas.getContext("2d");

      if (!sampledContext || !resultContext) {
        setError("This browser could not prepare the image canvas. Please try another image.");
        return;
      }

      sampledCanvas.width = sampledWidth;
      sampledCanvas.height = sampledHeight;
      sampledContext.imageSmoothingEnabled = true;
      sampledContext.imageSmoothingQuality = "high";
      sampledContext.drawImage(image, 0, 0, sampledWidth, sampledHeight);

      const imageData = sampledContext.getImageData(0, 0, sampledWidth, sampledHeight);
      const step = 255 / (quantizationLevels - 1);

      for (let index = 0; index < imageData.data.length; index += 4) {
        imageData.data[index] = Math.round(imageData.data[index] / step) * step;
        imageData.data[index + 1] = Math.round(imageData.data[index + 1] / step) * step;
        imageData.data[index + 2] = Math.round(imageData.data[index + 2] / step) * step;
      }

      sampledContext.putImageData(imageData, 0, 0);
      resultCanvas.width = width;
      resultCanvas.height = height;
      resultContext.clearRect(0, 0, width, height);
      resultContext.imageSmoothingEnabled = false;
      resultContext.drawImage(sampledCanvas, 0, 0, sampledWidth, sampledHeight, 0, 0, width, height);

      setResultDetails({ width, height, sampledWidth, sampledHeight });
      setError("");
    };

    image.onerror = () => {
      if (!cancelled) setError("The selected image could not be read. Please choose a PNG, JPG or WebP file.");
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl, quantizationLevels, samplingPercent]);

  const acceptImageFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file in PNG, JPG or WebP format.");
      return;
    }

    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    imageUrlRef.current = nextUrl;
    setImageUrl(nextUrl);
    setFileName(file.name);
    setResultDetails(null);
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptImageFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptImageFile(event.dataTransfer.files?.[0]);
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas || !resultDetails) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      link.download = `${fileName.replace(/\.[^.]+$/, "") || "image"}-sampled-quantized.png`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    }, "image/png");
  };

  const sampledPixels = resultDetails ? resultDetails.sampledWidth * resultDetails.sampledHeight : 0;
  const possibleColors = quantizationLevels ** 3;

  return (
    <section className="filter-verse-shell" aria-label="Computer Vision workspace">
      <header className="filter-verse-header">
        <Link className="filter-verse-brand" href="/filterverse" aria-label="Computer Vision home">
          <span className="filter-verse-mark" aria-hidden="true"><Aperture size={25} /></span>
          <span>
            <strong>Computer&nbsp;Vision</strong>
            <small>Image Processing Workspace</small>
          </span>
        </Link>
      </header>

      <div className="filter-verse-layout">
        <nav className="filter-verse-nav" aria-label="Computer Vision sections">
          <div className="filter-verse-nav-group">
            <p>Menu</p>
            <div className="filter-verse-nav-list">
              <button type="button" className="active" aria-current="page">
                <span className="filter-verse-menu-number">01</span>
                <span>
                  <strong>{activeItem[1]}</strong>
                  <small>{activeItem[2]}</small>
                </span>
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        <main className="filter-verse-stage">
          <section className="fv-topic-intro" aria-labelledby="sampling-title">
            <span className="filter-verse-kicker">Filter Verse / Menu 01</span>
            <h1 id="sampling-title">Sampling and Quantization</h1>
            <p className="fv-topic-lead">
              Sampling decides <strong>how many spatial points</strong> represent an image, while quantization decides
              <strong> how many intensity or colour values</strong> each sampled point may use.
            </p>

            <div className="fv-definition-grid">
              <article>
                <span className="fv-concept-icon" aria-hidden="true"><ImageIcon size={20} /></span>
                <div>
                  <h2>Sampling</h2>
                  <p>Converts the continuous image plane into a discrete pixel grid. Fewer samples reduce spatial detail and make pixels more visible.</p>
                </div>
              </article>
              <article>
                <span className="fv-concept-icon coral" aria-hidden="true"><Layers3 size={20} /></span>
                <div>
                  <h2>Quantization</h2>
                  <p>Maps every sampled colour channel to one of a fixed number of levels. Fewer levels reduce colour precision and create visible bands.</p>
                </div>
              </article>
            </div>

            <div className="fv-logic-card">
              <div className="fv-logic-heading">
                <span><SlidersHorizontal size={18} aria-hidden="true" /></span>
                <div>
                  <p>Processing logic</p>
                  <h2>From the uploaded image to the result</h2>
                </div>
              </div>
              <ol>
                <li><span>1</span> Read the original pixel grid.</li>
                <li><span>2</span> Resize it to the selected sampling percentage.</li>
                <li><span>3</span> Map each RGB value to the nearest permitted level.</li>
                <li><span>4</span> Enlarge the sampled grid so the visual change is easy to compare.</li>
              </ol>
              <code>Q(v) = round(v × (L − 1) / 255) × 255 / (L − 1)</code>
            </div>
          </section>

          <section className="fv-image-lab" aria-labelledby="image-lab-title">
            <div className="fv-lab-heading">
              <div>
                <span className="filter-verse-kicker">Interactive image lab</span>
                <h2 id="image-lab-title">Upload an image and see the result</h2>
                <p>Your image is processed locally in this browser. It is not uploaded or stored.</p>
              </div>
              <button type="button" className="fv-download-button" onClick={downloadResult} disabled={!resultDetails}>
                <Download size={17} aria-hidden="true" /> Download result
              </button>
            </div>

            <input
              ref={fileInputRef}
              id="fv-image-upload"
              className="fv-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />

            {!imageUrl ? (
              <div
                className={`fv-upload-zone${isDragging ? " is-dragging" : ""}`}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <span className="fv-upload-icon" aria-hidden="true"><Upload size={25} /></span>
                <h3>Choose an image to begin</h3>
                <p>Drag and drop a PNG, JPG or WebP image here, or browse your device.</p>
                <label htmlFor="fv-image-upload">Upload image <ArrowRight size={16} aria-hidden="true" /></label>
              </div>
            ) : (
              <>
                <div className="fv-control-bar">
                  <div className="fv-file-summary">
                    <span aria-hidden="true"><ImageIcon size={18} /></span>
                    <div><strong>{fileName}</strong><small>Ready for processing</small></div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}>Change image</button>
                  </div>

                  <label className="fv-range-control">
                    <span><strong>Sampling</strong><output>{samplingPercent}%</output></span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={samplingPercent}
                      onChange={(event) => setSamplingPercent(Number(event.target.value))}
                    />
                    <small>Lower values keep fewer spatial samples.</small>
                  </label>

                  <label className="fv-select-control">
                    <span>Quantization levels</span>
                    <select value={quantizationLevels} onChange={(event) => setQuantizationLevels(Number(event.target.value))}>
                      {[256, 64, 32, 16, 8, 4, 2].map((level) => <option key={level} value={level}>{level} levels / channel</option>)}
                    </select>
                  </label>
                </div>

                <div className="fv-result-grid">
                  <figure>
                    <figcaption><span>Original</span><small>Uploaded image</small></figcaption>
                    <div className="fv-image-viewport">
                      {/* A blob URL is required here because the visitor selects this image at runtime. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Original uploaded preview" />
                    </div>
                  </figure>
                  <figure className="fv-result-figure">
                    <figcaption><span>Result</span><small>{samplingPercent}% sampling · {quantizationLevels} levels</small></figcaption>
                    <div className="fv-image-viewport">
                      <canvas ref={canvasRef} role="img" aria-label="Sampling and quantization result" />
                    </div>
                  </figure>
                </div>

                {resultDetails && (
                  <div className="fv-result-metrics" aria-live="polite">
                    <span><small>Working grid</small><strong>{resultDetails.sampledWidth} × {resultDetails.sampledHeight}</strong></span>
                    <span><small>Spatial samples</small><strong>{sampledPixels.toLocaleString()}</strong></span>
                    <span><small>Possible RGB colours</small><strong>{possibleColors.toLocaleString()}</strong></span>
                  </div>
                )}
              </>
            )}

            {error && <p className="fv-upload-error" role="alert">{error}</p>}
          </section>
        </main>
      </div>
    </section>
  );
}
