/* Original allegory assembled from disclosed historical cut-outs. All geometry is song-time pure. */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise,stroke,fill,line,ellipse,piece,joint,rays,cloud}=A;
 const brass=t=>A.brass(t);
 const roots=[];
 function rootCurve(s,i){const x=s?1220:690,sign=s?-1:1,end=900+i*31;return [x+(i-2)*10,782,x+(i-2)*31,863+i*9,end-sign*(83+(i%2)*28),965+(i%3)*16,end,916+[0,26,46,15,38][i]]}
 for(let s=0;s<2;s++)for(let i=0;i<5;i++)roots.push(rootCurve(s,i));
 function bez(p,u){const v=1-u;return [v*v*v*p[0]+3*v*v*u*p[2]+3*v*u*u*p[4]+u*u*u*p[6],v*v*v*p[1]+3*v*v*u*p[3]+3*v*u*u*p[5]+u*u*u*p[7]]}
 // Closed, tapered wood silhouettes: a root has volume before it has bark lines.
 function rootSection(b,u,width){const q=bez(b,u),a=bez(b,Math.max(0,u-.002)),z=bez(b,Math.min(1,u+.002));
  const dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy)||1;
  return {q,n:[-dy/len,dx/len],r:width};
 }
 // v9: engraved wood. Organic swelling, shading hatched across the grain on the shadow side
 // (no long parallel lines, which read as planks), and for roots, tapering rootlets and hair at the tip.
 function woodyRoot(b,phase,base,tip,seed,opts={}){if(phase<=0)return;const sections=[];
  // Section spacing follows arc length, so the hatching is engraving-tight (about 3 px) on long roots too.
  let arc=0;for(let i=1,pv=bez(b,0);i<=16;i++){const q=bez(b,i/16*phase);arc+=Math.hypot(q[0]-pv[0],q[1]-pv[1]);pv=q}
  const N=opts.n||Math.round(clamp(arc/3.1,12,260));
  for(let i=0;i<=N;i++){const u=i/N*phase,taper=Math.pow(u,.8);let r=mix(base,tip,taper)*(1+.11*Math.sin(u*17+seed)+.06*Math.sin(u*43+seed*2.3));
   // v11: a growing tip comes to a point (no sawn ends); roots narrow into a neck under the foot.
   if(phase<1)r*=mix(.12,1,clamp((phase-u)/.07));if(opts.neck)r*=mix(.5,1,smooth(0,.09,u));sections.push(rootSection(b,u,r/2))}
  g.beginPath();for(let i=0;i<sections.length;i++){const {q,n,r}=sections[i];i?g.lineTo(q[0]+n[0]*r,q[1]+n[1]*r):g.moveTo(q[0]+n[0]*r,q[1]+n[1]*r)}
  for(const {q,n,r} of sections.slice().reverse())g.lineTo(q[0]-n[0]*r,q[1]-n[1]*r);
  g.closePath();g.fillStyle=opts.fill||(seed%2?'#d6bd88':'#e2c995');g.fill();g.strokeStyle=C.ink;g.lineWidth=opts.outline||1.8;g.stroke();
  // Shadow half: a darker wash, then wrapping hatch lines that fade toward the lit core.
  g.beginPath();sections.forEach(({q,n,r},i)=>{const x=q[0]+n[0]*r*.12,y=q[1]+n[1]*r*.12;i?g.lineTo(x,y):g.moveTo(x,y)});
  for(const {q,n,r} of sections.slice().reverse())g.lineTo(q[0]+n[0]*r*.98,q[1]+n[1]*r*.98);g.closePath();g.fillStyle='rgba(120,88,44,.42)';g.fill();
  const ink=new Path2D(),fine=new Path2D();
  sections.forEach(({q,n,r},i)=>{if(i<1||i>=sections.length-1||r<1.6)return;const t=sections[i+1].q,dx=t[0]-q[0],dy=t[1]-q[1],l=Math.hypot(dx,dy)||1,tx=dx/l,ty=dy/l;
   const from=.22+.18*noise(seed*7+i);
   ink.moveTo(q[0]+n[0]*r*from,q[1]+n[1]*r*from);ink.quadraticCurveTo(q[0]+n[0]*r*.62+tx*r*.18,q[1]+n[1]*r*.62+ty*r*.18,q[0]+n[0]*r*.97,q[1]+n[1]*r*.97);
   if(i%2===0){fine.moveTo(q[0]+n[0]*r*.62-tx*r*.3,q[1]+n[1]*r*.62-ty*r*.3);fine.lineTo(q[0]+n[0]*r*.96+tx*r*.3,q[1]+n[1]*r*.96+ty*r*.3)}
   // Broken bark flecks along the lit side.
   if(i%4===(seed%4)&&r>4){const o=-.3-.4*noise(seed+i),k=4+5*noise(seed+i*3);fine.moveTo(q[0]+n[0]*r*o-tx*k,q[1]+n[1]*r*o-ty*k);fine.lineTo(q[0]+n[0]*r*o+tx*k,q[1]+n[1]*r*o+ty*k)}
  });
  g.strokeStyle=C.ink;g.lineWidth=.7;g.stroke(ink);g.strokeStyle='#4a3a22';g.lineWidth=.5;g.stroke(fine);
  if(!opts.rootlets)return;
  // Rootlets leave the side of the root and curl downward into the soil; hair splays from the tip.
  for(let k=0;k<opts.rootlets;k++){const u=.18+.72*noise(seed*13+k*7.1);if(u>phase)continue;
   const {q,n,r}=rootSection(b,u,mix(base,tip,Math.pow(u,.8))/2),side=noise(seed+k*3.7)>.5?1:-1;
   const len=(opts.rootletLen||84)*(.55+.75*noise(seed+k*5.3))*(1-u*.35),p0=[q[0]+n[0]*side*r*.7,q[1]+n[1]*side*r*.7];
   const d=[n[0]*side*.8,n[1]*side*.8+.55],dl=Math.hypot(...d)||1,dx=d[0]/dl,dy=d[1]/dl,curl=(noise(seed+k)-.5)*1.6;
   const end=[p0[0]+dx*len+dy*len*curl,p0[1]+dy*len-dx*len*curl*.5];
   woodyRoot([p0[0],p0[1],p0[0]+dx*len*.35,p0[1]+dy*len*.35,end[0]-dx*len*.25+dy*len*curl*.4,end[1]-dy*len*.2,end[0],end[1]],clamp((phase-u)*4),Math.max(2.6,r*.34),.7,seed+k*11,{outline:1,fill:opts.fill});
  }
  if(phase>=.98){const e=bez(b,1),a=bez(b,.97),ax=e[0]-a[0],ay=e[1]-a[1],al=Math.hypot(ax,ay)||1,hair=new Path2D();
   for(let k=0;k<5;k++){const s=(k-2)*.38,cx=ax/al*Math.cos(s)-ay/al*Math.sin(s),cy=ax/al*Math.sin(s)+ay/al*Math.cos(s),l=10+12*noise(seed+k*2);hair.moveTo(e[0],e[1]);hair.quadraticCurveTo(e[0]+cx*l*.6+3,e[1]+cy*l*.6+3,e[0]+cx*l,e[1]+cy*l+4)}
   g.strokeStyle=C.ink;g.lineWidth=.7;g.stroke(hair)}
 }
 function rootSignal(t){const flow=A.performance.flow(t);if(!flow.active)return;
  const left=roots[2],right=roots[7],p=flow.u<.5?bez(left,flow.u*2):bez(right,(1-flow.u)*2);
  A.glow(p[0],p[1],30);
 }
 function rootNetwork(t){const p=smooth(61,63.75,t);if(!p)return;
  for(let j=0;j<roots.length;j++){const ch=A.performance.choreography(j<5?'sol':'luna',t),b=roots[j].slice();b[0]+=ch.x+spread(j>=5,t);b[1]-=ch.hop;b[2]+=ch.x*.7;const phase=clamp(p*1.18-(j%5)*.018);
   // A staggered woody fork sits behind each parent root.
   for(const u of [.34+noise(j+21)*.33]){if(phase<=u)continue;const {q,n}=rootSection(b,u,1),side=j%2?1:-1;
    woodyRoot([q[0],q[1],q[0]+n[0]*side*25,q[1]+20,q[0]+n[0]*side*38,q[1]+41,q[0]+n[0]*side*48,q[1]+48],clamp((phase-u)*4),10,1.6,j);
   }
   woodyRoot(b,phase,30+(j%5)*3,9+(j%3)*2,j,{rootlets:6,neck:true});
   const u=((t-61)*.075+j*.053)%1;if(u<phase){const v=bez(b,u);ellipse(v[0],v[1],4,2,C.gold)}
  }
 }
 function leaf(x,y,a,s,p){if(p<=0)return;g.save();g.translate(x,y);g.rotate(a);g.scale(s*p,s*p);fill('M0 0Q-25-18-13-48Q14-30 0 0',C.green);stroke('M0 0Q-25-18-13-48Q14-30 0 0');stroke('M0 0L-13-42',C.ink,.8);for(let j=0;j<5;j++)line(-3-j*2,-8-j*6,-13-j,-11-j*6,C.ink,.55);g.restore()}
 // The approximate dance pulse is choreography, not a verified beat transcription.
 const pulse=t=>(t-48.073)*(145/60)*Math.PI;
 const rotate=(p,o,a)=>[o[0]+Math.cos(a)*(p[0]-o[0])-Math.sin(a)*(p[1]-o[1]),o[1]+Math.sin(a)*(p[0]-o[0])+Math.cos(a)*(p[1]-o[1])];
 const cueProgress=(key,t)=>{const [a,b]=ALCHEMY_CUES.chorus[key];return smooth(a,b,t*ALCHEMY_CUES.fps)};
 const spread=(moon,t)=>(moon?1:-1)*34*smooth(122.7,125.2,t);
 function personPose(which,t,phase=0,cueTime=t,role='',receive=0,bloom=0){const moon=which==='luna',x=(moon?1220:690)+spread(moon,t),foot=797,s=.485,ox=moon?1030:325;
  const chore=role?{x:0,hop:0,left:0,right:0,elbow:0,lean:0,head:0,stretch:1}:A.performance.choreography(which,cueTime);
  const appear=cueProgress('sharedArrival',cueTime),lift=cueProgress(moon?'lunaBranches':'solBranches',cueTime)*A.performance.branchPresence(which,cueTime);
  const act=A.performance.actor(which,cueTime,role);act.extra=receive;act.bloom=role?bloom:(cueTime*24>=ALCHEMY_CUES.performance.rootExchange[moon?1:0]?1:0);
  if(role==='listener'){act.head+=(moon?-.34:.34)*receive;act.lean+=(moon?.055:-.055)*receive}
  else if(role==='carrier'){act.arms+=(moon?-.34:.34)*receive;act.stretch-=.035*receive}
  else if(role==='caretaker'){act.canopy+=.45*Math.max(receive,bloom);act.arms+=(moon?-.16:.16)*Math.max(receive,bloom)}
  else {act.lean+=(moon?-.16:.16)*receive;act.stretch-=.09*receive;act.head+=(moon?.20:-.20)*receive;act.canopy+=.18*receive}
  const q=pulse(t)+(moon?Math.PI*.64:0)+phase,dance=cueProgress('dance',cueTime)*act.dance;
  const meet=role?0:A.performance.bump(50.45,50.85,52.6,t),step2=role?0:A.performance.bump(53.4,53.75,54.6,t);
  const lean=.085*Math.sin(q)*dance+act.lean+chore.lean+(moon?-.07:.07)*meet,stretch=(1-.024*(.5+.5*Math.sin(q*2-.5))*dance)*act.stretch*chore.stretch;
  const left=(moon?-.29:.44)*lift+.24*Math.sin(q-.38)*dance+act.arms-(moon?.02:.12)*act.birdLoad+chore.left;
  const right=(moon?-.26:-.38)*lift-.22*Math.sin(q+.34)*dance+act.arms+(moon?.12:.02)*act.birdLoad+chore.right;
  const elbow=(moon?.23:-.26)*lift+.28*Math.sin(q-.9)*dance+chore.elbow;
  const head=-lean*.6+.028*Math.sin(q-1)*dance+act.head+chore.head+(moon?-.16:.16)*meet;
  const world=p=>{const v=rotate([(p[0]-ox)*s,(p[1]-1200)*s*stretch],[0,0],lean);return [x+chore.x+(moon?-22:22)*step2+v[0],foot-chore.hop-10*step2+28*(1-appear)+v[1]]};
  const lh=moon?rotate([712,695],[892,355],left):rotate(rotate([242,418],[140,471],elbow),[230,344],left);
  const rh=moon?rotate(rotate([944,402],[1100,512],elbow),[1089,358],right):rotate([490,590],[426,349],right);
  return {moon,x:x+chore.x,foot:foot-chore.hop,s,ox,appear,cueTime,act,left,right,elbow,head,lean,stretch,world,
   hands:[world(lh),world(rh)],boughAngles:[lean+.12*Math.sin(q-.7)*dance-.17*act.birdLoad+.65*act.caretakerLift+.10*act.shelterReply,lean-.12*Math.sin(q+.1)*dance+.17*act.birdLoad-.10*act.shelterReply]};
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
  const open=cueProgress(p.moon?'lunaBranches':'solBranches',p.cueTime)*A.performance.branchPresence(p.moon?'luna':'sol',p.cueTime),leaves=cueProgress(p.moon?'lunaLeaves':'solLeaves',p.cueTime);
  return {hand:p.hands[side],angle:p.boughAngles[side],dir,seed,vitality:Math.max(p.act.extra,p.act.bloom),leaves:leaves*(A.leafSeason?A.leafSeason(t):1),nodes:boughGeometry(open,t,seed).map(n=>({...n,px:n.px*p.act.canopy,ex:n.ex*p.act.canopy,cx:n.cx*p.act.canopy}))};
 }
 function bough(spec){const {hand,angle,dir,seed,leaves,nodes,vitality=0}=spec;g.save();g.translate(...hand);g.rotate(angle);g.scale(dir,1);
  for(const {px,py,ex,ey,cx,cy,aa,depth,id} of nodes){
   const path=`M${px} ${py}Q${cx} ${cy} ${ex} ${ey}`;stroke(path,'#c6ac70',Math.max(leaves<.5?3.1:2,depth*2));stroke(path,C.ink,Math.max(leaves<.5?1.1:.65,depth*.45));
   if(depth<3){const q=clamp(leaves*1.5-noise(id+seed)*.4);leaf(ex,ey,aa+1.7,.42+noise(id+18)*.25,q);leaf(mix(px,ex,.6),mix(py,ey,.6),aa-.5,.35+noise(id+52)*.16,q)}
   if(depth===2&&vitality>.01){g.save();g.globalAlpha=vitality;ellipse(ex,ey,9*vitality,6*vitality,C.gold,C.ink);g.restore()}
   for(let h=1;h<depth*3;h++){const u=h/(depth*3),xx=(1-u)*(1-u)*px+2*(1-u)*u*cx+u*u*ex,yy=(1-u)*(1-u)*py+2*(1-u)*u*cy+u*u*ey;line(xx-2,yy+1,xx+2,yy-1,C.ink,.5)}
  }
  g.restore();
 }
 function person(which,t,style={}){const p=personPose(which,t,style.phase||0,style.songTime??t,style.role||'',style.receive||0,style.bloom||0),{moon,x,foot,s,ox,appear,left,right,elbow,head,lean,stretch}=p;if(!appear)return;
  const color=style.color||(moon?C.rose:C.blue),wash=cueProgress('wash',p.cueTime);
  g.save();g.translate(x,foot+28*(1-appear));g.rotate(lean);g.scale(s,s*stretch);g.translate(-ox,-1200);g.globalAlpha=appear;
  if(style.headOnly){joint(moon?994:332,290,head,()=>{g.save();g.translate(moon?994:332,290);g.scale(p.act.headScale,p.act.headScale);g.translate(-(moon?994:332),-290);piece(which+'-head',moon?'#bdc9d3':C.gold,wash);g.restore()});g.restore();return}
  // A hand emerges from the previously closed sleeve once the free-arm dance begins.
  if(!moon&&p.cueTime>=79.5)joint(426,349,right,()=>{g.save();g.translate(490,590);g.rotate(-.35);g.scale(-.83,.83);g.translate(-712,-695);g.beginPath();g.moveTo(689,725);g.lineTo(696,667);g.lineTo(725,635);g.lineTo(787,639);g.lineTo(785,680);g.lineTo(749,709);g.closePath();g.clip();piece('luna-arm-l','#e3bb90',wash);g.restore()});
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
  joint(moon?994:332,290,head,()=>{g.save();g.translate(moon?994:332,290);g.scale(p.act.headScale,p.act.headScale);g.translate(-(moon?994:332),-290);piece(which+'-head',moon?'#bdc9d3':C.gold,wash);if(moon){g.save();g.beginPath();g.arc(994,176,150,0,Math.PI*2);g.clip();g.beginPath();g.rect(700,-120,600,600);g.arc(1052,150,140,0,Math.PI*2);g.clip('evenodd');g.fillStyle='rgba(44,58,92,.30)';g.fillRect(800,-20,400,380);for(let k=-200;k<220;k+=7)line(860+k,0,860+k+120,340,'#2a3550',.7);g.restore()}rays(moon?992:333,164,174,83,32,.15+oh*.75+Math.exp(-Math.max(0,t-50.708)*8)*(t>=50.708&&t<51.5?.75:0)+brass(t)*.14);g.restore()});
  g.restore();bough(boughSpec(p,0,t));bough(boughSpec(p,1,t));
 }
 function heraldPose(x,y,flip,t,raw){const cue=A.performance.horn(raw),q=pulse(t)+(flip<0?0:Math.PI*.6);
  const inh=cue.inhale||0,bob=3*Math.sin(q*2-.5)+cue.prepare*6-9*inh,rock=.04*Math.sin(q)+cue.attack*.09+(flip<0?-.045:.045)*cue.prepare-(flip<0?-.06:.06)*inh;
  const arm=-1.28*(1-cue.lift)+.035*Math.sin(q-.4)*cue.lift;
  const world=point=>{const a=rotate(point,[878,575],arm),v=rotate([(a[0]-795)*.315*flip,(a[1]-805)*.315-112],[0,0],rock);return [x+v[0],y+112+bob+v[1]]};
  return {cue,q,bob,rock,arm,bell:world([390,305]),grip:world([550,362])};
 }
 function herald(x,y,flip,t,raw){const h=heraldPose(x,y,flip,t,raw),{cue,q,bob,rock,arm}=h;
  g.save();g.translate(x,y+112+bob);g.rotate(rock);g.translate(0,-112);g.scale(.315*flip,.315);g.translate(-795,-805);
  joint(900,570,.10*Math.sin(q-.9)-cue.attack*.16,()=>piece('fame-wing',C.cream));
  // At rest, the lowered instrument passes behind the body and cloud support.
  const instrument=()=>joint(878,575,arm,()=>{g.save();if(cue.uncover<1){g.beginPath();g.rect(885-510*cue.uncover,250,510*cue.uncover,480);g.clip()}piece('fame-drape',C.gold);piece('fame-arm','#e9be80');rays(390,305,30,47,300,cue.attack,3.55,.8);g.restore()});
  if(cue.visible&&cue.lift<.5)instrument();
  piece('fame-body',x<960?'#c96560':'#739d77');
  if(!cue.visible||cue.lift<.3||cue.uncover<1){const robe=x<960?'#c96560':'#739d77';fill('M787 488Q828 520 868 514Q906 548 914 629L851 682L728 632Q749 553 787 488Z',robe);g.save();g.clip(new Path2D('M787 488Q828 520 868 514Q906 548 914 629L851 682L728 632Q749 553 787 488Z'));g.translate(-35,-160);piece('fame-body',robe);g.restore();stroke('M787 488Q828 520 868 514Q906 548 914 629L851 682L728 632Q749 553 787 488Z',C.ink,2);for(let i=0;i<22;i++)stroke(`M${786-i*1.7} ${510+i*5}q55 ${15+i*.8} ${109-i*1.4} ${7+i*.25}`,C.ink,.7);stroke('M794 510Q778 567 745 621M852 525Q846 590 883 637',C.ink,2.2)}
  g.save();g.beginPath();g.ellipse(844,460,76,61,-.2,0,Math.PI*2);g.clip();piece('fame-body','#e4bd90');g.restore();
  if(cue.visible&&cue.lift>=.5)instrument();
  g.restore();cloud(x+10,y+120+bob*.4,1.45,flip);
 }
 function bird(x,y,scale,t,dir=1,land=0,halo=1,ph=0){g.save();g.translate(x,y);g.scale(scale*dir,scale);g.translate(-280,-360);joint(267,233,.11*Math.sin(t*9+ph)*(1-land),()=>piece('bird-rear','#d7ad47'));piece('bird-body','#e9c986');joint(329,275,Math.sin(t*9+ph)*.4*(1-land)+.15*land,()=>piece('bird-wing','#f2e6bd'));if(halo){g.globalAlpha=halo;ellipse(152,185,69,19,null,'#b88c29');ellipse(152,185,61,13,null,C.ink);g.globalAlpha=1}
  // Small long-bell instrument in the bird's beak; original engraving stays the body language.
  if(A.performance.horn(t).visible){g.save();g.translate(84,298);g.rotate(-.1-brass(t)*.06-.45*(1-A.performance.horn(t).play));fill('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.gold);stroke('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.ink,2.5);ellipse(-166,-5,7,28,C.earth,C.ink);rays(-175,-5,9,25,135,brass(t),Math.PI,.7);g.restore()}g.restore()}
 function perch(which,side,t,role='',receive=0,phase=0,bloom=0){const spec=boughSpec(personPose(which,t,phase,t,role,receive,bloom),side,t);
  const node=spec.nodes.find(n=>n.path===(which==='luna'?'RL':'L')),v=rotate([node?node.ex*spec.dir:0,node?node.ey:0],[0,0],spec.angle);
  return [spec.hand[0]+v[0],spec.hand[1]+v[1]];
 }
 function birdPose(i,t){
  const contact=ALCHEMY_CUES.performance.birdContact[i]/24,enter=smooth(64.75+i*.12,contact,t),landing=smooth(contact-.35,contact,t),exit=smooth(75.292,76.6,t);
  const ret=i===0?smooth(77.15,77.7,t):0,gone=Math.max(exit*(1-ret),smooth(80.1,81.5,t)),target=perch(i===1?'luna':'sol',i===0&&t<77.708?0:1,t);
  const dir=i%2?-1:1,x=mix([-90,2010,-140][i],target[0],enter)+gone*(i%2?440:-600);
  const y=mix([330,360,410][i],target[1],enter)-Math.sin(enter*Math.PI)*110-gone*460;
  const anchorY=y-58*.22+(1-landing)*Math.sin(t*4+i)*14;
  return {x,y:anchorY,dir,landing:landing*(1-gone),target,foot:[x,anchorY+58*.22]};
 }
 function birds(t){if(t<64.666)return;for(let i=0;i<3;i++){
  const p=birdPose(i,t);bird(p.x,p.y,.22*[1,.9,1.08][i],t,p.dir,p.landing,smooth(65.792,66.15,t),i*2.1);
 }}
 function roundel(x,y,r,t,type,on){const p=smooth(on,on+.25,t);if(!p)return;g.save();g.translate(x,y);g.scale(.85+.15*p,.85+.15*p);g.globalAlpha=p;ellipse(0,0,r+8,r+8,C.paper,C.ink);ellipse(0,0,r,r,type==='sun'?C.gold:type==='wind'?'#a0bcc5':'#c5ccd2',C.ink);g.save();g.beginPath();g.arc(0,0,r-3,0,Math.PI*2);g.clip();
  if(type==='sun'){g.scale(.25,.25);g.translate(-332,-170);piece('sol-head',C.gold);rays(332,170,155,50,30,.4+.15*Math.sin(t*2))}
  if(type==='wind'){g.globalAlpha=.8;for(let i=0;i<8;i++){let z=(t*23+i*20)%155-88;stroke(`M${z} ${-38+i*11}q35-10 66-1q17 4 28-5`,C.ink,1)}cloud(-39,12,.16);}
  if(type==='winter'){stroke('M0 70V-20M0 34L-30 4M0 14L26-14M0-6L-18-30M-30 4L-44-6M26-14L40-20M-18-30L-24-44M0-20L6-40',C.ink,4.2);stroke('M0 70V-20M0 34L-30 4M0 14L26-14M0-6L-18-30M-30 4L-44-6M26-14L40-20M-18-30L-24-44M0-20L6-40','#efe9dc',1.2);for(const [sx,sy] of [[-30,1],[26,-17],[-18,-33],[40,-23],[-44,-9],[6,-43]])ellipse(sx,sy,6,3,'#fbf7ee',C.ink);for(let i=0;i<9;i++){const xx=noise(i+41)*110-55,yy=(t*16+noise(i+52)*120)%120-62;g.save();g.translate(xx,yy);for(let a=0;a<3;a++){g.rotate(Math.PI/3);line(-4,0,4,0,'#fffbf0',1.6)}g.restore()}for(let i=0;i<14;i++){const xx=noise(i+5)*130-65,yy=(t*14+noise(i+18)*125)%125-65;line(xx-2,yy,xx+2,yy,'#fff7df',2);line(xx,yy-2,xx,yy+2,'#fff7df',2)}}
  g.restore();g.restore();}
 // v9: an engraved cross-section. A grassy field where feet stand, a cut edge, then soil strata with
 // hatching and stones, so the shared roots run through visible earth instead of blank paper.
 const cutEdge=x=>806+5*Math.sin(x*.011)+3*Math.sin(x*.037+1);
 const groundArt=(()=>{const o=A.canvas(1920,700),q=o.getContext('2d');q.translate(0,-700);const P=s=>new Path2D(s);
  const edge=cutEdge;
  const band=(y0,amp,ph)=>x=>y0+amp*Math.sin(x*.006+ph)+amp*.5*Math.sin(x*.019+ph*2);
  const strata=[[edge,'#c9a974'],[band(868,7,1),'#b8945f'],[band(935,9,2.4),'#a6814f'],[band(1005,8,4),'#946f43']];
  const outline=f=>{let d=`M60 ${f(60)}`;for(let x=60;x<=1860;x+=12)d+=`L${x} ${f(x)}`;return d};
  for(const [f,col] of strata){q.fillStyle=col;q.fill(P(outline(f)+'L1860 1400L60 1400Z'))}
  // Horizontal engraved hatching, closer and darker with depth.
  for(let y=812;y<1400;y+=y<870?7:y<940?5.5:4.5){let d=`M60 ${y}`;for(let x=60;x<=1860;x+=40)d+=`L${x} ${y+1.6*Math.sin(x*.013+y*.21)}`;q.strokeStyle='#3b2f1d';q.globalAlpha=y<870?.22:y<940?.3:.38;q.lineWidth=.7;q.stroke(P(d))}
  q.globalAlpha=1;for(const [f] of strata.slice(1)){q.strokeStyle=C.ink;q.lineWidth=1;q.stroke(P(outline(f)))}
  // Stones and pebbles, shaded on their lower right like the plates.
  for(let i=0;i<75;i++){const x=80+noise(i+301)*1760,y=835+noise(i+77)*520,rx=5+noise(i+9)*16*(y>900?1.2:.7),ry=rx*(.55+.3*noise(i+4)),a=noise(i+12)*.8-.4;
   q.save();q.translate(x,y);q.rotate(a);q.beginPath();for(let k=0;k<9;k++){const th=k/9*Math.PI*2,rr=1+.13*Math.sin(k*2.3+i);q.lineTo(Math.cos(th)*rx*rr,Math.sin(th)*ry*rr)}q.closePath();
   q.fillStyle='#d9ccac';q.fill();q.save();q.clip();q.strokeStyle=C.ink;q.lineWidth=.6;for(let k=-rx;k<rx;k+=2.6){q.beginPath();q.moveTo(k+rx*.25,ry);q.lineTo(k+rx*.7,-ry*.1);q.stroke()}q.restore();q.strokeStyle=C.ink;q.lineWidth=1.1;q.stroke();q.restore()}
  // Worm burrows and a few seed husks, small enough to be texture.
  for(let i=0;i<14;i++){const x=120+noise(i+501)*1680,y=880+noise(i+502)*420;q.strokeStyle='#3b2f1d';q.lineWidth=1.3;q.beginPath();q.moveTo(x,y);q.bezierCurveTo(x+12,y-9,x+22,y+11,x+34,y+2);q.stroke()}
  // The cut face: a dark ink edge with grass and turf hanging over it.
  q.strokeStyle=C.ink;q.lineWidth=2.2;q.stroke(P(outline(edge)));
  for(let x=64;x<1858;x+=5){const y=edge(x),h=4+6*noise(x*.7);q.strokeStyle=C.ink;q.lineWidth=.8;q.beginPath();q.moveTo(x,y-1);q.lineTo(x+1.5,y+h);q.stroke()}
  return o})();
 // The field plane between the horizon and the cut, hatched in perspective, with grass tufts.
 const fieldArt=(()=>{const o=A.canvas(1920,140),q=o.getContext('2d'),P=s=>new Path2D(s);q.translate(0,-700);
  let fp='M75 760Q480 746 960 761T1845 760';for(let x=1845;x>=75;x-=12)fp+='L'+x+' '+cutEdge(x);fp+='Z';q.save();q.clip(P(fp));q.fillStyle='#dcd09c';q.fillRect(60,740,1800,100);q.globalAlpha=.55;q.fillStyle='#c7cf8e';q.fillRect(60,740,1800,100);q.restore();q.globalAlpha=1;
  const L=(x1,y1,x2,y2,c,w)=>{q.beginPath();q.moveTo(x1,y1);q.lineTo(x2,y2);q.strokeStyle=c;q.lineWidth=w;q.stroke()};
  for(let i=0;i<190;i++){const x=85+i*9.25,y=765+noise(i+17)*10;L(x,y,x+6,y-2,C.ink,.7)}
  for(let i=0;i<520;i++){const x=85+noise(i+66)*1750,y=772+noise(i+925)*32;L(x,y,x+3+noise(i)*6,y-2,'#7f8150',.6)}
  const tufts=new Path2D();for(let i=0;i<150;i++){const x=90+noise(i+611)*1740,y=776+noise(i+612)*28;for(let k=-1;k<=1;k++){tufts.moveTo(x+k*2,y);tufts.lineTo(x+k*4+noise(i+k)*2,y-5-4*noise(i+k+9))}}
  q.strokeStyle='#3d4425';q.lineWidth=.8;q.stroke(tufts);
  // the cut edge and the turf hanging over it
  let d='M60 '+cutEdge(60);for(let x=60;x<=1860;x+=12)d+='L'+x+' '+cutEdge(x);q.strokeStyle=C.ink;q.lineWidth=2.2;q.stroke(P(d));
  for(let x=64;x<1858;x+=5){const y=cutEdge(x),h=4+6*noise(x*.7);L(x,y-1,x+1.5,y+h,C.ink,.8)}
  return o})();
 // v11: the turf is the surface; roots run below the cut, so the field strip is drawn back over their tops.
 function turf(){g.save();let d='M75 763Q480 749 960 764T1845 763';for(let x=1845;x>=75;x-=12)d+='L'+x+' '+(cutEdge(x)+9);g.clip(new Path2D(d+'Z'));g.drawImage(fieldArt,0,700);g.restore()}
 function ground(t,showRoots=true){fill('M75 760Q480 746 960 761T1845 760V1370H75Z','#dcd09c');
 g.drawImage(groundArt,0,700);g.drawImage(fieldArt,0,700);
 stroke('M75 760Q480 746 960 761T1845 760',C.ink,2);if(showRoots){rootNetwork(t);rootSignal(t);turf()}}
 function sky(){g.save();g.beginPath();g.rect(76,70,1768,690);g.clip();g.fillStyle=C.azure;g.fillRect(76,70,1768,690);g.globalAlpha=.12;g.drawImage(A.paper,0,0);g.globalAlpha=.37;
 for(let i=0;i<125;i++){let y=76+i*5.5;stroke(`M77 ${y}Q490 ${y-3} 966 ${y+1}T1844 ${y}`,C.ink,.7)}g.restore()}
 function weather(t){const c=ALCHEMY_CUES.performance,f=t*24,w=A.performance.bump(...c.wind,f),winter=smooth(c.shelter[0],c.shelter[1],f)*(1-smooth(1802,1820,f));
  if(w){g.save();g.globalAlpha=w*.55;for(let i=0;i<4;i++)stroke(`M${310+i*70} ${270+i*56}q155-48 340 9t370-5`,C.cream,2.3);g.restore()}
  if(winter){g.save();g.globalAlpha=winter;for(let i=0;i<24;i++){const x=670+noise(i+38)*640,y=210+((t-73.75)*120+noise(i)*270)%390;line(x-3,y,x+3,y,C.cream,2);line(x,y-3,x,y+3,C.cream,2)}g.restore()}
 }
 function chorusState(raw){const t=Math.floor(Math.round(raw*24)/2)/12;return Object.fromEntries(['sol','luna'].map(which=>{const p=personPose(which,t,0,raw),boughs=[0,1].map(side=>boughSpec(p,side,t));return [which,{appear:p.appear,hands:p.hands,branchNodes:boughs.map(b=>b.nodes.length),leaves:boughs.map(b=>b.leaves)}]}))}
 A.scene={turf,leaf,chorusState,birdPose,perch,bez,roots,heraldPose,sky,ground,person,herald,bird,birds,roundel,woodyRoot,personPose,pulse};
 A.draw=(raw)=>{const frame=Math.round(raw*24),t=Math.floor(frame/2)/12;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(960,540);const camera=A.performance.rootCamera(raw),pb=A.performance.push(raw),zoom=(1+.032*smooth(47,79.5,raw))*camera.z*pb.z;g.scale(zoom,zoom);g.translate(-camera.x-(pb.x-960)*pb.w+2*Math.sin(raw*.14),-camera.y-(pb.y-540)*pb.w);sky();
  // Rear cloud layer has its own slow parallax; paper-coloured silhouettes occlude the sky hatch.
  for(let i=0;i<5;i++)cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25,.72+(i%2)*.15,i%2?-1:1);
  ground(t);herald(290,294,-1,t,raw);herald(1635,294,1,t,raw);
  person('sol',t,{songTime:raw});person('luna',t,{songTime:raw});birds(t);weather(t);
  roundel(820,163,63,t,'wind',71.875);roundel(960,156,64,t,'sun',72.875);roundel(1100,163,63,t,'winter',73.75);
  g.restore();g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  // Tiny print registration ornaments belong to the plate, not to an overlay UI.
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 };
})();
