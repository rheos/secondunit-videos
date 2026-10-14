/* Original allegory assembled from disclosed historical cut-outs. All geometry is song-time pure. */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise,stroke,fill,line,ellipse,piece,joint,rays,brass,cloud}=A;
 const roots=[];
 function rootCurve(s,i){const x=s?1220:690,sign=s?-1:1,end=900+i*31;return [x+(i-2)*10,782,x+(i-2)*31,863+i*9,end-sign*(83+(i%2)*28),965+(i%3)*16,end,916+[0,26,46,15,38][i]]}
 for(let s=0;s<2;s++)for(let i=0;i<5;i++)roots.push(rootCurve(s,i));
 function bez(p,u){const v=1-u;return [v*v*v*p[0]+3*v*v*u*p[2]+3*v*u*u*p[4]+u*u*u*p[6],v*v*v*p[1]+3*v*v*u*p[3]+3*v*u*u*p[5]+u*u*u*p[7]]}
 // Closed, tapered wood silhouettes: a root has volume before it has bark lines.
 function rootSection(b,u,width){const q=bez(b,u),a=bez(b,Math.max(0,u-.002)),z=bez(b,Math.min(1,u+.002));
  const dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy)||1;
  return {q,n:[-dy/len,dx/len],r:width};
 }
 function woodyRoot(b,phase,base,tip,seed){if(phase<=0)return;const sections=[];
  for(let i=0;i<=64;i++){const u=i/64*phase,r=mix(base,tip,u)*(1+.055*Math.sin(u*29+seed));sections.push(rootSection(b,u,r/2))}
  g.beginPath();for(let i=0;i<sections.length;i++){const {q,n,r}=sections[i];i?g.lineTo(q[0]+n[0]*r,q[1]+n[1]*r):g.moveTo(q[0]+n[0]*r,q[1]+n[1]*r)}
  for(const {q,n,r} of sections.slice().reverse())g.lineTo(q[0]-n[0]*r,q[1]-n[1]*r);
  g.closePath();g.fillStyle=seed%2?'#c3a572':'#d2b780';g.fill();g.strokeStyle=C.ink;g.lineWidth=1.6;g.stroke();
  for(let i=2;i<sections.length-1;i+=2){const {q,n,r}=sections[i];line(q[0]-n[0]*r*.8,q[1]-n[1]*r*.8,q[0]+n[0]*r*.45+2,q[1]+n[1]*r*.45-2,'#75613b',.7)}
  for(const side of [-.55,.45]){g.beginPath();sections.forEach(({q,n,r},i)=>{const x=q[0]+n[0]*r*side,y=q[1]+n[1]*r*side;i?g.lineTo(x,y):g.moveTo(x,y)});g.strokeStyle=side<0?'#ecd3a0':'#78613d';g.lineWidth=1.2;g.stroke()}
 }
 function rootNetwork(t){const p=smooth(61,63.75,t);if(!p)return;
  for(let j=0;j<roots.length;j++){const b=roots[j],phase=clamp(p*1.18-(j%5)*.018);
   // A staggered woody fork sits behind each parent root.
   for(const u of [.34+noise(j+21)*.33]){if(phase<=u)continue;const {q,n}=rootSection(b,u,1),side=j%2?1:-1;
    woodyRoot([q[0],q[1],q[0]+n[0]*side*25,q[1]+20,q[0]+n[0]*side*38,q[1]+41,q[0]+n[0]*side*48,q[1]+48],clamp((phase-u)*4),10,1.6,j);
   }
   woodyRoot(b,phase,32+(j%5)*3,11+(j%3)*2,j);
   const u=((t-61)*.075+j*.053)%1;if(u<phase){const v=bez(b,u);ellipse(v[0],v[1],4,2,C.gold)}
  }
 }
 function leaf(x,y,a,s,p){if(p<=0)return;g.save();g.translate(x,y);g.rotate(a);g.scale(s*p,s*p);fill('M0 0Q-25-18-13-48Q14-30 0 0',C.green);stroke('M0 0Q-25-18-13-48Q14-30 0 0');stroke('M0 0L-13-42',C.ink,.8);for(let j=0;j<5;j++)line(-3-j*2,-8-j*6,-13-j,-11-j*6,C.ink,.55);g.restore()}
 // The approximate dance pulse is choreography, not a verified beat transcription.
 const pulse=t=>(t-48.073)*(145/60)*Math.PI;
 const rotate=(p,o,a)=>[o[0]+Math.cos(a)*(p[0]-o[0])-Math.sin(a)*(p[1]-o[1]),o[1]+Math.sin(a)*(p[0]-o[0])+Math.cos(a)*(p[1]-o[1])];
 const cueProgress=(key,t)=>{const [a,b]=ALCHEMY_CUES.chorus[key];return smooth(a,b,t*ALCHEMY_CUES.fps)};
 function personPose(which,t,phase=0,cueTime=t){const moon=which==='luna',x=moon?1220:690,foot=797,s=.485,ox=moon?1030:325;
  const appear=cueProgress('sharedArrival',cueTime),lift=cueProgress(moon?'lunaBranches':'solBranches',cueTime);
  const q=pulse(t)+(moon?Math.PI*.64:0)+phase,dance=cueProgress('dance',cueTime);
  const lean=.085*Math.sin(q)*dance,stretch=1-.024*(.5+.5*Math.sin(q*2-.5))*dance;
  const left=(moon?-.29:.44)*lift+.24*Math.sin(q-.38)*dance;
  const right=(moon?-.26:-.38)*lift-.22*Math.sin(q+.34)*dance;
  const elbow=(moon?.23:-.26)*lift+.28*Math.sin(q-.9)*dance;
  const head=-lean*.6+.028*Math.sin(q-1)*dance;
  const world=p=>{const v=rotate([(p[0]-ox)*s,(p[1]-1200)*s*stretch],[0,0],lean);return [x+v[0],foot+28*(1-appear)+v[1]]};
  const lh=moon?rotate([712,695],[892,355],left):rotate(rotate([242,418],[140,471],elbow),[230,344],left);
  const rh=moon?rotate(rotate([944,402],[1100,512],elbow),[1089,358],right):rotate([490,590],[426,349],right);
  return {moon,x,foot,s,ox,appear,cueTime,left,right,elbow,head,lean,stretch,world,
   hands:[world(lh),world(rh)],boughAngles:[lean+.12*Math.sin(q-.7)*dance,lean-.12*Math.sin(q+.1)*dance]};
 }
 function boughGeometry(open,t,seed){const nodes=[];
  function grow(px,py,angle,len,depth,id,path){const stage=clamp(open*4-(4-depth)*.58);if(stage<=0)return;
   const aa=angle+.025*Math.sin(t*.7+id),ex=px+Math.cos(aa)*len*stage,ey=py+Math.sin(aa)*len*stage;
   const cx=px+Math.cos(aa+.23)*len*.52*stage,cy=py+Math.sin(aa+.23)*len*.52*stage;
   nodes.push({px,py,ex,ey,cx,cy,aa,depth,id,path});
   if(depth>1){const scale=.7+noise(id+seed)*.14;grow(ex,ey,aa-.48-noise(id)*.24,len*scale,depth-1,id*2+1,path+'L');grow(ex,ey,aa+.47+noise(id+31)*.2,len*(scale-.1),depth-1,id*2+2,path+'R')}
  }
  grow(0,0,-.62,91,4,seed+1,'');return nodes;
 }
 function boughSpec(p,side,t){const seed=p.moon?(side?52:39):(side?15:3),dir=side?1:-1;
  const open=cueProgress(p.moon?'lunaBranches':'solBranches',p.cueTime),leaves=cueProgress(p.moon?'lunaLeaves':'solLeaves',p.cueTime);
  return {hand:p.hands[side],angle:p.boughAngles[side],dir,seed,leaves:leaves*(A.leafSeason?A.leafSeason(t):1),nodes:boughGeometry(open,t,seed)};
 }
 function bough(spec){const {hand,angle,dir,seed,leaves,nodes}=spec;g.save();g.translate(...hand);g.rotate(angle);g.scale(dir,1);
  for(const {px,py,ex,ey,cx,cy,aa,depth,id} of nodes){
   const path=`M${px} ${py}Q${cx} ${cy} ${ex} ${ey}`;stroke(path,'#c6ac70',Math.max(1,depth*2));stroke(path,C.ink,Math.max(.65,depth*.45));
   if(depth<3){const q=clamp(leaves*1.5-noise(id+seed)*.4);leaf(ex,ey,aa+1.7,.42+noise(id+18)*.25,q);leaf(mix(px,ex,.6),mix(py,ey,.6),aa-.5,.35+noise(id+52)*.16,q)}
   for(let h=1;h<depth*3;h++){const u=h/(depth*3),xx=(1-u)*(1-u)*px+2*(1-u)*u*cx+u*u*ex,yy=(1-u)*(1-u)*py+2*(1-u)*u*cy+u*u*ey;line(xx-2,yy+1,xx+2,yy-1,C.ink,.5)}
  }
  g.restore();
 }
 function person(which,t,style={}){const p=personPose(which,t,style.phase||0,style.songTime??t),{moon,x,foot,s,ox,appear,left,right,elbow,head,lean,stretch}=p;if(!appear)return;
  const color=style.color||(moon?C.rose:C.blue),wash=cueProgress('wash',p.cueTime);
  g.save();g.translate(x,foot+28*(1-appear));g.rotate(lean);g.scale(s,s*stretch);g.translate(-ox,-1200);g.globalAlpha=appear;
  if(style.headOnly){joint(moon?994:332,290,head,()=>piece(which+'-head',moon?'#bdc9d3':C.gold,wash));g.restore();return}
  if(moon){joint(892,355,left,()=>piece('luna-arm-l',color,wash));joint(1089,358,right,()=>{piece('luna-upper',color,wash);joint(1100,512,elbow,()=>piece('luna-fore',color,wash))})}
  else {joint(426,349,right,()=>piece('sol-arm-r',color,wash));joint(230,344,left,()=>{piece('sol-upper',color,wash);joint(140,471,elbow,()=>piece('sol-fore',color,wash))})}
  piece(which+'-body',color,wash); // Torso covers shoulder seams; the front forearm remains independent.
  // The low hands also pass in front when a dance swing crosses the robe.
  joint(moon?892:426,moon?355:349,moon?left:right,()=>{g.save();g.beginPath();g.rect(moon?650:380,moon?520:480,moon?330:220,260);g.clip();piece(moon?'luna-arm-l':'sol-arm-r',color,wash);g.restore()});
  function fore(name,cx,cy,rx,ry){piece(name,color,wash);g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.clip();piece(name,'#e3bb90',wash);g.restore()}
  if(moon)joint(1089,358,right,()=>joint(1100,512,elbow,()=>fore('luna-fore',954,420,38,50)));
  else joint(230,344,left,()=>joint(140,471,elbow,()=>fore('sol-fore',246,443,36,55)));
  const arrival=ALCHEMY_CUES.chorus.sharedArrival[0]/ALCHEMY_CUES.fps;
  const oh=smooth(arrival,arrival+.17,p.cueTime)*(1-smooth(arrival+.32,arrival+.92,p.cueTime));
  joint(moon?994:332,290,head,()=>{piece(which+'-head',moon?'#bdc9d3':C.gold,wash);rays(moon?992:333,164,174,83,32,.15+oh*.75+Math.exp(-Math.max(0,t-50.708)*8)*(t>=50.708&&t<51.5?.75:0)+brass(t)*.14)});
  g.restore();bough(boughSpec(p,0,t));bough(boughSpec(p,1,t));
 }
 function herald(x,y,flip,t,raw){const p=brass(raw),s=.315,q=pulse(t)+(flip<0?0:Math.PI*.6);
  // Rock from the cloud support; wing, head/body and trumpet answer on different phases.
  const bob=6*Math.sin(q*2-.5),rock=.105*Math.sin(q);
  g.save();g.translate(x,y+112+bob);g.rotate(rock);g.translate(0,-112);g.scale(s*flip,s);g.translate(-795,-805);
  joint(900,570,.16*Math.sin(q-.9)-p*.09,()=>piece('fame-wing',C.cream));piece('fame-body',x<960?'#c96560':'#739d77');
  g.save();g.beginPath();g.ellipse(844,460,76,61,-.2,0,Math.PI*2);g.clip();piece('fame-body','#e4bd90');g.restore();piece('fame-drape',C.gold);
  joint(780,461,.10*Math.sin(q-.4)+p*.065,()=>{piece('fame-arm','#e9be80');rays(390,305,30,47,300,p,3.55,.8)});g.restore();
  cloud(x+10,y+120+bob*.4,1.45,flip);
 }
 function bird(x,y,scale,t,dir=1,land=0,halo=1){g.save();g.translate(x,y);g.scale(scale*dir,scale);g.translate(-280,-360);joint(267,233,.11*Math.sin(t*9)*(1-land),()=>piece('bird-rear','#d7ad47'));piece('bird-body','#e9c986');joint(329,275,Math.sin(t*9)*.4*(1-land)+.15*land,()=>piece('bird-wing','#f2e6bd'));if(halo){g.globalAlpha=halo;ellipse(152,185,69,19,null,'#b88c29');ellipse(152,185,61,13,null,C.ink);g.globalAlpha=1}
  // Small long-bell instrument in the bird's beak; original engraving stays the body language.
  g.save();g.translate(84,298);g.rotate(-.1-brass(t)*.06);fill('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.gold);stroke('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.ink,2.5);ellipse(-166,-5,7,28,C.earth,C.ink);rays(-175,-5,9,25,135,brass(t),Math.PI,.7);g.restore();g.restore()}
 function perch(which,side,t){const spec=boughSpec(personPose(which,t),side,t);
  const node=spec.nodes.find(n=>n.path===(which==='luna'?'RL':'L')),v=rotate([node?node.ex*spec.dir:0,node?node.ey:0],[0,0],spec.angle);
  return [spec.hand[0]+v[0],spec.hand[1]+v[1]];
 }
 function birds(t){if(t<64.666)return;for(let i=0;i<3;i++){
  const enter=smooth(64.666+i*.17,68.5+i*.12,t),landing=smooth(68.45,69.3,t),exit=smooth(75.292,76.6,t);
  const ret=i===0?smooth(77.708,78.6,t):0,gone=Math.max(exit*(1-ret),smooth(80.1,81.5,t)),target=perch(i===1?'luna':'sol',i===0?0:1,t);
  const dir=i%2?-1:1,x=mix(210+i*670,target[0],enter)+gone*(i%2?440:-600);
  const y=mix(220+i*45,target[1],enter)-Math.sin(enter*Math.PI)*110-gone*460;
  // Source foot point (280,418), rather than the body centre, meets the living bough.
  bird(x,y-58*.22+(1-landing)*Math.sin(t*4+i)*14,.22,t,dir,landing*(1-gone),smooth(65.792,66.15,t));
 }}
 function roundel(x,y,r,t,type,on){const p=smooth(on,on+.25,t);if(!p)return;g.save();g.translate(x,y);g.scale(.85+.15*p,.85+.15*p);g.globalAlpha=p;ellipse(0,0,r+8,r+8,C.paper,C.ink);ellipse(0,0,r,r,type==='sun'?C.gold:type==='wind'?'#a0bcc5':'#c5ccd2',C.ink);g.save();g.beginPath();g.arc(0,0,r-3,0,Math.PI*2);g.clip();
  if(type==='sun'){g.scale(.25,.25);g.translate(-332,-170);piece('sol-head',C.gold);rays(332,170,155,50,30,.4+.15*Math.sin(t*2))}
  if(type==='wind'){g.globalAlpha=.8;for(let i=0;i<8;i++){let z=(t*23+i*20)%155-88;stroke(`M${z} ${-38+i*11}q35-10 66-1q17 4 28-5`,C.ink,1)}cloud(-39,12,.16);}
  if(type==='winter'){stroke('M0 66V-31M0 12L-24-16M0-12L22-36M0 34L31 2M-24-16L-40-21M22-36L33-39',C.ink,2.6);for(let i=0;i<14;i++){const xx=noise(i+5)*130-65,yy=(t*14+noise(i+18)*125)%125-65;line(xx-2,yy,xx+2,yy,'#fff7df',2);line(xx,yy-2,xx,yy+2,'#fff7df',2)}}
  g.restore();g.restore();}
 function ground(t){fill('M75 760Q480 746 960 761T1845 760V1005H75Z','#d9c99f');for(let i=0;i<190;i++){const x=85+i*9.25,y=765+noise(i+17)*10;line(x,y,x+6,y-2,C.ink,.7)}
 for(let i=0;i<1300;i++){const x=85+noise(i+66)*1750,y=790+noise(i+925)*205;line(x,y,x+3+noise(i)*6,y-2,'#a59872',.55)}
 stroke('M75 760Q480 746 960 761T1845 760',C.ink,2);rootNetwork(t)}
 function sky(){g.save();g.beginPath();g.rect(76,70,1768,690);g.clip();g.fillStyle=C.azure;g.fillRect(76,70,1768,690);g.globalAlpha=.12;g.drawImage(A.paper,0,0);g.globalAlpha=.37;
 for(let i=0;i<125;i++){let y=76+i*5.5;stroke(`M77 ${y}Q490 ${y-3} 966 ${y+1}T1844 ${y}`,C.ink,.7)}g.restore()}
 function chorusState(raw){const t=Math.floor(Math.round(raw*24)/2)/12;return Object.fromEntries(['sol','luna'].map(which=>{const p=personPose(which,t,0,raw),boughs=[0,1].map(side=>boughSpec(p,side,t));return [which,{appear:p.appear,hands:p.hands,branchNodes:boughs.map(b=>b.nodes.length),leaves:boughs.map(b=>b.leaves)}]}))}
 A.scene={chorusState,sky,ground,person,herald,bird,birds,roundel,woodyRoot,personPose,pulse};
 A.draw=(raw)=>{const frame=Math.round(raw*24),t=Math.floor(frame/2)/12;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);g.save();g.translate(960,540);const zoom=1+.032*smooth(47,79.5,raw);g.scale(zoom,zoom);g.translate(-960+2*Math.sin(raw*.14),-540);sky();
  // Rear cloud layer has its own slow parallax; paper-coloured silhouettes occlude the sky hatch.
  for(let i=0;i<5;i++)cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25,.72+(i%2)*.15,i%2?-1:1);
  ground(t);herald(290,294,-1,t,raw);herald(1635,294,1,t,raw);
  person('sol',t,{songTime:raw});person('luna',t,{songTime:raw});birds(t);
  roundel(820,163,63,t,'wind',71.875);roundel(960,135,64,t,'sun',72.875);roundel(1100,163,63,t,'winter',73.75);
  g.restore();g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  // Tiny print registration ornaments belong to the plate, not to an overlay UI.
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 };
})();
