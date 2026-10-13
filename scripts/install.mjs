import { cp, mkdir, access, copyFile, rename, mkdtemp, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const upgrade=args.includes('--upgrade'),pos=args.indexOf('--dest');
for(let i=0;i<args.length;i++){
  if(args[i]==='--upgrade')continue;
  if(args[i]==='--dest'&&args[i+1]&&!args[i+1].startsWith('--')){i++;continue;}
  throw new Error('Usage: node scripts/install.mjs [--dest /path/to/skills] [--upgrade]');
}
const destination = path.resolve(pos>=0?args[pos+1]:path.join(process.env.CODEX_HOME || path.join(homedir(), '.codex'), 'skills'));
const names = ['eric-intro-motion-skill', 'social-motion', 'motion-story'];
const existing=[];
for (const name of names) {
  const target = path.join(destination, name);
  if (await access(target).then(() => true, () => false)) existing.push(name);
}
if(existing.length&&!upgrade)throw new Error(`Existing skills: ${existing.join(', ')}. Use --upgrade to preserve them in a dated backup before installing, or choose another destination.`);
await mkdir(destination, { recursive: true });
const parent=path.dirname(destination),stage=await mkdtemp(path.join(parent,'.intro-install-'));
const backup=existing.length?await mkdtemp(path.join(parent,`eric-intro-motion-skill-backup-${new Date().toISOString().slice(0,10)}-`)):null;
const moved=[],installed=[];
try {
  for(const name of names){
    const source=path.join(root,'skills',name),target=path.join(stage,name);
    await cp(source,target,{recursive:true,filter:entry=>!path.relative(source,entry).split(path.sep).some(part=>['node_modules','output','__pycache__','.cache'].includes(part))});
    await copyFile(path.join(root,'LICENSE'),path.join(target,'LICENSE'));
    await copyFile(path.join(root,'THIRD_PARTY_NOTICES.md'),path.join(target,'THIRD_PARTY_NOTICES.md'));
  }
  for(const name of existing){await rename(path.join(destination,name),path.join(backup,name));moved.push(name);}
  for(const name of names){await rename(path.join(stage,name),path.join(destination,name));installed.push(name);}
} catch(error){
  // Remove only newly installed, known child directories; restore every original.
  for(const name of installed)await rm(path.join(destination,name),{recursive:true,force:true});
  for(const name of moved)await rename(path.join(backup,name),path.join(destination,name));
  throw error;
} finally {
  await rm(stage,{recursive:true,force:true});
}
console.log(`Installed eric-intro-motion-skill, social-motion and the motion-story compatibility entry into ${destination}`);
if(backup)console.log(`Previous installations preserved at ${backup}`);
console.log('Next, install the base skill runtime with:');
console.log(`npm ci --prefix "${path.join(destination, 'eric-intro-motion-skill')}"`);
console.log('Refresh skill discovery or start a new Codex session if the new skills are not listed yet.');
