document.addEventListener('DOMContentLoaded', () => {
    const byId = (id) => document.getElementById(id);
    const video = byId('webcam');
    const canvas = byId('output_canvas');
    const cameraStatus = byId('cameraStatus');
    const fpsDisplay = byId('fpsDisplay');
    const cameraGate = byId('cameraGate');
    const cameraGateTitle = byId('cameraGateTitle');
    const cameraGateMessage = byId('cameraGateMessage');
    const cameraGateIcon = byId('cameraGateIcon');
    const startCameraBtn = byId('startCameraBtn');
    const cameraToggleBtn = byId('cameraToggleBtn');
    const flipCameraBtn = byId('flipCameraBtn');
    const objectDetectionBtn = byId('objectDetectionBtn');
    const toastRegion = byId('toastRegion');
    const undoBtn = byId('undoBtn');
    const redoBtn = byId('redoBtn');
    const gestureModal = byId('gestureModal');

    let stream = null;
    let cameraGeneration = 0;
    let facingMode = 'user';
    let isRunning = false;
    let processingFrame = false;
    let animationFrameId = null;
    let isDrawingActive = false;
    let activePointerId = null;
    let isSkeletonVisible = true;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let clearTriggered = false;
    let activeBoardMode = 'camera';
    const boardColors = { camera: '#00f3ff', black: '#ffffff', white: '#111827' };
    const apiUrl = (path) => `./api/${path}`;

    const canvasEngine = new CanvasEngine(canvas, ({ canUndo, canRedo }) => {
        undoBtn.disabled = !canUndo;
        redoBtn.disabled = !canRedo;
    });

    const handTracker = new HandTracker(handleHandResults, (error) => {
        showToast(error.message || 'Hand tracking stopped unexpectedly.', 'error');
        updateCameraStatus('error', 'Tracking error');
    });
    document.documentElement.dataset.handTracker = handTracker.isInitialized ? 'ready' : 'error';

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastRegion.appendChild(toast);
        window.setTimeout(() => toast.remove(), 3200);
    }

    function updateCameraStatus(state, text) {
        cameraStatus.querySelector('.status-dot').className = `status-dot ${state}`;
        cameraStatus.querySelector('.status-text').textContent = text;
    }

    function setGate(state, title, message) {
        cameraGate.dataset.state = state;
        cameraGateTitle.textContent = title;
        cameraGateMessage.textContent = message;
        cameraGateIcon.innerHTML = state === 'error'
            ? '<i class="fa-solid fa-triangle-exclamation"></i>'
            : '<i class="fa-solid fa-video"></i><span class="preview-pulse"></span>';
        startCameraBtn.querySelector('span').textContent = state === 'error' ? 'Try again' : 'Start camera';
        cameraGate.classList.remove('hidden');
    }

    function cameraErrorMessage(error) {
        if (!window.isSecureContext) {
            return 'Camera access requires localhost or HTTPS. Open this page on http://localhost:5000.';
        }
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
            return 'Camera permission was blocked. Allow camera access in your browser settings, then try again.';
        }
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            return 'No camera was found on this device.';
        }
        if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            return 'The camera is being used by another app. Close it there and try again.';
        }
        return 'The camera could not be started. Check the permission and try again.';
    }

    function stopCamera({ showGate = true } = {}) {
        cameraGeneration += 1;
        isRunning = false;
        processingFrame = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        if (isDrawingActive) canvasEngine.endStroke();
        isDrawingActive = false;
        handTracker.reset();
        stream?.getTracks().forEach((track) => track.stop());
        stream = null;
        video.srcObject = null;
        startCameraBtn.disabled = false;
        cameraToggleBtn.disabled = true;
        flipCameraBtn.disabled = true;
        fpsDisplay.querySelector('span').textContent = '0 FPS';
        updateCameraStatus('idle', 'Camera off');
        if (showGate && canvasEngine.boardMode === 'camera') {
            setGate('idle', 'Camera paused', 'Your camera is off. Your drawing is still here.');
        } else {
            cameraGate.classList.add('hidden');
            renderBoard();
        }
    }

    async function startCamera() {
        if (!navigator.mediaDevices?.getUserMedia) {
            setGate('error', 'Camera access is unavailable', 'Use a current version of Chrome, Edge, Safari, or Firefox on localhost or HTTPS.');
            updateCameraStatus('error', 'Unavailable');
            return;
        }

        stopCamera({ showGate: false });
        const request = cameraGeneration;
        startCameraBtn.disabled = true;
        updateCameraStatus('warning', 'Connecting…');
        try {
            const constraints = {
                audio: false,
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30, max: 60 }
                }
            };
            const nextStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (request !== cameraGeneration) {
                nextStream.getTracks().forEach((track) => track.stop());
                return;
            }
            stream = nextStream;
            video.srcObject = stream;
            await video.play();
            if (request !== cameraGeneration) return;
            if (!video.videoWidth) {
                await new Promise((resolve) => video.addEventListener('loadedmetadata', resolve, { once: true }));
            }
            canvasEngine.setVideoDimensions(video.videoWidth, video.videoHeight);
            isRunning = true;
            cameraGate.classList.add('hidden');
            updateCameraStatus('active', 'Camera live');
            cameraToggleBtn.disabled = false;
            flipCameraBtn.disabled = false;
            cameraToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            cameraToggleBtn.title = 'Pause camera';
            frameCount = 0;
            lastFpsTime = performance.now();
            animationFrameId = requestAnimationFrame(processingLoop);
        } catch (error) {
            if (request !== cameraGeneration) return;
            console.error('Camera access error:', error);
            updateCameraStatus('error', 'Camera blocked');
            setGate('error', 'We could not open the camera', cameraErrorMessage(error));
        } finally {
            startCameraBtn.disabled = false;
        }
    }

    async function processingLoop() {
        if (!isRunning) return;
        const generation = cameraGeneration;
        if (!processingFrame) {
            processingFrame = true;
            const processed = await handTracker.sendFrame(video);
            if (!isRunning || generation !== cameraGeneration) return;
            if (processed) frameCount += 1;
            processingFrame = false;
        }

        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
            fpsDisplay.querySelector('span').textContent = `${Math.round(frameCount * 1000 / (now - lastFpsTime))} FPS`;
            frameCount = 0;
            lastFpsTime = now;
        }
        animationFrameId = requestAnimationFrame(processingLoop);
    }

    function finishStroke() {
        if (!isDrawingActive) return;
        canvasEngine.endStroke();
        isDrawingActive = false;
    }

    function renderBoard(cursor = null, gesture = 'NONE') {
        canvasEngine.renderFrame(video, null, false, gesture, cursor);
    }

    function updateSelectedColor(color) {
        document.querySelectorAll('.color-swatch').forEach((item) => {
            item.classList.toggle('active', item.dataset.color.toLowerCase() === color.toLowerCase());
        });
        byId('customColorPicker').value = color;
        canvasEngine.setColor(color);
        boardColors[activeBoardMode] = color;
    }

    function setBoardMode(mode) {
        finishStroke();
        if (activePointerId !== null) {
            canvasEngine.endStroke();
            activePointerId = null;
        }
        boardColors[activeBoardMode] = canvasEngine.activeColor;
        activeBoardMode = mode;
        canvasEngine.setBoardMode(mode);
        document.querySelectorAll('.board-btn').forEach((button) => {
            const selected = button.dataset.board === mode;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        updateSelectedColor(boardColors[mode]);

        if (mode === 'camera' && !isRunning) {
            setGate('idle', 'Turn on your camera to start writing', 'VisionPen tracks your hand inside this browser. Live video is not uploaded while you draw.');
        } else {
            cameraGate.classList.add('hidden');
        }
        renderBoard();
        showToast(`${mode === 'camera' ? 'Camera canvas' : mode === 'black' ? 'Black board' : 'White board'} selected`, 'success');
    }

    function pointerCanvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function handleHandResults({ landmarks, gesture, cursorPt, clearProgress }) {
        if (!isRunning) return;
        const cursor = cursorPt ? canvasEngine.transformPoint(cursorPt) : null;
        const tool = canvasEngine.activeTool;

        if (activePointerId !== null) {
            canvasEngine.renderFrame(video, landmarks, isSkeletonVisible, 'NONE', null);
            return;
        }

        if (gesture === 'DRAW' && cursor) {
            if (!isDrawingActive) {
                canvasEngine.startStroke(cursor.x, cursor.y);
                isDrawingActive = true;
            } else {
                canvasEngine.continueStroke(cursor.x, cursor.y);
            }
            updateGestureHUD(tool === 'eraser' ? '🧽' : '☝️', tool === 'eraser' ? 'ERASING' : 'WRITING', 'Index finger active', tool === 'eraser' ? '#ff2f67' : canvasEngine.activeColor);
        } else if (gesture === 'ERASER' && cursor) {
            if (!isDrawingActive) {
                canvasEngine.startStroke(cursor.x, cursor.y, 'eraser');
                isDrawingActive = true;
            } else {
                canvasEngine.continueStroke(cursor.x, cursor.y);
            }
            updateGestureHUD('🤏', 'ERASING', 'Pinch or fist active', '#ff2f67');
        } else if (gesture === 'HOVER' && cursor) {
            finishStroke();
            updateGestureHUD('✌️', 'HOVER', 'Move without drawing', '#b026ff');
        } else if (gesture === 'OPEN_PALM' || gesture === 'CLEAR_CANVAS') {
            finishStroke();
            updateGestureHUD('🖐️', 'HOLD TO CLEAR', `${Math.round(clearProgress * 100)}%`, '#39ff14');
            if (gesture === 'CLEAR_CANVAS' && !clearTriggered) {
                clearTriggered = true;
                canvasEngine.clear();
                showToast('Canvas cleared', 'success');
                navigator.vibrate?.(80);
            }
        } else {
            finishStroke();
            clearTriggered = false;
            updateGestureHUD('🖐️', 'READY', landmarks ? 'Choose a gesture' : 'Show your hand to the camera', '#8e9bb0');
        }

        if (gesture !== 'CLEAR_CANVAS') clearTriggered = false;
        canvasEngine.renderFrame(video, landmarks, isSkeletonVisible, gesture, cursor);
    }

    function updateGestureHUD(icon, label, sub, color) {
        byId('gestureIcon').innerHTML = `<span>${icon}</span>`;
        byId('gestureIcon').style.color = color;
        byId('gestureLabel').textContent = label;
        byId('gestureSub').textContent = sub;
    }

    async function downloadDrawing() {
        const image = canvasEngine.getExportImageBase64();
        const link = document.createElement('a');
        link.download = `VisionPen-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        link.href = image;
        link.click();
        showToast('Drawing downloaded', 'success');
        try {
            const response = await fetch(apiUrl('save-drawing'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image })
            });
            if (!response.ok) throw new Error('Server copy was not saved');
        } catch (error) {
            console.warn(error);
        }
    }

    document.querySelectorAll('.tool-btn').forEach((button) => button.addEventListener('click', () => {
        finishStroke();
        document.querySelectorAll('.tool-btn').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        canvasEngine.setTool(button.dataset.tool);
    }));

    document.querySelectorAll('.color-swatch').forEach((swatch) => swatch.addEventListener('click', () => {
        updateSelectedColor(swatch.dataset.color);
    }));

    byId('customColorPicker').addEventListener('input', (event) => {
        document.querySelectorAll('.color-swatch').forEach((item) => item.classList.remove('active'));
        canvasEngine.setColor(event.target.value);
        boardColors[activeBoardMode] = event.target.value;
    });
    byId('strokeSizeSlider').addEventListener('input', (event) => {
        byId('strokeSizeValue').textContent = `${event.target.value}px`;
        canvasEngine.setSize(event.target.value);
    });
    byId('toggleSkeleton').addEventListener('change', (event) => { isSkeletonVisible = event.target.checked; });
    byId('toggleMirror').addEventListener('change', (event) => canvasEngine.setMirror(event.target.checked));
    document.querySelectorAll('.board-btn').forEach((button) => {
        button.addEventListener('click', () => setBoardMode(button.dataset.board));
    });
    byId('clearCanvasBtn').addEventListener('click', () => { canvasEngine.clear(); renderBoard(); showToast('Canvas cleared', 'success'); });
    undoBtn.addEventListener('click', () => { canvasEngine.undo(); renderBoard(); });
    redoBtn.addEventListener('click', () => { canvasEngine.redo(); renderBoard(); });
    byId('saveDrawingBtn').addEventListener('click', downloadDrawing);
    startCameraBtn.addEventListener('click', startCamera);
    cameraToggleBtn.addEventListener('click', () => stopCamera());
    flipCameraBtn.addEventListener('click', async () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        byId('toggleMirror').checked = facingMode === 'user';
        canvasEngine.setMirror(facingMode === 'user');
        await startCamera();
    });
    // Keep native link navigation (including Ctrl/Cmd-click) and release the
    // drawing camera so the separate Smart Vision tab can use the device.
    objectDetectionBtn.addEventListener('click', () => stopCamera());
    objectDetectionBtn.addEventListener('auxclick', (event) => { if (event.button === 1) stopCamera(); });
    byId('gestureGuideBtn').addEventListener('click', () => gestureModal.classList.add('open'));
    byId('closeModalBtn').addEventListener('click', () => gestureModal.classList.remove('open'));
    byId('gotItBtn').addEventListener('click', () => gestureModal.classList.remove('open'));
    gestureModal.addEventListener('click', (event) => { if (event.target === gestureModal) gestureModal.classList.remove('open'); });
    byId('fullscreenBtn').addEventListener('click', async () => {
        try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            else await document.exitFullscreen();
        } catch (error) {
            showToast('Fullscreen is not available in this browser.', 'error');
        }
    });
    canvas.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || activePointerId !== null) return;
        finishStroke();
        activePointerId = event.pointerId;
        canvas.setPointerCapture?.(event.pointerId);
        const point = pointerCanvasPoint(event);
        canvasEngine.startStroke(point.x, point.y);
        renderBoard(point, 'DRAW');
        updateGestureHUD('✍️', 'BOARD WRITING', 'Mouse, touch, or stylus active', canvasEngine.activeColor);
        event.preventDefault();
    });
    canvas.addEventListener('pointermove', (event) => {
        if (event.pointerId !== activePointerId) return;
        const point = pointerCanvasPoint(event);
        canvasEngine.continueStroke(point.x, point.y);
        renderBoard(point, 'DRAW');
        event.preventDefault();
    });
    const finishPointerStroke = (event) => {
        if (event.pointerId !== activePointerId) return;
        canvasEngine.endStroke();
        activePointerId = null;
        renderBoard();
        updateGestureHUD('🖐️', 'READY', isRunning ? 'Use your finger or write on the board' : 'Write with mouse, touch, or stylus', '#8e9bb0');
    };
    canvas.addEventListener('pointerup', finishPointerStroke);
    canvas.addEventListener('pointercancel', finishPointerStroke);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isDrawingActive) finishStroke();
    });
    window.addEventListener('beforeunload', () => stopCamera({ showGate: false }));

    canvasEngine.renderFrame(null);
    updateCameraStatus('idle', 'Camera off');
});
