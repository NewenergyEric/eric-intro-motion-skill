import { readFile,writeFile,mkdir,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './cli.mjs';
import { makeClip,moduleCatalog,validateRecipe } from './timeline-core.mjs';
import { renderStory,run,png,inspectVideo } from './render.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const exists = file => access(file).then(()=>true,()=>false);
const presets=JSON.parse(await readFile(new URL('../../social-motion/assets/presets.json',import.meta.url),'utf8')).presets;

async function engineSignature() {
  const files=['compose.mjs','timeline-core.mjs','render.mjs','text.mjs','modules/profile.mjs','modules/references.mjs','../assets/modules.json','../assets/fonts/NotoSansSC.ttf','../package-lock.json'];
  return hash(JSON.stringify(await Promise.all(files.map(async f=>hash(await readFile(new URL(f,import.meta.url))))))+(await run('ffmpeg',['-version'])).split('\n')[0]+process.platform+process.arch);
}
export async function compose(recipe, {out,cache,preset='moments',width,height,formats=['mp4','gif'],force=false,onProgress}={}) {
  const requestStarted=Date.now();
  validateRecipe(recipe);
  if(!out) throw new Error('out is required.');
  if(!presets[preset]) throw new Error(`Unknown preset: ${preset}`);
  if(formats.some(f=>!['mp4','gif','png'].includes(f))||!formats.length) throw new Error('Use formats mp4,gif,png.');
  const geometry={...presets[preset],width:width??presets[preset].width,height:height??presets[preset].height,language:recipe.language};
  const compositions=recipe.clips.map(clip=>makeClip(clip,geometry));
  const directory=path.resolve(out),base=path.join(directory,recipe.id),cacheDir=path.resolve(cache||path.join(directory,'.cache'));
  const signature=await engineSignature();
  const key=hash(JSON.stringify({recipe,geometry,formats,signature}));
  const reportFile=base+'.report.json';
  if(await exists(reportFile)) {
    const previous=JSON.parse(await readFile(reportFile,'utf8'));
    if(previous.key===key && await Promise.all(Object.entries(previous.fileHashes||{}).map(async([file,digest])=>await exists(path.join(directory,file))&&hash(await readFile(path.join(directory,file)))===digest)).then(items=>items.length>0&&items.every(Boolean))) {
      onProgress?.('Complete output cache hit; no rendering or encoding.');
      return {...previous,cache:{...previous.cache,outputHit:true,clipsReused:recipe.clips.length,clipsRendered:0},elapsedMs:Date.now()-requestStarted};
    }
  }
  const suffixes=['.mp4','.gif','.png','-safe.png','.recipe.json','.report.json'];
  if(!force) for(const suffix of suffixes) if(await exists(base+suffix)) throw new Error(`Output exists: ${base+suffix}. Use a new directory or --force.`);
  await mkdir(directory,{recursive:true}); await mkdir(cacheDir,{recursive:true});
  const started=Date.now(),fps=30,duration=recipe.clips.reduce((sum,c)=>sum+Math.round(c.seconds*fps)/fps,0);
  const report={schemaVersion:2,key,id:recipe.id,preset,width:geometry.width,height:geometry.height,duration,sourceMode:'reusable-vector-components',platformPreviewVerified:false,cache:{outputHit:false,clipsReused:0,clipsRendered:0},renderApiCalls:0,recipeBytes:Buffer.byteLength(JSON.stringify(recipe)),clips:[],outputs:{},fileHashes:{}};
  const posterIndex=Math.min(1,compositions.length-1),poster=compositions[posterIndex],posterAt=Math.min(2,poster.story.duration*.5);
  await writeFile(base+'.png',png(poster.frame(posterAt),geometry.width));
  await writeFile(base+'-safe.png',png(poster.frame(posterAt,{guide:true}),Math.min(900,geometry.width)));
  await writeFile(base+'.recipe.json',JSON.stringify(recipe,null,2)+'\n');
  const movies=[];
  for(let i=0;i<recipe.clips.length;i++) {
    const clip=recipe.clips[i],composition=compositions[i];
    const clipKey=hash(JSON.stringify({clip,geometry,signature}));
    const clipDir=path.join(cacheDir,clipKey),movie=path.join(clipDir,'clip.mp4'),clipReport=path.join(clipDir,'clip.report.json');
    let hit=false;
    if(await exists(clipReport)&&await exists(movie)) {
      const saved=JSON.parse(await readFile(clipReport,'utf8'));
      hit=saved.outputs?.mp4?.sha256===hash(await readFile(movie));
    }
    if(formats.some(f=>f!=='png')) {
      if(hit) {report.cache.clipsReused++;onProgress?.(`reuse ${clip.module}`);}
      else {
        onProgress?.(`render ${clip.module}`);
        await renderStory({id:'clip',duration:clip.seconds},{...geometry,out:clipDir,formats:['mp4','png'],gifWidth:Math.min(720,geometry.width),force:true,composition});
        report.cache.clipsRendered++;
      }
      movies.push({file:movie,duration:Math.round(clip.seconds*fps)/fps});
    }
    // A poster for every component makes ordering and copy review possible without video playback.
    await writeFile(path.join(directory,`${recipe.id}-scene-${String(i+1).padStart(2,'0')}.png`),png(composition.frame(Math.min(2,clip.seconds*.5)),Math.min(geometry.width,900)));
    report.clips.push({module:clip.module,key:clipKey,seconds:clip.seconds,composition:composition.metadata});
  }
  if(movies.length) {
    const concatFile=path.join(cacheDir,`${key}.concat.txt`);
    await writeFile(concatFile,movies.map(item=>`file '${item.file.replaceAll('\\','/').replaceAll("'","'\\''")}'\nduration ${item.duration}`).join('\n')+'\n');
    const movie=base+'.mp4';
    await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',concatFile,'-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000','-map','0:v:0','-map','1:a:0','-vf',`setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=30,trim=end_frame=${Math.round(duration*fps)},setsar=1`,'-frames:v',String(Math.round(duration*fps)),'-t',String(duration),'-c:v','libx264','-preset','fast','-b:v','1M','-minrate','1M','-maxrate','1M','-bufsize','2M','-x264-params','nal-hrd=cbr','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-threads','4',movie]);
    report.outputs.mp4=await inspectVideo(movie,{width:geometry.width,height:geometry.height,duration,fps});
    if(formats.includes('gif')) {
      const gifWidth=Math.min(600,geometry.width);
      await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',movie,'-filter_complex',`fps=20,scale=${gifWidth}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:reserve_transparent=0[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,'-loop','0','-an',base+'.gif']);
      report.outputs.gif=await inspectVideo(base+'.gif',{width:gifWidth,height:Math.round(geometry.height*gifWidth/geometry.width),duration,fps:20,gif:true});
    }
  }
  for(const suffix of suffixes.filter(s=>s!=='.report.json')) if(await exists(base+suffix)) report.fileHashes[path.basename(base+suffix)]=hash(await readFile(base+suffix));
  report.elapsedMs=Date.now()-started;
  await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
  return report;
}

async function main() {
  if(process.argv.includes('--list')) {console.log(JSON.stringify(moduleCatalog.map(({id,name})=>({id,...name})),null,2));return;}
  if(process.argv.includes('--help')) {console.log('compose.mjs --list | --input recipe.json --out folder [--preset moments|xiaohongshu|vertical|linkedin|x --cache folder --formats mp4,gif,png --force]');return;}
  const args=parseArgs(process.argv.slice(2),['input','out','cache','preset','formats','width','height']);
  if(!args.input||!args.out) throw new Error('--input and --out are required.');
  const report=await compose(JSON.parse(await readFile(args.input,'utf8')),{...args,width:args.width?Number(args.width):undefined,height:args.height?Number(args.height):undefined,formats:args.formats?.split(','),onProgress:console.log});
  console.log(JSON.stringify({id:report.id,cache:report.cache,renderApiCalls:report.renderApiCalls,elapsedMs:report.elapsedMs}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
