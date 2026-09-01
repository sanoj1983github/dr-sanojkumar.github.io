/** MediaPipe Hands wrapper with gesture and cursor stabilisation. */
class HandTracker {
    constructor(onResultsCallback, onErrorCallback = null) {
        this.onResultsCallback = onResultsCallback;
        this.onErrorCallback = onErrorCallback;
        this.hands = null;
        this.isInitialized = false;
        this.isSending = false;
        this.palmHoldStartTime = null;
        this.palmClearThresholdMs = 1200;
        this.lastPalmClearTime = 0;
        this.stableGesture = 'NONE';
        this.candidateGesture = 'NONE';
        this.candidateFrames = 0;
        this.smoothedCursor = null;
        this.lastRawCursor = null;
        this.cursorVelocity = 0;
        this.lastCursorTime = 0;
        this.initialize();
    }

    initialize() {
        if (typeof Hands === 'undefined') {
            this.reportError(new Error('MediaPipe failed to load. Check your internet connection and refresh.'));
            return;
        }

        try {
            this.hands = new Hands({
                locateFile: (file) => `./static/vendor/mediapipe-hands/${file}`
            });
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.65,
                minTrackingConfidence: 0.65
            });
            this.hands.onResults((results) => this.handleResults(results));
            this.isInitialized = true;
        } catch (error) {
            this.reportError(error);
        }
    }

    reportError(error) {
        console.error('Hand tracker error:', error);
        if (this.onErrorCallback) this.onErrorCallback(error);
    }

    async sendFrame(videoElement) {
        if (!this.hands || !this.isInitialized || this.isSending || videoElement.readyState < 2) return false;
        this.isSending = true;
        try {
            await this.hands.send({ image: videoElement });
            return true;
        } catch (error) {
            this.reportError(error);
            return false;
        } finally {
            this.isSending = false;
        }
    }

    reset() {
        this.palmHoldStartTime = null;
        this.stableGesture = 'NONE';
        this.candidateGesture = 'NONE';
        this.candidateFrames = 0;
        this.smoothedCursor = null;
        this.lastRawCursor = null;
        this.cursorVelocity = 0;
        this.lastCursorTime = 0;
    }

    handleResults(results) {
        const landmarks = results.multiHandLandmarks?.[0] || null;
        let gesture = 'NONE';
        let cursorPt = null;
        let clearProgress = 0;

        if (landmarks) {
            const classification = this.classifyGesture(landmarks);
            gesture = classification.gesture;
            cursorPt = this.smoothPoint(classification.cursorPt);
            clearProgress = classification.clearProgress;
        } else {
            this.reset();
        }

        this.onResultsCallback?.({ landmarks, gesture, cursorPt, clearProgress, rawResults: results });
    }

    smoothPoint(point) {
        if (!point) {
            this.smoothedCursor = null;
            return null;
        }
        if (!this.smoothedCursor) {
            this.smoothedCursor = { ...point };
            this.lastRawCursor = { ...point };
            this.lastCursorTime = performance.now();
            return { ...this.smoothedCursor };
        }

        const now = performance.now();
        const elapsed = Math.max(8, Math.min(50, now - this.lastCursorTime));
        const rawDistance = Math.hypot(point.x - this.lastRawCursor.x, point.y - this.lastRawCursor.y);
        const frameAdjustedMovement = rawDistance * (16.667 / elapsed);
        this.cursorVelocity = this.cursorVelocity * 0.72 + frameAdjustedMovement * 0.28;

        // Slow fingertip motion receives more stabilisation; fast writing stays
        // responsive. A small dead zone removes camera landmark shimmer.
        const alpha = frameAdjustedMovement < 0.0012
            ? 0.08
            : Math.min(0.64, Math.max(0.18, 0.16 + this.cursorVelocity * 18));
        this.smoothedCursor.x += (point.x - this.smoothedCursor.x) * alpha;
        this.smoothedCursor.y += (point.y - this.smoothedCursor.y) * alpha;
        this.lastRawCursor = { ...point };
        this.lastCursorTime = now;
        return { ...this.smoothedCursor };
    }

    stabiliseGesture(candidate) {
        if (candidate === this.candidateGesture) {
            this.candidateFrames += 1;
        } else {
            this.candidateGesture = candidate;
            this.candidateFrames = 1;
        }

        const requiredFrames = candidate === 'NONE' ? 2 : 3;
        if (this.candidateFrames >= requiredFrames) this.stableGesture = candidate;
        return this.stableGesture;
    }

    classifyGesture(lm) {
        const indexUp = lm[8].y < lm[6].y;
        const middleUp = lm[12].y < lm[10].y;
        const ringUp = lm[16].y < lm[14].y;
        const pinkyUp = lm[20].y < lm[18].y;
        const pinchDistance = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

        let candidate = 'HOVER';
        let cursorPt = { x: lm[8].x, y: lm[8].y };

        if (indexUp && middleUp && ringUp && pinkyUp) {
            candidate = 'OPEN_PALM';
            cursorPt = { x: lm[9].x, y: lm[9].y };
        } else if (pinchDistance < 0.045 || (!indexUp && !middleUp && !ringUp && !pinkyUp)) {
            candidate = 'ERASER';
            cursorPt = pinchDistance < 0.045
                ? { x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 }
                : { x: lm[9].x, y: lm[9].y };
        } else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
            candidate = 'DRAW';
        } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
            candidate = 'HOVER';
            cursorPt = { x: (lm[8].x + lm[12].x) / 2, y: (lm[8].y + lm[12].y) / 2 };
        }

        let gesture = this.stabiliseGesture(candidate);
        let clearProgress = 0;

        if (gesture === 'OPEN_PALM') {
            const now = performance.now();
            if (!this.palmHoldStartTime) this.palmHoldStartTime = now;
            clearProgress = Math.min(1, (now - this.palmHoldStartTime) / this.palmClearThresholdMs);
            if (clearProgress >= 1 && now - this.lastPalmClearTime > 1800) {
                gesture = 'CLEAR_CANVAS';
                this.lastPalmClearTime = now;
                this.palmHoldStartTime = null;
            }
        } else {
            this.palmHoldStartTime = null;
        }

        return { gesture, cursorPt, clearProgress };
    }
}
