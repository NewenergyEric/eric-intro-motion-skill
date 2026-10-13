import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type Lang = 'zh' | 'en';
export const tr = (l: Lang, zh: string, en: string) => l === 'zh' ? zh : en;
export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const p = (f: number, start: number, duration = 24) => {const t=clamp((f-start)/duration); return t*t*(3-2*t);};
export const mix = (a:number,b:number,t:number) => a+(b-a)*t;
export const box = (left:number,top:number,width:number,height?:number):React.CSSProperties => ({position:'absolute',left,top,width,...(height===undefined?{}:{height})});
export const shadow = '0 24px 54px #00152238, 0 2px 0 #ffffff55 inset';
export const artFont = '"AD Field", "Fallback SC", sans-serif';
let fonts:Promise<unknown> | undefined;
function loadFonts(){
  if(!fonts) fonts=Promise.all([
    ['AD Field','tidekeeper/tide-sans.woff2','100 900'],
    ['Fallback SC','shared/NotoSansSC.ttf','100 900'],
  ].map(async([name,file,weight])=>{const face=await new FontFace(name,`url("${staticFile(file)}")`,{weight}).load();document.fonts.add(face);}));
  return fonts;
}
export function Fonts(){const [handle]=useState(()=>delayRender('Load pinned artwork fonts'));useEffect(()=>{loadFonts().then(()=>continueRender(handle)).catch(cancelRender)},[handle]);return null;}

export function Text({id,children,style}: {id:string,children:React.ReactNode,style?:React.CSSProperties}){
  return <div data-text={id} style={{whiteSpace:'pre-line',lineHeight:1.45,paddingBottom:9,...style}}>{children}</div>;
}
export function Beat({f,index,beats,children}:{f:number,index:number,beats:number[],children:React.ReactNode}){
  // Text-bearing scenes leave before the next one enters. Shared artwork is
  // outside this wrapper and continues its path through the handoff.
  const a=index===0?1:p(f,beats[index],16),b=index===5?0:p(f,beats[index+1]-14,14);
  if(a===0||b===1)return null;
  return <AbsoluteFill data-scene={index} style={{opacity:a*(1-b),transform:`translateY(${(1-a)*60-b*38}px)`,zIndex:3}}>{children}</AbsoluteFill>;
}
export function Kinetic({f,start,children,style,id}:{f:number,start:number,children:React.ReactNode,style?:React.CSSProperties,id:string}){
  const t=p(f,start,23);
  return <div style={{overflow:'hidden',paddingBottom:10,...style}}><Text id={id} style={{lineHeight:1.15,transform:`translateY(${(1-t)*125}%) skewY(${(1-t)*4}deg)`}}>{children}</Text></div>;
}

// Run inside the composition, after font loading. The renderer collects real DOM
// bounds, not guessed font metrics. Every readable hold is sampled by render.mjs.
export function Audit({enabled,project,language}:{enabled:boolean,project:string,language:Lang}){
  const frame=useCurrentFrame(),{width,height}=useVideoConfig();
  const [handle]=useState(()=>enabled?delayRender('Measure native layout'):null);
  useEffect(()=>{
    if(handle===null)return;
    loadFonts().then(()=>{
      const root=document.querySelector('[data-native-root]')!.getBoundingClientRect();
      const sx=width/root.width,sy=height/root.height;
      const rows:Array<any>=[];
      for(const el of document.querySelectorAll<HTMLElement>('[data-text],[data-region]')){
        let visible=true;
        for(let n:HTMLElement|null=el;n&&n!==document.body;n=n.parentElement){if(Number(getComputedStyle(n).opacity)<.98)visible=false;}
        if(!visible)continue;
        const r=el.getBoundingClientRect();
        const b={x:(r.x-root.x)*sx,y:(r.y-root.y)*sy,w:r.width*sx,h:r.height*sy};
        const text=el.dataset.text?el.innerText:'';
        const overflow=!!text&&el.scrollWidth>el.clientWidth+2;
        const out=b.x < -2||b.y < -2||b.x+b.w>width+2||b.y+b.h>height+2;
        let textBounds;
        if(text){
          // DOM Range boxes include unused font ascent/descent, so they falsely
          // overlap tightly typeset headings. Measure each visible glyph's ink.
          const ctx=document.createElement('canvas').getContext('2d')!;
          const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node:Node|null;
          const glyphs:Array<{x:number,y:number,w:number,h:number}>=[];
          while((node=walker.nextNode())){
            const style=getComputedStyle(node.parentElement!);ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const localScale=node.parentElement!.getBoundingClientRect().height / Math.max(1,(node.parentElement as HTMLElement).offsetHeight) * sy;
            const value=node.textContent||'';
            for(let i=0;i<value.length;i++){
              const char=value[i];if(!char.trim())continue;
              const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect(),metric=ctx.measureText(char);
              glyphs.push({x:(r.x-root.x)*sx,y:(r.y-root.y)*sy+(metric.fontBoundingBoxAscent-metric.actualBoundingBoxAscent)*localScale,w:r.width*sx,h:(metric.actualBoundingBoxAscent+metric.actualBoundingBoxDescent)*localScale});
            }
          }
          if(glyphs.length){const x=Math.min(...glyphs.map(g=>g.x)),y=Math.min(...glyphs.map(g=>g.y));textBounds={x,y,w:Math.max(...glyphs.map(g=>g.x+g.w))-x,h:Math.max(...glyphs.map(g=>g.y+g.h))-y};}
        }
        rows.push({id:el.dataset.text||el.dataset.region,kind:text?'text':'layer',text,bounds:b,textBounds,overflow,out});
      }
      const videos=document.querySelectorAll('video').length;
      const overlaps=[];
      const texts=rows.filter(r=>r.textBounds);
      for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
        const a=texts[i].textBounds,b=texts[j].textBounds;
        const dx=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),dy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
        if(dx>3&&dy>3)overlaps.push([texts[i].id,texts[j].id]);
      }
      console.log('NATIVE_AUDIT '+JSON.stringify({project,language,frame,width,height,videoElements:videos,rows,overlaps}));
      continueRender(handle);
    }).catch(cancelRender);
  },[handle,frame,width,height,enabled,project,language]);
  return null;
}
