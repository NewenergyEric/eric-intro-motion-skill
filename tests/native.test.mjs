import test from 'node:test';
import assert from 'node:assert/strict';
import {assertNativeAudit,assertRecomposed} from '../skills/social-motion/scripts/native-audit.mjs';
import {frameVideo} from '../skills/social-motion/scripts/frame.mjs';
import {reframe} from '../skills/social-motion/scripts/reframe.mjs';

const row=(id,x,y,w,h,kind='layer')=>({id,kind,text:kind==='text'?'Keep the whole story.':undefined,bounds:{x,y,w,h},out:false,overflow:false});
const report=(width,height,rows)=>({mode:'native',embeddedMasterVideo:false,sourceHash:'fixture-sha',width,height,errors:[],samples:[{frame:60,width,height,rows,overlaps:[]}]});

test('framing and crop helpers refuse an implicit native-adaptation request',async()=>{
 await assert.rejects(frameVideo({input:'missing.mp4',out:'out.mp4',copy:{heading:'X'}}),/not native ratio adaptation/);
 await assert.rejects(reframe({input:'missing.mp4',out:'out.mp4'}),/not native ratio adaptation/);
 await assert.rejects(reframe({input:'missing.mp4',out:'out.mp4',mode:'crop',intent:'embed'}),/not native ratio adaptation/);
});
test('native evidence fails for wrappers, missing measurements, overflow and text collisions',()=>{
 const good=report(1080,1080,[row('heading',50,50,700,120,'text'),row('art',50,300,400,300),row('steps',550,300,450,300)]);
 assert.equal(assertNativeAudit(good).passed,true);
 assert.throws(()=>assertNativeAudit({...good,mode:'frame'}),/independent source layers/);
 assert.throws(()=>assertNativeAudit({...good,embeddedMasterVideo:true}),/independent source layers/);
 assert.throws(()=>assertNativeAudit({...good,samples:[]}),/Missing measured/);
 const bad=structuredClone(good);bad.samples[0].rows[1].bounds.x=1000;
 assert.throws(()=>assertNativeAudit(bad),/overflowing/);
 const collision=structuredClone(good);collision.samples[0].overlaps=[['heading','caption']];
 assert.throws(()=>assertNativeAudit(collision),/overlapping/);
});
test('independent re-layout passes while a uniformly scaled master fails',()=>{
 const wide=report(1920,1080,[row('heading',64,80,700,120,'text'),row('art',64,300,720,500),row('steps',960,300,800,500)]);
 const native=report(1080,1920,[row('heading',64,100,952,200,'text'),row('art',64,400,952,620),row('steps',64,1100,952,600)]);
 assert.equal(assertRecomposed([wide,native]).passed,true);
 const lostCopy=structuredClone(native);lostCopy.samples[0].rows[0].text='Only part of the story.';
 assert.throws(()=>assertRecomposed([wide,lostCopy]),/Text content was lost/);
 const scaled=report(1080,1920,wide.samples[0].rows.map(r=>({...r,bounds:{x:r.bounds.x*.5+60,y:r.bounds.y*.5+500,w:r.bounds.w*.5,h:r.bounds.h*.5}})));
 assert.throws(()=>assertRecomposed([wide,scaled]),/uniformly scaled/);
});

test('every scene must reflow, preserve its layers, and use the same revision and sample frames',()=>{
 const a=report(1080,1080,[row('title',50,50,700,120,'text'),row('note',60,300,450,400),row('action',600,300,400,400)]);
 const b=report(1080,1920,[row('title',50,70,900,120,'text'),row('note',60,400,900,500),row('action',60,1200,700,400)]);
 const early=structuredClone(a.samples[0]);early.frame=180;a.samples.push(early);
 const unchanged=structuredClone(early);unchanged.width=b.width;unchanged.height=b.height;b.samples.push(unchanged);
 assert.throws(()=>assertRecomposed([a,b]),/frame 180/);
 b.samples[1]=structuredClone(b.samples[0]);b.samples[1].frame=180;
 assert.equal(assertRecomposed([a,b]).passed,true);
 assert.throws(()=>assertRecomposed([a,{...b,sourceHash:'other'}]),/source revisions/);
 assert.throws(()=>assertRecomposed([a,{...b,samples:[b.samples[0]]}]),/same scene frames/);
 const lost=structuredClone(b);lost.samples[1].rows=lost.samples[1].rows.filter(r=>r.id!=='action');
 assert.throws(()=>assertRecomposed([a,lost]),/Visual layers were lost/);
});

test('glyphs must remain inside declared UI containers, including vertical overflow',()=>{
 const r=report(1080,1080,[row('label',70,70,400,80,'text'),row('card',60,60,440,160)]);
 r.samples[0].rows[0].containerId='card';r.samples[0].rows[0].textBounds={x:70,y:70,w:400,h:55};
 assert.equal(assertNativeAudit(r).passed,true);
 r.samples[0].rows[0].textBounds.y=190;
 assert.throws(()=>assertNativeAudit(r),/Text exceeds its container/);
});
