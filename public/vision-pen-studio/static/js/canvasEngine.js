/** Persistent canvas renderer with cover-correct camera mapping and history. */
class CanvasEngine {
    constructor(canvasElement, onHistoryChange = null) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.strokes = [];
        this.redoStack = [];
        this.currentStroke = null;
        this.lastPoint = null;
        this.activeTool = 'pen';
        this.activeColor = '#00f3ff';
        this.activeSize = 6;
        this.boardMode = 'camera';
        this.isMirrorMode = true;
        this.videoWidth = 1280;
        this.videoHeight = 720;
        this.onHistoryChange = onHistoryChange;
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.canvas.parentElement);
        this.resize();
    }

    resize() {
        const container = this.canvas.parentElement;
        const width = Math.max(1, Math.round(container.clientWidth));
        const height = Math.max(1, Math.round(container.clientHeight));
        if (this.canvas.width === width && this.canvas.height === height) return;

        const oldWidth = this.drawingCanvas.width;
        const oldHeight = this.drawingCanvas.height;
        const scaleX = oldWidth ? width / oldWidth : 1;
        const scaleY = oldHeight ? height / oldHeight : 1;
        if (oldWidth && oldHeight) {
            for (const stroke of [...this.strokes, ...this.redoStack]) {
                for (const point of stroke.points) {
                    point.x *= scaleX;
                    point.y *= scaleY;
                }
                stroke.size *= Math.min(scaleX, scaleY);
            }
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.drawingCanvas.width = width;
        this.drawingCanvas.height = height;
        this.redrawAll();
    }

    setVideoDimensions(width, height) {
        if (width > 0 && height > 0) {
            this.videoWidth = width;
            this.videoHeight = height;
        }
    }

    getCoverRect() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const scale = Math.max(width / this.videoWidth, height / this.videoHeight);
        const drawWidth = this.videoWidth * scale;
        const drawHeight = this.videoHeight * scale;
        return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight };
    }

    setTool(tool) { this.activeTool = tool; }
    setColor(color) { this.activeColor = color; }
    setSize(size) { this.activeSize = Number.parseInt(size, 10); }
    setBoardMode(mode) {
        if (['camera', 'black', 'white'].includes(mode)) this.boardMode = mode;
    }
    setMirror(isMirror) { this.isMirrorMode = isMirror; }
    canUndo() { return this.strokes.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    notifyHistory() {
        this.onHistoryChange?.({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    }

    startStroke(x, y, toolOverride = null) {
        const point = { x, y };
        this.currentStroke = {
            tool: toolOverride || this.activeTool,
            color: this.activeColor,
            size: this.activeSize,
            boardMode: this.boardMode,
            points: [point]
        };
        this.lastPoint = point;
    }

    continueStroke(x, y) {
        if (!this.currentStroke) {
            this.startStroke(x, y);
            return;
        }
        const target = { x, y };
        const origin = this.lastPoint;
        const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
        if (distance < 0.7) return;

        // Fill larger tracking gaps with evenly spaced samples. This keeps fast
        // hand movements continuous without adding lag to slower handwriting.
        const maxSpacing = Math.max(5, this.currentStroke.size * 0.9);
        const steps = Math.max(1, Math.ceil(distance / maxSpacing));
        for (let step = 1; step <= steps; step += 1) {
            const progress = step / steps;
            this.appendPoint({
                x: origin.x + (target.x - origin.x) * progress,
                y: origin.y + (target.y - origin.y) * progress
            });
        }
        this.lastPoint = target;
    }

    endStroke() {
        if (this.currentStroke?.points.length) {
            this.drawStrokeTail(this.drawingCtx, this.currentStroke);
            this.strokes.push(this.currentStroke);
            this.redoStack = [];
        }
        this.currentStroke = null;
        this.lastPoint = null;
        this.notifyHistory();
    }

    midpoint(first, second) {
        return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    }

    appendPoint(point) {
        const points = this.currentStroke.points;
        points.push(point);
        const count = points.length;
        if (count === 2) {
            this.drawCurve(this.drawingCtx, points[0], points[0], this.midpoint(points[0], points[1]), this.currentStroke);
            return;
        }

        const previous = points[count - 3];
        const control = points[count - 2];
        const current = points[count - 1];
        this.drawCurve(
            this.drawingCtx,
            this.midpoint(previous, control),
            control,
            this.midpoint(control, current),
            this.currentStroke
        );
    }

    applyStrokeStyle(ctx, stroke) {
        const { tool, color, size } = stroke;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = size * 4;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = tool === 'marker' ? size * 1.8 : tool === 'highlighter' ? size * 2.5 : size;
            ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1;
            ctx.shadowColor = color;
            const isBoardStroke = stroke.boardMode === 'black' || stroke.boardMode === 'white';
            ctx.shadowBlur = isBoardStroke ? 0 : tool === 'highlighter' ? 8 : tool === 'marker' ? 5 : 3;
        }
    }

    drawCurve(ctx, start, control, end, stroke) {
        if (!start || !control || !end) return;
        ctx.save();
        this.applyStrokeStyle(ctx, stroke);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
        ctx.stroke();
        ctx.restore();
    }

    drawStrokeTail(ctx, stroke) {
        const points = stroke.points;
        if (points.length === 1) {
            ctx.save();
            this.applyStrokeStyle(ctx, stroke);
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, Math.max(1, ctx.lineWidth / 2), 0, Math.PI * 2);
            ctx.fillStyle = stroke.tool === 'eraser' ? '#000' : stroke.color;
            ctx.fill();
            ctx.restore();
            return;
        }
        const previous = points[points.length - 2];
        const last = points[points.length - 1];
        this.drawCurve(ctx, this.midpoint(previous, last), last, last, stroke);
    }

    drawStroke(ctx, stroke) {
        const points = stroke.points;
        if (!points.length) return;
        if (points.length === 1) {
            this.drawStrokeTail(ctx, stroke);
            return;
        }

        ctx.save();
        this.applyStrokeStyle(ctx, stroke);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        const firstMidpoint = this.midpoint(points[0], points[1]);
        ctx.quadraticCurveTo(points[0].x, points[0].y, firstMidpoint.x, firstMidpoint.y);
        for (let index = 1; index < points.length - 1; index += 1) {
            const end = this.midpoint(points[index], points[index + 1]);
            ctx.quadraticCurveTo(points[index].x, points[index].y, end.x, end.y);
        }
        const last = points[points.length - 1];
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        ctx.stroke();
        ctx.restore();
    }

    clear() {
        this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.strokes = [];
        this.redoStack = [];
        this.currentStroke = null;
        this.lastPoint = null;
        this.notifyHistory();
    }

    undo() {
        if (!this.canUndo()) return;
        this.redoStack.push(this.strokes.pop());
        this.redrawAll();
        this.notifyHistory();
    }

    redo() {
        if (!this.canRedo()) return;
        this.strokes.push(this.redoStack.pop());
        this.redrawAll();
        this.notifyHistory();
    }

    redrawAll() {
        this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        for (const stroke of this.strokes) {
            this.drawStroke(this.drawingCtx, stroke);
        }
    }

    getBoardColor() {
        if (this.boardMode === 'white') return '#f8fafc';
        if (this.boardMode === 'black') return '#101713';
        return '#05070d';
    }

    drawBoardSurface(ctx, width, height) {
        ctx.fillStyle = this.getBoardColor();
        ctx.fillRect(0, 0, width, height);
        if (this.boardMode === 'camera') return;

        ctx.save();
        ctx.strokeStyle = this.boardMode === 'white' ? 'rgba(15, 23, 42, 0.035)' : 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        for (let y = 40; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(width, y + 0.5);
            ctx.stroke();
        }
        ctx.restore();
    }

    renderFrame(videoElement, handLandmarks = null, showSkeleton = true, activeGesture = 'NONE', cursorPt = null) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.drawBoardSurface(this.ctx, width, height);

        if (this.boardMode === 'camera' && videoElement?.readyState >= 2) {
            this.setVideoDimensions(videoElement.videoWidth, videoElement.videoHeight);
            const rect = this.getCoverRect();
            this.ctx.save();
            if (this.isMirrorMode) {
                this.ctx.translate(width, 0);
                this.ctx.scale(-1, 1);
            }
            this.ctx.drawImage(videoElement, rect.x, rect.y, rect.width, rect.height);
            this.ctx.restore();
        }

        this.ctx.drawImage(this.drawingCanvas, 0, 0);
        if (handLandmarks && showSkeleton) this.drawHandSkeleton(handLandmarks);
        if (cursorPt) this.drawPenCursor(cursorPt.x, cursorPt.y, activeGesture);
    }

    drawHandSkeleton(landmarks) {
        const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
        this.ctx.save();
        this.ctx.strokeStyle = this.boardMode === 'white' ? 'rgba(37, 99, 235, 0.5)' : 'rgba(0, 243, 255, 0.5)';
        this.ctx.lineWidth = 2;
        for (const [from, to] of connections) {
            const first = this.transformPoint(landmarks[from]);
            const second = this.transformPoint(landmarks[to]);
            this.ctx.beginPath();
            this.ctx.moveTo(first.x, first.y);
            this.ctx.lineTo(second.x, second.y);
            this.ctx.stroke();
        }
        landmarks.forEach((landmark, index) => {
            const point = this.transformPoint(landmark);
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, index === 8 ? 6 : 3, 0, Math.PI * 2);
            this.ctx.fillStyle = index === 8 ? '#39ff14' : this.boardMode === 'white' ? '#2563eb' : '#00f3ff';
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.shadowBlur = index === 8 ? 10 : 0;
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    transformPoint(landmark) {
        const rect = this.getCoverRect();
        const rawX = rect.x + landmark.x * rect.width;
        return {
            x: this.isMirrorMode ? this.canvas.width - rawX : rawX,
            y: rect.y + landmark.y * rect.height
        };
    }

    drawPenCursor(x, y, gesture) {
        this.ctx.save();
        this.ctx.beginPath();
        if (gesture === 'DRAW') {
            const isEraser = this.activeTool === 'eraser';
            this.ctx.arc(x, y, isEraser ? this.activeSize * 2 : this.activeSize / 2 + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = isEraser ? '#ff2f67' : this.activeColor;
            this.ctx.lineWidth = 2.5;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.shadowBlur = 12;
            this.ctx.stroke();
        } else if (gesture === 'HOVER') {
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.boardMode === 'white' ? 'rgba(15,23,42,.8)' : 'rgba(255,255,255,.8)';
            this.ctx.lineWidth = 1.5;
            this.ctx.setLineDash([4, 4]);
            this.ctx.stroke();
        } else if (gesture === 'ERASER') {
            this.ctx.arc(x, y, this.activeSize * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,47,103,.16)';
            this.ctx.strokeStyle = '#ff2f67';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    getExportImageBase64() {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.drawingCanvas.width;
        exportCanvas.height = this.drawingCanvas.height;
        const context = exportCanvas.getContext('2d');
        context.fillStyle = this.getBoardColor();
        context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        context.drawImage(this.drawingCanvas, 0, 0);
        return exportCanvas.toDataURL('image/png');
    }
}
