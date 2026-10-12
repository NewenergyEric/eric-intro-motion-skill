import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Audit,Beat,Fonts,Kinetic,Lang,Text,artFont,box,mix,p,shadow,tr} from './common';

const C={navy:'#001f3f',teal:'#007d86',mint:'#92e4da',paper:'#f5f9fb',muted:'#b2cbd7'};
const beats=[0,120,252,372,516,630,720];
const headings={zh:[['从你手上的','资料开始。'],['把风格说到','能执行。'],['打成一个包，','交给整个团队。'],['说出任务，','沿用同一版。'],['查出偏差，','带着依据改。']],en:[['Start with','what you have.'],['Make the style','actionable.'],['One project pack.','The whole team.'],['Describe the task.','Use the same rules.'],['Find the drift.','Fix it with context.']]};
export function ArtNative({language='zh',audit=false}:{language:Lang,audit?:boolean}){
 const f=useCurrentFrame(),{width:W,height:H}=useVideoConfig();
 const portrait=H>1200,tall=H>1600,m=64,inner=W-m*2;
 const phase=Math.max(0,beats.findIndex((b,i)=>i<6&&f>=b&&f<beats[i+1]));
 const titleY=tall?160:127,titleSize=language==='zh'?(portrait?101:83):(portrait?87:70);
 const title=(index:number)=><div data-region={`heading-${index}`} style={{...box(m,titleY,inner),zIndex:6}}>
  <Text id={`eyebrow-${index}`} style={{fontSize:22,color:C.mint,letterSpacing:3,marginBottom:24}}>{['01 / COLLECT','02 / DEFINE','03 / SHARE','04 / CREATE','05 / REVIEW'][index]}</Text>
  <div style={{fontSize:titleSize,letterSpacing:language==='zh'?-2:-2.5,fontWeight:440,transform:'skewX(-3deg)'}}>{headings[language][index].map((s,i)=><Kinetic key={s} id={`title-${index}-${i}`} f={f} start={beats[index]+i*5} style={{color:i?C.mint:C.paper,fontWeight:i?820:440}}>{s}</Kinetic>)}</div>
 </div>;
 const caption=(id:string,text:string,y:number,w=inner)=><Text id={id} style={{...box(m,y,w),fontSize:portrait?36:30,color:C.muted}}>{text}</Text>;
 const paper=(x:number,y:number,w:number,style:React.CSSProperties={})=>({...box(x,y,w),padding:portrait?38:28,background:C.paper,borderRadius:20,color:C.navy,boxShadow:shadow,boxSizing:'border-box' as const,...style});
 const artPoses=[
  portrait?(tall?{x:70,y:940,w:940}:{x:165,y:770,w:750}):{x:565,y:416,w:450},
  portrait?{x:680,y:H-455,w:325}:{x:710,y:455,w:305},
  {x:360,y:portrait?(tall?830:680):570,w:360},
  portrait?{x:725,y:455,w:265}:{x:745,y:430,w:265},
  portrait?{x:725,y:465,w:265}:{x:755,y:435,w:255},
  portrait?(tall?{x:72,y:915,w:935}:{x:210,y:742,w:660}):{x:580,y:470,w:420},
 ];
 let art=artPoses[0];for(let i=1;i<6;i++){const t=p(f,beats[i]-16,34);art={x:mix(art.x,artPoses[i].x,t),y:mix(art.y,artPoses[i].y,t),w:mix(art.w,artPoses[i].w,t)};}
 const artVisible=1-p(f,271,18)*(1-p(f,360,22));
 const artH=art.w*.5625+47;
 const taskY=portrait?(tall?865:750):597;
 const taskH=portrait?(tall?700:430):300;
 const taskX=m,taskW=inner;
 const focus=p(f,513,28),fix=p(f,563,25),taskEnter=p(f,390,25),taskLeave=p(f,630,20);
 const buttonW=portrait?244:248,buttonH=portrait?(tall?125:103):87;
 return <AbsoluteFill data-native-root style={{background:C.navy,color:C.paper,fontFamily:artFont,overflow:'hidden'}}>
  <Fonts/>
  <svg width={W} height={H} style={{position:'absolute',opacity:.18}}><defs><pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#54b6b9" strokeWidth="1"/></pattern></defs><rect width={W} height={H} fill="url(#grid)"/><circle cx={W*.8} cy={H*.5} r={H*.32} fill="none" stroke="#92e4da" strokeWidth="1"/></svg>
  <div style={{...box(m,40,inner),display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:23,letterSpacing:2}}><Text id="brand">ART DIRECTOR <span style={{color:C.mint}}>●</span></Text><Text id="agent-label" style={{fontSize:18,color:C.muted}}>{tr(language,'在你的 Agent 里完成','WORK IN YOUR AGENT')}</Text></div>
  <div data-region="shared-reference" style={{...box(art.x,art.y,art.w,artH),padding:9,background:C.paper,borderRadius:14,boxSizing:'border-box',boxShadow:shadow,transform:`perspective(1800px) rotateY(-3deg) rotate(${mix(-2,2,p(f,620))}deg)`,opacity:artVisible,zIndex:1}}><Img src={staticFile('art-director/studio/asset-system-board.png')} style={{width:'100%',height:art.w*.5625-10,objectFit:'contain',display:'block',borderRadius:6}}/>{(phase===0||phase===5)&&<Text id="art-caption" style={{color:C.teal,fontSize:art.w>500?20:15,marginTop:7}}>{tr(language,'项目参考 · 原创候选','PROJECT REFERENCE')}</Text>}</div>
  <Beat f={f} index={0} beats={beats}>
   {title(0)}
   <div data-region="input-prompt" style={{...box(m,portrait?(tall?542:480):416,portrait?inner:450),padding:tall?32:25,border:'1px solid #92e4da70',background:'#06344d',borderRadius:18,boxSizing:'border-box',boxShadow:shadow,opacity:p(f,13),transform:`translateX(${(1-p(f,13))*-70}px)`}}><Text id="input-label" style={{color:C.mint,fontSize:23}}>{tr(language,'你对 Agent 说','YOU → YOUR AGENT')}</Text><Text id="input-quote" style={{fontSize:tall?40:portrait?34:31,marginTop:16}}>{tr(language,'“用这些参考，建立项目规范。”','“Turn these references into our project’s art direction.”')}</Text></div>
   <div data-region="input-chips" style={{...box(portrait?m:565,portrait?(tall?805:693):738,portrait?inner:450),display:'flex',flexDirection:portrait?'row':'column',gap:portrait?16:12,flexWrap:'wrap'}}>{['已有作品','喜欢的参考','主美的批注'].map((s,i)=><Text id={`input-chip-${i}`} key={i} style={{padding:portrait?'12px 22px':'10px 20px',fontSize:portrait?27:23,color:C.navy,background:i===2?C.mint:C.paper,borderRadius:7,opacity:p(f,28+i*7),transform:`rotate(${(1-p(f,28+i*7))*8}deg) translateY(${(1-p(f,28+i*7))*35}px)`}}>{tr(language,s,['Your work','References','Director’s notes'][i])}</Text>)}</div>
   <Text id="input-note" style={{...box(m,portrait?(tall?H-226:1252):730,portrait?inner:445),fontSize:portrait&&!tall?27:30,color:C.muted}}>{tr(language,'资料不完整，也能先整理出初稿。','Start with a draft, even with incomplete inputs.')}</Text>
  </Beat>
  <Beat f={f} index={1} beats={beats}>
   {title(1)}
   {caption('define-body',tr(language,'Agent 整理要求与样板，主美逐步校准。','Your agent organizes the rules.\nThe director reviews samples.'),portrait?490:414,portrait?inner:620)}
   <div data-region="style-rules" style={paper(m,portrait?(tall?730:647):548,portrait?inner:635,{padding:portrait?38:22,transform:`perspective(2000px) rotateY(${mix(-10,0,p(f,127,30))}deg)`})}>
    <Text id="rules-label" style={{fontSize:portrait?22:18,color:C.teal}}>{tr(language,'设计规范 / UI 组件','DESIGN RULES / UI')}</Text>
    <Text id="rules-title" style={{fontSize:portrait?50:33,fontWeight:800,margin:portrait?'12px 0 18px':'12px 0'}}>{tr(language,'每种状态，都有依据','Every state, defined')}</Text>
    {[[tr(language,'固定','KEEP'),tr(language,'配色 · 轮廓 · 光源','Palette · shape · lighting')],[tr(language,'变化','VARY'),tr(language,'默认 · 按下 · 禁用','Default · pressed · disabled')],[tr(language,'验收','CHECK'),tr(language,'实际尺寸 · 放回界面','Actual size · in context')]].map(([l,s],i)=><div key={i} style={{display:'flex',gap:portrait?28:20,padding:portrait?'25px 0':'8px 0',borderTop:'1px solid #bfcfd4',opacity:p(f,142+i*12,18)}}><Text id={`rule-key-${i}`} style={{fontSize:portrait?27:21,color:C.teal,width:portrait?103:80,flexShrink:0}}>{l}</Text><Text id={`rule-value-${i}`} style={{fontSize:portrait?34:22}}>{s}</Text></div>)}
    <Text id="director-stamp" style={{position:'absolute',right:0,bottom:-35,padding:'16px 22px',background:C.teal,color:C.paper,borderRadius:6,fontSize:portrait?30:23,fontWeight:650,opacity:p(f,210,18),transform:`scale(${mix(1.3,1,p(f,210,18))}) rotate(-3deg)`}}>{tr(language,'主美看样板，再确认','DIRECTOR REVIEWS THE SAMPLE')}</Text>
   </div>
   <div data-region="palette" style={{...box(portrait?m:748,portrait?H-241:736,portrait?520:252),display:'flex',gap:15,flexWrap:'wrap'}}>{['#f97316','#377fb0','#768b5e','#d5c8ae','#575450'].map((c,i)=><div key={c} style={{width:portrait?75:60,height:portrait?75:60,background:c,borderRadius:11,border:'3px solid #f5f9fb',transform:`translateY(${(1-p(f,160+i*7))*30}px)`}}/>)}</div>
  </Beat>
  <Beat f={f} index={2} beats={beats}>
   {title(2)}
   {(()=>{const py=portrait?(tall?690:570):430,pw=portrait?620:535,px=(W-pw)/2,ph=portrait?(tall?420:315):250,ry=portrait?(tall?1280:1030):755,rw=portrait?410:430;return <>
    <svg width={W} height={H} style={{position:'absolute'}}>{[m,W-m-rw].map((x,i)=><path key={i} d={`M${W/2},${py+ph-10} C${W/2},${py+ph+100} ${x+rw/2},${ry-80} ${x+rw/2},${ry}`} fill="none" stroke={C.mint} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p(f,316+i*5,29)}/>)}</svg>
    {[2,1,0].map(i=><div key={i} style={paper(px+i*12,py-i*16,pw,{height:ph,background:i===0?C.teal:i===1?'#b2cbd7':C.paper,transform:`perspective(1800px) rotateX(${mix(20,0,p(f,265,28))}deg) rotate(${i*4*(1-p(f,285,27))}deg)`,zIndex:3-i})}>{i===0&&<><Text id="pack-version" style={{fontSize:25,letterSpacing:2,color:C.mint}}>PROJECT SKILL / v1.0</Text><Text id="pack-file" style={{fontSize:portrait?84:67,fontWeight:800,color:C.paper,marginTop:portrait?36:18}}>SKILL.md</Text><Text id="pack-contents" style={{fontSize:portrait?32:27,color:C.paper,marginTop:portrait?32:14}}>{tr(language,'规范 + 样板 + 交付要求','Rules + samples + delivery specs')}</Text></>}</div>)}
    {[tr(language,'团队成员','Teammates'),tr(language,'外部伙伴','External partners')].map((s,i)=><div data-region={`recipient-${i}`} key={i} style={paper(i?W-m-rw:m,ry,rw,{padding:portrait?29:23,opacity:p(f,334+i*5,20),transform:`translateY(${(1-p(f,334+i*5))*45}px)`})}><Text id={`recipient-label-${i}`} style={{color:C.teal,fontSize:23}}>PROJECT v1.0</Text><Text id={`recipient-name-${i}`} style={{fontSize:portrait?39:33,fontWeight:700,marginTop:12}}>{s}</Text></div>)}
   </>})()}
   {caption('share-note',tr(language,'装进各自的 Agent，不用重讲一遍。','Load it in their agents. Keep the context.'),(portrait?H-231:906))}
  </Beat>
  <Beat f={f} index={3} beats={beats}>
   {title(3)}
   <div data-region="task-prompt" style={{...box(m,portrait?491:423,portrait?620:640),zIndex:4}}><Text id="task-label" style={{color:C.mint,fontSize:22}}>{tr(language,'成员对 Agent 说','TEAMMATE → AGENT')}</Text><Text id="task-quote" style={{fontSize:portrait?39:31,marginTop:13}}>{tr(language,'“按项目规则，\n做按钮三态。”','“Make the three button states\nusing our project rules.”')}</Text></div>
   {caption('task-context',tr(language,'规则、参考、版本，自动接到任务里。','Rules, references and version travel with the task.'),(portrait?H-230:909))}
  </Beat>
  <Beat f={f} index={4} beats={beats}>
   {title(4)}
   {caption('review-body',tr(language,'按规则逐项检查，\n把返工说清楚。','Check against the rules.\nMake the revision specific.'),portrait?507:432,650)}
   {caption('review-note',tr(language,'共性问题，交主美更新规范。','Shared issues go back to the director.'),(portrait?H-230:909))}
  </Beat>
  {f>=385&&f<650&&<div data-region="shared-task-surface" style={paper(taskX,taskY,taskW,{height:taskH,zIndex:5,opacity:taskEnter*(1-taskLeave),transform:`perspective(1900px) rotateX(${(1-taskEnter)*12}deg) translateY(${(1-taskEnter)*60}px)`})}>
   <Text id="task-surface-label" style={{fontSize:portrait?25:22,color:C.teal}}>{focus>.5?tr(language,'对照规范 / 禁用态','CHECK AGAINST THE RULE / DISABLED'):tr(language,'本次制作 / UI 按钮','TASK / UI BUTTONS')}</Text>
   {['默认','按下','禁用'].map((s,i)=>{const baseX=tall?35:28+i*298;const bx=i===2?mix(baseX,35,focus):baseX;const baseY=tall?105+i*170:portrait?130:96;const by=i===2?mix(baseY,tall?150:baseY,focus):baseY;const isDisabled=i===2;return <div key={s} data-region={`state-${i}`} style={{...box(bx,by,buttonW,buttonH+67),opacity:p(f,413+i*15,20)*(isDisabled?1:1-focus),transform:`translateY(${(1-p(f,413+i*15,20))*30}px)`}}><div style={{height:buttonH,borderRadius:23,border:'4px solid #674833',background:i===1?'linear-gradient(#aa501d,#8e3917)':isDisabled&&fix>.5?'linear-gradient(#cbc9c0,#a4a59f)':'linear-gradient(#ffb457,#eb6718)',boxShadow:'0 7px 0 #573b2e55, inset 0 4px 0 #ffffff65',display:'flex',alignItems:'center',justifyContent:'center',color:isDisabled&&fix>.5?'#626864':'#fff3db',fontWeight:800,fontSize:portrait?48:40,filter:isDisabled?`saturate(${mix(1,.08,fix)})`:'none'}}>GO</div><Text id={`button-label-${i}`} style={{textAlign:tall&&focus<.5?'left':'center',fontSize:portrait?30:25,marginTop:tall&&focus<.5?0:17,...(tall&&focus<.5?{position:'absolute',left:315,top:32,width:440}:{})}}>{tr(language,s,['Default','Pressed','Disabled'][i])}</Text></div>})}
   <div data-region="review-annotations" style={{...box(365,portrait?(tall?160:115):85,taskW-440),opacity:focus}}><Text id="issue" style={{fontSize:portrait?36:29,fontWeight:700,color:fix>.9?C.teal:'#b14826'}}>{fix>.9?tr(language,'✓ 禁用态已区分','✓ Disabled state is distinct'):tr(language,'禁用态，别像还能点','Disabled should look disabled')}</Text><Text id="revision" style={{fontSize:portrait?30:24,marginTop:17,color:'#516b78'}}>{tr(language,'降低饱和度\n拉开状态差异','Lower the saturation.\nMake the state distinct.')}</Text></div>
   <Text id="task-surface-footer" style={{position:'absolute',left:portrait?38:28,right:28,bottom:24,fontSize:portrait?25:21,color:C.teal,borderTop:'1px solid #bfcfd4',paddingTop:14}}>{focus>.5?tr(language,'问题 → 修改依据 → 复查','Issue → rule → recheck'):tr(language,'沿用配色、轮廓与光源 · 首件待评审','Shared palette, shape and lighting · draft')}</Text>
  </div>}
  <Beat f={f} index={5} beats={beats}>
   <Text id="closing-eyebrow" style={{...box(m,titleY,inner),color:C.mint,fontSize:portrait?27:22,letterSpacing:3}}>ONE TEAM, ONE VISUAL MEMORY.</Text>
   <div data-region="closing-title" style={{...box(m,portrait?270:230,inner),fontSize:language==='zh'?(portrait?103:82):(portrait?94:76),fontWeight:760,letterSpacing:-3}}>{(language==='zh'?['一个团队／项目，','一份视觉记忆。']:['One team,','one visual memory.']).map((s,i)=><Kinetic key={s} id={`closing-title-${i}`} f={f} start={634+i*5} style={{color:i?C.mint:C.paper}}>{s}</Kinetic>)}</div>
   {caption('closing-body',tr(language,'让每一次交付，都有共同依据。','A shared foundation for every delivery.'),portrait?568:445,portrait?inner:490)}
   <div data-region="closing-file" style={{...box(m,portrait?(tall?726:661):589,portrait?inner:470),display:'flex',alignItems:'center',gap:22,color:C.mint,fontSize:portrait?38:29,fontWeight:650}}><Text id="style-source">STYLE.md</Text><span>→</span><Text id="skill-delivery">SKILL.md</Text></div>
   <Text id="closing-cta" style={{...box(m,H-255,inner),color:C.navy,background:C.mint,borderRadius:12,padding:'25px 30px',boxSizing:'border-box',fontSize:portrait?38:31,fontWeight:650}}>{tr(language,'装上 Skill，在你的 Agent 里开始。','Install the Skill. Start in your agent.')}</Text>
  </Beat>
  <div style={{...box(m,H-132,inner),zIndex:8,borderTop:'1px solid #92e4da50',paddingTop:19}}><div style={{display:'flex',gap:portrait?22:14,alignItems:'center',flexWrap:'wrap'}}>{['资料','规范与样板','项目包','成员制作','检查与返修'].map((s,i)=><Text id={`nav-${i}`} key={i} style={{fontSize:language==='zh'?23:21,color:Math.min(phase,4)===i?C.mint:C.muted,fontWeight:phase===i?750:400}}>{tr(language,s,['Inputs','Rules & samples','Project pack','Team task','Review & revise'][i])}</Text>)}</div><Text id="truth-footer" style={{fontSize:20,color:C.muted,marginTop:13}}>{tr(language,'流程示意 · 原创候选素材','ILLUSTRATED FLOW · CANDIDATE ART')}</Text></div>
  <div style={{position:'absolute',bottom:0,height:5,width:W*f/719,background:C.mint}}/>
  <Audit enabled={audit} project="art-director" language={language}/>
 </AbsoluteFill>;
}
