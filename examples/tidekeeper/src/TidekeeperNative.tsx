import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Audit,Fonts,Lang,Text,artFont,box,p,tr} from './common';
import {TidekeeperUI} from './TidekeeperUI';

const C={ink:'#173f48',teal:'#187d88',mint:'#99e2cd',cream:'#fff4d8',coral:'#f17f63',gold:'#ffe29c'};
const stops=[0,120,240,360,510,630,720];
function Art({id,name,style}:{id:string,name:string,style:React.CSSProperties}){return <Img data-region={id} src={staticFile('tidekeeper/'+name)} style={{objectFit:'contain',...style}}/>;}
function Scene({f,i,children}:{f:number,i:number,children:React.ReactNode}){
 const opacity=(i===0?1:p(f,stops[i]-5,10))*(i===5?1:1-p(f,stops[i+1]-5,10));
 return opacity>0?<AbsoluteFill data-scene={i} style={{opacity}}>{children}</AbsoluteFill>:null;
}
export function TidekeeperNative({language='zh',audit=false}:{language:Lang,audit?:boolean}){
 const f=useCurrentFrame(),{height:H,width:W}=useVideoConfig(),portrait=H>1200,tall=H>1600,m=64,inner=W-2*m;
 const say=(zh:string,en:string)=>tr(language,zh,en);
 const sceneAsset=(after=true)=>`workshop-${after?'after':'before'}${portrait?'-portrait':''}.jpg`;
 const tag=(id:string,value:string,y=108,light=false)=> <Text id={id} style={{...box(m,y,inner),fontSize:24,fontWeight:750,letterSpacing:2,color:light?C.cream:C.teal}}>{value}</Text>;
 const title=(id:string,lines:string[],y:number,size:number,color=C.ink)=> <div data-region={id} style={{...box(m,y,inner),color,fontWeight:900,fontSize:size,letterSpacing:language==='en'?-2:-1}}>{lines.map((line,i)=><Text key={i} id={`${id}-${i}`} style={{lineHeight:1.2,color:i?C.teal:color}}>{line}</Text>)}</div>;
 const foot=(id:string,value:string,light=false)=> <Text id={id} style={{...box(m,H-136,inner),fontSize:language==='en'?25:28,lineHeight:1.45,color:light?C.cream:C.ink,fontWeight:600}}>{value}</Text>;
 const scene=stops.findIndex((s,i)=>f>=s&&f<stops[i+1]);
 const gameTop=portrait?(tall?480:400):290,gameScale=portrait?(tall?1.47:1.03):.78,gameX=portrait?(W-390*gameScale)/2:W-64-390*gameScale;
 const gameStage=f<403?'missing':f<445?'ready':'done';
 return <AbsoluteFill data-native-root style={{fontFamily:artFont,background:C.cream,color:C.ink,overflow:'hidden'}}><Fonts/>
  <Scene f={f} i={0}>
   <Art id="opening-world" name={sceneAsset()} style={{...box(0,0,W,H),objectFit:'cover',objectPosition:'65% center'}}/>
   <AbsoluteFill style={{background:portrait?'linear-gradient(180deg,#103f50ed 0%,#164956cc 31%,#123e4720 68%)':'linear-gradient(180deg,#103f50da 0%,#17495280 52%,transparent 84%)'}}/>
   {tag('opening-tag',say('把主美的判断，带到每次交付。','CARRY THE DIRECTION INTO EVERY DELIVERY.'),portrait?140:125,true)}
   <div data-region="opening-title" style={{...box(m,portrait?214:202,inner),fontSize:language==='zh'?94:87,lineHeight:1.16,fontWeight:900,letterSpacing:-2,color:C.cream,transform:`translateY(${(1-p(f,0,30))*25}px)`}}>
    <Text id="opening-title-0" style={{lineHeight:1.16}}>{say('一个团队／项目，','One team,')}</Text><Text id="opening-title-1" style={{lineHeight:1.16,color:C.gold}}>{say('一份视觉记忆。','one visual memory.')}</Text>
   </div>
   <Text id="opening-description" style={{...box(m,portrait?480:450,portrait?560:800),color:C.cream,fontSize:portrait?34:30,lineHeight:1.5}}>{say('角色、场景、UI、合成链。\n每次交付都有共同依据。','Characters, worlds, UI and item chains.\nA shared basis for every delivery.')}</Text>
   <Art id="opening-character" name="character-wave.png" style={{...box(portrait?(tall?500:550):662,portrait?(tall?430:320):570,portrait?(tall?510:425):340,portrait?(tall?850:700):480),transform:`translateX(${(1-p(f,2,28))*40}px)`}}/>
  </Scene>
  <Scene f={f} i={1}>
   <AbsoluteFill style={{background:C.cream}}/>
   {tag('direction-tag',say('01 / 主美建立规范','01 / DIRECTOR BUILDS THE BASELINE'))}
   {title('direction-title',say(['把“这种感觉”，','留下来。'].join('|'),['Make the feeling','repeatable.'].join('|')).split('|'),169,portrait?84:76)}
   <Art id="direction-world" name="workshop-before.jpg" style={{...box(portrait?210:450,portrait?(tall?775:610):454,portrait?806:602,portrait?(tall?640:480):350),objectFit:'cover',borderRadius:portrait?'150px 20px 20px 20px':'95px 16px 16px 16px'}}/>
   <Art id="direction-character" name="character-base.png" style={{...box(portrait?20:8,portrait?(tall?800:610):414,portrait?380:300,portrait?(tall?700:570):460)}}/>
   <div data-region="direction-note" style={{...box(portrait?m:345,portrait?440:390,portrait?inner:650),padding:'22px 26px',background:'#fffdf0ee',borderLeft:`7px solid ${C.coral}`}}>
    <Text id="direction-note-title" style={{fontWeight:800,fontSize:32}}>{say('先定共同语言','Define the shared language')}</Text>
    <Text id="direction-note-copy" style={{fontSize:25,marginTop:10}}>{say('饱满体块 · 柔和高光\n身份、用途与变化，分别说明。','Chunky shapes · soft broad highlights\nSeparate identity, use and variation.')}</Text>
   </div>
   {[1,2].map((n,i)=><Art key={n} id={`direction-lamp-${n}`} name={`lamp-l${n}.png`} style={{...box(portrait?560+i*212:344+i*208,H-(portrait?414:360),portrait?220:200,portrait?220:200),transform:`translateY(${(1-p(f,140+i*8,20))*30}px)`}}/>)}
   {foot('direction-footer',say('规范、样板、字体与源码，一起装进项目包。','Rules, samples, fonts and source. One project pack.'))}
  </Scene>
  <Scene f={f} i={2}>
   <AbsoluteFill style={{background:'#dceee1'}}/>
   <Art id="members-world" name="workshop-after.jpg" style={{...box(portrait?0:300,portrait?(tall?510:445):405,portrait?W:780,portrait?(tall?640:520):470),objectFit:'cover'}}/>
   <AbsoluteFill style={{background:'linear-gradient(180deg,#dceee1 3%,#dceee1ef 23%,transparent 53%,#dceee1 89%)'}}/>
   {tag('members-tag',say('02 / 成员拿包续作','02 / TEAMMATE CONTINUES FROM THE PACK'))}
   {title('members-title',say('换一个人做，|还是同一个世界。','A new pair of hands.|The same world.').split('|'),173,portrait?82:74)}
   <Art id="members-character" name="character-wave.png" style={{...box(portrait?20:15,portrait?(tall?770:630):472,portrait?440:310,portrait?(tall?770:655):490),transform:`translateY(${(1-p(f,243,25))*35}px)`}}/>
   <Text id="members-label" style={{...box(portrait?470:375,H-(portrait?575:442),portrait?546:620),fontSize:portrait?28:23,fontWeight:800,background:C.cream,padding:'14px 20px'}}>{say('新动作 / 修复状态 / L3 · L4','NEW POSE / RESTORED SCENE / L3 · L4')}</Text>
   {[3,4].map((n,i)=><Art key={n} id={`members-lamp-${n}`} name={`lamp-l${n}.png`} style={{...box(portrait?490+i*246:390+i*250,H-(portrait?443:360),portrait?250:230,portrait?250:230),transform:`translateY(${(1-p(f,255+i*8,23))*25}px)`}}/>)}
   {foot('members-footer',say('沿用同一版本，记录实际输入与新输出。','Use the same version. Record the inputs and the new work.'))}
  </Scene>
  <Scene f={f} i={3}>
   <AbsoluteFill style={{background:'#163f4c',color:C.cream}}/>
   {tag('game-tag',say('03 / 放进真正的使用画面','03 / CHECK THE ACTUAL COMPOSITION'),108,true)}
   <div data-region="game-title" style={{...box(m,portrait?168:280,portrait?inner:580),fontSize:portrait?80:76,fontWeight:900,color:C.cream}}>
    <Text id="game-title-0" style={{lineHeight:1.16}}>{say('接得上，','Fits together.')}</Text><Text id="game-title-1" style={{lineHeight:1.16,color:C.gold}}>{say('也要用得起来。','Works together.')}</Text>
   </div>
   <div data-region="game-screen" style={{...box(gameX,gameTop,390*gameScale,844*gameScale),borderRadius:20,overflow:'hidden',boxShadow:'0 25px 70px #001b2460'}}><div style={{...box(0,0,390,844),transform:`scale(${gameScale})`,transformOrigin:'top left'}}><TidekeeperUI key={gameStage} stage={gameStage} language={language}/>{f>=380&&f<403?<><style>{'.tk-cell[data-cell="5"] img{opacity:0}'}</style><Art id="merging-lamp" name="lamp-l3.png" style={{...box(268,253+50*p(f,380,23),50,50),filter:'drop-shadow(0 4px 2px #214c5066)'}}/><div style={{...box(302,293+50*p(f,380,23),21,21),borderRadius:'50%',border:'3px solid white',background:'#ffffff66'}}/></>:null}{f>=445&&f<470?<Art id="reward-coin" name="coin.png" style={{...box(135+140*p(f,445,25),132-124*p(f,445,25),34,34),opacity:1-p(f,460,10)}}/>:null}</div></div>
   <Text id="game-step" style={{...box(m,portrait?H-154:570,portrait?inner:540),fontSize:portrait?30:31,fontWeight:750,color:C.mint,textAlign:portrait?'center':'left'}}>{say(gameStage==='missing'?'两件同级物品 → 合成':gameStage==='ready'?'订单已备齐 → 交付':'库存消耗 / 金币奖励 / 解锁区域',gameStage==='missing'?'MATCH TWO → MERGE':gameStage==='ready'?'ORDER READY → DELIVER':'INVENTORY / REWARD / UNLOCK')}</Text>
   <Text id="game-context" style={{...box(m,portrait?H-98:700,portrait?inner:530),fontSize:portrait?23:29,lineHeight:1.6,color:C.cream,textAlign:portrait?'center':'left'}}>{say('订单、图标、按钮和文字，\n都属于这款游戏。','Orders, icons, buttons and type.\nAll belong to this game.')}</Text>
  </Scene>
  <Scene f={f} i={4}>
   <Art id="review-before" name={sceneAsset(false)} style={{...box(0,0,W,H),objectFit:'cover',objectPosition:'65% center'}}/>
   <div data-region="review-after" style={{...box(0,0,W,H),clipPath:`inset(0 ${(1-p(f,531,37))*100}% 0 0)`}}><Img src={staticFile('tidekeeper/'+sceneAsset())} style={{width:W,height:H,objectFit:'cover',objectPosition:'65% center'}}/></div>
   <AbsoluteFill style={{background:portrait?'linear-gradient(180deg,#143c4b95,transparent 40%,#143c4bf5 84%)':'linear-gradient(180deg,#143c4b50,transparent 25%,#143c4bf5 86%)'}}/>
   <div data-region="review-note" style={{...box(portrait?m:460,portrait?155:96,portrait?inner:556)}}><Text id="review-badge" style={{background:C.cream,padding:'14px 22px',fontSize:25,color:C.ink,fontWeight:800}}>{say('真实续作 / 修复前后','ACTUAL CONTINUATION / BEFORE & AFTER')}</Text></div>
   <div data-region="review-caption" style={{...box(m,H-(portrait?435:420),inner),color:C.cream}}>
    <Text id="review-tag" style={{fontSize:24,letterSpacing:2}}>{say('04 / 对照、返修、回写规范','04 / COMPARE, REVISE, UPDATE THE PACK')}</Text>
    <Text id="review-title" style={{fontSize:language==='zh'?74:70,lineHeight:1.16,fontWeight:900,marginTop:20}}>{say('同一座灯房，\n新的生活。','The same place.\nA new chapter.')}</Text>
    <Text id="review-copy" style={{fontSize:30,lineHeight:1.5,marginTop:26}}>{say('补木板 · 开窗 · 亮灯。','Repair the deck. Open the shutters. Turn on the light.')}</Text>
   </div>
  </Scene>
  <Scene f={f} i={5}>
   <Art id="closing-world" name={sceneAsset()} style={{...box(0,0,W,H),objectFit:'cover',opacity:.67}}/>
   <AbsoluteFill style={{background:'linear-gradient(180deg,#fff4d8fa 0%,#fff4d8dc 44%,#fff4d835 76%,#fff4d8f0 97%)'}}/>
   {tag('closing-tag','ART DIRECTOR / AGENT SKILL',portrait?140:125)}
   {title('closing-title',say('一个团队／项目，|一份视觉记忆。','One team,|one visual memory.').split('|'),portrait?235:212,language==='zh'?90:86)}
   <Text id="closing-copy" style={{...box(m,portrait?485:445,portrait?560:inner),fontSize:portrait?34:32,lineHeight:1.5}}>{say('把主美的判断，带到每次交付。\n装好，在你的 Agent 里开始。','Carry the direction into every delivery.\nInstall. Start in your agent.')}</Text>
   <Art id="closing-character" name="character-wave.png" style={{...box(portrait?(tall?500:550):672,portrait?(tall?430:320):570,portrait?(tall?510:425):315,portrait?(tall?850:700):440)}}/>
   {foot('closing-footer',say('可打包分发 · 开源 · 原创候选案例','PORTABLE PROJECT PACKS · OPEN SOURCE · CANDIDATE ART'))}
  </Scene>
  <Text id="identity" style={{...box(m,36,inner),fontSize:20,fontWeight:800,letterSpacing:3,color:scene===0||scene===3||scene===4?C.cream:C.teal}}>ART DIRECTOR / TIDEKEEPER</Text>
  <div style={{position:'absolute',left:0,bottom:0,width:W*(f+1)/720,height:6,background:C.coral}}/>
  <Audit enabled={audit} project="tidekeeper" language={language}/>
 </AbsoluteFill>;
}
