import { analyzeHand, faceQuality, imageQuality, overlayScale, cameraError, CHAINS, ObjectTracker, sceneSource, StableValue } from './smartVisionCore.mjs?v=20260826-tracking-age';

const $ = (id) => document.getElementById(id);
const fullscreenButtons = [$('fullscreenButton')];
const video = $('visionVideo'), overlay = $('visionOverlay'), ctx = overlay.getContext('2d');
const frame = document.createElement('canvas'), frameContext = frame.getContext('2d', { willReadFrequently: true });
const faceFrame = document.createElement('canvas'), faceFrameContext = faceFrame.getContext('2d', { willReadFrequently: true });
const qualityFrame = document.createElement('canvas'), qualityContext = qualityFrame.getContext('2d', { willReadFrequently: true });
qualityFrame.width = qualityFrame.height = 64;
const assetRoot = new URL('../vendor/smart-vision/', import.meta.url).href;
// Face samples are deliberately less frequent; keep a continuous face track
// long enough to accumulate the three samples used by the age estimate.
const trackers = { objects: new ObjectTracker('', 1500, true), faces: new ObjectTracker('F', 5000), hands: new ObjectTracker('H', 900) };
const models = { objects: null, faces: null, hands: null };
const enabled = (kind) => $(`${kind}Toggle`).checked;
const selectedKinds = () => ['objects', 'hands', 'faces'].filter(enabled);
const yieldToInterface = () => new Promise((resolve) => setTimeout(resolve, 0));
const modelStates = { objects: 'Not loaded', faces: 'Not loaded', hands: 'Not loaded' };
const countState = new StableValue(180), gestureState = new StableValue(200);
let detections = { objects: [], faces: [], hands: [] };
let stream = null, state = 'idle', epoch = 0, facingMode = 'user', devices = [], deviceId = null;
let selectedId = null, lastFaceAt = 0, lastResultAt = 0, cycles = 0, fpsAt = performance.now();
let loadPromise = null, runtimePromise = null, handSession = -1, shutdown = false, pumpTimer = null;
let overlayTimer = null, lastOverlayAt = 0, objectLatency = 0;
let presentationMode = false;
const fullscreenDocuments = () => {
    const documents = [document];
    try {
        let context = window;
        while (context.parent && context.parent !== context) {
            context = context.parent;
            if (context.document && !documents.includes(context.document)) documents.push(context.document);
        }
    } catch { /* Cross-origin ancestors are not accessible. */ }
    return documents;
};
const fullscreenListeners = new WeakSet();
const scripts = new Map();
const colors = { objects: '#64e9ce', faces: '#edb964', hands: '#aeb3ff' };

function notify(message, error = false) { $('notice').textContent = message; $('notice').classList.toggle('error', error); }
function setModel(kind, status) {
    modelStates[kind] = status;
    const element = $(`${kind}Model`);
    element.textContent = status;
    element.classList.toggle('ready', status === 'Ready');
    refreshStatus();
}
function refreshStatus() {
    const selected = selectedKinds();
    const ready = selected.filter((kind) => models[kind]).length;
    const failed = selected.some((kind) => modelStates[kind].startsWith('Unavailable'));
    const loading = selected.some((kind) => modelStates[kind] === 'Loading…');
    Object.keys(models).forEach((kind) => {
        $(`${kind}Model`).textContent = enabled(kind) ? modelStates[kind] : 'Not enabled';
        $(`${kind}Model`).classList.toggle('ready', enabled(kind) && Boolean(models[kind]));
    });
    const status = $('systemStatus');
    let label = 'CAMERA OFF', tone = 'idle';
    if (state === 'starting') { label = 'CONNECTING'; tone = 'loading'; }
    if (state === 'paused') { label = 'AI PAUSED'; tone = 'paused'; }
    if (state === 'running') { label = !selected.length ? 'PREVIEW ONLY' : loading ? 'LOADING SELECTED AI' : ready ? (failed ? 'AI ACTIVE · PARTIAL' : 'AI ACTIVE') : 'AI UNAVAILABLE'; tone = ready ? 'active' : 'loading'; }
    status.dataset.state = tone;
    $('insightsStatus').textContent = state === 'running' ? (!selected.length ? 'PREVIEW' : loading ? 'LOADING' : ready ? 'ACTIVE' : 'UNAVAILABLE') : state === 'paused' ? 'PAUSED' : 'OFF';
    status.replaceChildren(document.createElement('span'), document.createTextNode(` ${label}`));
    $('trackingBadge').textContent = state === 'paused' ? 'DETECTION PAUSED' : state === 'running' ? (!selected.length ? 'PREVIEW ONLY' : ready ? 'TRACKING ACTIVE' : 'MODELS LOADING') : 'TRACKING STANDBY';
    const active = state === 'running' || state === 'paused';
    $('startButton').disabled = state === 'starting' || active;
    $('gateStart').disabled = state === 'starting';
    $('pauseButton').disabled = !active;
    $('stopButton').disabled = !active && state !== 'starting';
    $('switchButton').disabled = !active || devices.length < 2;
    $('pauseButton').innerHTML = state === 'paused' ? '<i class="fa-solid fa-play" aria-hidden="true"></i> Resume Detection' : '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause Detection';
}
function stage(name, active) {
    document.querySelector(`[data-stage="${name}"]`)?.classList.toggle('active', active);
}
function resetPipeline() { document.querySelectorAll('[data-stage]').forEach((item) => item.classList.remove('active')); }
function loadScript(url) {
    if (scripts.has(url)) return scripts.get(url);
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => { scripts.delete(url); script.remove(); reject(new Error('Library could not load')); };
        document.head.appendChild(script);
    });
    scripts.set(url, promise);
    return promise;
}

async function ensureModels() {
    if (loadPromise) return loadPromise;
    if (state !== 'running' || !selectedKinds().some((kind) => !models[kind])) return;
    loadPromise = (async () => {
        // Hands-only sessions do not need to load the TensorFlow runtime.
        const shared = () => (runtimePromise ||= (async () => {
            await loadScript(`${assetRoot}face-api.js`);
            const tf = window.faceapi.tf;
            // COCO-SSD and face analysis share one TensorFlow runtime/backend.
            window.tf = tf;
            try {
                if (!await tf.setBackend('webgl')) throw new Error('WebGL not supported');
                await tf.ready();
            } catch {
                await tf.setBackend('cpu');
                await tf.ready();
            }
            return window.faceapi;
        })().catch((error) => { runtimePromise = null; throw error; }));
        const jobs = {
            objects: async () => {
                await shared();
                await loadScript(`${assetRoot}coco-ssd.min.js`);
                return window.cocoSsd.load({ base: 'lite_mobilenet_v2', modelUrl: `${assetRoot}objects/model.json` });
            },
            faces: async () => {
                const api = await shared();
                await Promise.all([
                    api.nets.tinyFaceDetector.loadFromUri(`${assetRoot}face`),
                    api.nets.faceLandmark68TinyNet.loadFromUri(`${assetRoot}face`),
                    api.nets.ageGenderNet.loadFromUri(`${assetRoot}face`)
                ]);
                return api;
            },
            hands: async () => {
                await loadScript(new URL('../vendor/mediapipe-hands/hands.js', import.meta.url).href);
                const hands = new window.Hands({ locateFile: (file) => new URL(`../vendor/mediapipe-hands/${file}`, import.meta.url).href });
                hands.setOptions({ maxNumHands: 2, modelComplexity: 1, selfieMode: false, minDetectionConfidence: 0.65, minTrackingConfidence: 0.65 });
                hands.onResults(handleHands);
                try { await hands.initialize(); } catch (error) { await hands.close(); throw error; }
                return hands;
            }
        };
        // Initialize one selected model at a time; stop queuing work when the
        // camera stops. Yield between models so controls can respond.
        const attempted = new Set();
        while (state === 'running' && !shutdown) {
            const kind = selectedKinds().find((name) => !models[name] && !attempted.has(name));
            if (!kind) break;
            attempted.add(kind);
            setModel(kind, 'Loading…');
            notify(`Preparing ${kind === 'faces' ? 'face and age analysis' : kind === 'hands' ? 'hand tracking' : 'object detection'}… Your camera stays on this device.`);
            await yieldToInterface();
            if (state !== 'running' || shutdown || !enabled(kind)) { setModel(kind, 'Not loaded'); continue; }
            try {
                models[kind] = await jobs[kind](); setModel(kind, 'Ready');
                document.querySelector(`[data-stage="${kind}"]`)?.classList.remove('failed');
            }
            catch (error) { console.warn(`Smart Vision ${kind}:`, error); setModel(kind, 'Unavailable · retry'); }
            await yieldToInterface();
        }
        if (state !== 'running' || shutdown) return;
        const failed = selectedKinds().filter((kind) => !models[kind]);
        if (failed.length) notify(`Could not load ${failed.join(', ')}. Other available models can continue. Stop and start the camera to retry.`, true);
        else notify(selectedKinds().length ? `Selected tools ready. ${window.tf?.getBackend() === 'cpu' ? 'CPU processing is slower. ' : ''}Enable fewer tools for smoother performance.` : 'Preview only. Select a tool above the camera to start analysis.');
    })();
    try { await loadPromise; } finally { loadPromise = null; refreshStatus(); }
}

function resetResults() {
    detections = { objects: [], faces: [], hands: [] };
    Object.values(trackers).forEach((tracker) => tracker.reset());
    countState.reset(); gestureState.reset(); selectedId = null; lastFaceAt = 0;
    cycles = 0; fpsAt = performance.now(); lastResultAt = 0;
    objectLatency = 0;
    $('gestureNumber').hidden = true; $('gestureResponse').hidden = true;
    $('fpsBadge').textContent = '0 analysis FPS';
    $('analysisRate').textContent = '0 FPS';
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    renderInsights(); resetPipeline();
}
function releaseStream() {
    if (stream) stream.getTracks().forEach((track) => { track.onended = null; track.stop(); });
    stream = null; video.srcObject = null;
}
function stopCamera(message = 'Your camera is off. Start again whenever you are ready.') {
    cancelAnimationFrame(overlayTimer); overlayTimer = null;
    epoch++; state = 'idle'; releaseStream(); resetResults();
    $('visionGate').hidden = false;
    $('gateTitle').textContent = 'Camera stopped'; $('gateMessage').textContent = message;
    $('resolution').textContent = '—';
    $('feedCaption').textContent = 'Camera off · No recording or upload';
    refreshStatus();
}
async function startCamera(requestedDevice = null) {
    if (state === 'starting') return;
    stopCamera();
    const session = ++epoch;
    state = 'starting'; refreshStatus();
    $('gateTitle').textContent = 'Opening your camera';
    $('gateMessage').textContent = 'Allow camera access in your browser to begin live analysis.';
    if (!navigator.mediaDevices?.getUserMedia) {
        stopCamera('Camera access is unavailable. Use HTTPS or localhost in a browser with camera support.');
        return;
    }
    try {
        const next = await navigator.mediaDevices.getUserMedia({ audio: false, video: {
            ...(requestedDevice ? { deviceId: { exact: requestedDevice } } : { facingMode: { ideal: facingMode } }),
            width: { ideal: 960 }, height: { ideal: 540 }, frameRate: { ideal: 24, max: 24 }
        } });
        if (session !== epoch || shutdown) { next.getTracks().forEach((track) => track.stop()); return; }
        stream = next;
        const track = stream.getVideoTracks()[0], settings = track.getSettings();
        deviceId = settings.deviceId;
        if (settings.facingMode) facingMode = settings.facingMode;
        track.onended = () => stopCamera('The camera disconnected. Reconnect it and try again.');
        video.srcObject = stream;
        await video.play();
        if (session !== epoch || shutdown) return;
        state = 'running';
        $('visionGate').hidden = true;
        $('mirrorToggle').checked = facingMode === 'user';
        $('resolution').textContent = `${video.videoWidth} × ${video.videoHeight}`;
        $('feedCaption').textContent = 'Show an object, face, or hand · Select any detection to inspect it';
        frame.width = Math.min(480, video.videoWidth);
        frame.height = Math.round(frame.width * video.videoHeight / video.videoWidth);
        faceFrame.width = Math.min(960, video.videoWidth);
        faceFrame.height = Math.round(faceFrame.width * video.videoHeight / video.videoWidth);
        overlay.width = Math.min(1280, video.videoWidth); overlay.height = Math.round(overlay.width * video.videoHeight / video.videoWidth);
        fitCamera(); refreshStatus(); stage('camera', true);
        startOverlayRendering();
        void ensureModels();
        try { devices = (await navigator.mediaDevices.enumerateDevices()).filter((item) => item.kind === 'videoinput'); } catch { devices = []; }
        if (session === epoch) refreshStatus();
    } catch (error) {
        if (session !== epoch) return;
        stopCamera(cameraError(error, window.isSecureContext));
        $('gateTitle').textContent = 'Let’s get your camera connected';
        notify(cameraError(error, window.isSecureContext), true);
    }
}
function fitCamera() {
    const stage = $('cameraStage');
    const ratio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16 / 9;
    // Fit inside the content box, excluding the border and any scrollbar.
    const width = Math.max(0, Math.min(stage.clientWidth, stage.clientHeight * ratio));
    $('cameraImage').style.width = `${width}px`;
    $('cameraImage').style.height = `${width / ratio}px`;
    $('cameraImage').classList.toggle('mirrored', $('mirrorToggle').checked);
}
function nativeFullscreenDocument() { return fullscreenDocuments().find((doc) => doc.fullscreenElement || doc.webkitFullscreenElement) || null; }
function isFullscreen() { return Boolean(nativeFullscreenDocument()); }
function fullscreenTarget() {
    let target = document.documentElement;
    try {
        let context = window;
        while (context.frameElement && context.parent && context.parent !== context) {
            target = context.frameElement;
            context = context.parent;
        }
    } catch { /* The nearest same-origin target is still usable. */ }
    return target;
}
function bindFullscreenEvents() {
    fullscreenDocuments().forEach((doc) => {
        if (fullscreenListeners.has(doc)) return;
        fullscreenListeners.add(doc);
        doc.addEventListener('fullscreenchange', syncFullscreen);
        doc.addEventListener('webkitfullscreenchange', syncFullscreen);
    });
}
function syncFullscreen() {
    const native = isFullscreen();
    const active = native || presentationMode;
    const label = active ? 'Restore Smart Vision' : 'Maximize Smart Vision';
    fullscreenButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(active));
        button.title = label;
    });
    $('fullscreenButton').setAttribute('aria-label', label);
    $('fullscreenLabel').textContent = active ? 'Restore' : 'Maximize';
    ['fullscreenIcon'].forEach((id) => {
        $(id).className = active ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    });
    document.documentElement.classList.toggle('is-fullscreen', native);
    document.documentElement.classList.toggle('is-presentation-mode', presentationMode && !native);
    fitCamera();
}
async function exitFullscreen() {
    const activeDocument = nativeFullscreenDocument();
    const exit = activeDocument && (activeDocument.exitFullscreen || activeDocument.webkitExitFullscreen);
    if (exit) await exit.call(activeDocument);
    presentationMode = false;
}
async function toggleFullscreen() {
    if (fullscreenButtons.some((button) => button.disabled)) return;
    fullscreenButtons.forEach((button) => { button.disabled = true; });
    try {
        bindFullscreenEvents();
        if (isFullscreen() || presentationMode) await exitFullscreen();
        else {
            const target = fullscreenTarget();
            const enter = target.requestFullscreen || target.webkitRequestFullscreen;
            if (!enter) {
                presentationMode = true;
                notify('Maximized inside Vision Pen. Browser fullscreen is unavailable on this device.');
                return;
            }
            try { await enter.call(target); }
            catch {
                presentationMode = true;
                notify('Maximized inside Vision Pen. Browser fullscreen was blocked.');
            }
        }
    } catch {
        presentationMode = true;
        notify('Maximized inside Vision Pen. Browser fullscreen could not open.');
    } finally {
        fullscreenButtons.forEach((button) => { button.disabled = false; });
        syncFullscreen();
    }
}
function handleHands(results) {
    if (handSession !== epoch || state !== 'running' || !enabled('hands')) return;
    const hands = (results.multiHandLandmarks || []).map((points, index) => {
        const info = results.multiHandedness?.[index];
        // MediaPipe assumes selfie input. Our inference frame is unmirrored.
        const label = info?.label === 'Left' ? 'Right' : info?.label === 'Right' ? 'Left' : 'Unknown';
        return analyzeHand(points, label, info?.score ?? null);
    }).filter(Boolean);
    detections.hands = trackers.hands.update(hands, performance.now());
}
function live(session) { return session === epoch && state === 'running' && !shutdown; }
function modelFailure(kind, error) {
    console.warn(`Smart Vision ${kind} inference:`, error);
    if (kind === 'objects') models[kind]?.dispose();
    if (kind === 'hands') void models[kind]?.close();
    models[kind] = null; detections[kind] = [];
    setModel(kind, 'Unavailable · retry');
    document.querySelector(`[data-stage="${kind}"]`)?.classList.add('failed');
    notify(`${kind === 'faces' ? 'Face analysis' : kind === 'hands' ? 'Hand tracking' : 'Object detection'} stopped. Stop and start the camera to retry; other models remain available.`, true);
}

async function pump() {
    const session = epoch;
    const cycleStarted = performance.now();
    try {
        if (!live(session) || document.hidden || video.readyState < 2 || !selectedKinds().some((kind) => models[kind]) || loadPromise) return;
        frameContext.drawImage(video, 0, 0, frame.width, frame.height);
        stage('frame', true);
        if (enabled('objects') && models.objects) {
            stage('objects', true);
            try {
                const items = await models.objects.detect(frame, 20, 0.45);
                if (!live(session)) return;
                objectLatency = performance.now() - cycleStarted;
                detections.objects = trackers.objects.update(items.map((item) => ({ label: item.class, score: item.score, bbox: [item.bbox[0] / frame.width, item.bbox[1] / frame.height, item.bbox[2] / frame.width, item.bbox[3] / frame.height] })), cycleStarted, performance.now());
                renderInsights(); drawOverlays();
            } catch (error) { if (live(session)) modelFailure('objects', error); }
            finally { stage('objects', false); }
        }
        await yieldToInterface();
        if (!live(session)) return;
        if (enabled('hands') && models.hands) {
            stage('hands', true); handSession = session;
            try { await models.hands.send({ image: frame }); }
            catch (error) { if (live(session)) modelFailure('hands', error); }
            finally { stage('hands', false); }
        }
        await yieldToInterface();
        if (!live(session)) return;
        if (enabled('faces') && models.faces && performance.now() - lastFaceAt > 1800) {
            stage('faces', true);
            try {
                const api = models.faces;
                faceFrameContext.drawImage(video, 0, 0, faceFrame.width, faceFrame.height);
                const faces = await api.detectAllFaces(faceFrame, new api.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.65 })).withFaceLandmarks(true).withAgeAndGender();
                if (!live(session)) return;
                // Discard gender output. Do not run identity/recognition models.
                if (!faces.length) trackers.faces.reset();
                detections.faces = trackers.faces.update(faces.map(({ detection, age, landmarks }) => {
                    const box = detection.box;
                    qualityContext.drawImage(faceFrame, box.x, box.y, box.width, box.height, 0, 0, 64, 64);
                    const quality = faceQuality(detection, landmarks?.positions, faceFrame.width, faceFrame.height, imageQuality(qualityContext.getImageData(0, 0, 64, 64)));
                    return { label: 'Human face', score: detection.score, age: quality || age < 0 || age > 100 ? NaN : age, ageQuality: quality, bbox: [box.x / faceFrame.width, box.y / faceFrame.height, box.width / faceFrame.width, box.height / faceFrame.height] };
                }), performance.now());
                lastFaceAt = performance.now();
            } catch (error) { if (live(session)) modelFailure('faces', error); }
            finally { stage('faces', false); }
        }
        if (!live(session)) return;
        stage('fingers', enabled('hands') && Boolean(models.hands)); stage('gestures', enabled('hands') && Boolean(models.hands));
        updateGestures(); renderInsights(); drawOverlays(); stage('result', true);
        lastResultAt = performance.now(); cycles++;
        if (lastResultAt - fpsAt >= 1000) {
            $('fpsBadge').textContent = `${Math.round(cycles * 1000 / (lastResultAt - fpsAt))} analysis FPS`;
            $('analysisRate').textContent = `${Math.round(cycles * 1000 / (lastResultAt - fpsAt))} FPS`;
            cycles = 0; fpsAt = lastResultAt;
        }
    } catch (error) { console.warn('Smart Vision processing:', error); notify('A frame could not be processed. Retrying…', true); }
    finally {
        stage('frame', false);
        // Leave breathing room after expensive frames instead of immediately
        // saturating the UI thread again, especially on CPU/mobile devices.
        const delay = state === 'running' ? Math.max(200, Math.min(750, (performance.now() - cycleStarted) / 2)) : 300;
        if (!shutdown) pumpTimer = setTimeout(pump, delay);
    }
}

function overlayItems(now = performance.now()) {
    const objects = enabled('objects') && models.objects ? (state === 'paused' ? detections.objects : trackers.objects.visibleAt(now, Math.min(1600, Math.max(650, objectLatency * 2)))) : [];
    return [...objects.map((item) => ({ ...item, kind: 'objects' })), ...allItems().filter((item) => item.kind !== 'objects')];
}
function startOverlayRendering() {
    if (overlayTimer !== null) return;
    const paint = (now) => {
        overlayTimer = null;
        if (state !== 'running' || document.hidden || shutdown) return;
        if (now - lastOverlayAt >= 32) { drawOverlays(now); lastOverlayAt = now; }
        overlayTimer = requestAnimationFrame(paint);
    };
    overlayTimer = requestAnimationFrame(paint);
}

function animate(element) {
    element.hidden = false; element.classList.remove('animate');
    void element.offsetWidth; element.classList.add('animate');
}
function updateGestures() {
    const hands = detections.hands;
    const total = hands.reduce((sum, hand) => sum + hand.count, 0);
    const now = performance.now();
    $('countNames').textContent = (hands.length === 1 && hands[0].count === 5 ? 'Open Palm' : hands.length === 1 && !total ? 'Closed Fist' : hands.flatMap((hand) => hand.names).join(' + ')).toUpperCase();
    if (countState.update(hands.length ? total : null, now)) {
        if (!hands.length) $('gestureNumber').hidden = true;
        else {
            $('countNumber').textContent = total;
            animate($('gestureNumber'));
        }
    }
    const signature = hands.map((hand) => `${hand.handedness}:${hand.gesture}`).sort().join('|');
    if (gestureState.update(signature, now)) {
        if (!hands.length) $('gestureResponse').hidden = true;
        else {
            $('gestureResponse').textContent = hands.map((hand) => `${hand.emoji} ${hand.gesture === 'Thumbs Up' ? 'Great!' : hand.gesture === 'Closed Fist' ? 'Fist Detected' : hand.gesture}`).join(' · ');
            animate($('gestureResponse'));
        }
    }
}
function allItems() { return Object.entries(detections).flatMap(([kind, items]) => items.map((item) => ({ ...item, kind }))); }
function confidence(score) { return Number.isFinite(score) ? `${(score * 100).toFixed(1)}%` : 'Unavailable'; }
function apparentAge(face) {
    if (face.ageQuality || !Number.isFinite(face.age)) return '—';
    return (face.ageSampleCount || 0) < 3 ? `Measuring ${face.ageSampleCount || 1}/3` : `≈ ${Math.round(face.age)} years`;
}
function renderInsights() {
    const hands = detections.hands;
    $('objectCount').textContent = detections.objects.length;
    $('personCount').textContent = detections.objects.filter((item) => item.label === 'person').length;
    $('faceCount').textContent = detections.faces.length; $('handCount').textContent = hands.length;
    $('fingerTotal').textContent = hands.length ? hands.reduce((sum, hand) => sum + hand.count, 0) : '—';
    $('gestureSummary').textContent = !enabled('hands') ? 'Not enabled' : hands.length ? hands.map((hand) => hand.gesture).join(' / ') : 'Waiting for a hand';
    $('raisedNames').textContent = !enabled('hands') ? 'Select Hands & gestures above the camera to explore.' : hands.length ? hands.map((hand) => `${hand.handedness}: ${hand.names.join(', ') || 'No raised fingers'}`).join(' · ') : 'Raise a finger to see its name.';
    $('ageSummary').textContent = !enabled('faces') ? 'Off' : detections.faces.length ? detections.faces.map(apparentAge).join(' / ') : '—';
    $('ageHint').textContent = !enabled('faces') ? 'Enable Faces & age to begin.' : detections.faces.length ? detections.faces.map((face) => face.ageQuality || (!Number.isFinite(face.age) ? 'No reliable age estimate on this frame.' : face.ageSampleCount < 3 ? 'Hold a clear, front-facing pose for three readings.' : `${face.ageSampleCount} clear readings combined · approximate age.`)).join(' ') : 'Look straight at the camera in good, even lighting.';
    const items = allItems(), list = $('detectionList');
    $('detectionTotal').textContent = items.length;
    list.querySelector('.empty-list')?.remove();
    const valid = new Set(items.map((item) => item.id));
    list.querySelectorAll('.detection-item').forEach((element) => { if (!valid.has(element.dataset.id)) element.remove(); });
    items.forEach((item) => {
        let button = list.querySelector(`[data-id="${item.id}"]`);
        if (!button) {
            button = document.createElement('button'); button.className = 'detection-item'; button.dataset.id = item.id;
            button.append(document.createElement('span'), document.createElement('span'));
            button.addEventListener('click', () => { selectedId = item.id; renderInsights(); drawOverlays(); });
            list.appendChild(button);
        }
        button.firstChild.textContent = `${item.label} #${item.id}`;
        button.lastChild.textContent = item.kind === 'hands' ? `${item.count} fingers` : item.kind === 'faces' ? apparentAge(item) : $('confidenceToggle').checked ? confidence(item.score) : 'Object';
        button.setAttribute('aria-pressed', String(selectedId === item.id));
    });
    if (!items.length) {
        const empty = document.createElement('p'); empty.className = 'empty-list';
        empty.textContent = state === 'running' ? 'No confident detections yet. Object mode recognizes 80 categories: try a bottle, book, phone, cup or person.' : 'Detections will appear here when the camera is active.';
        list.appendChild(empty);
    }
    renderSelection(items.find((item) => item.id === selectedId));
}
function renderSelection(item) {
    const target = $('selectionDetails'); target.replaceChildren();
    $('selectionType').textContent = item ? `#${item.id}` : 'DETAILS';
    if (!item) { target.textContent = selectedId ? 'This detection is no longer visible.' : 'Select a bounding box or an item below to inspect it.'; return; }
    const rows = [['Type', item.label], ['Tracking ID', `#${item.id}`]];
    if ($('confidenceToggle').checked) rows.push([item.kind === 'hands' ? 'Handedness confidence' : 'Detection confidence', confidence(item.score)]);
    if (item.kind === 'faces') rows.push(['Estimated age', apparentAge(item)], ['Quality guidance', item.ageQuality || 'Clear, front-facing sample'], ['Stabilization', `${item.ageSampleCount || 0} accepted frames`], ['Age confidence', 'Not provided by model']);
    if (item.kind === 'hands') rows.push(['Hand', item.handedness], ['Raised fingers', `${item.count} · ${item.names.join(', ') || 'None'}`], ['Gesture', item.gesture], ['Finger state', 'Landmark geometry estimate']);
    rows.push(['Source', sceneSource(item, detections.objects, $('sourceMode').value)]);
    const dl = document.createElement('dl');
    rows.forEach(([label, value]) => { const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; row.append(dt, dd); dl.append(row); });
    target.append(dl);
}
function drawOverlays(now = performance.now()) {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const mirror = $('mirrorToggle').checked, width = overlay.width, height = overlay.height;
    const scale = overlayScale(width, overlay.clientWidth);
    ctx.font = `600 ${12 * scale}px system-ui`;
    const point = (p) => [(mirror ? 1 - p.x : p.x) * width, p.y * height];
    overlayItems(now).forEach((item) => {
        const color = colors[item.kind], box = item.bbox;
        const x = (mirror ? 1 - box[0] - box[2] : box[0]) * width, y = box[1] * height;
        ctx.strokeStyle = color; ctx.lineWidth = (item.id === selectedId ? 3 : 1.5) * scale;
        ctx.setLineDash(item.predicted ? [5 * scale, 4 * scale] : []);
        ctx.strokeRect(x, y, box[2] * width, box[3] * height);
        ctx.setLineDash([]);
        let label = `${item.label.toUpperCase()} #${item.id}`;
        if (item.predicted) label += ' · TRACKING';
        if ($('confidenceToggle').checked) label += ` | ${confidence(item.score)}`;
        if (item.kind === 'faces') label += ` | EST. AGE ${apparentAge(item)}`;
        if (item.kind === 'hands') label += ` | ${item.count} FINGERS | ${item.gesture.toUpperCase()}`;
        const labelWidth = Math.min(ctx.measureText(label).width + 14 * scale, width);
        const lx = Math.max(0, Math.min(x, width - labelWidth)), ly = Math.max(0, Math.min(y - 24 * scale, height - 25 * scale));
        ctx.fillStyle = '#07121fe8'; ctx.fillRect(lx, ly, labelWidth, 24 * scale);
        ctx.fillStyle = color; ctx.fillText(label, lx + 7 * scale, ly + 16 * scale, labelWidth - 10 * scale);
        if (item.kind !== 'hands' || !$('landmarksToggle').checked) return;
        ctx.lineWidth = 2 * scale;
        CHAINS.forEach((chain) => { ctx.beginPath(); chain.forEach((index, i) => { const p = point(item.points[index]); if (i) ctx.lineTo(...p); else ctx.moveTo(...p); }); ctx.stroke(); });
        item.points.forEach((p, index) => {
            const fingertip = [4, 8, 12, 16, 20].indexOf(index);
            ctx.fillStyle = fingertip >= 0 && item.raised[fingertip] ? '#64e9ce' : color;
            ctx.beginPath(); ctx.arc(...point(p), (fingertip >= 0 ? 4.5 : 2.5) * scale, 0, Math.PI * 2); ctx.fill();
            if (fingertip >= 0 && item.raised[fingertip]) {
                const [px, py] = point(p); ctx.fillStyle = '#fff'; ctx.fillText(['THUMB', 'INDEX', 'MIDDLE', 'RING', 'PINKY'][fingertip], Math.max(0, Math.min(px + 6, width - 62 * scale)), Math.max(13 * scale, py - 9));
            }
        });
    });
}

$('startButton').addEventListener('click', () => void startCamera());
$('gateStart').addEventListener('click', () => void startCamera());
$('stopButton').addEventListener('click', () => stopCamera());
$('pauseButton').addEventListener('click', () => {
    epoch++;
    if (state === 'running') {
        state = 'paused'; video.pause(); resetPipeline();
        $('gestureNumber').hidden = true; $('gestureResponse').hidden = true;
        $('fpsBadge').textContent = '0 analysis FPS · paused';
        $('analysisRate').textContent = '0 FPS · paused';
        $('feedCaption').textContent = 'Detection paused · Camera remains on · Stop Camera releases it';
    } else if (state === 'paused') {
        state = 'running'; resetResults();
        startOverlayRendering();
        video.play().catch(() => stopCamera('The camera could not resume. Please start again.'));
        stage('camera', true);
        $('feedCaption').textContent = 'Show an object, face, or hand · Select any detection to inspect it';
        void ensureModels();
    }
    refreshStatus();
});
$('switchButton').addEventListener('click', () => {
    if (devices.length < 2) { notify('Only one camera is available on this device.'); return; }
    const index = devices.findIndex((device) => device.deviceId === deviceId);
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    void startCamera(devices[(index + 1) % devices.length].deviceId);
});
fullscreenButtons.forEach((button) => button.addEventListener('click', toggleFullscreen));
$('backButton').addEventListener('click', async () => {
    stopCamera();
    try { await exitFullscreen(); } catch { /* Navigation also exits fullscreen. */ }
    location.href = '/vision-pen';
});
document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    // Escape exits fullscreen first, without closing the camera studio.
    if (isFullscreen() || presentationMode) { event.preventDefault(); event.stopPropagation(); void toggleFullscreen(); }
});
['objects', 'hands', 'faces'].forEach((kind) => $(`${kind}Toggle`).addEventListener('change', () => {
    epoch++; resetResults(); refreshStatus();
    notify(selectedKinds().length ? 'Only selected tools run. Enable fewer tools for smoother performance.' : 'Preview only. Select a tool above the camera to start analysis.');
    if (state === 'running') { stage('camera', true); void ensureModels(); }
}));
['landmarksToggle', 'confidenceToggle'].forEach((id) => $(id).addEventListener('change', () => { renderInsights(); drawOverlays(); }));
$('mirrorToggle').addEventListener('change', () => { fitCamera(); drawOverlays(); });
$('insightsToggle').addEventListener('change', () => { $('insights').hidden = !$('insightsToggle').checked; $('workspace').classList.toggle('no-insights', !$('insightsToggle').checked); fitCamera(); });
$('sourceMode').addEventListener('change', () => {
    $('sceneBadge').textContent = { auto: 'SOURCE: AUTO · UNVERIFIED', live: 'SOURCE: LIVE SCENE', displayed: 'SOURCE: DISPLAYED IMAGE' }[$('sourceMode').value];
    renderInsights();
});
overlay.addEventListener('click', (event) => {
    const rect = overlay.getBoundingClientRect();
    const x = $('mirrorToggle').checked ? 1 - (event.clientX - rect.left) / rect.width : (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const hits = overlayItems().filter(({ bbox: b }) => x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]).sort((a, b) => a.bbox[2] * a.bbox[3] - b.bbox[2] * b.bbox[3]);
    selectedId = hits[0]?.id || null; renderInsights(); drawOverlays();
});
new ResizeObserver(fitCamera).observe($('cameraStage'));
document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'running' || state === 'starting' || state === 'paused')) stopCamera('Camera stopped while this page was hidden. Start it again when you are ready.');
});
window.addEventListener('pagehide', () => { shutdown = true; clearTimeout(pumpTimer); stopCamera(); });
window.addEventListener('pageshow', (event) => { if (event.persisted) { shutdown = false; pumpTimer = setTimeout(pump, 100); } });
['gestureNumber', 'gestureResponse'].forEach((id) => $(id).addEventListener('animationend', () => { $(id).hidden = true; }));
bindFullscreenEvents(); refreshStatus(); renderInsights(); syncFullscreen();
pumpTimer = setTimeout(pump, 100);
// Navigation is deliberately lightweight. Camera access and AI initialization
// start only after an explicit Start AI Camera click in this tab.
