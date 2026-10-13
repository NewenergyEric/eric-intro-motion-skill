import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// A layout report is evidence supplied by the source renderer. This validates
// that evidence; it cannot infer editable layers or visual quality from pixels.
export function assertNativeAudit(report) {
  if(report.mode!=='native'||report.embeddedMasterVideo!==false)
    throw new Error('Native adaptation requires independent source layers. Framing, backdrop, crop and a scaled master do not qualify.');
  if(!report.sourceHash||![report.width,report.height].every(n=>Number.isFinite(n)&&n>0))throw new Error('Missing source hash or canvas geometry.');
  if(!Array.isArray(report.samples)||!report.samples.length)throw new Error('Missing measured layout samples.');
  if(report.errors?.length)throw new Error('Layout report contains failures.');
  let textCount=0,layerCount=0;
  const frames=new Set();
  for(const sample of report.samples){
    if(!Number.isInteger(sample.frame)||sample.frame<0||frames.has(sample.frame))throw new Error('Invalid or duplicate sample frame.');
    frames.add(sample.frame);
    if(sample.width!==report.width||sample.height!==report.height)throw new Error('Sample canvas does not match output.');
    if(sample.embeddedMasterVideo||sample.overlaps?.length)throw new Error('Flattened master or overlapping text in sample.');
    if(!Array.isArray(sample.rows)||!sample.rows.length)throw new Error('Sample has no measured layers.');
    const ids=new Set();
    for(const row of sample.rows){
      if(!row.id||ids.has(row.id))throw new Error('Missing or duplicate layer id.');
      ids.add(row.id);
      const b=row.bounds;
      if(!b||!['x','y','w','h'].every(k=>Number.isFinite(b[k]))||b.w<=0||b.h<=0)throw new Error('Invalid measured bounds: '+row.id);
      if(row.out||row.overflow||b.x< -2||b.y< -2||b.x+b.w>report.width+2||b.y+b.h>report.height+2)throw new Error('Clipped or overflowing layer: '+row.id);
      if(row.textBounds){
        const t=row.textBounds;
        if(!['x','y','w','h'].every(k=>Number.isFinite(t[k]))||t.w<=0||t.h<=0)throw new Error('Invalid glyph bounds: '+row.id);
        const parent=row.containerId?sample.rows.find(r=>r.id===row.containerId)?.bounds:b;
        if(!parent)throw new Error('Missing text container: '+row.containerId);
        if(t.x<parent.x-3||t.y<parent.y-3||t.x+t.w>parent.x+parent.w+3||t.y+t.h>parent.y+parent.h+3)throw new Error('Text exceeds its container: '+row.id);
      }
      if(row.kind==='text'&&row.text)textCount++;else if(row.kind==='layer')layerCount++;
    }
  }
  if(!textCount||!layerCount)throw new Error('Measure both text and independent visual layers.');
  return {passed:true,samples:report.samples.length,textCount,layerCount,visualReviewRequired:true};
}

// A global scale + translation keeps the center-to-center vectors proportional.
// Require evidence in EVERY measured scene, not just somewhere in the film.
export function assertRecomposed(reports){
  reports.forEach(assertNativeAudit);
  if(reports.length<2)throw new Error('Compare at least two target ratios.');
  const signatures=new Set(reports.map(r=>(r.width/r.height).toFixed(6)));
  if(signatures.size<2)throw new Error('Need different aspect ratios.');
  const first=reports[0];
  for(const other of reports.slice(1)){
    if(first.sourceHash!==other.sourceHash)throw new Error('Cannot compare different source revisions.');
    if(first.samples.length!==other.samples.length||first.samples.some(a=>!other.samples.some(b=>b.frame===a.frame)))throw new Error('Every ratio must measure the same scene frames.');
    for(const a of first.samples){
      let changed=false;
      const b=other.samples.find(s=>s.frame===a.frame);
      const copy=sample=>Object.fromEntries(sample.rows.filter(r=>r.kind==='text').map(r=>[r.id,r.text.replace(/\s+/g,'')]));
      const ac=copy(a),bc=copy(b);
      if(Object.keys(ac).length!==Object.keys(bc).length||Object.entries(ac).some(([id,text])=>bc[id]!==text))throw new Error('Text content was lost or changed across ratios.');
      const shared=a.rows.filter(r=>r.kind==='layer').map(r=>[r,b.rows.find(s=>s.kind==='layer'&&s.id===r.id)]).filter(([,s])=>s);
      if(shared.length!==a.rows.filter(r=>r.kind==='layer').length||shared.length!==b.rows.filter(r=>r.kind==='layer').length)throw new Error('Visual layers were lost across ratios.');
      for(let i=0;i<shared.length;i++)for(let j=i+1;j<shared.length;j++){
        const center=r=>[r.bounds.x+r.bounds.w/2,r.bounds.y+r.bounds.h/2];
        const a1=center(shared[i][0]),a2=center(shared[j][0]),b1=center(shared[i][1]),b2=center(shared[j][1]);
        const av=[a2[0]-a1[0],a2[1]-a1[1]],bv=[b2[0]-b1[0],b2[1]-b1[1]];
        const al=Math.hypot(...av),bl=Math.hypot(...bv);
        if(al>10&&bl>10&&Math.abs(av[0]*bv[1]-av[1]*bv[0])/(al*bl)>.07)changed=true;
        const ar=shared[i][0].bounds.w/shared[j][0].bounds.w,br=shared[i][1].bounds.w/shared[j][1].bounds.w;
        if(Math.abs(ar/br-1)>.08)changed=true;
      }
      if(!changed)throw new Error(`No independent re-layout evidence at frame ${a.frame}; this may be a uniformly scaled/translated master.`);
    }
  }
  return {passed:true,ratios:reports.map(r=>`${r.width}:${r.height}`),visualReviewRequired:true};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const files=process.argv.slice(2);if(!files.length)throw new Error('Usage: node native-audit.mjs layout-audit.json [another-ratio.json ...]');const reports=await Promise.all(files.map(async f=>JSON.parse(await readFile(f,'utf8'))));console.log(JSON.stringify(files.length>1?assertRecomposed(reports):assertNativeAudit(reports),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
}
