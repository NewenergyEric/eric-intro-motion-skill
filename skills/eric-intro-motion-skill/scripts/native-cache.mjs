import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {png,run,inspectVideo} from './render.mjs';

export const digest = value => createHash('sha256').update(value).digest('hex');
export const readJSON = file => readFile(file,'utf8').then(JSON.parse);
const maybeJSON = file => readJSON(file).catch(()=>null);
export async function atomicJSON(file,value) {
  await writeFile(file+'.tmp',JSON.stringify(value,null,2)+'\n');
  await rename(file+'.tmp',file);
}
export async function engineHash() {
  const files=['native-intro.mjs','native-cache.mjs','text.mjs','render.mjs','../../social-motion/scripts/native-audit.mjs','../assets/fonts/NotoSansSC.ttf','../package-lock.json'];
  return digest(Buffer.concat(await Promise.all(files.map(f=>readFile(new URL(f,import.meta.url))))));
}
export function cacheKeys({sourceHash,recipe,ratio,language,width,height,fps,audioHash,encoder}) {
  const visual=digest(JSON.stringify({sourceHash,recipe,ratio,language,width,height,fps}));
  return {visual,output:digest(JSON.stringify({visual,audioHash,encoder}))};
}
export async function verifiedFile(file,sha256) {
  return Boolean(sha256) && await readFile(file).then(b=>digest(b)===sha256,()=>false);
}

// Only one writer per visual key. Hashes reject partial/corrupt PNGs on resume.
export async function renderCachedFrames(composition,{directory,fps,onProgress}) {
  await mkdir(directory,{recursive:true});
  const manifestFile=path.join(directory,'frames.json');
  const index=await maybeJSON(manifestFile)||{frames:{}};
  const count=Math.round(composition.duration*fps);
  let reused=0,rendered=0;
  try {
    for(let i=0;i<count;i++) {
      const name=`frame-${String(i).padStart(6,'0')}.png`,file=path.join(directory,name);
      if(await verifiedFile(file,index.frames[name])){reused++;continue;}
      const bytes=png(composition.frame(i/fps),composition.width);
      await writeFile(file+'.tmp',bytes);await rename(file+'.tmp',file);
      index.frames[name]=digest(bytes);rendered++;
      if(rendered%30===0){await atomicJSON(manifestFile,index);onProgress?.(`frames ${i+1}/${count}`);}
    }
  } finally { await atomicJSON(manifestFile,index); }
  return {reused,rendered,count};
}

export async function encodeFrames({frames,output,audio,width,height,duration,fps}) {
  const audioInput=audio?['-i',audio]:['-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000'];
  if(audio){
    const meta=JSON.parse(await run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',audio]));
    if(!meta.streams.some(s=>s.codec_type==='audio')||Number(meta.format.duration)<duration-.02)throw new Error('Audio must cover the complete timeline.');
  }
  await run('ffmpeg',['-v','error','-y','-framerate',String(fps),'-i',path.join(frames,'frame-%06d.png'),...audioInput,'-map','0:v:0','-map','1:a:0','-frames:v',String(Math.round(duration*fps)),'-t',String(duration),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-vf','setsar=1','-threads','4','-c:a','aac','-b:a','128k','-movflags','+faststart',output]);
  const report=await inspectVideo(output,{width,height,duration,fps});
  await run('ffmpeg',['-v','error','-xerror','-i',output,'-f','null','-']);
  const bytes=await readFile(output);
  if(bytes.indexOf(Buffer.from('moov'))<0||bytes.indexOf(Buffer.from('moov'))>bytes.indexOf(Buffer.from('mdat')))throw new Error('Missing faststart metadata.');
  return {...report,fullDecodePassed:true,faststart:true};
}
