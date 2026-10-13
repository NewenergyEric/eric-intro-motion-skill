import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {textBox} from './text.mjs';
import {png,run} from './render.mjs';
import {parseArgs} from './cli.mjs';
import {assertNativeAudit,assertRecomposed} from '../../social-motion/scripts/native-audit.mjs';
import {digest,engineHash,cacheKeys,verifiedFile,readJSON,atomicJSON,renderCachedFrames,encodeFrames} from './native-cache.mjs';

export const RATIOS={square:[1080,1080],portrait:[1080,1440],vertical:[1080,1920]};
const C={paper:'#f4f0e7',ink:'#1f3436',muted:'#647778',accent:'#bd4c31',yellow:'#f3d994',line:'#c7cdc3',white:'#fffdf7',sage:'#dbe4cc'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const rect=(b,fill,stroke=C.line,r=20)=>`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const ease=n=>1-Math.pow(1-Math.max(0,Math.min(1,n)),3);
const union=boxes=>{const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));return{x,y,w:Math.max(...boxes.map(b=>b.x+b.w))-x,h:Math.max(...boxes.map(b=>b.y+b.h))-y};};

export function validateIntro(recipe) {
  if(recipe.schemaVersion!==3||!/^[a-z0-9][a-z0-9-]{0,60}$/.test(recipe.id))throw new Error('Native intro needs schemaVersion 3 and a safe id.');
  if(!Array.isArray(recipe.scenes)||!recipe.scenes.length||recipe.scenes.length>12)throw new Error('Use 1–12 scenes.');
  for(const language of ['zh','en'])if(typeof recipe.brand?.[language]!=='string'||!recipe.brand[language].trim())throw new Error('Provide brand copy for zh and en.');
  for(const scene of recipe.scenes){
    if(!['capture','tag','save','return'].includes(scene.template))throw new Error('Unknown intro template.');
    if(!Number.isFinite(scene.seconds)||scene.seconds<3||scene.seconds>30)throw new Error('Use 3–30 seconds per scene.');
    for(const language of ['zh','en'])for(const key of ['title','note','action','detail','caption'])if(typeof scene[language]?.[key]!=='string'||!scene[language][key].trim())throw new Error(`Missing ${language}.${key} copy.`);
  }
  return recipe;
}

// All positions below are native canvas units. No master-canvas scale transform.
export function makeIntro(recipe,{ratio='square',language='en'}={}) {
  validateIntro(recipe);
  if(!RATIOS[ratio]||!['zh','en'].includes(language))throw new Error('Unknown ratio or language.');
  const [width,height]=RATIOS[ratio];
  const layouts={
    square:{a:{x:64,y:378,w:526,h:456},b:{x:650,y:444,w:366,h:330},title:{x:64,y:148,w:952,h:190}},
    portrait:{a:{x:64,y:384,w:952,h:472},b:{x:64,y:934,w:760,h:274},title:{x:64,y:156,w:952,h:192}},
    vertical:{a:{x:142,y:496,w:796,h:616},b:{x:64,y:1302,w:952,h:330},title:{x:64,y:192,w:952,h:252}}
  };
  const l=layouts[ratio],titleSize=language==='en'?(ratio==='vertical'?68:60):(ratio==='vertical'?76:68);
  let elapsed=0;
  const scenes=recipe.scenes.map((s,i)=>{
    const copy=s[language],rows=[],texts=[];
    const add=(id,value,b,size,options={})=>{
      const {containerId,...style}=options;
      const rendered=textBox(value,b,{size,minSize:size,color:C.ink,weight:450,field:`scene ${i+1}/${language}/${ratio}/${id}`,...style});
      rows.push({id,kind:'text',text:value,bounds:b,textBounds:union(rendered.bounds),...(containerId?{containerId}:{}),out:false,overflow:false});
      texts.push({id,svg:rendered.svg});return rendered.svg;
    };
    rows.push({id:'note-card',kind:'layer',bounds:l.a,out:false,overflow:false},{id:'action-card',kind:'layer',bounds:l.b,out:false,overflow:false});
    const brand=add('brand',recipe.brand[language],{x:64,y:60,w:760,h:42},25,{weight:650});
    const title=add('title',copy.title,l.title,titleSize,{weight:650,lineHeight:1.2});
    const caption=add('caption',copy.caption,{x:64,y:height-156,w:900,h:94},32,{color:C.muted});
    const a=l.a,b=l.b;
    const label=add('note-label',language==='en'?'ONE SMALL THOUGHT':'一件小事',{x:a.x+32,y:a.y+30,w:a.w-64,h:40},21,{color:C.accent,weight:650,containerId:'note-card'});
    const note=add('note',copy.note,{x:a.x+32,y:a.y+104,w:a.w-64,h:a.h-202},language==='en'?42:44,{weight:550,lineHeight:1.42,containerId:'note-card'});
    const detail=add('detail',copy.detail,{x:a.x+32,y:a.y+a.h-72,w:a.w-64,h:45},23,{color:C.muted,containerId:'note-card'});
    const step=add('step',`${String(i+1).padStart(2,'0')} / ${String(recipe.scenes.length).padStart(2,'0')}`,{x:b.x+28,y:b.y+30,w:b.w-56,h:36},22,{color:C.accent,weight:650,containerId:'action-card'});
    const action=add('action',copy.action,{x:b.x+28,y:b.y+98,w:b.w-56,h:b.h-124},language==='en'?38:42,{weight:650,lineHeight:1.4,containerId:'action-card'});
    const start=elapsed;elapsed+=s.seconds;
    const ac={x:a.x+a.w/2,y:a.y+a.h/2},bc={x:b.x+b.w/2,y:b.y+b.h/2};
    const connector=ratio==='square'?`M${a.x+a.w+4} ${ac.y} C${a.x+a.w+65} ${ac.y-70} ${b.x-65} ${bc.y-70} ${b.x-4} ${bc.y}`:`M${ac.x} ${a.y+a.h+4} C${ac.x+85} ${a.y+a.h+95} ${bc.x-85} ${b.y-95} ${bc.x} ${b.y-4}`;
    return {index:i,start,end:elapsed,seconds:s.seconds,template:s.template,rows,draw(t){
      const p=ease(t/.65),q=ease((t-.18)/.7),aDX=ratio==='square'?(1-p)*-44:0,aDY=ratio==='square'?0:(1-p)*40;
      const bDX=ratio==='portrait'?(1-q)*36:0,bDY=ratio==='portrait'?0:(1-q)*26;
      const progress=Math.max(0,Math.min(1,(t-.35)/.7));
      const tag=s.template==='tag'?`<path d="M${a.x+a.w-64} ${a.y+23} l34 0 0 45 -17 -10 -17 10z" fill="${C.accent}"/>`:'';
      const saved=['save','return'].includes(s.template)?`<circle cx="${a.x+a.w-44}" cy="${a.y+48}" r="17" fill="${C.sage}"/><path d="M${a.x+a.w-53} ${a.y+48} l6 6 12 -14" fill="none" stroke="${C.ink}" stroke-width="3"/>`:'';
      // Stable copy holds for reading. Motion explains arrival, association and saving.
      return brand+title+caption+`<path d="${connector}" fill="none" stroke="${C.accent}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-progress}"/><g opacity="${p}" transform="translate(${aDX} ${aDY})">${rect(a,C.white)}${label}${note}${detail}${tag}${saved}</g><g opacity="${q}" transform="translate(${bDX} ${bDY})">${rect(b,s.template==='save'?C.sage:C.yellow,'none')}${step}${action}</g>`;
    }};
  });
  return {width,height,duration:elapsed,scenes,frame(t){
    const scene=scenes.find(s=>t<s.end)||scenes.at(-1),local=t-scene.start;
    const transition=local<.22&&scene.index>0?local/.22:1;
    const previous=transition<1?`<g opacity="${1-transition}">${scenes[scene.index-1].draw(scenes[scene.index-1].seconds-.01)}</g>`:'';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${escape(recipe.brand[language])}</title><rect width="${width}" height="${height}" fill="${C.paper}"/><path d="M64 116H1016" stroke="${C.line}" stroke-width="2"/><circle cx="1002" cy="77" r="13" fill="${C.accent}"/>${previous}<g opacity="${transition}">${scene.draw(local)}</g><rect x="64" y="${height-44}" width="${952*Math.min(1,t/elapsed)}" height="4" fill="${C.accent}"/></svg>`;
  }};
}

export function introAudit(composition,{sourceHash,fps=30}) {
  const report={schemaVersion:2,mode:'native',embeddedMasterVideo:false,sourceHash,width:composition.width,height:composition.height,errors:[],samples:composition.scenes.map(s=>({scene:s.index,frame:Math.round((s.end-.6)*fps),width:composition.width,height:composition.height,rows:s.rows,overlaps:[],embeddedMasterVideo:false}))};
  for(const sample of report.samples){
    const rows=sample.rows.filter(r=>r.textBounds);
    for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
      const a=rows[i].textBounds,b=rows[j].textBounds;
      if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>3&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>3)sample.overlaps.push([rows[i].id,rows[j].id]);
    }
  }
  assertNativeAudit(report);return report;
}

export async function renderIntro(recipe,{out,cache,ratios=Object.keys(RATIOS),languages=['zh','en'],stills=false,audio,force=false,fps=30,onProgress=console.log}={}) {
  if(!out)throw new Error('An output directory is required.');
  if(![24,25,30,60].includes(fps)||ratios.length===0||languages.length===0||new Set(ratios).size!==ratios.length||new Set(languages).size!==languages.length)throw new Error('Invalid fps, ratios or languages.');
  const sourceHash=digest((await engineHash())+JSON.stringify(recipe));
  const audioHash=audio?digest(await readFile(audio)):'silent-aac';
  const encoder=(await run('ffmpeg',['-version'])).split('\n')[0];
  const root=path.resolve(out),cacheRoot=path.resolve(cache||path.join(root,'.cache'));
  const jobs=languages.flatMap(language=>ratios.map(ratio=>{
    const composition=makeIntro(recipe,{ratio,language});
    const audit=introAudit(composition,{sourceHash,fps});
    return {language,ratio,composition,audit};
  }));
  // Validate all requested layouts before spending time on frames.
  for(const language of languages){const a=jobs.filter(j=>j.language===language).map(j=>j.audit);if(a.length>1)assertRecomposed(a);}
  await mkdir(root,{recursive:true});
  await atomicJSON(path.join(root,'recipe.json'),recipe);
  const summary={schemaVersion:1,sourceHash,audioMode:audio?'supplied-track':'silent',renderApiCalls:0,outputs:[]};
  for(const {language,ratio,composition:c,audit} of jobs){
    const id=`${recipe.id}-${language}-${ratio}`,dir=path.join(root,id);await mkdir(dir,{recursive:true});
    const {visual,output:key}=cacheKeys({sourceHash,recipe,ratio,language,width:c.width,height:c.height,fps,audioHash,encoder});
    const movie=path.join(dir,'film.mp4'),meta=path.join(dir,'encode.json');
    const previous=await readJSON(meta).catch(()=>null);
    if(!stills&&previous?.key===key&&previous.media?.fullDecodePassed&&await verifiedFile(movie,previous.media.sha256)){
      const entry={id,ratio,language,width:c.width,height:c.height,duration:c.duration,cache:{outputHit:true,framesRendered:0},media:previous.media};summary.outputs.push(entry);onProgress(`CACHE ${id}`);continue;
    }
    if(!stills&&!force&&await access(movie).then(()=>true,()=>false))throw new Error(`Output changed: ${movie}. Use --force or another directory.`);
    await atomicJSON(path.join(dir,'layout-audit.json'),audit);
    for(const s of c.scenes)await writeFile(path.join(dir,`scene-${s.index+1}.png`),png(c.frame(s.end-.6),c.width));
    await writeFile(path.join(dir,'poster.png'),png(c.frame(c.scenes[0].end-.6),c.width));
    const entry={id,ratio,language,width:c.width,height:c.height,duration:c.duration,cache:{outputHit:false}};
    if(!stills){
      const frames=path.join(cacheRoot,visual),stats=await renderCachedFrames(c,{directory:frames,fps,onProgress});
      entry.cache={...entry.cache,framesRendered:stats.rendered,framesReused:stats.reused};
      const temp=path.join(dir,'film.partial.mp4');
      entry.media=await encodeFrames({frames,output:temp,audio,width:c.width,height:c.height,duration:c.duration,fps});
      const {rename}=await import('node:fs/promises');await rename(temp,movie);
      await atomicJSON(meta,{key,visual,sourceHash,audioHash,...entry});
      // Inspect actual compressed frames, including both sides of every boundary.
      const samples=c.scenes.flatMap(s=>[{label:`scene-${s.index+1}-enter`,frame:Math.round((s.start+.35)*fps)},{label:`scene-${s.index+1}-hold`,frame:Math.round((s.end-.6)*fps)},...(s.index?[{label:`cut-${s.index}-before`,frame:Math.round(s.start*fps)-1},{label:`cut-${s.index}-after`,frame:Math.round(s.start*fps)+1}]:[])]);
      for(const s of samples)await run('ffmpeg',['-v','error','-y','-i',movie,'-vf',`select=eq(n\\,${s.frame}),scale=360:-1`,'-frames:v','1','-update','1',path.join(dir,s.label+'.jpg')]);
      await atomicJSON(path.join(dir,'encoded-samples.json'),{sourceHash,sha256:entry.media.sha256,samples});
    }
    summary.outputs.push(entry);onProgress(`VERIFIED ${id}`);
  }
  await atomicJSON(path.join(root,stills?'layout-summary.json':'manifest.json'),summary);return summary;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  try {
    const a=parseArgs(process.argv.slice(2),['input','out','cache','ratios','languages','audio','fps'],['stills','force']);
    if(!a.input)throw new Error('Use --input recipe.json --out output [--stills] [--ratios square,portrait,vertical] [--languages zh,en] [--cache directory] [--audio track.wav] [--force].');
    await renderIntro(await readJSON(a.input),{...a,ratios:a.ratios?.split(','),languages:a.languages?.split(','),fps:a.fps?Number(a.fps):30});
  } catch(e){console.error(e.message);process.exitCode=1;}
}
