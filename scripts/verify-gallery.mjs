import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {assertRecomposed} from '../skills/social-motion/scripts/native-audit.mjs';
import {sourceHashFor} from '../examples/tidekeeper/source-hash.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),folder=path.join(root,'examples/tidekeeper');
const json=async p=>JSON.parse(await readFile(p,'utf8')),digest=b=>createHash('sha256').update(b).digest('hex');
const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args,{windowsHide:true});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err=(err+b).slice(-4000));p.on('error',reject);p.on('exit',code=>code?reject(new Error(err)):resolve(out));});
const sourceHash=await sourceHashFor(folder),report=await json(path.join(folder,'verification.json'));assert.equal(report.sourceHash,sourceHash);assert.equal(report.results.length,6);
for(const asset of await json(path.join(folder,'asset-provenance.json')))assert.equal(digest(await readFile(path.join(folder,asset.path))),asset.sha256,asset.path);
for(const language of ['zh','en']){
 const audits=[];
 for(const entry of report.results.filter(r=>r.language===language)){
  const dir=path.join(folder,entry.id),movie=path.join(dir,'film.mp4'),audit=await json(path.join(dir,'layout-audit.json'));
  assert.equal(audit.sourceHash,sourceHash);audits.push(audit);assert.equal(digest(await readFile(movie)),entry.sha256);
  const encode=await json(path.join(dir,'encode.json'));
  assert.equal(encode.sourceHash,sourceHash);assert.equal(encode.sha256,entry.sha256);assert.equal(encode.metadata.format.filename,'film.mp4');
  const streams=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-of','json',movie])).streams;
  const v=streams.find(s=>s.codec_type==='video');assert.equal(v.width,entry.width);assert.equal(v.height,entry.height);assert.equal(Number(v.nb_read_frames),720);assert.equal(Number(v.duration),24);assert.equal(v.r_frame_rate,'30/1');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.pix_fmt,'yuv420p');
  await run('ffmpeg',['-v','error','-i',movie,'-f','null','-']);
  const samples=await json(path.join(dir,'encoded-samples.json'));assert.equal(samples.sourceHash,sourceHash);assert.equal(samples.sha256,entry.sha256);assert.equal(samples.samples.length,29);
  for(const sample of samples.samples)assert.equal(digest(await readFile(path.join(dir,sample.file))),sample.sha256);
 }
 assertRecomposed(audits);
}
// Check local destinations on the two newly authored gallery pages. Remote
// source links are pinned or manually verified; this never crawls the internet.
for(const name of ['examples/index.html','examples/tidekeeper/index.html']){
 const p=path.join(root,name),html=await readFile(p,'utf8');
 for(const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
  const target=match[1];if(/^(https?:|#|data:)/.test(target))continue;
  await stat(path.resolve(path.dirname(p),decodeURIComponent(target.split('#')[0])));
 }
}
await stat(path.join(folder,report.visualReview));await stat(path.join(folder,report.browserPlayback));
const updateFolder=path.join(root,'examples/materials-update');
const update=await json(path.join(updateFolder,'provenance.json'));
assert.equal(update.commit,'04f183050a5d1122648a9c5aa35b998f325bf08f');
for(const asset of update.assets)assert.equal(digest(await readFile(path.join(updateFolder,asset.path))),asset.sha256,asset.path);
const latestMovie=path.join(updateFolder,'latest-source-en.mp4');
const latest=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-of','json',latestMovie])).streams.find(s=>s.codec_type==='video');
assert.equal(latest.width,1280);assert.equal(latest.height,720);assert.equal(Number(latest.nb_read_frames),720);assert.equal(Number(latest.duration),24);
await run('ffmpeg',['-v','error','-i',latestMovie,'-f','null','-']);
console.log('PASS: gallery links, pinned artwork, six native MP4s, 48 native layout samples, 174 encoded images and the latest English source preview.');
