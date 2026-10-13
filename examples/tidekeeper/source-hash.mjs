import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Git checkouts and downloaded source archives may use different line endings.
// Identify UTF-8 source text canonically; binary asset digests remain byte exact.
export async function sourceHashFor(root){
 const hash=createHash('sha256');hash.update('tidekeeper-source-lf-v1\0');
 for(const file of (await readdir(path.join(root,'src'))).sort())hash.update((await readFile(path.join(root,'src',file),'utf8')).replace(/\r\n/g,'\n'));
 hash.update((await readFile(path.join(root,'asset-provenance.json'),'utf8')).replace(/\r\n/g,'\n'));
 return hash.digest('hex');
}
