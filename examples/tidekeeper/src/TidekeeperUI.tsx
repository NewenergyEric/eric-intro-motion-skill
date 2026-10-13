import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {gameMarkup, createState, act, uiCss} from './ui-kit.js';
import {Lang} from './common';

// Translate the actual editable UI, including its state feedback. Artwork stays
// byte-identical to the source pack; English is never baked into a screenshot.
const english:Record<string,string>={
 '阿澜 · 点亮灯房':'ALAN · LIGHT THE WAY','奈莉 · 修好栈桥':'NERI · REPAIR THE DOCK',
 '栈桥需要新木料':'Fresh timber','第一盏归航灯':'A light for home','继续合成':'Merge more','去看看':'View town','交付':'Deliver',
 '两张订单完成，灯房可以开门了！':'Both orders done. The workshop is ready!',
 '木料送到，一排货箱解开了！':'Timber delivered. New cells unlocked!',
 '合成成功 · 小小航标灯':'Merged: little beacon','灯匠工作箱':'Lampmaker’s kit',
 '点击取出灯具或木料，每次消耗 1 点体力。':'Tap for a lamp or timber. Costs 1 energy.',
 '选中，再点同级物品；也可以拖动合成。':'Match two items of the same level to merge.',
 '原创交互试作 · 数值为示例 · 非已上线游戏':'ORIGINAL ART PROTOTYPE · SAMPLE VALUES',
 '重新试做':'Restart','小镇':'Town','合成':'Merge','灯匠':'MAKER',
};
export function TidekeeperUI({stage,language}:{stage:'missing'|'ready'|'done',language:Lang}){
 const root=useRef<HTMLDivElement>(null);
 const [handle]=useState(()=>delayRender('Load Tidekeeper UI assets'));
 let state=createState({target:4,title:'第一盏归航灯'});
 if(stage!=='missing'){state=act(state,'cell',5);state=act(state,'cell',12);}
 if(stage==='done'){state=act(state,'deliver');state=act(state,'repair');}
 state.flash=null;
 let markup=gameMarkup(state,staticFile('tidekeeper/'));
 if(language==='en')for(const [zh,en] of Object.entries(english).sort((a,b)=>b[0].length-a[0].length))markup=markup.replaceAll(zh,en);
 useLayoutEffect(()=>{root.current?.querySelectorAll<HTMLElement>('.tk-name,.tk-order h1,.tk-order h2,.tk-action,.tk-count,.tk-info strong,.tk-info p,.tk-note').forEach((el,i)=>{el.dataset.text=`game-text-${i}`;});},[stage,language]);
 useEffect(()=>{Promise.all([
  ...Array.from(root.current?.querySelectorAll('img')??[]).map(img=>img.complete&&img.naturalWidth?Promise.resolve():new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Missing UI asset '+img.src));})),document.fonts.ready,
 ]).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 return <AbsoluteFill><style>{`${uiCss}\n.tk{font-family:'Fallback SC',sans-serif}.tk *{animation:none!important}.tk button{font-family:inherit}.tk-info strong{font-size:${language==='en'?10:12}px}.tk-info p{font-size:${language==='en'?9:10}px}.tk-note{font-size:8px}.tk-name{font-size:${language==='en'?9:11}px}.tk-action{font-size:${language==='en'?10:12}px}`}</style><div ref={root} dangerouslySetInnerHTML={{__html:markup}}/></AbsoluteFill>;
}
