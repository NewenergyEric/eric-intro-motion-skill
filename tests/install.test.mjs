import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const execute=promisify(execFile),installer=fileURLToPath(new URL('../scripts/install.mjs',import.meta.url));

test('migration preserves existing installations and does not overwrite without --upgrade',async()=>{
 await mkdir('.work',{recursive:true});
 const root=await mkdtemp(path.resolve('.work/intro-install-test-')),dest=path.join(root,'skills');
 try{
  await mkdir(path.join(dest,'motion-story'),{recursive:true});await writeFile(path.join(dest,'motion-story','local-change.txt'),'keep my changes');
  await assert.rejects(execute(process.execPath,[installer,'--dest',dest]),/Existing skills/);
  assert.equal(await readFile(path.join(dest,'motion-story','local-change.txt'),'utf8'),'keep my changes');
  await execute(process.execPath,[installer,'--dest',dest,'--upgrade']);
  const backup=(await readdir(root)).find(n=>n.startsWith('eric-intro-motion-skill-backup-'));
  assert.equal(await readFile(path.join(root,backup,'motion-story','local-change.txt'),'utf8'),'keep my changes');
  const pkg=JSON.parse(await readFile(path.join(dest,'eric-intro-motion-skill','package.json'),'utf8'));
  assert.equal(pkg.name,'eric-intro-motion-skill-renderer');
  await assert.rejects(execute(process.execPath,[installer,'--bad']),/Usage/);
 }finally{await rm(root,{recursive:true,force:true});}
});
