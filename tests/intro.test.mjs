import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {makeIntro,introAudit,RATIOS} from '../skills/eric-intro-motion-skill/scripts/native-intro.mjs';
import {assertRecomposed} from '../skills/social-motion/scripts/native-audit.mjs';
import {cacheKeys,renderCachedFrames,encodeFrames,digest} from '../skills/eric-intro-motion-skill/scripts/native-cache.mjs';
import {replaceAudio} from '../skills/eric-intro-motion-skill/scripts/replace-audio.mjs';
import {run} from '../skills/eric-intro-motion-skill/scripts/render.mjs';

test('four complete intro scenes reflow natively in both languages; oversized text fails',async()=>{
 const recipe=JSON.parse(await readFile(new URL('../skills/eric-intro-motion-skill/assets/examples/pocket-notes.json',import.meta.url),'utf8'));
 for(const language of ['zh','en']){
  const reports=Object.keys(RATIOS).map(ratio=>{
   const c=makeIntro(recipe,{ratio,language});assert.equal(c.scenes.length,4);assert.equal(c.duration,16);
   const audit=introAudit(c,{sourceHash:'same-source'});assert.equal(audit.samples.length,4);return audit;
  });
  assert.equal(assertRecomposed(reports).passed,true);
 }
 const bad=structuredClone(recipe);bad.scenes[0].en.note='Too long '.repeat(50);
 assert.throws(()=>makeIntro(bad),/overflow/);
});

test('cache resumes missing/corrupt frames and audio replacement keeps the video stream',async()=>{
 await mkdir('.work',{recursive:true});
 const root=await mkdtemp(path.resolve('.work/intro-cache-test-'));
 try{
  const c={width:320,height:320,duration:.6,frame:t=>`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="#f4f0e7"/><circle cx="${40+t*120}" cy="160" r="30" fill="#bd4c31"/></svg>`};
  const directory=path.join(root,'frames');
  assert.equal((await renderCachedFrames(c,{directory,fps:30})).rendered,18);
  assert.equal((await renderCachedFrames(c,{directory,fps:30})).reused,18);
  await writeFile(path.join(directory,'frame-000003.png'),'truncated');
  await rm(path.join(directory,'frame-000006.png'));
  const resumed=await renderCachedFrames(c,{directory,fps:30});assert.equal(resumed.rendered,2);assert.equal(resumed.reused,16);
  const opts={sourceHash:'a',recipe:{id:'x'},ratio:'square',language:'en',width:320,height:320,fps:30,encoder:'test'};
  const a=cacheKeys({...opts,audioHash:'a'}),b=cacheKeys({...opts,audioHash:'b'});
  assert.equal(a.visual,b.visual);assert.notEqual(a.output,b.output);
  assert.notEqual(a.visual,cacheKeys({...opts,sourceHash:'new-art',audioHash:'a'}).visual);
  const video=path.join(root,'original.mp4'),audio=path.join(root,'music.wav');
  const encoded=await encodeFrames({frames:directory,output:video,width:320,height:320,duration:.6,fps:30});
  assert.equal(encoded.frames,18);assert.equal(encoded.fullDecodePassed,true);
  const original=digest(await readFile(video));
  await run('ffmpeg',['-v','error','-y','-f','lavfi','-i','sine=frequency=440:duration=0.6',audio]);
  const report=await replaceAudio({video,audio,out:path.join(root,'with-music.mp4')});
  assert.equal(report.videoStreamUnchanged,true);assert.equal(digest(await readFile(video)),original);
  await assert.rejects(replaceAudio({video,audio,out:video}),/new output path/);
 }finally{await rm(root,{recursive:true,force:true});}
});
