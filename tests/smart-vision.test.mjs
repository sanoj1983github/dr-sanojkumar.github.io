import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import * as core from '../public/vision-pen-studio/static/js/smartVisionCore.mjs';
const { analyzeHand, ageRange, faceQuality, imageQuality, overlayScale, ObjectTracker, sceneSource, StableValue, cameraError } = core;

function facePoints() {
    const points=Array.from({length:68},()=>({x:70,y:70}));
    for(let i=36;i<42;i++)points[i]={x:45,y:55};
    for(let i=42;i<48;i++)points[i]={x:95,y:55};
    points[30]={x:70,y:80};
    return points;
}
function clearImage() {
    const data=new Uint8ClampedArray(64*64*4);
    for(let i=0;i<4096;i++){const value=100+(i%2)*60;data.set([value,value,value,255],i*4);}
    return {data,width:64,height:64};
}

function handFixture(raised = []) {
    const points = Array.from({ length: 21 }, () => ({ x: .5, y: .6, z: 0 }));
    points[0] = { x: .5, y: .85, z: 0 };
    [[.43,.75],[.36,.67],[.43,.63],[.47,.62]].forEach(([x,y], i) => { points[i + 1] = { x,y,z:0 }; });
    if (raised.includes(0)) [[.43,.75],[.32,.68],[.22,.61],[.12,.54]].forEach(([x,y], i) => { points[i + 1] = { x,y,z:0 }; });
    [5,9,13,17].forEach((base, finger) => {
        const x = .4 + finger * .1;
        (raised.includes(finger + 1) ? [.55,.4,.28,.16] : [.55,.45,.58,.65]).forEach((y, joint) => { points[base + joint] = {x,y,z:0}; });
    });
    return points;
}

test('recognizes all individual raised fingers, fist, palm and victory', () => {
    for (let finger = 0; finger < 5; finger++) {
        const result = analyzeHand(handFixture([finger]), 'Right', .98);
        assert.equal(result.count, 1);
        assert.deepEqual(result.names, [core.FINGERS[finger]]);
    }
    assert.equal(analyzeHand(handFixture()).gesture, 'Closed Fist');
    assert.equal(analyzeHand(handFixture([0,1,2,3,4])).gesture, 'Open Palm');
    assert.equal(analyzeHand(handFixture([1,2])).gesture, 'Victory');
    assert.equal(analyzeHand(handFixture([0,1,4])).gesture, 'I Love You');
    assert.equal(analyzeHand(handFixture([0])).gesture, 'Thumbs Up');
    assert.equal(analyzeHand(handFixture([0]).map((p) => ({ ...p, y: 1 - p.y }))).gesture, 'Thumbs Down');
    assert.equal(analyzeHand([]), null);
});
test('counts rotated fingers and handles the OK pinch without counting touching tips', () => {
    const rotated = handFixture([1,2,3]).map((p) => ({ x:p.y,y:1-p.x,z:p.z }));
    assert.deepEqual(analyzeHand(rotated).names, ['Index','Middle','Ring']);
    const points = handFixture([2,3,4]); points[4] = { ...points[8] };
    assert.equal(analyzeHand(points).gesture, 'OK');
    assert.equal(analyzeHand(points).count, 3);
});
test('tracks movement, reordered objects and brief gaps without reusing IDs', () => {
    const tracker = new ObjectTracker();
    const detection = (x, label = 'bottle') => ({ label, bbox: [x,.2,.15,.4], score:.9 });
    const initial = tracker.update([detection(.1),detection(.65)], 0);
    const moved = tracker.update([detection(.62),detection(.13)], 100);
    assert.equal(moved[0].id, initial[1].id); assert.equal(moved[1].id, initial[0].id);
    tracker.update([], 400);
    assert.equal(tracker.update([detection(.16)], 800)[0].id, initial[0].id);
    assert.notEqual(tracker.update([detection(.16, 'person')], 900)[0].id, initial[0].id);
    assert.notEqual(tracker.update([detection(.16)], 2500)[0].id, initial[0].id);
    tracker.reset(); assert.equal(tracker.update([detection(.1)], 2600)[0].id, '01');
});
test('smooths age estimates and handles all range boundaries without fabricated confidence', () => {
    for (const [age, expected] of [[0,'0–5'],[5,'0–5'],[6,'6–12'],[13,'13–17'],[18,'18–24'],[25,'25–34'],[35,'35–44'],[45,'45–54'],[55,'55–64'],[65,'65+'],[NaN,'Unavailable']]) assert.equal(ageRange(age), expected);
    const tracker = new ObjectTracker('F');
    tracker.update([{ label:'face',bbox:[.1,.1,.2,.2],age:20 }], 0);
    const second = tracker.update([{ label:'face',bbox:[.1,.1,.2,.2],age:40 }], 10)[0];
    assert.equal(second.age, 30); assert.equal(second.ageSampleCount, 2);
    const stable = tracker.update([{ label:'face',bbox:[.1,.1,.2,.2],age:22 }], 20)[0];
    assert.equal(stable.age, 22); assert.deepEqual(stable.ageSamples,[20,40,22]);
});
test('motion-aware association keeps IDs through a crossing and limits prediction after gaps', () => {
    const tracker=new ObjectTracker('',1500,true), item=x=>({label:'cup',score:.9,bbox:[x,.2,.15,.2]});
    const first=tracker.update([item(.1),item(.7)],0);
    tracker.update([item(.2),item(.6)],100);
    tracker.update([item(.32),item(.48)],200);
    const crossing=tracker.update([item(.36),item(.44)],300);
    assert.equal(crossing[0].id,first[1].id); assert.equal(crossing[1].id,first[0].id);
    const projected=tracker.visibleAt(450).find(track=>track.id===first[0].id);
    assert.ok(projected.bbox[0]>crossing[1].bbox[0]);
    tracker.update([],500);
    assert.equal(tracker.visibleAt(600).length,2);
    assert.equal(tracker.visibleAt(1000).length,0);
    for(const track of tracker.visibleAt(600)) assert.ok(track.bbox[0]>=0 && track.bbox[0]+track.bbox[2]<=1);
    assert.equal(tracker.update([{label:'cup',bbox:[NaN,0,1,1]}],700).length,0);
    const slow=new ObjectTracker('',1500,true);
    const slowId=slow.update([item(.1)],0,2000)[0].id;
    assert.equal(slow.visibleAt(2100).length,1);
    assert.equal(slow.update([item(.15)],2200,4200)[0].id,slowId);
    assert.equal(slow.visibleAt(4900).length,0);
});
test('overlay labels keep the same readable CSS size on mobile and desktop', () => {
    for(const displayWidth of [240,360,800,1400]) {
        const scale=overlayScale(1280,displayWidth);
        assert.ok(Math.abs(12*scale*displayWidth/1280-12)<1e-8);
    }
});
test('age quality checks reject small, turned, cropped, dim and blurry faces', () => {
    const detection={score:.9,box:{x:20,y:20,width:100,height:140}}, points=facePoints(), texture=imageQuality(clearImage());
    assert.equal(faceQuality(detection,points,640,480,texture),'');
    assert.match(faceQuality({...detection,score:.6},points,640,480,texture),/clearer/);
    assert.match(faceQuality({...detection,box:{...detection.box,width:50}},points,640,480,texture),/closer/);
    assert.match(faceQuality({...detection,box:{...detection.box,x:-2}},points,640,480,texture),/whole face/);
    points[30].x=100;
    assert.match(faceQuality(detection,points,640,480,texture),/straight/);
    assert.match(faceQuality(detection,facePoints(),640,480,{brightness:20,sharpness:100}),/lighting/);
    assert.match(faceQuality(detection,facePoints(),640,480,{brightness:250,sharpness:100}),/glare/);
    assert.match(faceQuality(detection,facePoints(),640,480,{brightness:120,sharpness:0}),/focus/);
});
test('marks automatic source inference as uncertain, with explicit user overrides', () => {
    const screen = { label:'laptop',bbox:[.1,.1,.8,.8] };
    const inside = { label:'person',bbox:[.25,.25,.2,.4] };
    assert.match(sceneSource(inside,[screen,inside]), /possible screen content/);
    assert.match(sceneSource(screen,[screen,inside]), /source unverified/);
    assert.match(sceneSource(inside,[], 'displayed'), /Printed Image Detection · user selected/);
    assert.match(sceneSource(inside,[], 'live'), /Live Scene Detection · user selected/);
});
test('debounces gesture changes and does not restart the animation for a held count', () => {
    const stable = new StableValue(180);
    assert.equal(stable.update(1,0),false); assert.equal(stable.update(1,200),true);
    assert.equal(stable.update(1,1500),false); assert.equal(stable.update(2,1510),false);
    assert.equal(stable.update(1,1580),false); assert.equal(stable.update(2,1700),false);
    assert.equal(stable.update(2,1900),true); assert.equal(stable.update(2,2500),false);
    assert.equal(stable.update(null,3000),false); assert.equal(stable.update(null,3200),true);
});
test('provides actionable permission, camera and insecure-context errors', () => {
    assert.match(cameraError({name:'NotAllowedError'}),/permission was blocked/);
    assert.match(cameraError({name:'NotFoundError'}),/No camera/);
    assert.match(cameraError({name:'NotReadableError'}),/camera is busy/);
    assert.match(cameraError({},false),/HTTPS or localhost/);
});
test('bundled models and weight shards are complete and checksum verified', async () => {
    const root = new URL('../public/vision-pen-studio/static/vendor/smart-vision/',import.meta.url);
    const assets = JSON.parse(await readFile(new URL('assets.json',root),'utf8'));
    for (const asset of assets) {
        const bytes = await readFile(new URL(asset.path,root));
        assert.equal(bytes.length,asset.bytes,asset.path);
        assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
    }
    const model = JSON.parse(await readFile(new URL('objects/model.json',root),'utf8'));
    for (const group of model.weightsManifest) for (const shard of group.paths) assert.ok(assets.some((asset) => asset.path === `objects/${shard}`));
});

test('real bundled object, face and age models share a runtime and release tensors', { timeout:120000 }, async () => {
    const root = new URL('../public/vision-pen-studio/static/vendor/smart-vision/',import.meta.url);
    const localFetch = async (url) => {
        const relative = new URL(url).pathname.slice(1);
        assert.ok(!relative.includes('..'));
        return new Response(await readFile(new URL(relative,root)),{headers:{'content-type':relative.endsWith('.json')?'application/json':'application/octet-stream'}});
    };
    const runtime = vm.createContext({console,fetch:localFetch,performance,TextEncoder,TextDecoder,setTimeout,clearTimeout,URL,URLSearchParams,Response,Request});
    runtime.global=runtime;
    vm.runInContext(await readFile(new URL('face-api.js',root),'utf8'),runtime);
    const api=runtime.faceapi, tf=api.tf;
    runtime.tf=tf;
    tf.setPlatform('node',{fetch:localFetch,now:()=>performance.now(),encode:(s)=>new TextEncoder().encode(s),decode:(s)=>new TextDecoder().decode(s)});
    api.env.setEnv({Canvas:class{},Image:class{},ImageData:class{},Video:class{},fetch:localFetch});
    await tf.setBackend('cpu'); await tf.ready();
    vm.runInContext(await readFile(new URL('coco-ssd.min.js',root),'utf8'),runtime);
    const model=await runtime.cocoSsd.load({base:'lite_mobilenet_v2',modelUrl:'https://models.invalid/objects/model.json'});
    const input=tf.zeros([224,224,3],'int32');
    try {
        assert.equal((await model.detect(input,20,.45)).length,0);
        await api.nets.tinyFaceDetector.loadFromUri('https://models.invalid/face');
        await api.nets.faceLandmark68TinyNet.loadFromUri('https://models.invalid/face');
        await api.nets.ageGenderNet.loadFromUri('https://models.invalid/face');
        assert.equal((await api.detectAllFaces(input,new api.TinyFaceDetectorOptions({inputSize:224,scoreThreshold:.55})).withFaceLandmarks(true).withAgeAndGender()).length,0);
        assert.ok(Number.isFinite((await api.nets.ageGenderNet.predictAgeAndGender(input)).age));
    } finally {
        input.dispose(); model.dispose(); api.nets.tinyFaceDetector.dispose(); api.nets.faceLandmark68TinyNet.dispose(); api.nets.ageGenderNet.dispose();
    }
    assert.equal(tf.memory().numTensors,0);
});

// A minimal DOM/media fixture tests lifecycle logic without a device or browser.
async function controllerFixture(getUserMedia, search = '', clock = performance) {
    class Element {
        constructor() { this.children=[]; this.style={}; this.dataset={}; this.events={}; this.checked=true; this.value='auto'; this.textContent=''; this.videoWidth=1280; this.videoHeight=720; this.clientWidth=800; this.clientHeight=500; this.readyState=4; this.classList={ toggle(){},add(){},remove(){} }; }
        addEventListener(name,fn) { this.events[name]=fn; }
        append(...nodes) { this.children.push(...nodes); }
        appendChild(node) { this.append(node); return node; }
        get firstChild() { return this.children[0]; }
        get lastChild() { return this.children.at(-1); }
        replaceChildren(...nodes) { this.children=nodes; }
        querySelector() { return null; }
        querySelectorAll() { return []; }
        setAttribute(name,value) { this[name]=value; }
        click() { return this.events.click?.(); }
        remove() {}
        getBoundingClientRect() { return { width:800,height:500,left:0,top:0 }; }
        getContext() { return this.context ||= { boxes:[],texts:[],clearRect(){},drawImage(){},strokeRect(...box){this.boxes.push(box);},setLineDash(){},measureText(){return{width:100};},fillRect(){},fillText(text){this.texts.push(text);},getImageData:clearImage }; }
        async play() {}
        pause() {}
    }
    const elements = new Map(), events = {}, timers = [], media = getUserMedia || (async () => { throw Object.assign(new Error('Blocked'),{name:'NotAllowedError'}); });
    const document = { documentElement:new Element(), getElementById(id) { if(!elements.has(id)) { const element=new Element(); if(['handsToggle','facesToggle'].includes(id)) element.checked=false; elements.set(id,element); } return elements.get(id); },createElement:()=>new Element(),createTextNode:(s)=>s,querySelector:()=>new Element(),querySelectorAll:()=>[],addEventListener:(name,fn)=>{events[name]=fn;},head:new Element() };
    const window = { addEventListener:(name,fn)=>{events[name]=fn;}, isSecureContext:true };
    window.parent=window; window.top=window;
    let animationId=0; const animations=new Map();
    const context = { core,document,window,navigator:{mediaDevices:{getUserMedia:media,enumerateDevices:async()=>[]}},location:{search,origin:'http://localhost'},URL,URLSearchParams,performance:clock,console,setTimeout:(fn,delay)=>{timers.push(delay);if(delay===0)queueMicrotask(fn);return timers.length;},clearTimeout(){},requestAnimationFrame:(fn)=>{animations.set(++animationId,fn);return animationId;},cancelAnimationFrame:(id)=>animations.delete(id),ResizeObserver:class {observe(){}} };
    const url = new URL('../public/vision-pen-studio/static/js/smartVision.js',import.meta.url);
    const source = (await readFile(url,'utf8')).replace(/^import[^\n]+/,`const { analyzeHand, faceQuality, imageQuality, overlayScale, cameraError, CHAINS, ObjectTracker, sceneSource, StableValue } = core;`).replaceAll('import.meta.url',JSON.stringify(url.href));
    vm.runInNewContext(`${source}\nglobalThis.api={startCamera,stopCamera,fitCamera,ensureModels,pump,drawOverlays,getState:()=>state,setReady:()=>{models.objects={};models.faces={};models.hands={};},setModels:(values)=>Object.assign(models,values),getEpoch:()=>epoch};`,context);
    return {...context.api,elements,events,document,window,timers,animations,location:context.location};
}
const fakeStream = () => { const track={stop(){},getSettings:()=>({deviceId:'camera1'})}; return {getTracks:()=>[track],getVideoTracks:()=>[track]}; };
function installModelDoubles(app, loadObject = async () => ({detect:async()=>[]})) {
    const loaded=[];
    app.document.head.appendChild=(script)=>{loaded.push(new URL(script.src).pathname.split('/').pop());queueMicrotask(()=>script.onload());return script;};
    app.window.faceapi={tf:{setBackend:async()=>true,ready:async()=>{},getBackend:()=> 'webgl'}};
    app.window.cocoSsd={load:loadObject};
    app.window.Hands=class {setOptions(){} onResults(){} async initialize(){loaded.push('hand model');} async close(){} async send(){}};
    return loaded;
}
test('opening Smart Vision stays idle without camera prompts or model downloads, even with an old autostart URL', async () => {
    let prompts=0;
    const app=await controllerFixture(async()=>{prompts++;return fakeStream();},'?autostart=1');
    await Promise.resolve();
    assert.equal(prompts,0); assert.equal(app.getState(),'idle'); assert.equal(app.document.head.children.length,0);
});
test('only selected models load, with hand analysis available on demand', async () => {
    const app=await controllerFixture(async()=>fakeStream());
    const loaded=installModelDoubles(app);
    await app.startCamera(); await app.ensureModels();
    assert.deepEqual(loaded,['face-api.js','coco-ssd.min.js']);
    assert.equal(app.elements.get('handsModel').textContent,'Not enabled');
    app.elements.get('handsToggle').checked=true; app.elements.get('handsToggle').events.change();
    await app.ensureModels();
    assert.deepEqual(loaded,['face-api.js','coco-ssd.min.js','hands.js','hand model']);
});
test('stopping model initialization prevents remaining selected models from loading', async () => {
    const app=await controllerFixture(async()=>fakeStream()); let finishObject,started;
    const objectStarted=new Promise(resolve=>{started=resolve;});
    const loaded=installModelDoubles(app,()=>{started();return new Promise(resolve=>{finishObject=resolve;});});
    app.elements.get('handsToggle').checked=true; app.elements.get('facesToggle').checked=true;
    await app.startCamera(); await objectStarted;
    app.stopCamera(); finishObject({detect:async()=>[]}); await app.ensureModels();
    assert.deepEqual(loaded,['face-api.js','coco-ssd.min.js']); assert.equal(app.getState(),'idle');
});
test('inference skips disabled tools, yields between stages, and leaves time for the interface', async () => {
    const app=await controllerFixture(async()=>fakeStream()); let objectCalls=0,handCalls=0;
    app.setModels({objects:{detect:async()=>{objectCalls++;return[];}},hands:{send:async()=>{handCalls++;}}});
    await app.startCamera(); await app.pump();
    assert.equal(objectCalls,1); assert.equal(handCalls,0);
    assert.ok(app.timers.includes(0)); assert.ok(app.timers.at(-1)>=200);
    app.elements.get('objectsToggle').checked=false; app.elements.get('objectsToggle').events.change();
    await app.pump();
    assert.equal(objectCalls,1); assert.equal(app.elements.get('insightsStatus').textContent,'PREVIEW');
});
test('Back to Vision Pen returns to the integrated route and releases the camera', async () => {
    const app=await controllerFixture(async()=>fakeStream()); app.setReady(); await app.startCamera();
    await app.elements.get('backButton').click();
    assert.equal(app.location.href,'/vision-pen'); assert.equal(app.getState(),'idle');
});
test('slower face analysis still stabilizes age across multiple frames and resets after a missing face', async () => {
    let now=0,age=20,present=true,boxWidth=100;
    const app=await controllerFixture(async()=>fakeStream(),'',{now:()=>now});
    app.elements.get('objectsToggle').checked=false; app.elements.get('facesToggle').checked=true;
    app.setModels({faces:{TinyFaceDetectorOptions:class{},detectAllFaces:()=>({withFaceLandmarks:()=>({withAgeAndGender:async()=>present?[{age,landmarks:{positions:facePoints()},detection:{score:.9,box:{x:20,y:20,width:boxWidth,height:100}}}]:[]})})}});
    await app.startCamera();
    for (const sample of [20,40,22]) { age=sample; now+=2200; await app.pump(); }
    assert.equal(app.elements.get('ageSummary').textContent,'≈ 22 years');
    assert.doesNotMatch(app.document.getElementById('notice').textContent,/could not be processed/);
    boxWidth=50; now+=2200; await app.pump();
    assert.equal(app.elements.get('ageSummary').textContent,'—');
    assert.match(app.elements.get('ageHint').textContent,/closer/);
    present=false; now+=2200; await app.pump();
    present=true; boxWidth=100; age=50; now+=2200; await app.pump();
    assert.equal(app.elements.get('ageSummary').textContent,'Measuring 1/3');
});
test('object boxes render before slower models and stay aligned with mirrored video', async () => {
    let now=100;
    const app=await controllerFixture(async()=>fakeStream(),'',{now:()=>now});
    const overlay=app.elements.get('visionOverlay'), context=overlay.getContext();
    app.elements.get('handsToggle').checked=true;
    app.setModels({objects:{detect:async()=>{now+=2000;return[{class:'cup',score:.9,bbox:[48,27,96,54]}];}},hands:{send:async()=>{assert.ok(context.boxes.length>0);}}});
    await app.startCamera(); overlay.clientWidth=320; await app.pump();
    assert.ok(Math.abs(context.boxes[0][0]-.7*1280)<1e-8);
    assert.equal(context.font,'600 48px system-ui');
    app.elements.get('mirrorToggle').checked=false; app.drawOverlays();
    assert.ok(Math.abs(context.boxes.at(-1)[0]-.1*1280)<1e-8);
    assert.equal(app.animations.size,1); app.stopCamera(); assert.equal(app.animations.size,0);
});
test('camera permission denial resets controls and shows recovery instructions', async () => {
    const app = await controllerFixture(); await app.startCamera();
    assert.equal(app.getState(),'idle'); assert.equal(app.elements.get('startButton').disabled,false);
    assert.match(app.elements.get('gateMessage').textContent,/permission was blocked/);
});
test('stopping during a permission request releases the late stream and prevents restart', async () => {
    let resolve,stops=0;
    const app = await controllerFixture(()=>new Promise((r)=>{resolve=r;}));
    const starting = app.startCamera(); app.stopCamera();
    resolve({getTracks:()=>[{stop:()=>stops++}]}); await starting;
    assert.equal(stops,1); assert.equal(app.getState(),'idle');
    assert.equal(app.elements.get('visionVideo').srcObject,null);
});
test('pause retains the stream; stop and hidden-page cleanup release camera tracks', async () => {
    let stops=0;
    const track={stop:()=>stops++,getSettings:()=>({deviceId:'camera1',facingMode:'user'})};
    const stream={getTracks:()=>[track],getVideoTracks:()=>[track]};
    const app=await controllerFixture(async()=>stream); app.setReady();
    await app.startCamera(); assert.equal(app.getState(),'running');
    app.elements.get('pauseButton').events.click(); assert.equal(app.getState(),'paused'); assert.equal(stops,0);
    app.elements.get('pauseButton').events.click(); assert.equal(app.getState(),'running');
    app.stopCamera(); assert.equal(stops,1); assert.equal(app.elements.get('visionVideo').srcObject,null);
    await app.startCamera(); app.events.pagehide(); assert.equal(stops,2); assert.equal(app.getState(),'idle');
});

test('camera fitting stays within desktop, tablet and mobile content boxes', async () => {
    const app=await controllerFixture();
    const stage=app.elements.get('cameraStage'),video=app.elements.get('visionVideo'),image=app.elements.get('cameraImage');
    for (const [width,height] of [[1040,530],[440,390],[720,460],[278,420],[0,0]]) {
        stage.clientWidth=width; stage.clientHeight=height;
        for (const [sourceWidth,sourceHeight] of [[1920,1080],[1080,1920],[640,480],[0,0]]) {
            video.videoWidth=sourceWidth; video.videoHeight=sourceHeight;
            app.fitCamera();
            const fittedWidth=parseFloat(image.style.width),fittedHeight=parseFloat(image.style.height);
            assert.ok(fittedWidth>=0 && fittedWidth<=width);
            assert.ok(fittedHeight>=0 && fittedHeight<=height+1e-8);
            if(width) assert.ok(Math.abs(fittedWidth/fittedHeight-(sourceWidth ? sourceWidth/sourceHeight : 16/9))<1e-8);
        }
    }
});

test('the remaining fullscreen button toggles without stopping the camera', async () => {
    let stops=0;
    const track={stop:()=>stops++,getSettings:()=>({deviceId:'camera1'})};
    const app=await controllerFixture(async()=>({getTracks:()=>[track],getVideoTracks:()=>[track]}));
    app.setReady(); await app.startCamera();
    app.document.documentElement.requestFullscreen=async()=>{app.document.fullscreenElement=app.document.documentElement;app.events.fullscreenchange();};
    app.document.exitFullscreen=async()=>{app.document.fullscreenElement=null;app.events.fullscreenchange();};
    await app.elements.get('fullscreenButton').click();
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Restore');
    assert.equal(app.elements.get('fullscreenButton')['aria-pressed'],'true');
    assert.equal(app.elements.get('fullscreenIcon').className,'fa-solid fa-compress');
    await app.elements.get('fullscreenButton').click();
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Maximize');
    assert.equal(app.elements.get('fullscreenButton')['aria-pressed'],'false');
    assert.equal(app.elements.get('fullscreenIcon').className,'fa-solid fa-expand');
    assert.equal(app.getState(),'running'); assert.equal(stops,0);
    // Browsers can report fullscreen exit before delivering Escape.
    app.events.keydown({key:'Escape'});
    assert.equal(app.getState(),'running');
});
test('Escape leaves fullscreen before leaving the studio and handles external exits', async () => {
    const app=await controllerFixture(); let backClicks=0;
    app.elements.get('backButton').click=()=>{backClicks++;};
    app.document.fullscreenElement=app.document.documentElement;app.events.fullscreenchange();
    app.document.exitFullscreen=async()=>{app.document.fullscreenElement=null;app.events.fullscreenchange();};
    let prevented=false;
    app.events.keydown({key:'Escape',preventDefault:()=>{prevented=true;},stopPropagation(){}});
    await Promise.resolve(); await Promise.resolve();
    assert.equal(prevented,true); assert.equal(backClicks,0);
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Maximize');
    app.document.fullscreenElement=app.document.documentElement;app.events.fullscreenchange();
    app.document.fullscreenElement=null;app.events.fullscreenchange();
    assert.equal(app.elements.get('fullscreenButton')['aria-pressed'],'false');
});
test('unsupported fullscreen uses a working in-page maximize fallback', async () => {
    const app=await controllerFixture();
    await app.elements.get('fullscreenButton').click();
    assert.match(app.elements.get('notice').textContent,/Maximized inside Vision Pen/);
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Restore');
    assert.equal(app.elements.get('fullscreenButton')['aria-pressed'],'true');
    await app.elements.get('fullscreenButton').click();
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Maximize');
    assert.equal(app.elements.get('fullscreenButton').disabled,false);
    assert.equal(app.elements.get('fullscreenButton')['aria-pressed'],'false');
});
test('fullscreen ignores repeated requests while the button is busy', async () => {
    const app=await controllerFixture(); let resolve,requests=0;
    app.document.documentElement.requestFullscreen=()=>{requests++;return new Promise((done)=>{resolve=done;});};
    const entering=app.elements.get('fullscreenButton').click();
    assert.equal(app.elements.get('fullscreenButton').disabled,true);
    await app.elements.get('fullscreenButton').click();
    assert.equal(requests,1);
    resolve(); await entering;
    assert.equal(app.elements.get('fullscreenButton').disabled,false);
});
test('rejected browser fullscreen falls back to in-page maximize', async () => {
    const app=await controllerFixture();
    app.document.documentElement.requestFullscreen=async()=>{throw new Error('Denied');};
    await app.elements.get('fullscreenButton').click();
    assert.match(app.elements.get('notice').textContent,/Browser fullscreen was blocked/);
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Restore');
    assert.equal(app.elements.get('fullscreenButton').disabled,false);
});
test('maximize requests fullscreen on the outermost accessible Vision Pen frame', async () => {
    const app=await controllerFixture(); let innerRequests=0,outerRequests=0;
    const topEvents={};
    const topDocument={fullscreenElement:null,addEventListener:(name,fn)=>{topEvents[name]=fn;}};
    topDocument.exitFullscreen=async()=>{topDocument.fullscreenElement=null;topEvents.fullscreenchange?.();};
    const topWindow={document:topDocument}; topWindow.parent=topWindow; topWindow.top=topWindow;
    const outerFrame={requestFullscreen:async()=>{outerRequests++;topDocument.fullscreenElement=outerFrame;topEvents.fullscreenchange?.();}};
    const middleWindow={document:{addEventListener(){}},parent:topWindow,top:topWindow,frameElement:outerFrame};
    const innerFrame={requestFullscreen:async()=>{innerRequests++;}};
    app.window.parent=middleWindow; app.window.top=topWindow; app.window.frameElement=innerFrame;
    await app.elements.get('fullscreenButton').click();
    assert.equal(outerRequests,1); assert.equal(innerRequests,0);
    assert.equal(app.elements.get('fullscreenLabel').textContent,'Restore');
    await app.elements.get('fullscreenButton').click();
    assert.equal(topDocument.fullscreenElement,null);
});
