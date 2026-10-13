import {readFile,mkdir,access,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {run,probe} from './render.mjs';
import {parseArgs} from './cli.mjs';
import {digest,atomicJSON} from './native-cache.mjs';

export async function replaceAudio({video,audio,out}) {
  if(!video||!audio||!out)throw new Error('video, audio and out are required.');
  const target=path.resolve(out);
  if([video,audio].some(p=>path.resolve(p)===target))throw new Error('Use a new output path; inputs are preserved.');
  if(await access(target).then(()=>true,()=>false))throw new Error('Output already exists.');
  const before=await probe(video),sound=await probe(audio),v=before.streams.find(s=>s.codec_type==='video');
  const duration=Number(v?.duration||before.format.duration);
  if(v?.codec_name!=='h264'||!sound.streams.some(s=>s.codec_type==='audio')||!Number.isFinite(duration)||Number(sound.format.duration)<duration-.02)throw new Error('Need H.264 video and an audio track covering its duration.');
  const streamHash=file=>run('ffmpeg',['-v','error','-i',file,'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-']);
  await mkdir(path.dirname(target),{recursive:true});
  const temp=target+'.partial.mp4';
  try {
    await run('ffmpeg',['-v','error','-n','-i',video,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart',temp]);
    const [a,b]=await Promise.all([streamHash(video),streamHash(temp)]);
    if(a!==b)throw new Error('Video stream changed during audio replacement.');
    await run('ffmpeg',['-v','error','-xerror','-i',temp,'-f','null','-']);
    const after=await probe(temp),av=after.streams.find(s=>s.codec_type==='video');
    if(av.nb_read_frames!==v.nb_read_frames||Math.abs(Number(after.format.duration)-duration)>.12)throw new Error('Timeline changed during audio replacement.');
    await rename(temp,target);
    const report={videoStreamUnchanged:true,videoStreamHash:a.trim(),audioHash:digest(await readFile(audio)),sha256:digest(await readFile(target)),duration,fullDecodePassed:true};
    await atomicJSON(target+'.audio.json',report);return report;
  } catch(e){await rm(temp,{force:true});throw e;}
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const args=parseArgs(process.argv.slice(2),['video','audio','out'],[]);
  replaceAudio(args).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
