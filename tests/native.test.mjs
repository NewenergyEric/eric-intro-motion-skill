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
