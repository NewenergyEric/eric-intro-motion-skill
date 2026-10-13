import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../../eric-intro-motion-skill/scripts/cli.mjs',import.meta.url));
console.error('motion-story is now eric-intro-motion-skill; forwarding this command.');
const child=spawn(process.execPath,[script,...process.argv.slice(2)],{stdio:'inherit',windowsHide:true});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
