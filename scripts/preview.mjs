import {createServer} from 'node:http';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../examples/',import.meta.url)),port=Number(process.env.PORT||4322);
const types={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(target!==root.slice(0,-1)&&!target.startsWith(root)){res.writeHead(403).end();return;}
  let file=target,s=await stat(file);if(s.isDirectory()){file=path.join(file,'index.html');s=await stat(file);}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  let start=0,end=s.size-1,status=200;
  if(req.headers.range){
   const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!m){res.writeHead(416,{'Content-Range':`bytes */${s.size}`}).end();return;}
   start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;
   if(start>end){res.writeHead(416,{'Content-Range':`bytes */${s.size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${s.size}`;
  }
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Examples: http://127.0.0.1:${port}/native-intro/`));
