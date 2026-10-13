import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {digest,engineHash,readJSON} from '../skills/eric-intro-motion-skill/scripts/native-cache.mjs';
import {assertRecomposed} from '../skills/social-motion/scripts/native-audit.mjs';
import {png} from '../skills/eric-intro-motion-skill/scripts/render.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=path.join(root,'examples/native-intro');
const recipe=await readJSON(path.join(dir,'recipe.json')),manifest=await readJSON(path.join(dir,'manifest.json'));
const sourceHash=digest((await engineHash())+JSON.stringify(recipe));assert.equal(manifest.sourceHash,sourceHash);
const checked=[];
for(const language of ['zh','en']){
 const audits=[];
 for(const ratio of ['square','portrait','vertical']){
  const id=`${recipe.id}-${language}-${ratio}`,folder=path.join(dir,id),encode=await readJSON(path.join(folder,'encode.json'));
  const audit=await readJSON(path.join(folder,'layout-audit.json')),samples=await readJSON(path.join(folder,'encoded-samples.json'));
  assert.equal(encode.sourceHash,sourceHash);assert.equal(audit.sourceHash,sourceHash);assert.equal(samples.sourceHash,sourceHash);
  assert.equal(digest(await readFile(path.join(folder,'film.mp4'))),encode.media.sha256);
  assert.equal(samples.sha256,encode.media.sha256);assert.equal(encode.media.frames,480);assert.equal(encode.media.seconds,16);assert.ok(encode.media.fullDecodePassed);
  assert.equal(audit.samples.length,4);assert.equal(samples.samples.length,14);
  audits.push(audit);checked.push({id,width:encode.media.width,height:encode.media.height,seconds:16,frames:480,sha256:encode.media.sha256,fullDecodePassed:true,sceneCount:4,encodedSamples:14,cache:manifest.outputs.find(x=>x.id===id).cache});
 }
 assertRecomposed(audits);
}
async function sheet(language,kind){
 const images=[];
 const columns=['square','portrait','vertical'],sampleNames=kind==='scenes'?[1,2,3,4].map(n=>`scene-${n}-hold.jpg`):[1,2,3].flatMap(n=>[`cut-${n}-before.jpg`,`cut-${n}-after.jpg`]);
 const cellH=kind==='scenes'?650:400,w=kind==='scenes'?330:200;
 for(let row=0;row<sampleNames.length;row++)for(let col=0;col<columns.length;col++){
  const file=path.join(dir,`${recipe.id}-${language}-${columns[col]}`,sampleNames[row]),bytes=await readFile(file);
  images.push(`<image href="data:image/jpeg;base64,${bytes.toString('base64')}" x="${col*360+15}" y="${row*cellH+15}" width="${w}" height="${cellH-30}" preserveAspectRatio="xMinYMin meet"/>`);
 }
 await writeFile(path.join(dir,`${language}-${kind}.png`),png(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${sampleNames.length*cellH}"><rect width="1080" height="100%" fill="#dce1d7"/>${images.join('')}</svg>`,1080));
}
for(const language of ['zh','en'])for(const kind of ['scenes','transitions'])await sheet(language,kind);
const images=[];for(const [i,ratio]of ['square','portrait','vertical'].entries())images.push(`<image href="data:image/png;base64,${(await readFile(path.join(dir,`pocket-notes-en-${ratio}/poster.png`))).toString('base64')}" x="${i*360+15}" y="15" width="330" height="620" preserveAspectRatio="xMinYMin meet"/>`);
await writeFile(path.join(dir,'ratio-review.png'),png(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="650"><rect width="1080" height="650" fill="#dce1d7"/>${images.join('')}</svg>`,1080));
const font=path.join(root,'skills/eric-intro-motion-skill/assets/fonts/NotoSansSC.ttf');
await writeFile(path.join(dir,'asset-provenance.json'),JSON.stringify({license:'MIT except font',assets:[{path:'recipe.json',source:'Original fictional workflow written for this repository',license:'MIT',sha256:digest(await readFile(path.join(dir,'recipe.json')))},{path:'../../skills/eric-intro-motion-skill/scripts/native-intro.mjs',source:'Original native vector layouts, cards and motion',license:'MIT',sha256:digest(await readFile(path.join(root,'skills/eric-intro-motion-skill/scripts/native-intro.mjs')))},{path:'../../skills/eric-intro-motion-skill/assets/fonts/NotoSansSC.ttf',source:'https://github.com/google/fonts/tree/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl/notosanssc',license:'SIL OFL 1.1; license file beside font',sha256:digest(await readFile(font))}],privateProjectAssetsIncluded:false},null,2)+'\n');
await writeFile(path.join(dir,'verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),sourceHash,passed:true,languages:['zh','en'],ratios:['1:1','3:4','9:16'],nativeEveryScene:true,embeddedMasterVideo:false,renderApiCalls:0,platformUploadVerified:false,visualReview:'See visual-review.md',browserPlayback:'See browser-playback.json',results:checked},null,2)+'\n');
console.log(JSON.stringify({passed:true,outputs:checked.length,scenes:24,encodedSamples:84,cacheOutputHits:checked.filter(x=>x.cache.outputHit).length}));
