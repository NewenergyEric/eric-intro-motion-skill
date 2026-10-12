// Extracted from NewenergyEric/NewenergyEric @ 526a279 (author-requested reuse).
// Nine original vector scenes; labels now use bundled, outlined fonts.
import { inlineText } from '../text.mjs';
const C={ink:'#001f3f',teal:'#007d86',blue:'#3246ff',muted:'#526578',line:'#d9e1e5',paper:'#f3f6f7',white:'#ffffff',tint:'#e5ecf8'};
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>1-Math.pow(1-clamp(v),3);
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p)};
const mix=(a,b,p)=>a+(b-a)*p;
const f=v=>Number(v.toFixed(3));
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rect=(x,y,w,h,fill=C.white,r=4,stroke=C.line)=>`<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0,w))}" height="${f(Math.max(0,h))}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const line=(x1,y1,x2,y2,color=C.line,width=2)=>`<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const text=inlineText;
const path=(d,color=C.ink,width=2,fill='none')=>`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const circle=(x,y,r,fill=C.white,stroke=C.line,width=1.5)=>`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const group=(body,x=0,y=0,angle=0,opacity=1,scale=1)=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(scale)})" opacity="${f(clamp(opacity))}">${body}</g>`;
const draw=(d,p,color=C.teal,width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1-clamp(p))}"/>`;
const check=(x,y,p=1)=>group(draw('M0 0L5 6 14-7',p,C.teal,2.5),x,y);
const chip=(x,y,w,label,fill=C.paper,color=C.teal)=>rect(x,y,w,27,fill,2,'none')+text(x+10,y+18,label,12,color,700);
function panel(w,h,title,accent=C.teal){
 return rect(4,5,w,h,'#e5ecef',4,'none')+rect(0,0,w,h,C.white,4,C.ink)+text(14,27,title,12,C.ink,700)+line(13,40,w-13,40)+rect(0,0,4,h,accent,1,'none');
}
function sheet(w,h,title,accent=C.teal){
 let s=panel(w,h,title,accent);
 for(let i=0;i<4;i++)s+=line(15,61+i*17,w-19-(i%2)*22,61+i*17,i===0?C.muted:C.line,3);
 return s;
}
function miniDoc(x,y,angle=0,color=C.teal){return group(rect(0,0,27,34,C.white,2,C.ink)+path('M17 0V10H27')+line(6,16,20,16,color)+line(6,24,18,24,C.line),x,y,angle);}
function cube(x,y,scale=1,color=C.blue){return group(path('M0 15L28 0 56 15 28 30Z',C.ink,1.5,C.tint)+path('M0 15V49L28 65V30Z',C.ink,1.5,C.white)+path('M28 30L56 15V49L28 65Z',C.ink,1.5,color),x,y,0,1,scale);}
function cursor(x,y){return group(path('M0 0L0 27 8 20 15 34 22 30 15 17 26 17Z',C.white,2,C.ink),x,y);}
function curve(p,u){const v=1-u;return [v*v*v*p[0][0]+3*v*v*u*p[1][0]+3*v*u*u*p[2][0]+u*u*u*p[3][0],v*v*v*p[0][1]+3*v*v*u*p[1][1]+3*v*u*u*p[2][1]+u*u*u*p[3][1]];}
function packet(p,u,color=C.teal){const pt=curve(p,u);return miniDoc(pt[0]-13,pt[1]-17,-5+u*10,color);}

function marketing(t,w){
 let s='';
 for(let i=0;i<3;i++){
  const p=ease((t-i*.13)/.8),x=mix(205,22+i*187,p);
  let card=panel(163,170,w[i],i===2?C.blue:C.teal);
  if(i===0){
   card+=line(16,145,149,145,C.line,1);
   [27,48,43,78].forEach((h,j)=>{const k=ease((t-.4-j*.15)/1.1);card+=rect(20+j*30,140-h*k,17,h*k,C.teal,1,'none')});
   card+=draw('M20 87L49 73 81 84 114 59 145 65',ease((t-.6)/1.1),C.blue,2.5);
  }else if(i===1){
   for(let j=0;j<4;j++)card+=line(18,67+j*24,18+(j%2===0?126:97)*ease((t-.6-j*.2)/.8),67+j*24,j===0?C.ink:C.line,j===0?5:3);
  }else{card+=cube(54,52,.77)+line(17,128,146,128,C.ink,4)+line(17,144,118,144,C.line,3);}
  s+=group(card,x,27+35*(1-p),mix((i-1)*-8,0,p),p);
 }
 const p=ease((t-1.2)/.6);let strip=rect(0,0,550,143,C.ink,5,C.ink)+text(15,25,w[3],13,C.white,700);
 for(let i=0;i<18;i++)strip+=rect(12+i*30,36,10,5,C.white,0,'none')+rect(12+i*30,127,10,5,C.white,0,'none');
 strip+='<defs><clipPath id="film"><rect x="12" y="49" width="526" height="69" rx="2"/></clipPath></defs><g clip-path="url(#film)">';
 for(let i=-1;i<6;i++){const x=12+i*143-(t*38)%143;strip+=rect(x,49,132,69,i%2===0?C.paper:C.tint,2,'none')+cube(x+45,57,.73,i%2===0?C.teal:C.blue);}
 strip+='</g>';
 const cx=28+(t*.15%1)*490;strip+=path(`M${cx-5} 42H${cx+5}L${cx} 49Z`,C.blue,1,C.blue)+line(cx,49,cx,118,C.blue,1.5);
 s+=group(strip,22,244+30*(1-p),0,p)+group(chip(0,0,157,w[5]),216,207,0,ease((t-1.8)/.5));
 return s;
}

function sales(t,w){
 let s='';
 for(let i=0;i<3;i++){
  const x=24+i*187;s+=rect(x,24,172,242,C.paper,4,'none')+text(x+14,51,w[i],12,C.ink,700)+line(x+13,64,x+158,64,C.line,1.5);
  for(let j=0;j<(i===0?3:2);j++){
   const y=81+j*57;let card=rect(0,0,144,44,C.white,3,C.line)+circle(18,21,8,C.tint,'none')+line(34,16,123,16,C.muted,2)+line(34,29,100,29,C.line,2);
   s+=group(card,x+13,y,0,ease((t-i*.15-j*.08)/.5));
  }
 }
 const u=(t*.24)%1,px=37+u*377,py=187-24*Math.sin(u*Math.PI);
 s+=group(rect(0,0,144,51,C.white,3,C.teal)+circle(19,25,9,C.teal,'none')+line(37,19,128,19,C.ink,3)+line(37,33,109,33,C.line,2)+check(122,33,ease((u-.6)/.2)),px,py);
 let proposal=panel(326,99,w[4],C.blue)+line(16,60,248,60,C.ink,3)+line(16,78,202,78,C.line,3);
 s+=group(proposal,24,293+30*(1-ease((t-1.4)/.7)),0,ease((t-1.4)/.7));
 let plan=panel(213,99,w[3])+check(17,64,ease((t-2)/.5))+line(43,64,194,64,C.line,3)+line(43,82,169,82,C.line,2);
 s+=group(plan,372,293,0,ease((t-2)/.7));
 return s;
}

function brand(t,w){
 let s='';const origins=[[25,32,-5],[367,27,5],[382,206,-3]],gather=ease((t-1.9)/1.4);
 origins.forEach(([x,y,r],i)=>{
  let card=panel(170,126,w[i],i===1?C.blue:C.teal);
  if(i===0)card+=circle(35,73,15,C.tint,C.ink)+path('M12 109Q35 78 58 109',C.teal,2.5)+line(77,67,152,67,C.line,3)+line(77,86,136,86,C.line,3);
  if(i===1)card+=cube(21,54,.75)+line(82,65,151,65,C.ink,3)+line(82,86,138,86,C.line,3);
  if(i===2)card+=rect(17,56,134,49,C.paper,3,C.line)+line(30,72,137,72,C.muted,3)+line(30,91,117,91,C.line,3);
  s+=group(card,mix(x,221,gather),mix(y,123,gather),mix(r,0,gather),1-gather*.9);
 });
 const mx=207+32*Math.sin(t*1.4),my=190+18*Math.cos(t*1.6),lens=circle(0,0,36,C.white,C.ink,4)+circle(0,0,29,'none',C.line,1.5)+path('M25 28L59 63',C.teal,10);
 s+=group(lens,mx,my,0,1-ease((t-2.6)/.65));
 let out=panel(313,229,w[3])+text(19,82,w[4],19,C.ink,700)+line(19,103,284,103,C.teal,3)+line(19,126,258,126,C.line,3)+line(19,146,229,146,C.line,3);
 for(let i=0;i<4;i++)out+=rect(20+i*64,171,48,34,[C.ink,C.teal,C.blue,C.paper][i],2,'none');
 const p=ease((t-2.1)/.8);s+=group(out,166,119+30*(1-p),0,p);
 s+=group(chip(0,0,157,w[5]),37,355,0,p);
 const u=(t*.31)%1;s+=group(miniDoc(0,0,0,C.blue),mix(539,482,u),mix(70,304,u),0,p*Math.sin(u*Math.PI));
 return s;
}

function support(t,w){
 let s=group(panel(188,111,w[0])+line(16,63,166,63,C.ink,3)+line(16,85,142,85,C.line,3),21,24);
 s+=path('M207 79C253 79 223 188 270 188',C.line,2);
 const docs=[23,88,153];
 docs.forEach((y,i)=>{s+=group(sheet(166,107,w[2]+' '+(i+1)),395,y,0,ease((t-i*.12)/.6),.92)});
 const sy=101+(t*42)%159;s+=rect(384,sy,177,20,'#007d861b',2,C.teal);
 s+=path('M395 223C350 223 384 275 345 275',C.line,2)+packet([[395,223],[350,223],[384,275],[345,275]],(t*.45)%1,C.blue);
 let reply=panel(312,180,w[3]);
 for(let j=0;j<4;j++)reply+=line(17,65+j*23,17+(j%2===0?271:218)*ease((t-1-j*.35)/.8),65+j*23,j===0?C.ink:C.line,j===0?4:3);
 reply+=chip(15,145,179,w[4])+check(274,158,ease((t-3.3)/.7));
 s+=group(reply,22,199+20*(1-ease((t-.9)/.6)),0,ease((t-.9)/.6));
 const cy=76+12*Math.sin(t*1.8);s+=group(circle(0,0,28,C.white,C.teal,2)+path('M-9-7H9M-9 0H9M-9 7H3',C.ink,2),293,cy);
 s+=group(chip(0,0,182,w[1]),379,342,0,ease((t-2.2)/.5));
 return s;
}

function operations(t,w){
 let s='';
 for(let i=0;i<3;i++){
  const x=23+i*186;s+=rect(x,25,171,287,C.paper,4,C.line)+text(x+13,52,w[i],12,C.ink,700)+line(x+12,65,x+157,65,C.line,1);
  for(let j=0;j<2;j++){const p=ease((t-i*.1-j*.2)/.6);let card=rect(0,0,144,75,C.white,3,C.ink)+line(13,20,122,20,C.ink,3)+line(13,37,102,37,C.line,2)+circle(19,58,8,i===2?C.teal:C.tint,'none');card+=i===2?check(110,58,p):line(38,58,116,58,C.line,2);s+=group(card,x+13,86+j*96,0,p);}
 }
 const u=(t*.21)%1;
 let moving=rect(0,0,144,70,C.white,3,C.teal)+line(12,20,121,20,C.ink,3)+line(12,38,102,38,C.line,2)+check(113,56,ease((u-.67)/.2));
 s+=group(moving,36+u*375,202-29*Math.sin(u*Math.PI));
 let alert=rect(0,0,354,52,C.white,3,C.ink)+circle(23,26,11,C.paper,C.blue)+text(23,31,'!',15,C.blue,700,'middle')+text(45,31,t<2.9?w[3]:w[4],13,C.ink,700);
 alert+=group(check(322,26,ease((t-3)/.5)),0,0,0,ease((t-3)/.3));s+=group(alert,24,340,0,ease((t-1.1)/.6));
 s+=group(chip(0,0,165,w[5]),409,354,0,ease((t-3.2)/.5));
 return s;
}

function data(t,w){
 let s=group(panel(173,266,w[0]),23,28);
 for(let r=0;r<7;r++)for(let c=0;c<3;c++)s+=rect(36+c*48,81+r*28,39,17,r===Math.floor(t*1.4)%7&&c===1?'#d7ebeb':C.paper,1,'none');
 s+=rect(31,79+(Math.floor(t*1.4)%7)*28,156,22,'none',1,C.teal);
 const p=ease((t-.65)/.75);let chart=panel(349,266,w[2]);
 for(let y=85;y<236;y+=45)chart+=line(23,y,330,y,C.line,1);
 const heights=[31,60,51,95,82,134];
 heights.forEach((h,i)=>chart+=rect(29+i*49,229-h*ease((t-.7-i*.13)/1),27,h*ease((t-.7-i*.13)/1),C.teal,1,'none'));
 chart+=draw('M41 179L90 152 139 168 188 121 237 135 286 83',ease((t-1.2)/1.5),C.blue,2.5);
 const px=31+(t*.17%1)*277;chart+=line(px,64,px,234,C.muted,1)+circle(px,83+50*(1+Math.sin(t*1.6)),4,C.white,C.blue,2);
 s+=group(chart,222,28+20*(1-p),0,p);
 s+=path('M199 184H221',C.teal,2)+packet([[156,204],[221,204],[184,148],[254,148]],(t*.45)%1,C.blue);
 let notes=panel(548,83,w[3])+line(16,61,414,61,C.muted,3)+check(514,60,ease((t-3.2)/.6));
 s+=group(notes,23,319,0,ease((t-1.7)/.7));
 return s;
}

function product(t,w){
 let win=rect(0,0,366,263,C.white,5,C.ink)+rect(0,0,366,35,C.paper,5,'none')+line(0,35,366,35,C.ink,1.5);
 [14,26,38].forEach((x,i)=>win+=circle(x,17,3.5,[C.ink,C.teal,C.line][i],'none'));
 win+=text(65,22,w[0],11,C.muted,700)+rect(15,51,81,192,C.paper,2,'none');
 for(let j=0;j<5;j++)win+=line(26,70+j*29,80,70+j*29,j===1?C.teal:C.line,4);
 win+=rect(112,54,236,89,C.tint,3,'none')+cube(189,65,.9)+line(113,165,335,165,C.ink,4)+line(113,183,295,183,C.line,3)+rect(112,205,156,31,t>2.4?C.teal:C.ink,3,'none')+text(190,226,w[3],12,C.white,700,'middle');
 let s=group(win,23,26,0,ease(t/.6));
 const u=smooth((t-1)/1.8),cx=mix(377,251,u)+Math.sin(t*1.6)*6,cy=mix(159,252,u);s+=cursor(cx,cy);
 s+=group(circle(0,0,12+(t*13)%22,'none',C.teal,2),251,249,0,t>2.35?(1-(t*13)%22/22)*.6:0);
 let phone=rect(0,0,158,281,C.ink,16,C.ink)+rect(8,10,142,260,C.white,10,'none')+rect(54,15,50,7,C.ink,4,'none')+text(79,55,w[1],12,C.ink,700,'middle');
 for(let j=0;j<11;j++){const h=10+43*(.5+.5*Math.sin(t*4+j*.67));phone+=line(26+j*11,132-h/2,26+j*11,132+h/2,C.teal,4);}
 phone+=circle(79,213,21,C.teal,'none')+path('M72 210V204Q79 197 86 204V210Q79 217 72 210',C.white,2)+line(79,215,79,226,C.white,2);
 s+=group(phone,418,41+18*(1-ease((t-.3)/.7)),0,ease((t-.3)/.7));
 const p=ease((t-2.5)/.7);let note=panel(365,87,w[2])+text(17,65,w[4],14,C.ink,400)+check(332,62,p);
 s+=group(note,23,315+15*(1-p),0,p);
 return s;
}

function agents(t,w){
 const nodes=[{x:23,y:157,l:w[0]},{x:209,y:25,l:w[1]},{x:449,y:101,l:w[2]},{x:449,y:278,l:w[3]},{x:210,y:338,l:w[4]}];
 const paths=[[[126,186],[177,186],[178,205],[217,205]],[[263,79],[263,122],[280,122],[280,157]],[[449,133],[390,133],[403,191],[343,202]],[[449,306],[393,306],[407,246],[343,235]],[[264,338],[264,310],[280,312],[280,281]]];
 let s='';
 paths.forEach((p,i)=>{s+=path(`M${p[0]}C${p[1]} ${p[2]} ${p[3]}`,C.line,2)+draw(`M${p[0]}C${p[1]} ${p[2]} ${p[3]}`,ease((t-i*.13)/.7),C.teal,2)+packet(p,(t*.43+i*.19)%1,i===3?C.blue:C.teal);});
 nodes.forEach((n,i)=>s+=group(rect(0,0,112,57,C.white,4,C.ink)+text(56,34,n.l,12,C.ink,700,'middle'),n.x,n.y,0,ease((t-i*.06)/.6)));
 let core=circle(0,0,63,C.white,C.ink,2)+circle(0,0,52,C.paper,'none')+group(path('M0-61A61 61 0 0 1 58 20',C.teal,4),0,0,t*77)+text(0,4,'Agent',25,C.ink,700,'middle')+text(0,27,'you',12,C.teal,700,'middle');
 s+=group(core,281,220);
 s+=group(chip(0,0,151,w[5]),24,334,0,ease((t-2)/.7));
 return s;
}

function methods(t,w){
 let s=group(sheet(159,129,w[0]),24,26,-4,ease(t/.6));
 s+=path('M189 163L222 140H481L448 163Z',C.ink,1.5,'#e5ecef')+path('M448 163L481 140V350L448 373Z',C.ink,1.5,'#cbd7df')+rect(189,163,259,210,C.white,0,C.ink);
 [w[1],w[2],w[3]].forEach((label,i)=>{
  const y=182+i*59,open=(1+Math.sin(t*1.7+i*.7))/2;
  s+=rect(201,y,236,46,C.paper,2,C.line)+rect(207-open*7,y+5,224,36,C.white,2,C.ink)+text(223-open*7,y+29,label,13,C.ink,700)+path(`M371 ${y+17}H396V${y+24}H371Z`,C.teal,1.5);
  const u=(t*.31+i*.29)%1;let card=sheet(109,99,label,i===2?C.blue:C.teal);
  s+=group(card,mix(18+i*160,230+i*42,ease(u)),mix(29,y-28,ease(u)),mix((i-1)*11,0,u),Math.sin(u*Math.PI),mix(.85,.48,u));
 });
 s+=group(chip(0,0,170,w[5]),24,349,0,ease((t-1.5)/.6));
 const p=[[467,286],[569,286],[471,151],[537,151]];s+=path(`M${p[0]}C${p[1]} ${p[2]} ${p[3]}`,C.line,2)+packet(p,(t*.35)%1,C.blue);
 s+=group(rect(0,0,142,62,C.white,4,C.ink)+text(71,29,w[4],12,C.ink,700,'middle')+line(19,46,122,46,C.teal,3),428,56);
 return s;
}


export const profileModules={marketing,sales,brand,support,operations,data,product,agents,methods};
