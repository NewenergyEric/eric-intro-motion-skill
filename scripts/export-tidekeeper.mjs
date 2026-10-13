// Verify and package the actual encoded films, not source-only screenshots.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {assertRecomposed} from '../skills/social-motion/scripts/native-audit.mjs';
import {png} from '../skills/eric-intro-motion-skill/scripts/render.mjs';
import {sourceHashFor} from '../examples/tidekeeper/source-hash.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=path.join(root,'examples/tidekeeper');
const digest=b=>createHash('sha256').update(b).digest('hex');
const readJSON=async file=>JSON.parse(await readFile(file,'utf8'));
const run=(cmd,args)=>new Promise((resolve,reject)=>{const child=spawn(cmd,args,{windowsHide:true});let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err=(err+b).slice(-6000));child.on('error',reject);child.on('exit',code=>code?reject(new Error(`${cmd}: ${err}`)):resolve(out));});
const ratios=[['square',1080],['portrait',1440],['vertical',1920]],holds=[86,205,325,480,595,690],cuts=[120,240,360,510,630],results=[];
const temp=path.join(root,'.work/tidekeeper-export');await mkdir(temp,{recursive:true});
const sourceHash=await sourceHashFor(dir);
for(const asset of await readJSON(path.join(dir,'asset-provenance.json')))assert.equal(digest(await readFile(path.join(dir,asset.path))),asset.sha256,asset.path);
for(const language of ['zh','en']){
 const audits=[];
 for(const [ratio,height] of ratios){
  const id=`tidekeeper-${language}-${ratio}`,working=path.join(dir,'output',id),dest=path.join(dir,id);await mkdir(dest,{recursive:true});
  const audit=await readJSON(path.join(working,'layout-audit.json')),encode=await readJSON(path.join(working,'encode.json')),movie=path.join(working,`${id}.mp4`);
  assert.equal(audit.sourceHash,sourceHash);assert.equal(encode.sourceHash,sourceHash);audits.push(audit);
  const bytes=await readFile(movie);assert.equal(digest(bytes),encode.sha256);
  const probe=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',movie]));
  const v=probe.streams.find(s=>s.codec_type==='video');assert.equal(v.width,1080);assert.equal(v.height,height);assert.equal(Number(v.nb_read_frames),720);assert.equal(v.codec_name,'h264');assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.sample_aspect_ratio,'1:1');assert.equal(v.r_frame_rate,'30/1');assert.ok(Math.abs(Number(v.duration)-24)<.01);
  await run('ffmpeg',['-v','error','-i',movie,'-f','null','-']);
  assert.ok(bytes.indexOf(Buffer.from('moov'))<bytes.indexOf(Buffer.from('mdat')),'faststart');
  await copyFile(movie,path.join(dest,'film.mp4'));await copyFile(path.join(working,'layout-audit.json'),path.join(dest,'layout-audit.json'));
  const metadata={...encode.metadata,format:{...encode.metadata.format,filename:'film.mp4'}};
  await writeFile(path.join(dest,'encode.json'),JSON.stringify({...encode,metadata,fullDecodePassed:true},null,2)+'\n');
  const samples=[...holds.map((frame,i)=>({frame,file:`scene-${i+1}.jpg`,kind:'scene-hold'})),...[15,138,258,378,528,648].map((frame,i)=>({frame,file:`entrance-${i+1}.jpg`,kind:'entrance'})),...cuts.flatMap((frame,i)=>[-6,0,6].map(offset=>({frame:frame+offset,file:`cut-${i+1}-${offset<0?'before':offset>0?'after':'middle'}.jpg`,kind:'cut'}))),...[395,430].map(frame=>({frame,file:`game-${frame}.jpg`,kind:'ui-state'}))];
  for(const sample of samples){await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(sample.frame/30),'-i',movie,'-frames:v','1','-q:v','3',path.join(dest,sample.file)]);sample.sha256=digest(await readFile(path.join(dest,sample.file)));}
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(86/30),'-i',movie,'-frames:v','1',path.join(dest,'poster.png')]);
  await writeFile(path.join(dest,'encoded-samples.json'),JSON.stringify({sourceHash,sha256:encode.sha256,samples},null,2)+'\n');
  results.push({id,language,ratio,width:1080,height,durationSeconds:24,frames:720,bytes:bytes.length,sha256:encode.sha256,fullDecodePassed:true,nativeSamples:audit.samples.length,encodedSamples:samples.length});
  console.log('EXPORTED',id,Math.round(bytes.length/1024)+' KiB');
 }
 assertRecomposed(audits);
}
async function sheet(language,kind){
 const rowFiles=kind==='scenes'?holds.map((_,i)=>`scene-${i+1}.jpg`):cuts.flatMap((_,i)=>[`cut-${i+1}-before.jpg`,`cut-${i+1}-middle.jpg`,`cut-${i+1}-after.jpg`]);
 const cellH=kind==='scenes'?580:400,cellW=336,thumbW=kind==='scenes'?308:206,items=[];
 for(const [row,file] of rowFiles.entries())for(const [col,[ratio]] of ratios.entries()){
  const bytes=await readFile(path.join(dir,`tidekeeper-${language}-${ratio}`,file));
  items.push(`<image href="data:image/jpeg;base64,${bytes.toString('base64')}" x="${col*cellW+(cellW-thumbW)/2}" y="${row*cellH+14}" width="${thumbW}" height="${cellH-28}" preserveAspectRatio="xMidYMin meet"/>`);
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1008" height="${rowFiles.length*cellH}"><rect width="100%" height="100%" fill="#e4e8da"/>${items.join('')}</svg>`;
 const staging=path.join(temp,`${language}-${kind}.png`);await writeFile(staging,png(svg,1008));
 await run('ffmpeg',['-v','error','-y','-i',staging,'-frames:v','1','-q:v','3',path.join(dir,`${language}-${kind}.jpg`)]);
}
for(const language of ['zh','en']){
 await sheet(language,'scenes');await sheet(language,'transitions');
 const movie=path.join(dir,`tidekeeper-${language}-square/film.mp4`);
 await run('ffmpeg',['-v','error','-y','-i',movie,'-filter_complex','fps=10,scale=480:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',path.join(dir,`preview-${language}.gif`)]);
}
const items=[];
for(const [col,[ratio]] of ratios.entries())items.push(`<image href="data:image/png;base64,${(await readFile(path.join(dir,`tidekeeper-zh-${ratio}/poster.png`))).toString('base64')}" x="${col*360+15}" y="15" width="330" height="590" preserveAspectRatio="xMidYMin meet"/>`);
await writeFile(path.join(temp,'ratios.png'),png(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="620"><rect width="100%" height="100%" fill="#e4e8da"/>${items.join('')}</svg>`,1080));
await run('ffmpeg',['-v','error','-y','-i',path.join(temp,'ratios.png'),'-frames:v','1','-q:v','3',path.join(dir,'ratio-review.jpg')]);
await writeFile(path.join(dir,'verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),sourceHash,passed:true,sourceCommit:'a6d17d873845ebeeb530fdf295b9d527c6ac2181',nativeEveryScene:true,embeddedMasterVideo:false,languages:['zh','en'],ratios:['1:1','3:4','9:16'],sceneCount:6,results,visualReview:'visual-review.md',browserPlayback:'browser-playback.json',platformUploadVerified:false},null,2)+'\n');
console.log('PASS: six films, eight measured holds/UI states each, all encoded scenes and cuts, full decoding.');
