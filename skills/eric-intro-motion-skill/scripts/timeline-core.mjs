import { readFileSync } from 'node:fs';
import { textBox, measure } from './text.mjs';
import { profileModules } from './modules/profile.mjs';
import { referenceModules } from './modules/references.mjs';
export const moduleCatalog = JSON.parse(readFileSync(new URL('../assets/modules.json', import.meta.url), 'utf8'));
const references = [
  {id:'reference.stagger',name:{zh:'错峰网格',en:'Staggered grid'},source:'https://animejs.com/documentation/utilities/stagger/'},
  {id:'reference.trace',name:{zh:'路径追踪',en:'Path tracing'},source:'https://animejs.com/documentation/svg/createdrawable'},
  {id:'reference.ticker',name:{zh:'滚动字带',en:'Kinetic ticker'},source:'https://motion.dev/docs/react-ticker'}
];
moduleCatalog.push(...references);
export function validateRecipe(recipe) {
  if (recipe.schemaVersion !== 2 || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(recipe.id)) throw new Error('Expected schemaVersion 2 and a safe lowercase id.');
  if (!['zh','en'].includes(recipe.language)) throw new Error('language must be zh or en.');
  if (!Array.isArray(recipe.clips) || !recipe.clips.length || recipe.clips.length>30) throw new Error('Use 1–30 clips.');
  for (const clip of recipe.clips) {
    const item = moduleCatalog.find(item=>item.id===clip.module);
    if (!item) throw new Error(`Unknown module: ${clip.module}`);
    if (!Number.isFinite(clip.seconds) || clip.seconds<2 || clip.seconds>30) throw new Error('Each clip needs 2–30 seconds.');
    if (typeof clip.title!=='string' || !clip.title.trim()) throw new Error('Each clip needs a title.');
    if (clip.subtitle!==undefined && typeof clip.subtitle!=='string') throw new Error('subtitle must be text.');
    if (clip.labels && (!item.labels || !Array.isArray(clip.labels) || clip.labels.length!==item.labels[recipe.language].length || clip.labels.some(label=>typeof label!=='string'||label.length>35))) throw new Error(`labels must match the module catalog: ${clip.module}`);
    if (clip.labels?.some((label,i)=>measure(label,14,650)>measure(item.labels[recipe.language][i],14,650)+.1)) throw new Error(`A label is wider than the original ${clip.module} slot. Shorten it or edit the component layout.`);
  }
  return recipe;
}

export function makeClip(clip, {language='en',width=1080,height=1080,safe={left:.08,right:.08,top:.08,bottom:.08}}={}) {
  if (![width,height].every(n=>Number.isInteger(n)&&n>=320&&n<=4096&&n%2===0)) throw new Error('Dimensions must be even integers between 320 and 4096.');
  for (const side of ['left','right','top','bottom']) if (!Number.isFinite(safe[side])||safe[side]<0||safe[side]>.3) throw new Error('Invalid safe inset.');
  const item = moduleCatalog.find(item=>item.id===clip.module);
  if (!item) throw new Error('Unknown module.');
  const [family,name] = clip.module.split('.');
  const render = family==='profile'?profileModules[name]:referenceModules[name];
  const dark = family==='reference';
  const colors = dark?{bg:'#17233b',ink:'#faf8f0',accent:'#a4eee2',muted:'#b5c3d6'}:{bg:'#fbfcfc',ink:'#001f3f',accent:'#007d86',muted:'#526578'};
  const x=width*safe.left,y=height*safe.top,w=width*(1-safe.left-safe.right),h=height*(1-safe.top-safe.bottom);
  const wide=width/height>1.35, scale=Math.min(width/1080,height/900);
  const copyW=wide?w*.40:w;
  const title=textBox(clip.title,{x,y:y+46*scale,w:copyW,h:wide?h*.42:150*scale},{size:54*scale,minSize:42*scale,weight:650,color:colors.ink,field:'title'});
  const subtitle=textBox(clip.subtitle||'',{x,y:wide?y+h*.57:y+h-83*scale,w:copyW,h:wide?h*.26:83*scale},{size:26*scale,minSize:24*scale,color:colors.muted,field:'subtitle'});
  const label=textBox(item.name[language],{x,y,w:copyW,h:35*scale},{size:20*scale,color:colors.accent,weight:650,field:'module name'});
  const art=wide?{x:x+w*.43,y:y+10*scale,w:w*.57,h:h-20*scale}:{x,y:y+192*scale,w,h:h-298*scale};
  const zoom=Math.min(art.w/600,art.h/430);
  if (zoom<=0) throw new Error('Canvas is too short for this layout.');
  const artX=art.x+(art.w-600*zoom)/2,artY=art.y+(art.h-430*zoom)/2;
  const labels=clip.labels||item.labels?.[language];
  const metadata={width,height,safe,layout:wide?'side-by-side':'stacked',text:[title,subtitle,label].map(({svg,...info})=>info),module:clip.module,artBounds:{x:artX,y:artY,w:600*zoom,h:430*zoom},source:item.source};
  const fixed=label.svg+title.svg+subtitle.svg;
  return {story:{id:name,duration:clip.seconds},metadata,frame(t,{guide=false}={}) {
    let body=`<rect width="${width}" height="${height}" fill="${colors.bg}"/>${fixed}<g transform="translate(${artX} ${artY}) scale(${zoom})">${render(t,labels)}</g>`;
    if(guide) body+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fb4070" stroke-width="2" stroke-dasharray="8 6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  }};
}
