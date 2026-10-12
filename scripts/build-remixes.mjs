import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {compose} from '../skills/motion-story/scripts/compose.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const results=[];
for(const [id,preset,folder] of [['profile-remix','moments','profile-square'],['profile-remix','xiaohongshu','profile-portrait'],['reference-remix','xiaohongshu','reference-portrait']]) {
  const recipe=JSON.parse(await readFile(path.join(root,`skills/motion-story/assets/examples/${id}.json`),'utf8'));
  const result=await compose(recipe,{out:path.join(root,'examples/remix',folder),cache:path.join(root,'.work/component-cache'),preset,force:process.argv.includes('--force'),onProgress:console.log});
  results.push({id,preset,folder,cache:result.cache,renderApiCalls:result.renderApiCalls});
  console.log(JSON.stringify(results.at(-1)));
}
await writeFile(path.join(root,'examples/remix/build.json'),JSON.stringify(results,null,2)+'\n');
