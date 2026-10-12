import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from '../../motion-story/scripts/cli.mjs';
import {textBox} from '../../motion-story/scripts/text.mjs';
import {probe,run,png,inspectVideo} from '../../motion-story/scripts/render.mjs';
const presets=JSON.parse(await readFile(new URL('../assets/presets.json',import.meta.url),'utf8')).presets;
const hash=data=>createHash('sha256').update(data).digest('hex');
const exists=file=>access(file).then(()=>true,()=>false);
export function makeFrame(copy,video,preset='moments') {
  if(!presets[preset]) throw new Error(`Unknown preset: ${preset}`);
  const {width:w,height:h}=presets[preset],s=w/1080;
  const colors={background:'#f8f4ed',ink:'#17233b',accent:'#007d86',muted:'#526578',...copy.colors};
  if(Object.values(colors).some(color=>!/^#[0-9a-f]{6}$/i.test(color))) throw new Error('Colors must be six-digit hex strings.');
  const top=h*.09,margin=72*s;
  const title=textBox(copy.heading,{x:margin,y:top+45*s,w:w-2*margin,h:146*s},{size:49*s,minSize:40*s,weight:650,color:colors.ink,field:'heading'});
  const eyebrow=textBox(copy.eyebrow||'',{x:margin,y:top,w:w-2*margin,h:33*s},{size:20*s,weight:650,color:colors.accent,field:'eyebrow'});
  const rotation=video.side_data_list?.find(item=>item.rotation!==undefined)?.rotation||0;
  const sar=(video.sample_aspect_ratio||'1:1').split(':').map(Number);
  let ratio=video.width*(sar[0]>0&&sar[1]>0?sar[0]/sar[1]:1)/video.height;
  if(Math.abs(rotation)%180===90) ratio=1/ratio;
  const box={x:36*s,y:top+210*s,w:w-72*s,h:h-(top+210*s)-h*.19};
  // Keep exact integer aspect units when possible (e.g. 1008×567 for 16:9).
  // The foreground may have an odd height; the final H.264 canvas stays even.
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  let rw=video.width*(sar[0]>0?sar[0]:1),rh=video.height*(sar[1]>0?sar[1]:1);
  if(Math.abs(rotation)%180===90) [rw,rh]=[rh,rw];
  const divisor=gcd(rw,rh);rw/=divisor;rh/=divisor;
  const unit=Math.floor(Math.min(box.w/rw,box.h/rh));
  const vh=unit?unit*rh:Math.round(Math.min(box.h,box.w/ratio)),vw=unit?unit*rw:Math.round(vh*ratio);
  if(vw<2||vh<2) throw new Error('Source does not fit the frame.');
  const media={x:Math.round((w-vw)/2),y:Math.round(box.y+(box.h-vh)/2),width:vw,height:vh};
  const caption=textBox(copy.caption||'',{x:margin,y:h-h*.15,w:w-2*margin,h:100*s},{size:27*s,minSize:25*s,color:colors.muted,field:'caption'});
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${colors.background}"/><circle cx="${w}" cy="${h*.46}" r="${w*.55}" fill="${colors.accent}" opacity=".045"/><path d="M${margin} ${top-20*s}H${margin+55*s}" stroke="${colors.accent}" stroke-width="5"/>${eyebrow.svg}${title.svg}${caption.svg}<rect x="${media.x-1}" y="${media.y-1}" width="${vw+2}" height="${vh+2}" fill="none" stroke="${colors.accent}" stroke-opacity=".25"/></svg>`;
  return {width:w,height:h,media,svg,text:[title,eyebrow,caption].map(({svg,...item})=>item)};
}
export async function frameVideo({input,out,copy,preset='moments',force=false,preview=false,intent='native'}) {
  if(intent!=='embed') throw new Error('frameVideo embeds finished footage; it is not native ratio adaptation. Use source layers, or explicitly select intent: "embed" / --intent embed.');
  if(!input||!out||!copy||typeof copy.heading!=='string') throw new Error('input, out and copy.heading are required.');
  const sourceFile=path.resolve(input),file=path.resolve(out);
  if(sourceFile.toLowerCase()===file.toLowerCase()) throw new Error('The source will not be overwritten.');
  if(!file.endsWith('.mp4')) throw new Error('out must end in .mp4.');
  const sourceSha256=hash(await readFile(sourceFile));
  const signature=hash(Buffer.concat(await Promise.all([import.meta.url,new URL('../../motion-story/scripts/text.mjs',import.meta.url),new URL('../../motion-story/scripts/render.mjs',import.meta.url),new URL('../assets/presets.json',import.meta.url),new URL('../../motion-story/assets/fonts/NotoSansSC.ttf',import.meta.url)].map(url=>readFile(new URL(url))))));
  const key=hash(JSON.stringify({sourceSha256,copy,preset,signature,preview,ffmpeg:(await run('ffmpeg',['-version'])).split('\n')[0]}));
  const reportFile=file+'.report.json';
  if(await exists(reportFile)&&await exists(file)) {
    const report=JSON.parse(await readFile(reportFile,'utf8'));
    if(report.key===key&&report.output?.sha256===hash(await readFile(file))) return {...report,cacheHit:true};
  }
  if(!force) for(const suffix of ['', '.report.json','.png','.frame.png']) if(await exists(file+suffix)) throw new Error(`Output exists: ${file+suffix}. Use a new path or --force.`);
  const source=await probe(sourceFile),video=source.streams.find(s=>s.codec_type==='video');
  if(!video) throw new Error('No video stream.');
  const duration=Number(video.duration||source.format.duration),frames=Math.round(duration*30);
  if(!Number.isFinite(duration)||duration<=0) throw new Error('Invalid source duration.');
  const plan=makeFrame(copy,video,preset);
  await mkdir(path.dirname(file),{recursive:true});
  const background=file+'.frame.png';
  await writeFile(background,png(plan.svg,plan.width));
  const hasAudio=source.streams.some(s=>s.codec_type==='audio');
  const filters=`[1:v]scale=${plan.media.width}:${plan.media.height}:flags=lanczos,setsar=1,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=30,trim=end_frame=${frames}[fg];[0:v][fg]overlay=${plan.media.x}:${plan.media.y}:shortest=1,setsar=1,format=yuv420p[v]`;
  const args=['-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',background,'-i',sourceFile];
  if(!hasAudio) args.push('-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000');
  args.push('-filter_complex',filters,'-map','[v]');
  if(preview) args.push('-ss',String(Math.min(2,duration*.3)),'-frames:v','1','-update','1',file+'.png');
  else {
    args.push('-map',hasAudio?'1:a:0':'2:a:0','-af','apad','-frames:v',String(frames),'-t',String(frames/30),'-c:v','libx264','-preset','fast');
    if(preset==='linkedin') args.push('-b:v','4M','-minrate','4M','-maxrate','4M','-bufsize','8M','-x264-params','nal-hrd=cbr');
    else args.push('-crf','18');
    args.push('-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-threads','4',file);
  }
  await run('ffmpeg',args);
  const report={key,preset,cacheHit:false,renderApiCalls:0,sourceSha256,sourceSeconds:duration,preservesFullSourceFrame:true,addsBlackPadding:false,nativeReflow:false,platformPreviewVerified:false,sourceTextReadabilityVerified:false,sourceAudioPreserved:hasAudio,frame:{width:plan.width,height:plan.height,media:plan.media,text:plan.text},copy};
  if(!preview) {
    report.output=await inspectVideo(file,{width:plan.width,height:plan.height,duration:frames/30,fps:30});
    await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(Math.min(2,duration*.3)),'-i',file,'-frames:v','1','-update','1',file+'.png']);
  }
  await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
  return report;
}
async function main(){
  if(process.argv.includes('--help')) {console.log('frame.mjs --intent embed --input source.mp4 --copy copy.json --out framed.mp4 [--preset moments|xiaohongshu|vertical --preview --force]');return;}
  const args=parseArgs(process.argv.slice(2),['input','copy','out','preset','intent'],['preview','force']);
  const result=await frameVideo({...args,copy:JSON.parse(await readFile(args.copy,'utf8'))});
  console.log(JSON.stringify({preset:result.preset,cacheHit:result.cacheHit,output:result.output}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
