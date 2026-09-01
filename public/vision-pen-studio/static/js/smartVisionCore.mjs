/** Geometry uses unmirrored, normalized camera coordinates throughout. */
export const FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
export const CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
function angle(a, b, c) {
    const ab = [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)];
    const cb = [c.x - b.x, c.y - b.y, (c.z || 0) - (b.z || 0)];
    const denominator = Math.hypot(...ab) * Math.hypot(...cb);
    return denominator ? Math.acos(Math.max(-1, Math.min(1, ab.reduce((n, v, i) => n + v * cb[i], 0) / denominator))) * 180 / Math.PI : 0;
}

export function analyzeHand(points, handedness = 'Unknown', score = null) {
    if (points?.length !== 21) return null;
    const palm = Math.max(distance(points[0], points[9]), 0.001);
    const raised = [
        angle(points[1], points[2], points[3]) > 145 && angle(points[2], points[3], points[4]) > 150 && distance(points[4], points[5]) > palm * 0.65,
        ...[5, 9, 13, 17].map((base) => angle(points[base], points[base + 1], points[base + 3]) > 155 && distance(points[base + 3], points[0]) > distance(points[base + 1], points[0]) * 1.12)
    ];
    const pinch = distance(points[4], points[8]) < palm * 0.32;
    // A touching thumb/index pair is bent, not two additional raised fingers.
    if (pinch) { raised[0] = false; raised[1] = false; }
    const names = FINGERS.filter((_, index) => raised[index]);
    const count = names.length;
    let gesture = count === 0 ? 'Closed Fist' : count === 5 ? 'Open Palm' : names.join(' + ');
    let emoji = count === 0 ? '✊' : count === 5 ? '✋' : '☝';
    if (pinch && raised.slice(2).every(Boolean)) { gesture = 'OK'; emoji = '👌'; }
    else if (count === 1 && raised[0]) {
        const dy = points[4].y - points[2].y;
        gesture = Math.abs(dy) > palm * 0.25 ? (dy < 0 ? 'Thumbs Up' : 'Thumbs Down') : 'Thumb';
        emoji = gesture === 'Thumbs Down' ? '👎' : '👍';
    } else if (count === 2 && raised[1] && raised[2]) { gesture = 'Victory'; emoji = '✌'; }
    else if (count === 3 && raised[0] && raised[1] && raised[4]) { gesture = 'I Love You'; emoji = '🤟'; }
    else if (count === 1 && raised[1]) gesture = 'Pointing';
    const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
    const left = Math.max(0, Math.min(...xs) - 0.025), top = Math.max(0, Math.min(...ys) - 0.025);
    return { label: `${handedness} hand`, handedness, score, points, raised, names, count, gesture, emoji,
        bbox: [left, top, Math.min(1, Math.max(...xs) + 0.025) - left, Math.min(1, Math.max(...ys) + 0.025) - top] };
}

export function ageRange(age) {
    if (!Number.isFinite(age) || age < 0) return 'Unavailable';
    for (const [min, max] of [[0, 5], [6, 12], [13, 17], [18, 24], [25, 34], [35, 44], [45, 54], [55, 64]]) {
        if (Math.round(age) <= max) return `${min}–${max}`;
    }
    return '65+';
}

/** Quality checks are guidance, not an age-accuracy confidence score. */
export function faceQuality({ score, box }, points, width, height, texture) {
    if (!Number.isFinite(score) || score < .75) return 'Hold still for a clearer face detection.';
    if (Math.min(box.width, box.height) < 96) return 'Move closer so your face fills more of the camera.';
    if (box.x < 1 || box.y < 1 || box.x + box.width > width - 1 || box.y + box.height > height - 1) return 'Keep your whole face inside the camera frame.';
    if (!points || points.length < 68) return 'Face the camera so both eyes are visible.';
    const center = (start) => points.slice(start, start + 6).reduce((sum, point) => ({ x: sum.x + point.x / 6, y: sum.y + point.y / 6 }), { x: 0, y: 0 });
    const left = center(36), right = center(42), separation = Math.hypot(right.x - left.x, right.y - left.y);
    if (!Number.isFinite(separation) || !Number.isFinite(points[30]?.x) || separation < 16 || Math.abs(right.y - left.y) / separation > .35 || Math.abs(points[30].x - (left.x + right.x) / 2) / separation > .3) return 'Look straight at the camera with your head level.';
    if (texture?.brightness < 30) return 'Use brighter, even lighting on your face.';
    if (texture?.brightness > 240) return 'Reduce glare or strong light on your face.';
    if (texture?.sharpness < 8) return 'Hold still and let the camera focus.';
    return '';
}

export function imageQuality({ data, width, height }) {
    const gray = new Float32Array(width * height);
    let brightness = 0, edges = 0, count = 0;
    for (let i = 0; i < gray.length; i++) {
        gray[i] = data[i * 4] * .299 + data[i * 4 + 1] * .587 + data[i * 4 + 2] * .114;
        brightness += gray[i];
    }
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        const laplacian = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
        edges += laplacian * laplacian; count++;
    }
    return { brightness: brightness / (gray.length || 1), sharpness: edges / (count || 1) };
}

export function overlayScale(bufferWidth, displayWidth) {
    return bufferWidth / Math.max(1, displayWidth || bufferWidth);
}

function boundedBox(box) {
    const width = Math.min(1, Math.max(.001, box[2])), height = Math.min(1, Math.max(.001, box[3]));
    return [Math.max(0, Math.min(1 - width, box[0])), Math.max(0, Math.min(1 - height, box[1])), width, height];
}

export function intersectionOverUnion(a, b) {
    const width = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
    const height = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
    const intersection = width * height;
    return intersection / (a[2] * a[3] + b[2] * b[3] - intersection || 1);
}

export class ObjectTracker {
    constructor(prefix = '', ttl = 1500, motion = false) { this.prefix = prefix; this.ttl = ttl; this.motion = motion; this.reset(); }
    reset() { this.tracks = []; this.nextId = 1; }
    project(track, now) {
        const elapsed = this.motion ? Math.max(0, Math.min(250, now - track.lastSeen)) : 0;
        return boundedBox(track.bbox.map((value, index) => value + (track.velocity?.[index] || 0) * elapsed));
    }
    visibleAt(now, maxAge = 650) {
        return this.tracks.filter((track) => now - (track.receivedAt ?? track.lastSeen) <= maxAge).map((track) => ({ ...track, bbox: this.project(track, now), predicted: now - track.lastSeen > 250 }));
    }
    update(detections, now, receivedAt = now) {
        this.tracks = this.tracks.filter((item) => now - (item.receivedAt ?? item.lastSeen) <= this.ttl);
        detections = detections.filter((item) => item.bbox?.length === 4 && item.bbox.every(Number.isFinite) && item.bbox[2] > 0 && item.bbox[3] > 0).map((item) => ({ ...item, bbox: boundedBox(item.bbox) }));
        const candidates = [];
        detections.forEach((detection, di) => this.tracks.forEach((track, ti) => {
            if (detection.label !== track.label) return;
            const a = this.project(track, now), b = detection.bbox;
            const overlap = intersectionOverUnion(a, b);
            const shift = Math.hypot(a[0] + a[2] / 2 - b[0] - b[2] / 2, a[1] + a[3] / 2 - b[1] - b[3] / 2);
            const scale = Math.max(a[2], a[3], b[2], b[3], 0.05);
            if (overlap > 0.12 || shift < scale * 0.55) candidates.push({ di, ti, cost: 1 - overlap + shift / scale });
        }));
        const assigned = new Map(), used = new Set();
        candidates.sort((a, b) => a.cost - b.cost).forEach(({ di, ti }) => {
            if (!assigned.has(di) && !used.has(ti)) { assigned.set(di, ti); used.add(ti); }
        });
        return detections.map((detection, index) => {
            const previous = assigned.has(index) ? this.tracks[assigned.get(index)] : null;
            const result = { ...detection, id: previous?.id || `${this.prefix}${String(this.nextId++).padStart(2, '0')}`, lastSeen: now, receivedAt };
            if (this.motion && previous) {
                const elapsed = Math.max(16, now - previous.lastSeen);
                result.velocity = detection.bbox.map((value, index) => .65 * Math.max(-.003, Math.min(.003, (value - (previous.rawBox || previous.bbox)[index]) / elapsed)) + .35 * (previous.velocity?.[index] || 0));
                result.rawBox = detection.bbox;
                const predicted = this.project(previous, now);
                result.bbox = boundedBox(detection.bbox.map((value, index) => .85 * value + .15 * predicted[index]));
            }
            if (Number.isFinite(detection.age)) {
                const samples = [...(previous?.ageSamples || []), detection.age].slice(-9);
                const sorted = [...samples].sort((a, b) => a - b);
                const middle = Math.floor(sorted.length / 2);
                result.ageSamples = samples;
                result.ageSampleCount = samples.length;
                // A rolling median rejects occasional extreme frame estimates.
                result.age = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
            } else if (previous?.ageSamples) {
                result.ageSamples = previous.ageSamples;
                result.ageSampleCount = previous.ageSampleCount;
            }
            if (previous) Object.assign(previous, result);
            else this.tracks.push(result);
            return result;
        });
    }
}

/** Only infer displayed content when its box is substantially inside a screen. */
export function sceneSource(item, objects, mode = 'auto') {
    if (mode === 'displayed') return 'Displayed/Printed Image Detection · user selected';
    if (mode === 'live') return 'Live Scene Detection · user selected';
    const area = item.bbox[2] * item.bbox[3];
    const contained = objects.some((screen) => {
        if (screen === item || !['tv', 'laptop', 'cell phone'].includes(screen.label)) return false;
        const a = item.bbox, b = screen.bbox;
        const intersection = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
        return area > 0 && intersection / area > 0.85 && area < b[2] * b[3] * 0.75;
    });
    return contained ? 'Displayed Image Detection · possible screen content' : 'Live Scene Detection · source unverified';
}

/** Debounce gesture changes; a held gesture emits only once. */
export class StableValue {
    constructor(holdMs = 180) { this.holdMs = holdMs; this.reset(); }
    reset() { this.value = undefined; this.candidate = undefined; this.since = 0; }
    update(value, now) {
        if (value !== this.candidate) { this.candidate = value; this.since = now; }
        if (value !== this.value && now - this.since >= this.holdMs) { this.value = value; return true; }
        return false;
    }
}

export function cameraError(error, secure = true) {
    if (!secure) return 'Camera access requires HTTPS or localhost.';
    if (['NotAllowedError', 'SecurityError'].includes(error.name)) return 'Camera permission was blocked. Allow camera access in your browser, then select Start AI Camera.';
    if (['NotFoundError', 'DevicesNotFoundError'].includes(error.name)) return 'No camera was found. Connect a camera and try again.';
    if (['NotReadableError', 'TrackStartError'].includes(error.name)) return 'Your camera is busy. Close other camera apps and try again.';
    if (error.name === 'OverconstrainedError') return 'That camera is unavailable. Choose another camera or try again.';
    return 'The camera could not start. Check your device and browser permissions, then try again.';
}
