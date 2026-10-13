import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from './cli.mjs';
import {probe,run,inspectVideo} from './render.mjs';
const hash=data=>createHash('sha256').update(data).digest('hex');
const exists=file=>access(file).then(()=>true,()=>false);
export async function assembleMedia(recipe,{directory='.',out,force=false}={}) {
  if(recipe.schemaVersion!==1||!Array.isArray(recipe.clips)||!recipe.clips.length||recipe.clips.length>30) throw new Error('Expected schemaVersion 1 and 1–30 media clips.');
  if(!out||!out.endsWith('.mp4')) throw new Error('out must end in .mp4.');
  const sources=new Map(),segments=[];
  for(const clip of recipe.clips) {
    if(typeof clip.file!=='string'||!Number.isFinite(clip.from)||clip.from<0||!Number.isFinite(clip.seconds)||clip.seconds<.1) throw new Error('Each clip needs file, from ≥ 0 and seconds ≥ 0.1.');
    const file=path.resolve(directory,clip.file);
    if(file.toLowerCase()===path.resolve(out).toLowerCase()) throw new Error('The source will not be overwritten.');
    if(!sources.has(file)) {
      const data=await probe(file),v=data.streams.find(s=>s.codec_type==='video');
      if(!v) throw new Error('Source has no video.');
      const sar=v.sample_aspect_ratio?.split(':').map(Number)||[1,1];
      if(sar[0]!==sar[1]&&sar[0]>0) throw new Error('Normalize non-square pixels before assembly.');
      if(v.side_data_list?.some(item=>Math.abs(item.rotation||0)%180===90)) throw new Error('Normalize rotation before assembly.');
      sources.set(file,{file,sha256:hash(await readFile(file)),width:v.width,height:v.height,duration:Number(v.duration||data.format.duration),audio:data.streams.some(s=>s.codec_type==='audio')});
    }
    const source=sources.get(file);
    if(clip.from+clip.seconds>source.duration+.035) throw new Error('Clip extends beyond its source.');
    segments.push({...clip,source,frames:Math.round(clip.seconds*30)});
  }
  const first=segments[0].source,{width,height}=first;
  if(width%2||height%2) throw new Error('Use an even source canvas for H.264.');
  for(const {source} of segments) if(Math.abs(source.width/source.height-width/height)>.001) throw new Error('Mixed aspect ratios: frame each source to one canvas before assembly.');
  const signature=hash(await readFile(new URL(import.meta.url)));
  const key=hash(JSON.stringify({recipe,sources:[...sources.values()],signature,ffmpeg:(await run('ffmpeg',['-version'])).split('\n')[0]}));
  const reportFile=out+'.report.json';
  if(await exists(out)&&await exists(reportFile)) {
    const previous=JSON.parse(await readFile(reportFile,'utf8'));
    if(previous.key===key&&previous.output.sha256===hash(await readFile(out))) return {...previous,cacheHit:true};
  }
  if(!force&&(await exists(out)||await exists(reportFile))) throw new Error('Output exists. Use a new path or --force.');
  await mkdir(path.dirname(path.resolve(out)),{recursive:true});
  const args=['-hide_banner','-loglevel','error','-y'];
  const filters=[],streams=[];
  for(const [i,clip] of segments.entries()) {
    args.push('-i',clip.source.file);
    const seconds=clip.frames/30;
    filters.push(`[${i}:v]trim=start=${clip.from}:duration=${clip.seconds},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=30,trim=end_frame=${clip.frames},scale=${width}:${height},setsar=1,format=yuv420p[v${i}]`);
    filters.push(clip.source.audio?`[${i}:a]atrim=start=${clip.from}:duration=${clip.seconds},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${seconds}[a${i}]`:`anullsrc=r=48000:cl=stereo,atrim=duration=${seconds}[a${i}]`);
    streams.push(`[v${i}][a${i}]`);
  }
  const count=segments.reduce((sum,clip)=>sum+clip.frames,0);
  filters.push(streams.join('')+`concat=n=${segments.length}:v=1:a=1[v][a]`);
  args.push('-filter_complex',filters.join(';'),'-map','[v]','-map','[a]','-frames:v',String(count),'-t',String(count/30),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-threads','4',out);
  await run('ffmpeg',args);
  const output=await inspectVideo(out,{width,height,duration:count/30,fps:30});
  const report={key,cacheHit:false,renderApiCalls:0,newVisualAssets:0,sourceMode:'existing-pixels',sourceAudioPreserved:true,recipe,sourceHashes:[...sources.values()].map(s=>({file:path.relative(directory,s.file).replaceAll('\\','/'),sha256:s.sha256})),output};
  await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
  return report;
}
async function main(){
  if(process.argv.includes('--help')) {console.log('assemble-media.mjs --input edit.json --out remix.mp4 [--force]. Clip paths resolve relative to edit.json.');return;}
  const args=parseArgs(process.argv.slice(2),['input','out']);
  if(!args.input) throw new Error('--input is required.');
  const report=await assembleMedia(JSON.parse(await readFile(args.input,'utf8')),{directory:path.dirname(path.resolve(args.input)),out:args.out,force:args.force});
  console.log(JSON.stringify({cacheHit:report.cacheHit,newVisualAssets:0,output:report.output}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
