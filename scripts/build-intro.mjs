import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderIntro} from '../skills/eric-intro-motion-skill/scripts/native-intro.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const recipe=JSON.parse(await readFile(path.join(root,'skills/eric-intro-motion-skill/assets/examples/pocket-notes.json'),'utf8'));
const summary=await renderIntro(recipe,{out:path.join(root,'examples/native-intro'),cache:path.join(root,'.work/native-frames'),force:process.argv.includes('--force'),stills:process.argv.includes('--stills')});
await writeFile(path.join(root,'examples/native-intro/build.json'),JSON.stringify({outputs:summary.outputs.map(x=>({id:x.id,cache:x.cache})),renderApiCalls:0},null,2)+'\n');
