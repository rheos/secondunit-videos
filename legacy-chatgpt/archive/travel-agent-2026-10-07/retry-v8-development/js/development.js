/* Development of the existing travelling world. Original choreography and geometry. */
const EXT_ANGLE=Math.atan(90*Math.PI/340);
const EXT_ROOT=[routeX(travelZ(96))+35*Math.sin(EXT_ANGLE),0,travelZ(96)+35*Math.cos(EXT_ANGLE)];
const LOOP_R=45,LOOP_Z=42;
const MECHANICAL_PHASE=[0];
for(let i=0;i<MUSIC.length;i++)MECHANICAL_PHASE.push(MECHANICAL_PHASE[i]+(.65+MUSIC[i][1]*1.5)/24);
function measuredMotion(t,delay=0){
 const frame=clamp((t-delay)*24,0,MUSIC.length-1),i=Math.floor(frame);
 return{phase:mix(MECHANICAL_PHASE[i],MECHANICAL_PHASE[i+1],frame-i),kick:ATTACK[i]||0};
}
function extWorld(p){return[EXT_ROOT[0]+p[0]*Math.cos(EXT_ANGLE)+p[2]*Math.sin(EXT_ANGLE),p[1],EXT_ROOT[2]-p[0]*Math.sin(EXT_ANGLE)+p[2]*Math.cos(EXT_ANGLE)];}
function ringPoint(a,r=LOOP_R,y=5){return[-LOOP_R+r*Math.cos(a),y,LOOP_Z+r*Math.sin(a)];}
function extensionPosition(t){
 if(t<100)return[0,9.1,mix(-35,42,clamp((t-96)/4))];
 if(t<116){let a=(t-100)/16*TAU,r=LOOP_R;let u=(a-.65)/.8;if(u>0&&u<1)r+=18*Math.sin(u*Math.PI);return ringPoint(a,r,9.1);}
 if(t<128)return ringPoint(TAU+(t-116)/12*TAU,LOOP_R,9.1);
 if(t<160)return[0,9.1,42+(t-128)*5.6];
 if(t<172){
  const lean=ramp(t,160,162.5)*(1-ramp(t,169.5,172));
  return[-2.4*lean,9.1+4*lean,221.2+10.8*ramp(t,160,166)];
 }
 if(t<175)return[0,9.1,mix(232,244,(t-172)/3)];
 if(t<188.78)return[0,9.1,244];
 if(t<203.4)return[0,9.1,244+(t-188.78)*4.5];
 if(t<216)return[0,9.1,309.79+(t-203.4)*3.4];
 return[0,9.1,352.63+(t-216)*3.2];
}
function localLook(t,pos){
 const ahead=extensionPosition(t+.7),delta=sub(ahead,pos),moving=Math.hypot(delta[0],delta[2])>.04;
 let target=moving?[pos[0]+delta[0]*8,pos[1]+.15,pos[2]+delta[2]*8]:[pos[0],pos[1]+.15,pos[2]+20];
 let lens=970,roll=.003*Math.sin(t*.7);
 if(t>=100&&t<116){
  const a=(t-100)/16*TAU;let offset=0;
  for(let j=0;j<3;j++){const on=103.86+j*5.35;offset+=(ramp(t,on-.9,on-.3)-ramp(t,on+.7,on+1.3))*.75;}
  let radial=[Math.cos(a),0,Math.sin(a)];target=vadd(target,mul(radial,offset*12));
  if(t>=109.1&&t<110.4)lens=1150;
 }
 if(t>=116.9&&t<125.76){
  let u=(ramp(t,116.9,118.2)-ramp(t,122.7,125.76));target=target.map((v,i)=>mix(v,[-45,4.6,42][i],u*.93));lens=790;
 }
 if(t>=125.76&&t<128){let u=ramp(t,125.76,127);target=target.map((v,i)=>mix(v,[0,16,90][i],u*.7));}
 if(t>=128&&t<155.16){
  target=[0,14.5,pos[2]+32];
  if(t>=131.62&&t<138.5){let u=ramp(t,131.62,133);target=target.map((v,i)=>mix(v,[-8,27,pos[2]+37][i],u));lens=1130;}
  if(t>=138.5&&t<143.36){target=[-5,3.8,pos[2]+18];lens=1250;}
  if(t>=143.36&&t<146.42){target=[0,16,pos[2]+32];lens=1100;}
 }
 if(t>=155.16&&t<160)target=[0,12,224];
 if(t>=160&&t<172){target=[-6.3+1.9*ramp(t,165,168.72),8.86,235];lens=t<168.72?1320:1050;}
 if(t>=172&&t<175)target=[6.1,10.5,258];
 if(t>=175&&t<186.1){target=[6.1,10.9,258];lens=1190;}
 if(t>=186.1&&t<188.78){target=[0,11,267];lens=840;}
 if(t>=195.2&&t<197.2){
  // A deliberate backward glance confirms that the doors have actually closed.
  target=[-4,10,pos[2]-20];lens=990;
 }
 if(t>=203.4&&t<216){target=[-3.5,12.5,pos[2]+22];lens=t<209?1010:1120;}
 if(t>=216){target=[-5.7,10.2,371];lens=1010;}
 return{target,lens,roll};
}
function ribbon(points,w=3.5,col='#a8a083',supports=false){
 for(let i=0;i<points.length-1;i++){
  let a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),nx=-dz/(len||1),nz=dx/(len||1);
  const p=(v,side,y=0)=>[v[0]+nx*side,v[1]+y,v[2]+nz*side];
  quad(p(a,-w),p(a,w),p(b,w),p(b,-w),col);
  for(let side of[-1,1]){quad(p(a,side*w),p(a,side*w,-1.2),p(b,side*w,-1.2),p(b,side*w),'#425e64');
   quad(p(a,side*1.35-.10,.10),p(a,side*1.35+.10,.10),p(b,side*1.35+.10,.10),p(b,side*1.35-.10,.10),'#c9bc91');}
  const mid=mul(vadd(a,b),.5),yaw=Math.atan2(dx,dz);
  place(mid,yaw,0,1,()=>box(0,.04,0,4,.16,.35,'#59625c','#344c55','#909784'));
  if(supports&&i%4===0){for(let side of[-1,1]){let q=p(a,side*2.7);box(q[0],-2,q[2],.8,q[1]+1,.9,'#667b77','#35545f','#aaa58a');}}
 }
}
function linearRail(a,b,step=5,col='#a8a083',supports=true){const pts=[],n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/step);for(let i=0;i<=n;i++)pts.push(a.map((v,j)=>mix(v,b[j],i/n)));ribbon(pts,3.5,col,supports);}
function bentLoopLamp(){
 const x=7,z=35;box(x,5,z,1.8,1.4,1.8,'#8b8874','#4d6566','#b8ad87');
 line3([[x,6,z],[x,11,z],[x-1.2,14,z],[x-4,14.5,z]],'#53635f',5);
 line3([[x,11,z],[x-3,11.8,z]],'#7b806c',3);box(x-4,12.5,z,1.8,2,.9,'#d6bc7d','#777967','#c5b183');
 polygon([[x-5.15,14.5,z-.65],[x-2.85,14.5,z-.65],[x-4,15.3,z]],'#5d726d');
 line3([[x-4.7,12.6,z-.5],[x-3.7,13.25,z-.5],[x-4.3,13.65,z-.5],[x-3.3,14.3,z-.5]],'#50635e',2);
 polygon([[3.3,5.19,z],[6.5,5.19,z],[3,5.19,z+12]],'#66786d');
 box(x+.4,6.4,z+.2,.8,.5,.5,'#b7a989','#66786b','#d0bd92');
}
function portal(t,index){
 const on=103.86+index*5.35,closed=ramp(t,on,on+.55),w=4.5,h=14;
 for(let side of[-1,1])box(side*(w+.7),5,0,1.4,h,2.8,'#9d9985','#55727a','#cdbb93');box(0,5+h,0,11.8,1.4,3,'#b6a88a','#536e76','#d6c092');
 quad([-w,5,.65],[w,5,.65],[w,5+h,.65],[-w,5+h,.65],index===0?'#bfa479':index===1?'#92aca1':'#ccab74',null,.03);
 for(let side of[-1,1]){
  const angle=(1-closed)*1.5,hinge=side*w,edge=hinge-side*w*Math.cos(angle),away=w*Math.sin(angle),p=(u,y,off=0)=>[mix(hinge,edge,u),y,away*u+off];
  quad(p(0,5),p(1,5),p(1,5+h),p(0,5+h),side<0?'#8d7455':'#685e50');
  for(let yy of[6,11,17])line3([p(.10,yy,-.1),p(.9,yy,-.1)],'#d0b788',3);
  for(let u of[.10,.90])line3([p(u,6,-.1),p(u,18,-.1)],'#d0b788',3);
 }
 // A closing exit turns its reflected beam into a narrow stripe, then darkness.
 if(closed<1)quad([-4,5.2,-15],[4,5.2,-15],[4*(1-closed),5.2,-1],[-4*(1-closed),5.2,-1],'#c4b689');
}
function loopWorld(t){
 const pts=[];for(let i=0;i<=96;i++)pts.push(ringPoint(i/96*TAU));ribbon(pts,3.5,'#9da18a',true);
 linearRail([0,5,-150],[0,5,42],5,'#a9a083');
 for(let j=0;j<3;j++){
  const a=.65+j*2.1,branch=[];for(let i=0;i<=28;i++){let u=i/28;branch.push(ringPoint(a+u*.8,45+18*Math.sin(u*Math.PI)));}
  ribbon(branch,3.2,j%2?'#8b9b8e':'#b3a482',true);
  const angle=a+.32,pos=ringPoint(angle,45+18*Math.sin(.4*Math.PI));place(pos.map((v,i)=>i===1?0:v),Math.PI/2-angle,0,1,()=>portal(t,j));
 }
 bentLoopLamp();
 // The circuit has a working underside: a broad gear, spokes and water shadow.
 const ang=measuredMotion(t).phase*.18;
 for(let i=0;i<64;i++){
  const a=i/64*TAU+ang,b=(i+1)/64*TAU+ang,r=i%2?22:25;
  let p=(q,rad,y)=>[-45+Math.cos(q)*rad,y,42+Math.sin(q)*rad];
  quad(p(a,7,1.2),p(a,r,1.2),p(b,r,1.2),p(b,7,1.2),i%3?'#3d545d':'#68786d');
  quad(p(a,r,1.2),p(a,r,-.5),p(b,r,-.5),p(b,r,1.2),'#294755');
  if(i%8===0)quad(p(a-.018,7,2),p(a+.018,7,2),p(a+.018,42,2),p(a-.018,42,2),'#65766c');
  quad(p(a,38,-1.66),p(a,49,-1.66),p(b,49,-1.66),p(b,38,-1.66),'#2b4b59');
 }
 box(-45,-2,42,7,6,7,'#637470','#314e5d','#a59d80');
}
function localSea(t){
 quad([-2000,-2,-2000],[2000,-2,-2000],[2000,-2,2200],[-2000,-2,2200],'#345b69');
 for(let j=0;j<240;j++){let x=(hash(j+51)-.5)*1000,z=hash(j+102)*900-220,w=3+hash(j)*24,y=-1.82+Math.sin(t*.65+j)*.10;
  quad([x,y,z],[x+w,y,z],[x+w+1,y,z+1],[x+1,y,z+1],['#6f9290','#547b82','#254b5c','#8b9b8b'][j%4]);}
}
function thinCable(points,t){
 line3(points,'#1f3745',4.3);line3(points.map(p=>[p[0]+.055,p[1]+.035,p[2]]),'#baab85',1.2);
}
function pulley(t,z){
 const drive=measuredMotion(t),turn=drive.phase*1.2;
 const center=[-8,27,z+7];
 circle3(center[0],center[1],center[2],4.2,'z','#4f655f');circle3(center[0],center[1],center[2]-.07,3.6,'z','#b4a378');circle3(center[0],center[1],center[2]-.14,2.6,'z','#435c5c');
 for(let j=0;j<7;j++){let a=j/7*TAU+turn;line3([[center[0],center[1],center[2]-.18],[center[0]+Math.cos(a)*3.4,center[1]+Math.sin(a)*3.4,center[2]-.18]],'#b8a77e',3);}
 box(-8,5,z+7,1,19,1,'#64736b','#334e5b','#9b997c');
 line3([[-8,24,z+7],[-8,31,z+7],[0,31,z+7]],'#465e5d',5);
 circle3(-5,6,z-10,2.4,'x','#8b8d70');
 thinCable([[0,22,z],[-5,31,z+7],[-11.5,28,z+7],[-11.5,9,z+7],[-5,6,z-10]],t);
 // Crosspieces visibly wind into the drum; the pursuing route powers the lure.
 for(let j=0;j<8;j++){let a=turn+j/8*TAU,x=-5,y=6+Math.sin(a)*2.2,zz=z-10+Math.cos(a)*2.2;
  box(x,y,zz,4,.26,.50,j%2?'#948f75':'#687c70','#344f58','#b8a982');}
}
function lure(t){
 if(t<123.5||t>160)return;
 const pos=extensionPosition(t),morph=ramp(t,143.36,147.2),retreat=ramp(t,150,157),z=mix(90,pos[2]+32,ramp(t,128,131.62))-retreat*18,x=-retreat*9,y=14.5+Math.sin(t*.6)*.3+retreat*2;
 pulley(t,z);thinCable([[x,y+8,z],[x,22,z],[0,22,z]],t);
 place([x,y,z],Math.sin(t*.5)*.045,Math.sin(t*.8)*.035,1,()=>{
  if(morph<1){
   // Familiar warm glass closes, folds and tapers into the pursued reward.
   let w=3.1*(1-morph*.75),h=6.2;
   quad([-w,0,0],[w,0,0],[w*(1-morph*.55),h,0],[-w*(1-morph*.55),h,0],'#e6b574','#6e674e',.08);
   line3([[0,0,-.1],[0,h,-.1]],'#836842',3);line3([[-w,h*.52,-.1],[w,h*.52,-.1]],'#8c724e',2.5);
  }
  if(morph>0){
   const scales=[.04,.40,.65,.86,1,.95,.72];
   for(let k=0;k<scales.length-1;k++){let yy=k*1.0,yy2=(k+1)*1.0,r=scales[k]*1.8*morph,r2=scales[k+1]*1.8*morph;
    for(let j=0;j<12;j++){let a=j/12*TAU,b=(j+1)/12*TAU;quad([Math.cos(a)*r,yy,Math.sin(a)*r],[Math.cos(b)*r,yy,Math.sin(b)*r],[Math.cos(b)*r2,yy2,Math.sin(b)*r2],[Math.cos(a)*r2,yy2,Math.sin(a)*r2],['#d89754','#e5b36e','#b67b46','#dca362'][j%4]);}
   }
   for(let j=0;j<5;j++){let a=j/5*TAU;polygon([[0,6,0],[Math.cos(a)*2.3,7.5+hash(j),Math.sin(a)*1.5],[Math.cos(a)*.5,6.4,Math.sin(a)*.5]],j%2?'#6d8972':'#98a082');}
   for(let k=0;k<4;k++)line3([[-1.1,2+k,-1.05],[.35,2.1+k,-1.2]],'#be824c',2);
  }
 });
}
function buildingFront(t){
 // A fixed service building on masonry footings, reached along the actual rail.
 for(let side of[-1,1]){
  box(side*10,-2,222,9,28,9,'#7d8881','#425e68','#b9b296');
  box(side*12,-2,262,5,13,90,'#637a76','#35545f','#9d9d83');
  for(let yy of[8,15,22])line3([[side*5.6,yy,217.4],[side*14.4,yy,217.4]],'#c0baa1',2.8);
 }
 box(0,25,222,29,3,10,'#a4a58e','#526f75','#cec099');
 const open=ramp(t,153,158),w=5.6;
 for(let side of[-1,1]){let hx=side*w,edge=hx-side*w*Math.cos(open*1.55),z=217.4+Math.sin(open*1.55)*w;
  quad([hx,5,217.4],[edge,5,z],[edge,23,z],[hx,23,217.4],side<0?'#88856c':'#5f776e');
  for(let yy of[7,15,21])line3([[hx,yy,217.25],[edge,yy,z-.15]],'#b9b394',3);
 }
}
function tiledRoom(t){
 quad([-14,5,218],[14,5,218],[14,5,435],[-14,5,435],'#818d85');
 for(let z=219;z<430;z+=8){for(let side of[-1,1]){
  box(side*10.5,5,z,1,19,8.1,'#929f96','#556c70','#b4bba6');
  line3([[side*9.95,11,z-4],[side*9.95,11,z+4]],'#5e797a',2);
  line3([[side*9.93,18,z-4],[side*9.93,18,z+4]],'#678280',2);
 }
 if(z%24===3){box(0,22,z,22,1,1,'#697f79','#3b5b63','#c1c1a6');box(0,21.8,z,5,.15,1.8,'#d9d8b9','#a7baa5','#e5dfbf');}
 }
 linearRail([0,5,218],[0,5,430],5,'#6e817a',false);
 // Two service counters begin as hospitality and later become a sorting line.
 for(let side of[-1,1]){
  box(side*6.4,5,258,4.8,3.2,68,'#64796d','#3a5962','#b8b495');
  box(side*6.4,8.25,258,5.2,.18,70,'#b1b49b','#637d78','#d4ccb0');
  for(let z=226;z<290;z+=8)line3([[side*4,6,z],[side*8.8,6,z]],'#adad90',2);
 }
}
function plate(x,z){
 let pts=[];for(let j=0;j<40;j++){let a=j/40*TAU;pts.push([x+Math.cos(a)*1.7,8.52,z+Math.sin(a)*1.55]);}polygon(pts,'#dfd7b9');
 let ring=[];for(let j=0;j<=40;j++){let a=j/40*TAU;ring.push([x+Math.cos(a)*1.48,8.55,z+Math.sin(a)*1.34]);}line3(ring,'#8b9990',2);
}
function forkObject(t,special){
 const turn=special?ramp(t,162.5,166.8)*1.05:0,drift=special?ramp(t,165,168.72)*1.9:0;
 place([-6.3+drift,8.7,235],turn,0,1,()=>{
  box(0,0,-1.15,.27,.09,2.5,'#b1b8aa','#677f7b','#e4d9b7');
  polygon([[-.15,.1,.1],[.15,.1,.1],[.65,.1,1.3],[-.65,.1,1.3]],'#ccd0b9');
  for(let j=0;j<4;j++)box((j-1.5)*.34,.05,1.8,.19,.09,1.15,'#cdd0b8','#768980','#eee0bd');
  line3([[0,.13,-2.3],[0,.13,.35]],'#768b83',1.5);
 });
}
function tableWorld(t){
 for(let side of[-1,1])for(let j=0;j<4;j++){
  let z=235+j*16;plate(side*6.1,z);
  if(!(side===-1&&j===0)){
   box(side*6.1-2.05,8.65,z,.26,.07,4.0,'#c8cbb2','#738982','#ece1c0');
   for(let k=0;k<3;k++)box(side*6.1-2.05+(k-1)*.23,8.68,z+1.65,.14,.06,.9,'#c8cbb2','#738982','#ece1c0');
  }
  box(side*6.1+2.05,8.65,z,.37,.09,4.1,'#c5c8ae','#738982','#e8dbb9');
  if(j===0&&side===-1){quad([-8.4,8.56,z-2.3],[-7.8,8.56,z-2.3],[-7.8,8.56,z+2.5],[-8.4,8.56,z+2.5],'#9ca68e');}
 }
 forkObject(t,true);
 const scan=ramp(t,168.72,170.1),sweep=scan*7;
 if(scan>0&&t<174.5){quad([-9.1+sweep,8.77,230],[-8.7+sweep,8.77,230],[-8.7+sweep,8.77,240],[-9.1+sweep,8.77,240],'#dfd5a4',null,.05);
  box(-3.65,8.45,235,.36,3,.36,'#78877b','#45636a','#c2b994');
 }
}
function bottleMesh(t){
 // A faceted, asymmetrical wine bottle, with neck, lip and restrained highlights.
 const profile=[[0,1.03],[.35,1.15],[3.25,1.12],[3.8,.8],[4.25,.35],[5.55,.35],[5.68,.50],[5.92,.46]],N=16;
 for(let k=0;k<profile.length-1;k++){let [y,r]=profile[k],[y2,r2]=profile[k+1];for(let j=0;j<N;j++){
  let a=j/N*TAU,b=(j+1)/N*TAU;quad([Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],[Math.cos(b)*r2,y2,Math.sin(b)*r2],[Math.cos(a)*r2,y2,Math.sin(a)*r2],['#456c5e','#355948','#658477','#2d4d45'][j%4]);}}
 for(let off of[-1.13,1.13])quad([-.76,.9,off],[.76,.9,off],[.76,2.8,off],[-.76,2.8,off],'#bcb18f');
 line3([[.6,.6,-.95],[.6,3.1,-.95],[.20,4.45,-.32],[.20,5.4,-.32]],'#94aa87',3);
}
function bottleWorld(t){
 const rock=ramp(t,177.2,180.8),release=ramp(t,181.55,182.1),settle=1-ramp(t,182.1,184),tilt=-rock*.22+release*.15*settle;
 const carry=ramp(t,188.78,193.4),cx=6.1+8*ramp(t,191.2,194),cz=258+carry*21;
 place([cx,8.58,cz],.08,tilt,1,()=>bottleMesh(t));
 // The serrated edge is established beside the bottle before it works the cork.
 if(t<188.78)box(7.6,13.6,257.9,1.1,.35,2.5,'#aa9e75','#61796f','#d3b883');
 if(t<188.78)for(let k=0;k<6;k++)polygon([[7.05,14,256.75+k*.4],[7.05,14.6,256.95+k*.4],[7.05,14,257.15+k*.4]],'#d8c495');
 let age=Math.max(0,t-182.1),flight=Math.min(age,2.56),z=258-flight*3,y=Math.max(8.58,14.5+flight*4-flight*flight*2.5);
 if(t<182.1){const neckX=6.1-5.92*Math.sin(tilt)*Math.cos(.08),neckY=8.58+5.92*Math.cos(tilt),neckZ=258+5.92*Math.sin(tilt)*Math.sin(.08);place([neckX,neckY,neckZ],.08,tilt,.95,()=>box(0,0,0,.75,.85,.75,'#b99260','#7c785c','#d0ad76'));}
 else if(t<194)place([6.1+flight*.75,y,z],0,age<2.56?age*2.5:.12,.95,()=>box(0,0,0,.75,.85,.75,'#b99260','#7c785c','#d0ad76'));
 const wine=ramp(t,182.1,184.2);if(wine>0){
  // The spill is the only burgundy accent, and becomes the mark the machine notices.
  const pts=[];for(let j=0;j<30;j++){let a=j/30*TAU,r=(1+hash(j)*.28)*wine;pts.push([6.1+Math.cos(a)*r*1.7,8.58,255.6+Math.sin(a)*r*1.05]);}polygon(pts,'#754d50');
 }
 const capture=ramp(t,185.2,187.2);
 if(t>184)quad([10.03,8,275],[10.03,8,285],[10.03,17,285],[10.03,17,275],'#1d3d48');
 if(capture>0){for(let side of[-1,1])box(cx+side*(3.3-capture*.9),8.4,cz,.4,5,6.4,'#677f77','#3c5e67','#b9b994');
  box(cx,13.5,cz,6.6,.42,6.4,'#84978a','#44666c','#c5c0a0');
 }
}
function institutionalDoors(t){
 for(let j=0;j<4;j++){
  const z=267+j*23,on=194.4+j*5.5,close=ramp(t,on,on+.6),w=9.4;
  for(let side of[-1,1])box(side*9.7,5,z,1.1,17,2,'#80948c','#3f646c','#c2c5aa');box(0,22,z,21,1,2,'#99ac9c','#4c7275','#d1cfb3');
  // Sideways passage closes after the front route has redirected us.
  for(let side of[-1,1]){let x=side*(w*(1-close)+w*.5*close);box(x,5,z,close*w+.15,16,.7,'#9aaba0','#567f7d','#d0cfb1');
   for(let face of[-.4,.4]){
    line3([[x,10,z+face],[x,19,z+face]],'#496860',3);
    if(close>.45){
     circle3(x,16,z+face,.9,'z','#2d535c');
     circle3(x,16,z+face*1.02,.59,'z','#779990');
     box(x-side*close*3.4,11,z+face*1.1,.22,1.8,.16,'#5a7269','#385b61','#c9c1a2');
    }
   }
  }
 }
}
function roller(t,z,index){
 const press=ramp(t,203.4+index*2.2,205+index*2.2),motionTime=t<216.2?t:216.2+.8*(1-Math.exp(-(t-216.2)/.8)),drive=measuredMotion(motionTime,index*.0833),turn=drive.phase*1.4;
 drive.kick*=1-ramp(t,216.2,217.2);
 for(let side of[-1,1])box(side*7.2,5,z,1.2,14,2.8,'#6d8d82','#355f68','#bbc2a5');
 // Axle and broad drum have thickness and a toothed edge, not a floating rectangle.
 for(let j=0;j<24;j++){let a=j/24*TAU+turn,b=(j+1)/24*TAU+turn,r=2.7;
  quad([-7,14+Math.sin(a)*r,z+Math.cos(a)*r],[7,14+Math.sin(a)*r,z+Math.cos(a)*r],[7,14+Math.sin(b)*r,z+Math.cos(b)*r],[-7,14+Math.sin(b)*r,z+Math.cos(b)*r],j%4?'#7f9885':'#b9bba0');}
 const fy=8.4+Math.sin(t*4+index)*.3*(1-press),col=press>.6?'#829b8d':'#dfb778';
 place([-3.7,fy,z-5.5+press*10.7],0,Math.sin(t*3+index)*.15*(1-press),1,()=>{
  const w=1.9,h=5.2*(1-press*.65);quad([-w,0,0],[w,0,0],[w,h,0],[-w,h,0],col,'#586e63',press<.5?.025:0);
  line3([[0,0,-.06],[0,h,-.06]],'#637c6b',2.5);
 });
 // A weighted pawl recoils on measured attacks while the drum turns steadily.
 box(-7.2,18.7+drive.kick*.45,z-1.2,2.1,.8,2.0,'#bec1a2','#658478','#dfd1ad');
 for(let j=0;j<7;j++)box((j-3)*1.8,5.4,z+5,.95,.25,3,'#91a994','#517b78','#c6c9a7');
}
function correctionLine(t){
 for(let j=0;j<4;j++)roller(t,337+j*12,j);
 // White capsules feed the same regularised track, as the warm pane is clamped.
 for(let side of[-1,1]){
  box(side*8.2,12,346,2.2,5,4,'#afbb9f','#658b83','#d5d5b6');
  for(let j=0;j<5;j++){let yy=13+j*.7;circle3(side*8.2,yy,343.9,.42,'z','#e2ddbd');}
 }
 // A resisting hinge eventually skips a tooth and opens a seam in the side wall.
 let opening=ramp(t,216.2,218.6);
 box(-8.1,5,371,2.1,13,9,'#6e8c7d','#345f64','#bec4a6');
 quad([-7.02,6,366],[-7.02,6,376],[-7.02,18,376],[-7.02,18,366],'#dfc88a',null,.05*opening);
 box(-6.7-opening*2.4,5,371,.5,12,10,'#a6b499','#66897c','#d4d1ae');
 place([-6.3,10.3,365],.6*opening,-.15*opening,1,()=>windowWing([0,0,0],1.5,3.6,t,908,1-opening*.3));
 thinCable([[-6.4,13,366],[-5.1,16.7,362],[-4.4,16.7,358]],t);
 if(opening>.01){quad([-7,5.3,366],[-3,5.3,366],[-1,5.3,374],[-7,5.3,376],'#cfc196');}
}
function drawApproachToLoop(t){
 EXT_WORLD=EXT_ROOT;loopWorld(t);EXT_WORLD=null;
}
const DEVELOPMENT_SHOTS=[
 [90,96,'next-route-offered'],[96,100,'approach-the-forks'],[100,103.86,'choose-a-false-exit'],[103.86,109.2,'exit-shuts-behind-us'],[109.2,113.4,'another-offer-closes'],[113.4,116.9,'the-lamp-returns'],
 [116.9,123.5,'see-the-entire-circuit'],[123.5,128,'warm-opening-beyond-the-loop'],[128,131.62,'pursuit-without-progress'],[131.62,138.5,'see-the-string-and-pulley'],[138.5,143.36,'the-route-powers-the-lure'],[143.36,146.42,'look-back-at-the-promise'],[146.42,155.16,'opening-becomes-dangling-reward'],[155.16,160,'follow-the-cable-into-service-building'],
 [160,168.72,'one-fork-refuses-its-mark'],[168.72,174.94,'a-scanner-notices'],[174.94,181.55,'bottle-works-its-own-cork'],[181.55,186.1,'release-and-an-unexpected-stain'],[186.1,188.78,'capture-the-place-setting'],[188.78,195.2,'track-becomes-compulsory'],[195.2,199.4,'confirm-the-doors-behind-us'],[199.4,203.4,'approach-the-correction-line'],[203.4,209,'warm-glass-is-pressed-flat'],[209,216,'everything-is-made-the-same'],[216,220,'one-hinge-interrupts-the-system']
];
window.EDIT=[...window.EDIT.slice(0,-1),{a:84.14,b:90,key:'landmark-returns',id:12,startFrame:Math.round(84.14*24),endFrame:2160},...DEVELOPMENT_SHOTS.map((o,i)=>({a:o[0],b:o[1],key:o[2],id:i+13,startFrame:Math.round(o[0]*24),endFrame:Math.round(o[1]*24)}))];
function offeredRail(t){
 const grow=ramp(t,123.5,127.8);
 if(!grow)return;
 const end=mix(42,218,grow);
 linearRail([0,5,42],[0,5,end],5,'#a3a28a',true);
 if(grow<1){
  // The first usable exit is made in front of us. Its last section lowers onto
  // the piers rather than implying an available straight road throughout the loop.
  const ang=(1-grow)*1.5,tip=[0,5+Math.sin(ang)*18,end+Math.cos(ang)*18];
  ribbon([[0,5,end],tip],3.5,'#c0b393',false);
 }
}
function renderExtension(t){
 t=clamp(t,96,DURATION-.001);TIME=t;EXT_WORLD=null;
 for(let g of[s,f,mask]){g.setTransform(.5,0,0,.5,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);}
 ink.clearRect(0,0,W,H);f.fillStyle='#000';f.fillRect(0,0,W,H);mask.fillStyle='#000';mask.fillRect(0,0,W,H);faces=[];
 const pos=extensionPosition(t),look=localLook(t,pos);camera(extWorld(pos),extWorld(look.target),look.lens,look.roll);
 window.__cameraState={time:t,position:[...cam.pos],forward:[...cam.fw],localPosition:pos,phase:DEVELOPMENT_SHOTS.find(o=>t>=o[0]&&t<o[1])?.[2]};
 sky(t,1);EXT_WORLD=EXT_ROOT;localSea(t);
 if(t<160)loopWorld(t);
 offeredRail(t);
 lure(t);buildingFront(t);tiledRoom(t);
 if(t>=155&&t<194){tableWorld(t);bottleWorld(t);}
 institutionalDoors(t);
 if(t>197)correctionLine(t);
 EXT_WORLD=null;flush();atmosphere(t);carriageEdge(t);
 const cold=ramp(t,188.78,211);
 Paint.present(t,{boil:6,strokeK:.46,impasto:.32,ground:.015,groundCol:'#10192c',gap:.01,fauve:.14,shadowTint:cold>.5?'#244643':'#19294d',hiTint:cold>.5?'#dfd9a8':'#f1c68b',flowK:.16,flowAng:-.16,flowBias:.65,bloom:.45,grain:.025,vig:.24,dash:.04,smear:[0,0],inkSoft:.5,wave:[.25,.009,.003,.8],waveK:.2});
}
window.__ready=true;
