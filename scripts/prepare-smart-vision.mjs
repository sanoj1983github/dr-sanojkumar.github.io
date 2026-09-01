// Pinned, public model assets. Camera frames never leave the browser.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../public/vision-pen-studio/static/vendor/smart-vision/', import.meta.url));
const assets = [];
async function download(url, name) {
  if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.split('/').includes('..')) throw new Error('Invalid asset path');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const target = path.join(root, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  assets.push({ path: name, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  return bytes;
}

if (process.argv.includes('--check')) {
  const manifest = JSON.parse(await readFile(path.join(root, 'assets.json'), 'utf8'));
  for (const asset of manifest) {
    const bytes = await readFile(path.join(root, asset.path));
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Asset changed: ${asset.path}`);
  }
  console.log(`Verified ${manifest.length} Smart Vision assets.`);
} else {
  const faceBase = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/';
  const cocoBase = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/';
  await download(`${faceBase}dist/face-api.js`, 'face-api.js');
  await download(`${faceBase}LICENSE`, 'FACE-API-LICENSE');
  await download(`${cocoBase}dist/coco-ssd.min.js`, 'coco-ssd.min.js');
  await download('https://raw.githubusercontent.com/tensorflow/tfjs-models/master/LICENSE', 'COCO-SSD-LICENSE');
  await download('https://raw.githubusercontent.com/tensorflow/tfjs/tfjs-v4.22.0/LICENSE', 'TENSORFLOW-LICENSE');
  for (const model of ['tiny_face_detector', 'face_landmark_68_tiny', 'age_gender']) {
    const manifest = JSON.parse(await download(`${faceBase}model/${model}_model-weights_manifest.json`, `face/${model}_model-weights_manifest.json`));
    for (const shard of new Set(manifest.flatMap((group) => group.paths))) {
      await download(`${faceBase}model/${shard}`, `face/${shard}`);
    }
  }
  const objectBase = 'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/';
  const model = JSON.parse(await download(`${objectBase}model.json`, 'objects/model.json'));
  for (const shard of new Set(model.weightsManifest.flatMap((group) => group.paths))) {
    await download(`${objectBase}${shard}`, `objects/${shard}`);
  }
  await writeFile(path.join(root, 'assets.json'), `${JSON.stringify(assets, null, 2)}\n`);
  console.log(`Saved ${assets.length} assets (${(assets.reduce((sum, asset) => sum + asset.bytes, 0) / 1048576).toFixed(1)} MB).`);
}
