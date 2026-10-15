/* Extended local rough cut. Absolute song time; v2's first passage remains its own scene. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,smooth,clamp,mix,noise,stroke,fill,line,ellipse,rays,cloud}=A;
 const lookTest=A.draw;
 const cast=[
  {id:'west',sprite:'owl',index:0,role:'listener',which:'luna',x:330,k:.60,on:81.22,phase:1.4,color:'#739d77'},
  {id:'east',sprite:'keeper',index:1,role:'carrier',which:'sol',x:1635,k:.65,on:91.56,phase:3.8,color:C.gold},
  {id:'far-west',sprite:'moth',index:2,role:'caretaker',which:'sol',x:165,k:.40,on:123.5,phase:2.5,color:C.rose},
  {id:'inner-west',sprite:'fox',index:3,role:'listener',which:'luna',x:500,k:.66,on:84.5,phase:4.4,color:C.blue},
  {id:'inner-east',sprite:'fish',index:4,role:'carrier',which:'sol',x:1440,k:.70,on:93.2,phase:.8,color:'#739d77'},
  {id:'far-east',sprite:'hare',index:5,role:'mischief',which:'luna',x:1765,k:.46,on:126.0,phase:5.7,color:C.gold}
 ];
 const abstract=t=>smooth(109.7,112,t)*(1-smooth(120.5,122.7,t));
 A.leafSeason=t=>1-.82*smooth(107.96,109.5,t)+.82*smooth(122.7,125.3,t);
 function actor(c,t,headOnly=false){
  const receive=ALCHEMY_CUES.performance.carePulses.filter(p=>p.x===({0:285,1:1635,3:475,4:1440}[c.index]??c.x)).reduce((v,p)=>v+A.performance.reaction(t,p.end),0)+A.performance.reaction(t,ALCHEMY_CUES.performance.finalRelay[c.index]);
  A.puppets.draw(c,t,receive,headOnly);
  if(!headOnly)sprigs(c,t,receive);
 }
 // v9 finale: everyone becomes a tree. When the relay reaches a member, leafy sprigs grow from both hands.
 function sprigs(c,t,receive){const f=t*24,start=ALCHEMY_CUES.performance.finalRelay[c.index],p=smooth(start,start+30,f);if(!p)return;
  const pose=A.puppets.pose(c,t,receive),season=A.leafSeason(t);
  pose.hands.forEach((h,i)=>{const dir=i?1:-1,len=95*c.k/.6,sway=.06*Math.sin(t*1.6+c.index+i);
   const b=[h[0],h[1],h[0]+dir*len*.15,h[1]-len*.45,h[0]+dir*len*(.35+sway),h[1]-len*.8,h[0]+dir*len*(.5+sway),h[1]-len];
   S.woodyRoot(b,p,9*c.k/.6,2,c.index*7+i,{});
   for(let k=0;k<6;k++){const u=.3+k*.12;if(u>p)continue;const q=S.bez(b,u),q2=S.bez(b,Math.min(1,u+.03)),ang=Math.atan2(q2[1]-q[1],q2[0]-q[0]);
    S.leaf(q[0],q[1],ang+(k%2?1.7:-1.3)*dir,(.48+.12*noise(k+c.index))*c.k/.6,clamp((p-u)*4)*season)}
   if(p>.9){const e=S.bez(b,1);ellipse(e[0],e[1],7*c.k/.6,7*c.k/.6,C.gold,C.ink)}
  });
 }
 function widerRootCurve(a,c,j=1,t=0){const end=910+j*51,side=a.x<960?1:-1,p=A.puppets.pose(a,t),foot=p.feet[j===2?1:0];return [foot[0],foot[1]-4,foot[0]+(j-1)*37,848+j*16,end-side*(70+c*8),988-j*14,end,922+j*13]}
 function widerRoots(t){for(let c=0;c<cast.length;c++){const a=cast[c],p=smooth(a.on+.6,a.on+3.0,t);if(!p)continue;
  for(let j=0;j<3;j++){const end=910+j*51,side=a.x<960?1:-1;
   const b=widerRootCurve(a,c,j,t);
   g.save();g.globalAlpha=p;S.woodyRoot(b,1,20*a.k+6,5+j,c+j,{rootlets:4,rootletLen:64});g.restore();
  }
 }}
 // v9: the heart grows on its own young tree out of the shared root junction, cradled by two leafy
 // branches. On "sun" it catches fire inside an emblem sun (alternating straight and flame rays); on the
 // final chorus it rises and its rays reach across the whole sky.
 function heartGeom(t,a){const rise=smooth(96.3,100.1,t),final=smooth(122.7,128,t),climax=smooth(128,136,t);
  const reply=smooth(ALCHEMY_CUES.performance.reply.sol,ALCHEMY_CUES.performance.reply.settle,t*24);
  const x=950,y=mix(929,mix(348,412,a),rise)-final*70-reply*20;
  const effort=ALCHEMY_CUES.performance.carePulses.reduce((v,p)=>Math.max(v,A.performance.reaction(t,p.start)),0);
  const radius=mix(18,112,rise)*(1+a*.55+final*.22+climax*.08)*(1+.018*Math.sin(S.pulse(t)*2)-.13*effort);
  return {rise,final,climax,x,y,radius,sun:smooth(104.55,105.5,t)};
 }
 function flame(h,w,ph){const sw=w*.9*Math.sin(ph),tongue=(k,col,lw)=>{const H=h*k,W=w*k,d=`M${-W} 0C${-W*1.5} ${-H*.32} ${W*.9+sw*k} ${-H*.5} ${sw*1.9*k} ${-H}C${-W*.35+sw*k} ${-H*.62} ${W*1.6} ${-H*.36} ${W} 0Q0 ${H*.12} ${-W} 0Z`;fill(d,col);if(lw)stroke(d,C.ink,lw);return d};
  const d=tongue(1,C.gold,1.5);g.save();g.clip(new Path2D(d));for(let k=0;k<6;k++)stroke(`M${-w+k*w*.4} 0Q${sw*.8} ${-h*.5} ${sw*1.9} ${-h}`,'#a8681f',.8);g.restore();tongue(.55,'#d0583a',0)}
 function heart(t,a,raysOnly=false){const birth=smooth(96.3,97.4,t);if(!birth)return;
  const {rise,final,climax,x,y,radius,sun}=heartGeom(t,a);
  if(raysOnly){if(!sun)return;g.save();g.translate(x,y);g.scale(birth,birth);g.rotate(t*.02);
   const n=40,inner=radius*1.12,len=(120+final*330+climax*260)*(.9+.1*Math.sin(S.pulse(t))),glow=.5+sun*.25+A.brass(t)*.2;
   g.globalAlpha=Math.min(1,glow);
   for(let j=0;j<n;j++){const ang=j/n*Math.PI*2,ca=Math.cos(ang),sa=Math.sin(ang),l=len*(j%2?.62:1);
    if(j%2){let d=`M${ca*inner} ${sa*inner}`;for(let k=1;k<=8;k++){const r=inner+l*k/8,o=(k%2?1:-1)*7*(1-k/9);d+=`L${ca*r-sa*o} ${sa*r+ca*o}`}stroke(d,'#b5791f',2.2)}
    else {line(ca*inner,sa*inner,ca*(inner+l),sa*(inner+l),C.ink,1.1);line(ca*inner+sa*2,sa*inner-ca*2,ca*(inner+l*.8)+sa*2,sa*(inner+l*.8)-ca*2,C.gold,1.6)}}
   g.restore();return}
  // The young tree: same path the care packets ride, now with real wood and two cradling branches.
  const trunk=[960,936,936,759,990,y+210,x,y+radius*.7];
  S.woodyRoot(trunk,rise,44,20,77,{});
  // The emblem sun sits behind; the branches hold the heart in front of it.
  if(sun){g.save();g.translate(x,y);g.scale(birth,birth);g.globalAlpha=sun;ellipse(0,0,radius*1.1,radius*1.1,C.gold,C.ink);
   for(const k of [1.02,.93,.86])ellipse(0,0,radius*k,radius*k,null,'#8f5f1e');
   g.save();g.beginPath();g.arc(0,0,radius*1.08,0,Math.PI*2);g.clip();for(let j=0;j<60;j++){const ang=j/60*Math.PI*2;line(Math.cos(ang)*radius*.86,Math.sin(ang)*radius*.86,Math.cos(ang)*radius*1.08,Math.sin(ang)*radius*1.08,'#8f5f1e',.7)}g.restore();g.restore()}
  if(rise>.6){const grow=smooth(.6,1,rise),season=A.leafSeason?A.leafSeason(t):1;
   for(const side of [-1,1]){const p0=S.bez(trunk,.8),b=[p0[0],p0[1],p0[0]+side*radius*.7,p0[1]+radius*.05,x+side*radius*1.3,y+radius*.5,x+side*radius*.98,y-radius*.5];
    S.woodyRoot(b,grow,18,4,80+side,{});
    for(let k=0;k<8;k++){const u=.22+k*.1;if(u>grow)continue;const q=S.bez(b,u),q2=S.bez(b,Math.min(1,u+.02));const ang=Math.atan2(q2[1]-q[1],q2[0]-q[0]);
     S.leaf(q[0],q[1],ang+(k%2?1.9:-1.2)*side,.62+.18*noise(k+side*9),clamp((grow-u)*5)*season)}}
  }
  g.save();g.translate(x,y);g.scale(birth,birth);
  const path=new Path2D('M0 1C-.18 .85-1 .25-.86-.3C-.78-.78-.2-.8 0-.36C.22-.82.85-.74.9-.22C1 .23.25 .76 0 1Z');
  g.save();g.scale(radius,radius);g.fillStyle=C.rose;g.fill(path);g.strokeStyle=C.ink;g.lineWidth=1.8/radius;g.stroke(path);g.clip(path);
  g.globalAlpha=.57;
  for(let j=0;j<75;j++){const yy=-.82+j*.026;stroke(`M-1 ${yy}Q-.18 ${yy-.23} 1 ${yy+.14}`,C.ink,.0075)}
  for(let j=0;j<200;j++){const xx=noise(j+80)*2-1,yy=noise(j+621)*2-1;line(xx,yy,xx+.014,yy-.017,C.ink,.004)}
  g.globalAlpha=.36;for(let j=0;j<17;j++){const yy=.12+j*.045;stroke(`M.05 ${yy}Q.67 ${yy-.25} .96 ${yy-.72}`,C.ink,.012)}
  g.globalAlpha=1;
  for(let j=0;j<17;j++){const xx=-.92+j*.11;stroke(`M${xx} .93Q${xx+.15} .1 ${xx+.3}-.9`,'#864c43',.0035)}
  g.restore();
  // Love's fire: flames rise from the cleft on "sun" and flicker on twos, drawn over the heart.
  if(sun){const ph=Math.floor(t*12)*1.7,h=radius*(.9+.12*Math.sin(ph))*sun,w=radius*.11;
   for(const [fx,fy,rot,k,o] of [[-.42,-.74,-.25,.62,2.4],[.42,-.7,.22,.6,4.1],[0,-.36,0,1,1]]){g.save();g.translate(fx*radius,fy*radius);g.rotate(rot);flame(h*k,w*(k>.9?1.15:.9),ph+o);g.restore()}}
  g.restore();
 }
 function fallingLeaves(t){if(t<107.96||t>111.6)return;
  for(let i=0;i<22;i++){const u=clamp((t-107.96-noise(i+18)*.9)/2.5);if(!u||u>=1)continue;
   const x=490+noise(i+39)*940+Math.sin(u*5+i)*32,y=355+noise(i+52)*140+u*330;
   g.save();g.translate(x,y);g.rotate(u*6+i);g.scale(1-u*.5,1-u*.5);fill('M0 0Q-15-20 0-36Q17-17 0 0','#bf9638');stroke('M0 0Q-15-20 0-36Q17-17 0 0',C.ink,1);line(0,0,0,-31,C.ink,.7);g.restore();
  }
 }
 function heraldPosition(flip,t){const a=abstract(t),x=mix(flip<0?290:1635,flip<0?495:1425,a)+26*Math.sin(t*.37+flip),y=mix(294-55*smooth(79.5,83,t),510,a)+70*smooth(96.3,100.1,t)*(1-smooth(108,110,t))+11*Math.sin(t*.53+flip*2),scale=1+a*.48;
  return {x,y,scale};
 }
 function bellPoint(x,y,flip,t,raw){return S.heraldPose(x,y,flip,t,raw).bell}
 function careFlow(t){const f=t*24;
  for(const pulse of ALCHEMY_CUES.performance.carePulses){
   if(f<pulse.start||f>pulse.end)continue;const u=(f-pulse.start)/(pulse.end-pulse.start),idx=cast.findIndex(c=>({0:285,1:1635,3:475,4:1440}[c.index]??c.x)===pulse.x),c=cast[idx];
   // A pump stroke moves down its stem, then follows the receiver's actual root.
   const a=abstract(t),y=mix(929,mix(348,412,a),smooth(96.3,100.1,t));
   const point=u<.35?S.bez([950,y+80,990,y+210,936,759,960,936],u/.35):S.bez(widerRootCurve(c,idx,1,t),(1-u)/.65);
   ellipse(point[0],point[1],16,11,C.gold,C.ink);for(let j=0;j<5;j++)line(point[0]-7+j*4,point[1]-6,point[0]-10+j*4,point[1]+5,C.ink,.9);
  }
 }
 function finalRelay(t){const f=t*24,starts=ALCHEMY_CUES.performance.finalRelay;
  for(let i=0;i<cast.length;i++){const start=starts[i],u=clamp((f-start+20)/20);if(f<start-20||f>start+8)continue;
   const q=S.bez(widerRootCurve(cast[i],i,1,t),1-u);ellipse(q[0],q[1],12,8,C.gold,C.ink);
  }
 }
 function brassRibbons(t,raw){const a=abstract(t);if(!a)return;const performance=A.performance.horn(raw),p=A.brass(raw);if(!performance.play)return;
  for(const flip of [-1,1]){const h=heraldPosition(flip,t),source=bellPoint(0,0,flip,t,raw),x=h.x+source[0]*h.scale,y=h.y+source[1]*h.scale;
   g.save();g.globalAlpha=a*.8*performance.play;
   // Curved engraved sound lines leave the actual instrument bell and orbit the shared heart.
   for(let j=0;j<15;j++){const phase=t*.62+j*.36+(flip<0?0:Math.PI),r=150+j*8+p*23;
    const ex=960+Math.cos(phase)*r,ey=412+Math.sin(phase)*r*.72;
    const path=`M${x} ${y}C${mix(x,960,.42)} ${y-180-j*6} ${960-flip*(250+j*8)} ${412+Math.sin(phase)*270} ${ex} ${ey}`;
    stroke(path,j%3?C.gold:C.ink,j%3?2.6:1.1);
    if(j%4===0)ellipse(ex,ey,5,5,C.gold,C.ink);
   }
   g.restore();
  }
 }
 function finalBirdPose(t){const cue=ALCHEMY_CUES.performance.reply,host=cast[2],start=cue.birdApproach/24,contact=cue.birdContact/24;
  const visible=smooth(start,start+1.5,t),angle=(t-start)*.34,land=smooth(start,contact,t);
  const target=A.puppets.perch(host,t);
  const x=mix(960+Math.cos(angle)*640,target[0],land),y=mix(200+Math.sin(angle)*90,target[1]-58*.15,land);
  return {x,y,visible,land,target,foot:[x,y+58*.15*visible]};
 }
 function orbitBirds(t,front=false){const start=ALCHEMY_CUES.performance.reply.birdApproach/24,p=smooth(start,start+1.5,t);if(!p)return;
  if(front){const b=finalBirdPose(t);S.bird(b.x,b.y,.15*p,t,1,b.land,1);return}
  for(let i=1;i<5;i++){const angle=(t-start)*.34+i*Math.PI*2/5,x=960+Math.cos(angle)*640,y=200+Math.sin(angle)*90;
   S.bird(x,y,.18*p,t,Math.sin(angle)>0?1:-1,0,1);
  }
 }
 function replyPackets(t){const f=t*24,c=ALCHEMY_CUES.performance.reply,source=widerRootCurve(cast[5],5,1,t),junction=S.bez(source,1),packets=[];
  if(f>=c.launch&&f<c.junction)packets.push(S.bez(source,(f-c.launch)/(c.junction-c.launch)));
  for(const [name,index] of [['luna',7],['sol',2]])if(f>=c.junction&&f<=c[name]){
   const u=(f-c.junction)/(c[name]-c.junction),root=S.roots[index],join=S.bez(root,1);
   packets.push(u<.12?[mix(junction[0],join[0],u/.12),mix(junction[1],join[1],u/.12)]:S.bez(root,1-(u-.12)/.88));
  }
  return packets;
 }
 function returnReply(t){for(const q of replyPackets(t)){ellipse(q[0],q[1],21,14,C.gold,C.ink);for(let j=0;j<5;j++)line(q[0]-8+j*4,q[1]-7,q[0]-11+j*4,q[1]+6,C.ink,1.1)}}
 function border(){g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 }
 // v9 finale: a forest pops up along the horizon, sap lights the whole root network gold, the sky warms
 // around the heart, two more heralds descend, then the scene pulls back into an engraved emblem frame.
 const forest=Array.from({length:30},(_,i)=>{const back=i%2,x=110+(i+.5)/30*1700+(noise(i+71)-.5)*40;return {x,back,k:(back?.42:.6)*(.85+.3*noise(i+9)),seed:300+i*13,at:122.9+Math.abs(x-960)/860*3.2+noise(i+3)*.4}});
 function smallTree(x,y,k,seed,p,t){if(p<=0)return;g.save();g.translate(x,y);g.scale(k*p,k*(.4+.6*p));g.rotate(.02*Math.sin(t*1.4+seed));
  S.woodyRoot([0,0,-6,-50,8,-110,0,-170],1,26,10,seed,{n:30});
  const blobs=[[0,-205,62],[-48,-175,46],[50,-172,48],[-26,-240,44],[30,-238,42],[0,-150,38]];
  for(const [bx,by,r] of blobs){ellipse(bx,by,r,r*.86,'#79a456',C.ink)}
  g.save();g.beginPath();for(const [bx,by,r] of blobs)g.ellipse(bx,by,r,r*.86,0,0,Math.PI*2);g.clip();
  for(let j=0;j<46;j++){const yy=-290+j*3.6;line(10,yy,80,yy+22,C.ink,.55)}for(let j=0;j<40;j++){const a=noise(seed+j)*6.28,r=20+noise(seed+j*2)*50;S.leaf(Math.cos(a)*r,-200+Math.sin(a)*r*.8,a+1.6,.38,1)}g.restore();
  for(const [bx,by,r] of blobs){g.beginPath();g.ellipse(bx,by,r,r*.86,0,Math.PI*1.05,Math.PI*1.95);g.strokeStyle=C.ink;g.lineWidth=1.6;g.stroke()}
  g.restore()}
 function horizonForest(t){if(t<122.9)return;for(const back of [1,0])for(const tr of forest){if(tr.back!==back)continue;
  const p=smooth(tr.at,tr.at+.55,t),pop=1+.12*Math.sin(clamp((t-tr.at)/.55)*Math.PI);smallTree(tr.x,back?757:766,tr.k*pop,tr.seed,p,t)}}
 function goldenRoots(t){const p=smooth(126.4,131.5,t);if(!p)return;const glow=.75+.25*Math.sin(t*3);
  const paths=[...S.roots];cast.forEach((c,i)=>{if(t>=c.on+1)for(let j=0;j<3;j++)paths.push(widerRootCurve(c,i,j,t))});
  for(const b of paths){g.beginPath();for(let k=0;k<=40;k++){const q=S.bez(b,k/40*p);k?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}
   g.strokeStyle=`rgba(240,184,60,${.35*glow})`;g.lineWidth=11;g.stroke();g.strokeStyle=C.gold;g.lineWidth=3.2;g.stroke();g.strokeStyle=C.ink;g.lineWidth=.7;g.stroke()}
 }
 function warmSky(t,a){const w=smooth(125.5,136,t);if(!w)return;const {x,y}=heartGeom(t,a),r=g.createRadialGradient(x,y,60,x,y,1150);
  // An opaque dawn that fades into the azure, so the warm light never mixes to olive.
  r.addColorStop(0,'#fbe6a6');r.addColorStop(.3,'#f2c773');r.addColorStop(.62,'#d9b98a');r.addColorStop(1,C.azure);
  g.save();g.beginPath();g.rect(76,70,1768,690);g.clip();g.globalAlpha=w;g.fillStyle=r;g.fillRect(0,0,1920,1080);g.globalAlpha=.12*w;g.drawImage(A.paper,0,0);
  g.globalAlpha=.3*w;for(let i=0;i<125;i++){let yy=76+i*5.5;stroke(`M77 ${yy}Q490 ${yy-3} 966 ${yy+1}T1844 ${yy}`,'#6b4a1c',.7)}g.restore()}
 function upperHeralds(t,raw){const p=smooth(122.7,125.6,t);if(!p)return;
  // v10b: low enough that the whole figure stays in frame (Robin: heads were cropped), outside the sun and moon heads.
  for(const flip of [-1,1]){const x=960+flip*(335+10*Math.sin(t*.4+flip)),y=mix(-200,150,p)+6*Math.sin(t*.55+flip*2);
   g.save();g.translate(x,y);g.scale(.47,.47);const oldX=flip<0?290:1635;g.translate(-oldX,-294);S.herald(oldX,294,flip,t+.21*flip,raw+.21*flip);g.restore()}}
 function medallion(x,y,r,kind,p,t){if(p<=0)return;g.save();g.translate(x,y);g.scale(p,p);ellipse(0,0,r+9,r+9,C.paper,C.ink);ellipse(0,0,r,r,kind==='moon'?'#a9bccb':kind==='tree'?'#b9cf95':C.gold,C.ink);
  g.save();g.beginPath();g.arc(0,0,r-3,0,Math.PI*2);g.clip();
  if(kind==='sun'){g.scale(r/165,r/165);g.translate(-332,-170);A.piece('sol-head',C.gold)}
  if(kind==='moon'){g.scale(r/165,r/165);g.translate(-992,-164);A.piece('luna-head','#bdc9d3')}
  if(kind==='heart'){const hp=new Path2D('M0 1C-.18 .85-1 .25-.86-.3C-.78-.78-.2-.8 0-.36C.22-.82.85-.74.9-.22C1 .23.25 .76 0 1Z');g.save();g.translate(0,r*.08);g.scale(r*.62,r*.62);g.fillStyle=C.rose;g.fill(hp);g.lineWidth=2/(r*.62);g.strokeStyle=C.ink;g.stroke(hp);g.restore();g.save();g.translate(0,-r*.2);flame(r*.5,r*.07,t*7)}
  if(kind==='heart')g.restore();
  if(kind==='tree'){smallTree(0,r*.78,r/330,911,1,t)}
  g.restore();for(let j=0;j<36;j++){const a=j/36*Math.PI*2;line(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r+9),Math.sin(a)*(r+9),C.ink,.6)}g.restore()}
 function emblemFrame(fr,k,t){if(!fr)return;const W=1768,H=935,cx=960,cy=537.5,iw=W*k,ih=H*k,x0=cx-iw/2,y0=cy-ih/2;
  g.save();g.fillStyle=C.paper;g.beginPath();g.rect(76,70,W,H);g.rect(x0,y0,iw,ih);g.fill('evenodd');g.globalAlpha=.12;g.drawImage(A.paper,0,0);g.globalAlpha=1;
  g.strokeStyle=C.ink;g.lineWidth=2.2;g.strokeRect(x0,y0,iw,ih);g.lineWidth=.8;g.strokeRect(x0-7,y0-7,iw+14,ih+14);g.strokeRect(84,78,W-16,H-16);
  // A laurel garland draws itself round the band, starting at the top centre.
  const m=(76+x0)/2,mt=(70+y0)/2,pts=[];const per=2*(iw+ih);
  for(let s=0;s<per;s+=24){let x,y,ang;const u=s;if(u<iw/2){x=cx+u;y=mt;ang=0}else if(u<iw/2+ih){x=1920-m;y=y0+(u-iw/2);ang=Math.PI/2}else if(u<iw*1.5+ih){x=x0+iw-(u-iw/2-ih);y=1080-mt-5;ang=Math.PI}else if(u<iw*1.5+2*ih){x=m;y=y0+ih-(u-iw*1.5-ih);ang=-Math.PI/2}else {x=x0+(u-iw*1.5-2*ih);y=mt;ang=0}
   pts.push([x,y,ang,s/per])}
  for(const [x,y,ang,u] of pts){const q=clamp((fr*1.25-u)*6);if(!q)continue;S.leaf(x,y,ang+1.2,.42*q,1);S.leaf(x,y,ang+Math.PI-1.2+Math.PI,.42*q,1)}
  const r=Math.max(10,Math.min(m-76,mt-70)*1.25);
  [['sun',x0,y0],['moon',x0+iw,y0],['heart',x0,y0+ih],['tree',x0+iw,y0+ih]].forEach(([kind,x,y],i)=>medallion(x,y,r*1.6,kind,smooth(.35+i*.12,.6+i*.12,fr),t));
  g.restore()}
 function extended(raw){const frame=Math.round(raw*24),t=Math.floor(frame/2)/12,a=abstract(t);
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  // A continuous widening from the existing look test, then a final pull-back to the whole plate.
  const close=smooth(96.3,100.1,raw)*(1-smooth(108.0,110.0,raw));
  const fr=smooth(136.5,142,raw),fk=1-.14*fr,zoom=(1.032-.032*smooth(79.5,85,raw)+.12*close)*fk;
  g.save();g.beginPath();g.rect(960-884*fk,537.5-467.5*fk,1768*fk,935*fk);g.clip();g.translate(960,540);g.scale(zoom,zoom);g.translate(-960+2*Math.sin(raw*.14),-540);S.sky();warmSky(t,a);
  for(let i=0;i<5;i++)cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25,.72+(i%2)*.15,i%2?-1:1);
  horizonForest(t);S.ground(t);widerRoots(t);goldenRoots(t);careFlow(t);finalRelay(t);returnReply(t);
  orbitBirds(t);heart(t,a,true);
  upperHeralds(t,raw);
  for(const flip of [-1,1]){const h=heraldPosition(flip,t);g.save();g.translate(h.x,h.y);g.scale(h.scale,h.scale);const oldX=flip<0?290:1635;g.translate(-oldX,-294);S.herald(oldX,294,flip,t,raw);g.restore()}
  // The cast retreats below the soil while its musical emblem occupies the sky.
  g.save();g.beginPath();g.rect(76,70,1768,731);g.clip();g.translate(0,a*620);
  for(const c of cast)actor(c,t);
  S.person('sol',t);S.person('luna',t);for(const c of cast)actor(c,t,true);if(t<82)S.birds(t);g.restore();
  // Foreground earth occludes the retreating bodies and the entire root section together.
  if(a){g.save();g.globalAlpha=a;S.ground(t,false);g.restore()}
  fallingLeaves(t);heart(t,a);brassRibbons(t,raw);orbitBirds(t,true);
  // Last verse roundels physically leave their row before the next chorus builds its cast.
  if(t<81.3){g.save();g.translate(0,-330*smooth(79.5,81.3,t));S.roundel(820,163,63,t,'wind',71.875);S.roundel(960,156,64,t,'sun',72.875);S.roundel(1100,163,63,t,'winter',73.75);g.restore()}
  g.restore();emblemFrame(fr,fk,t);border();
  const fade=smooth(148.6,153.066,raw);if(fade){g.save();g.globalAlpha=fade;g.drawImage(A.paper,0,0);g.restore()}
 }
 A.draw=raw=>raw<79.5?lookTest(raw):extended(raw);
 A.ensemble={finalBirdPose,replyPackets,widerRootCurve,cast};
 A.extendedState=t=>({chapter:t<79.5?'look-test':t<96.3?'community':t<110?'heart-sun':t<122.7?'brass':t<136?'grove':'outro',cast:2+cast.filter(c=>t>=c.on+1.25).length,abstract:abstract(t),foliage:A.leafSeason(t)});
})();
