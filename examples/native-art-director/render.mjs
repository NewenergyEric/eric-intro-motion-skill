import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill,renderMedia,openBrowser} from '@remotion/renderer';
import {mkdir,readFile,writeFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const val=(k,f)=>args.includes(k)?args[args.indexOf(k)+1]:f;
const selected=val('--only','').split(',').filter(Boolean),isStills=args.includes('--stills'),isShort=args.includes('--short');
const concurrency=Number(val('--concurrency','6'));
if(!Number.isInteger(concurrency)||concurrency<1||concurrency>32)throw new Error('--concurrency must be an integer from 1 to 32.');
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out=path.join(root,'output');await mkdir(out,{recursive:true});
const provenance=JSON.parse(await readFile(path.join(root,'asset-provenance.json'),'utf8'));
for(const asset of provenance.filter(a=>a.path.startsWith('public/'))){
 const actual=createHash('sha256').update(await readFile(path.join(root,asset.path))).digest('hex');
 if(actual!==asset.sha256)throw new Error('Asset changed: '+asset.path+'. Update its SHA-256 in asset-provenance.json, then rerun --stills.');
}
const hash=createHash('sha256');for(const file of (await readdir(path.join(root,'src'))).sort())hash.update(await readFile(path.join(root,'src',file)));hash.update(await readFile(path.join(root,'asset-provenance.json')));const sourceHash=hash.digest('hex');
const renderHash=createHash('sha256').update(sourceHash).update(await readFile(fileURLToPath(import.meta.url))).update(await readFile(path.join(root,'package.json'))).digest('hex');
const encodeProfile={codec:'h264',crf:18,pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'png'};
const rasterHash=createHash('sha256').update(sourceHash+JSON.stringify(encodeProfile)).digest('hex');
console.log('Bundling native layers',sourceHash.slice(0,12));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'.bundle'),rootDir:root});
const browser=await openBrowser('chrome',{browserExecutable:chrome,chromeMode:'chrome-for-testing',logLevel:'error'});
const browserOptions={browserExecutable:chrome,puppeteerInstance:browser,chromeMode:'chrome-for-testing',logLevel:'error',timeoutInMilliseconds:120000};
const compositions=(await getCompositions(serveUrl,browserOptions)).filter(c=>!selected.length||selected.some(s=>c.id.includes(s)));
const run=(cmd,argv)=>new Promise((resolve,reject)=>{const p=spawn(cmd,argv,{windowsHide:true});let stdout='',stderr='';p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr=(stderr+b).slice(-6000));p.on('error',reject);p.on('exit',code=>code?reject(new Error(stderr)):resolve(stdout));});
for(const composition of compositions){
 const dir=path.join(out,composition.id);await mkdir(dir,{recursive:true});
 const auditRows=[];const onBrowserLog=log=>{const at=log.text.indexOf('NATIVE_AUDIT ');if(at>=0)auditRows.push(JSON.parse(log.text.slice(at+13)));};
 const inputs={...composition.defaultProps,audit:true};
 if(isStills){
  const frames=[86,235,355,482,610,700];
  for(const frame of frames){await renderStill({...browserOptions,serveUrl,composition:{...composition,props:inputs},inputProps:inputs,frame,output:path.join(dir,`scene-${frame}.png`),imageFormat:'png',onBrowserLog});console.log(composition.id,'still',frame);}
  if(auditRows.length!==frames.length)throw new Error('Missing DOM audit samples');
  const errors=auditRows.flatMap(a=>[...a.rows.filter(r=>r.out||r.overflow).map(r=>({frame:a.frame,...r})),...a.overlaps.map(pair=>({frame:a.frame,textOverlap:pair}))]);
  const report={composition:composition.id,sourceHash,width:composition.width,height:composition.height,mode:'native',embeddedMasterVideo:false,samples:auditRows,errors};
  await writeFile(path.join(dir,'layout-audit.json'),JSON.stringify(report,null,2));
  console.log('AUDIT',composition.id,errors.length?JSON.stringify(errors):'PASS');
 }else{
  const reportPath=path.join(dir,'encode.json'),outputLocation=path.join(dir,isShort?'sample.mp4':`${composition.id}.mp4`);
  if(!args.includes('--force')&&!isShort){try{const old=JSON.parse(await readFile(reportPath,'utf8'));if(old.sourceHash===sourceHash&&old.renderHash===renderHash&&old.sha256===createHash('sha256').update(await readFile(outputLocation)).digest('hex')){console.log('CACHE',composition.id);continue;}}catch{}}
  const layout=JSON.parse(await readFile(path.join(dir,'layout-audit.json'),'utf8'));
  if(layout.sourceHash!==sourceHash||layout.errors.length)throw new Error('Run and pass --stills for this source before final encoding: '+composition.id);
  let last=-1;
  const rawOutput=path.join(dir,isShort?'sample.raw.mp4':'render.raw.mp4'),rawReport=rawOutput+'.json';
  let reuseRaw=false;try{const old=JSON.parse(await readFile(rawReport,'utf8'));reuseRaw=old.rasterHash===rasterHash&&old.sha256===createHash('sha256').update(await readFile(rawOutput)).digest('hex');}catch{}
  if(!reuseRaw){
   await renderMedia({...browserOptions,serveUrl,composition,inputProps:{...composition.defaultProps,audit:false},outputLocation:rawOutput,...encodeProfile,concurrency,overwrite:true,muted:true,frameRange:isShort?[60,119]:undefined,onProgress:({progress})=>{const n=Math.floor(progress*10);if(n>last){last=n;console.log(composition.id,n*10+'%');}}});
   await writeFile(rawReport,JSON.stringify({rasterHash,sha256:createHash('sha256').update(await readFile(rawOutput)).digest('hex')}));
  }else console.log('REUSE RASTER',composition.id);
  // Remotion's PNG encoder omits SAR metadata. Set square pixels in the H.264
  // bitstream without rescaling or recompressing any frame.
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',rawOutput,'-map','0:v:0','-c','copy','-bsf:v','h264_metadata=sample_aspect_ratio=1/1','-movflags','+faststart',outputLocation]);
  const metadata=JSON.parse(await run('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',outputLocation]));
  const v=metadata.streams.find(s=>s.codec_type==='video'),expected=isShort?60:720;
  if(v.width!==composition.width||v.height!==composition.height||Number(v.nb_read_frames)!==expected||v.pix_fmt!=='yuv420p'||v.codec_name!=='h264'||v.sample_aspect_ratio!=='1:1'||v.r_frame_rate!=='30/1'||Math.abs(Number(v.duration)-expected/30)>.01)throw new Error('Encoded stream validation failed');
  const bytes=await readFile(outputLocation);if(bytes.indexOf(Buffer.from('moov'))>bytes.indexOf(Buffer.from('mdat')))throw new Error('Missing faststart metadata');
  await writeFile(isShort?path.join(dir,'sample-encode.json'):reportPath,JSON.stringify({composition:composition.id,sourceHash,renderHash,sha256:createHash('sha256').update(bytes).digest('hex'),compositionMode:'native',embeddedMasterVideo:false,durationSeconds:expected/30,frames:expected,width:v.width,height:v.height,metadata},null,2));
  console.log('VERIFIED',composition.id,expected,'frames');
 }
}
await browser.close({silent:true});
