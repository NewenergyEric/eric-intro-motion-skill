import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {makeClip,moduleCatalog,validateRecipe} from '../skills/motion-story/scripts/timeline-core.mjs';
import {compose} from '../skills/motion-story/scripts/compose.mjs';
import {assembleMedia} from '../skills/motion-story/scripts/assemble-media.mjs';
import {frameVideo,makeFrame} from '../skills/social-motion/scripts/frame.mjs';
import {png} from '../skills/motion-story/scripts/render.mjs';

test('all reusable modules render in both languages and all social layouts; long copy fails',()=>{
  for(const item of moduleCatalog) for(const language of ['zh','en']) for(const [width,height] of [[1920,1080],[1080,1080],[1080,1350],[1080,1440],[1080,1920]]) {
    const clip={module:item.id,seconds:2,title:item.name[language],subtitle:language==='zh'?'继续试试。':'Keep trying.'};
    validateRecipe({schemaVersion:2,id:'test',language,clips:[clip]});
    const composition=makeClip(clip,{language,width,height});
    assert.ok(png(composition.frame(1.25),300).length>1000);
    assert.ok(composition.metadata.artBounds.x>=0);
  }
  assert.throws(()=>makeClip({module:'profile.product',seconds:2,title:'long '.repeat(1000)}),/overflow/);
  const item=moduleCatalog[0];
  assert.throws(()=>validateRecipe({schemaVersion:2,id:'bad',language:'en',clips:[{module:item.id,seconds:2,title:'X',labels:item.labels.en.map(()=> 'W'.repeat(30))}]}),/wider/);
  const plan=makeFrame({heading:'One scene.\nA new canvas.'},{width:1280,height:720},'xiaohongshu');
  assert.equal(plan.media.width/plan.media.height,16/9);
});

test('encode, reuse unchanged clips, invalidate changed copy, assemble pixels, preserve the source frame',{timeout:180000},async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'motion-reuse-test-'));
  try {
    const recipe={schemaVersion:2,id:'test',language:'en',clips:[{module:'reference.trace',seconds:2,title:'Keep going.'},{module:'reference.stagger',seconds:2,title:'Try again.'}]};
    const options={out:path.join(root,'first'),cache:path.join(root,'cache'),width:640,height:640,formats:['mp4']};
    const first=await compose(recipe,options);
    assert.equal(first.outputs.mp4.frames,120);
    const same=await compose(recipe,options);
    assert.equal(same.cache.outputHit,true);assert.equal(same.cache.clipsRendered,0);
    recipe.clips[1].title='A new thought.';
    const changed=await compose(recipe,{...options,out:path.join(root,'changed')});
    assert.equal(changed.cache.clipsReused,1);assert.equal(changed.cache.clipsRendered,1);
    const source=path.join(options.out,'test.mp4');
    const mediaRecipe={schemaVersion:1,clips:[{file:source,from:2,seconds:1},{file:source,from:0,seconds:1}]};
    const mediaOut=path.join(root,'cut.mp4');
    const cut=await assembleMedia(mediaRecipe,{out:mediaOut});
    assert.equal(cut.output.frames,60);assert.equal(cut.newVisualAssets,0);
    assert.equal((await assembleMedia(mediaRecipe,{out:mediaOut})).cacheHit,true);
    const framed=await frameVideo({input:mediaOut,out:path.join(root,'framed.mp4'),preset:'xiaohongshu',copy:{heading:'A new frame.',caption:'The original stays complete.'}});
    assert.equal(framed.output.height,1440);assert.equal(framed.output.frames,60);
    assert.equal(framed.preservesFullSourceFrame,true);assert.equal(framed.platformPreviewVerified,false);
    await assert.rejects(assembleMedia({schemaVersion:1,clips:[{file:source,from:99,seconds:2}]},{out:path.join(root,'bad.mp4')}),/beyond/);
    await assert.rejects(frameVideo({input:source,out:source,copy:{heading:'X'}}),/overwritten/);
  } finally {await rm(root,{recursive:true,force:true});}
});
