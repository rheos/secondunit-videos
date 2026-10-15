/* Spoken lead-in. One face acquires different emblems, then the chart becomes a root plate. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,clamp,smooth,mix,noise,line,stroke,fill,ellipse,piece,cloud}=A;
 const later=A.draw;
 // v15: every coin lands on a name the DJ reads (Earwigs, Cameron, Goofs, Sibony Club, Scott Merritt, Pat), so the
 // wheel is full before the station changes (Robin: the last coin took too long).
 const portraits=[2.62,4.88,8.85,9.7,10.45,11.5];
 function border(t){const p=smooth(0,1.8,t),length=5552;
  g.save();g.strokeStyle=C.ink;g.lineWidth=1.4;g.setLineDash([length*p,length]);g.strokeRect(57,50,1806,970);g.restore();
  g.save();g.globalAlpha=smooth(.7,2.2,t);g.strokeStyle=C.ink;g.lineWidth=.6;g.strokeRect(63,56,1794,958);g.restore();
 }
 function leaf(x,y,angle,k){g.save();g.translate(x,y);g.rotate(angle);g.scale(k,k);
  fill('M0 0Q-24-18-13-48Q14-30 0 0',C.green);stroke('M0 0Q-24-18-13-48Q14-30 0 0',C.ink,1.3);line(0,0,-12,-42,C.ink,.8);
  for(let j=0;j<5;j++)line(-3-j*2,-8-j*6,-13-j,-11-j*6,C.ink,.65);g.restore();
 }
 function crown(kind,t){const q=S.pulse(t);
  if(kind===0){cloud(0,-124,.28);for(let j=0;j<3;j++)stroke(`M${-38+j*27} -105q-12 21 0 33`,C.blue,1.5)}
  if(kind===1){stroke('M0-90V-163M0-111L-29-140M0-129L29-155',C.ink,3);leaf(-29,-140,-.7,.6);leaf(29,-155,.5,.65)}
  if(kind===2&&!A.performance.horn(t).visible){cloud(0,-130,.30);return}
  if(kind===2){g.save();g.translate(0,-125);g.rotate(.12*Math.sin(q));fill('M-49 3L20-6L49-24L54 21L22 4L-49 9Z',C.gold);stroke('M-49 3L20-6L49-24L54 21L22 4L-49 9Z');ellipse(51,-1,5,23,null,C.ink);A.rays(57,-1,4,19,45,A.brass(t),0,.9);g.restore()}
  if(kind===3)S.bird(18,-115,.15,t,1,0,0);
  if(kind===4){ellipse(0,-134,24,24,C.gold,C.ink);A.rays(0,-134,28,27,23,.7+.15*Math.sin(t*2),t*.05)}
  if(kind===5){g.save();g.translate(0,-140);g.scale(.20,.20);g.translate(-994,-170);piece('luna-head','#bdc9d3');g.restore()}
 }
 // v12: the named people become the trees (audit A5): each medallion falls like a seed onto a tree spot and lands
 // as that tree starts to grow (front row from 32.9 s).
 const seedSpots=['0-0','0-1','0-2','0-3','1-1','1-4'];
 // v14 (Robin: the hanging grid was lopsided and thin): the roll call is a WHEEL OF NAMES. A symmetric engraved
 // wheel is flown in before the first name with all six roundels empty, so it is balanced from the start; each act
 // the DJ names fills a slot with the constant face and its crown, alternating left and right. From the trumpet
 // entry the wheel turns a step on every trumpet phrase (faces stay upright, like a Ferris wheel) and every crown
 // advances one place. At 30.7 s the faces come loose and fall as the seeds; the wheel lifts away.
 const WC={x:960,y:465,R:225},slotDeg=[330,30,270,90,210,150];
 // v16: hangs 25 px lower under the valance (clear of its fringe), rises 65 px once the stage opens (clear of the floor) (audit A12)
 const wcY=t=>490-65*smooth(16.5,18,t);
 function phrasesBy(t){const sc=window.ALCHEMY_TRUMPET_SCORE;if(!sc)return 0;const f=t*24;let n=0;for(const [a] of sc.intervals){if(a/24>30.7)break;n+=smooth(a,a+9,f)}return n}
 // v16 (audit A1): each phrase step overshoots and settles, the wheel swells slowly across the trumpet intro.
 function wheelTurn(t){const sc=window.ALCHEMY_TRUMPET_SCORE;let kick=0;if(sc)for(const [a] of sc.intervals){if(a/24>30.7)break;const d=t*24-a;if(d>=0&&d<14)kick+=.09*Math.sin(d/14*Math.PI*2)*Math.exp(-d/6)}
  return phrasesBy(t)*Math.PI/14+kick+.05*smooth(16.6,18,t)*(t-16.6)}
 const wheelScale=t=>1+.12*smooth(17,30.5,t);
 function slotPos(i,t){const a=slotDeg[i]*Math.PI/180+wheelTurn(t),R=WC.R*wheelScale(t);return [WC.x+Math.sin(a)*R,wcY(t)-Math.cos(a)*R]}
 function wheel(t,lift){const fly=smooth(1.5,2.5,t),y0=wcY(t)-900*(1-fly)-1000*lift*lift;if(fly<=0||lift>=1)return;
  const turn=wheelTurn(t);g.save();g.translate(WC.x,y0);g.scale(wheelScale(t),wheelScale(t));
  // suspension cords from the flies
  line(-150,-700,-60,-WC.R-30,C.ink,1.4);line(150,-700,60,-WC.R-30,C.ink,1.4);
  g.rotate(turn);
  // outer ring: double engraved band with a laurel run between
  ellipse(0,0,WC.R+26,WC.R+26,null,C.ink);ellipse(0,0,WC.R-26,WC.R-26,null,C.ink);
  g.save();g.beginPath();g.arc(0,0,WC.R+26,0,Math.PI*2);g.arc(0,0,WC.R-26,0,Math.PI*2,true);g.fillStyle='#e7c46a';g.fill('evenodd');g.restore();
  for(let k=0;k<48;k++){const a=k/48*Math.PI*2;g.save();g.rotate(a);S.leaf(0,-WC.R+2,Math.PI/2.4,.34,1);g.restore()}
  ellipse(0,0,WC.R+26,WC.R+26,null,C.ink);ellipse(0,0,WC.R-26,WC.R-26,null,C.ink);
  // spokes to every slot, and between slots
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r0=98,r1=WC.R-26;g.save();g.rotate(a);fill(`M-5 ${-r0}L5 ${-r0}L3 ${-r1}L-3 ${-r1}Z`,i%2?'#c9962e':'#d8b25a');stroke(`M-5 ${-r0}L5 ${-r0}L3 ${-r1}L-3 ${-r1}Z`,C.ink,1);g.restore()}
  g.rotate(-turn);
  // hub: the large constant sun face
  ellipse(0,0,100,100,'#b9cf95',C.ink);ellipse(0,0,92,92,null,'#5b6a3a');g.save();g.beginPath();g.arc(0,0,90,0,Math.PI*2);g.clip();g.translate(0,62);g.scale(.24,.24);A.grove.treeShape(911,t,.3);g.restore();
  A.rays(0,0,104,40,30*A.performance.horn(t).attack,A.performance.horn(t).attack,turn);
  g.restore();
  // empty roundels in every slot (upright)
  for(let i=0;i<6;i++){const [x,y]=slotPos(i,t),yy=y-(wcY(t)-y0);g.save();g.translate(x,yy);ellipse(0,0,74,74,C.paper,C.ink);ellipse(0,0,68,68,null,'#ad9662');for(let k=0;k<24;k++){const a=k/24*Math.PI*2;line(Math.cos(a)*58,Math.sin(a)*58,Math.cos(a)*66,Math.sin(a)*66,'#ad9662',.8)}g.restore()}
 }
 function chart(t){const handoff=smooth(30.7,32.9,t),st=A.grove.state(t),lift=smooth(30.7,32.2,t),fly=smooth(1.5,2.5,t);
  g.save();g.beginPath();g.rect(76,70,1768,935);g.clip(); // the wheel stays inside the plate while it flies in and out
  wheel(t,lift);
  const steps=Math.floor(phrasesBy(t)+.5);
  for(let i=0;i<portraits.length;i++){const born=smooth(portraits[i],portraits[i]+.45,t);if(!born||t>=33.1)continue;
   const [wx,wy]=slotPos(i,t),baseX=wx,baseY=wy-(wcY(t)-(wcY(t)-900*(1-fly)));
   const spot=st.trees.find(tr=>tr.id===seedSpots[i]),sx=spot?spot.x:baseX,sy=spot?spot.y+st.cameraY:760;
   // v16: faces first swing outward from the hub, then fall (audit A13)
   const out=smooth(0,.35,handoff),ox=(baseX-WC.x)*.5*out*(1-smooth(.35,1,handoff)),oy=(baseY-wcY(t))*.5*out*(1-smooth(.35,1,handoff));
   const x=mix(baseX,sx,smooth(.25,1,handoff))+ox,y=mix(baseY,sy-8,Math.pow(smooth(.2,1,handoff),2))+oy;
   const hit=A.performance.horn(t).attack,pop=1+.25*A.performance.bump(portraits[i],portraits[i]+.2,portraits[i]+.6,t);
   const k=born*.78*pop*mix(1,.42,smooth(0,1,handoff))*(1+.05*hit),beat=(.45+.55*smooth(12.5,14,t))*(1-handoff);
   if(handoff>.97){const pf=1-smooth(32.9,33.4,t);A.glow(sx,sy-6,70*pf,pf);for(let q=0;q<7;q++){const a=q/7*Math.PI-Math.PI,r=30+40*(1-pf);ellipse(sx+Math.cos(a)*r,sy-4+Math.sin(a)*r*.4,6*pf,4*pf,'#c9a46c',null)}}
   g.save();g.translate(x,y+beat*4*Math.sin(S.pulse(t)+i));g.rotate(.03*beat*Math.sin(S.pulse(t)+i*.8));g.scale(k,k);
   ellipse(0,0,91,91,C.paper,C.ink);ellipse(0,0,85,85,null,'#ad9662');
   // Keep the same historical face; only the emblem above it changes, one place per trumpet phrase.
   g.save();g.beginPath();g.arc(0,0,80,0,Math.PI*2);g.clip();g.scale(.43,.43);g.translate(-333,-164);piece('sol-head',C.gold,smooth(12.5,18,t));g.restore();
   const top=Math.cos(slotDeg[i]*Math.PI/180+wheelTurn(t))>.8;if(hit&&born>=1)A.rays(0,0,96,36,(top?60:26)*hit,hit*(top?1:.6),i*.4);if(top&&hit>.3)A.glow(0,0,110,hit*.8);g.save();g.translate(0,-91);g.scale(1.5,1.5);g.translate(0,91);crown((i+steps)%6,t);g.restore();g.restore();
  }
  g.restore();
 }
 function gear(x,y,r,teeth,ang,k,crank){if(k<=0)return;g.save();g.translate(x,y);g.scale(k,k);g.rotate(ang);
  const P=new Path2D();for(let i=0;i<teeth;i++){const a0=i/teeth*Math.PI*2,a1=a0+Math.PI/teeth*.55,a2=a0+Math.PI/teeth,a3=a2+Math.PI/teeth*.45,ro=r+r*.22;
   const pt=(a,rr)=>[Math.cos(a)*rr,Math.sin(a)*rr];const q=[pt(a0,r),pt(a0+.06,ro),pt(a1-.06,ro),pt(a1,r),pt(a3,r)];q.forEach(([px,py],j)=>i||j?P.lineTo(px,py):P.moveTo(px,py))}
  P.closePath();g.fillStyle='#d4a640';g.fill(P);g.save();g.clip(P);for(let j=-r*1.3;j<r*1.3;j+=3.2)line(j,-r*1.3,j+r*.6,r*1.3,'#7a5320',.6);g.restore();
  g.fillStyle='rgba(255,236,170,.35)';g.beginPath();g.arc(-r*.25,-r*.25,r*.55,0,Math.PI*2);g.fill();
  g.strokeStyle=C.ink;g.lineWidth=1.6;g.stroke(P);ellipse(0,0,r*.72,r*.72,null,C.ink);
  for(let s=0;s<4;s++){g.save();g.rotate(s*Math.PI/2);fill(`M${-r*.09} ${-r*.2}L${r*.09} ${-r*.2}L${r*.07} ${-r*.68}L${-r*.07} ${-r*.68}Z`,'#b8862e');stroke(`M${-r*.09} ${-r*.2}L${r*.09} ${-r*.2}L${r*.07} ${-r*.68}L${-r*.07} ${-r*.68}Z`,C.ink,1);g.restore()}
  ellipse(0,0,r*.24,r*.24,'#e7c46a',C.ink);ellipse(0,0,r*.09,r*.09,C.ink,null);
  if(crank){line(0,0,r*1.15,0,C.ink,5);line(0,0,r*1.15,0,'#c9962e',3);ellipse(r*1.15,0,r*.16,r*.16,'#8a5a2b',C.ink)}
  g.restore()}
 function machine(t,cover){const grow=smooth(43.6,44.45,t),k0=grow*(1-cover);if(k0<=0)return;
  const run=t<44.54?0:(t-44.54)*1.6+Math.max(0,t-46.0)*7*(1-smooth(46.5,46.9,t)),works=A.performance.bump(45.95,46.12,46.9,t);
  // gear sites: the central knot, each front tree's root crown, and the middle of each long root
  const sites=[[960,939,86,18,1,1]];
  for(const [x,dir] of [[400,1],[1520,-1]]){sites.push([x,812,48,12,-1,0]);sites.push([...S.bez([x,756,x+dir*25,845,x+dir*390,979,960,939],.55),44,11,1,0])}
  for(const [x,dir] of [[690,1],[1220,-1]]){sites.push([x,812,50,12,-1,0]);sites.push([...S.bez([x,756,x+dir*55,856,960-dir*147,979,959,934],.5),42,11,1,0])}
  // the gold drive: on "how" a glint runs from every tree's gear to the knot
  const drive=smooth(44.9,45.8,t);if(drive>0&&drive<1)for(const [x,dir] of [[400,1],[1520,-1],[690,1],[1220,-1]]){const b=x===400||x===1520?[x,756,x+dir*25,845,x+dir*390,979,960,939]:[x,756,x+dir*55,856,960-dir*147,979,959,934];const q=S.bez(b,drive);A.glow(q[0],q[1],26)}
  if(works)A.glow(960,939,120*works,works*.9);
  sites.forEach(([x,y,r,teeth,dir,crank],i)=>{const k=k0*smooth(0,.6,grow*1.6-i*.08)*(1+.12*works);gear(x,y,r,teeth,dir*run*(46/r)+i*.3,k,crank)});

 }
 // v21 (Robin's pick for "exactly", 44.54 s): the geometer's dividers from the emblem books walk along the roots, stepping
 // over on alternating points, and land astride the gold knot exactly on the word, with a gold spark and a measured arc.
 function dividers(t){const on=smooth(43.75,44.0,t),off=smooth(45.0,45.7,t);if(on<=0||off>=1)return;
  const S2=270,Y=932,L=330,steps=[[285,555],[555,825],[825,1095]],at=[44.05,44.3,44.54];
  let a=steps[0][0],b=steps[0][1];
  if(t>=at[0]){const k=t<at[1]?0:1,u=smooth(at[k]-.25+.0,at[k],t)*(t<at[k]?1:1);const pivot=steps[k][1],phi=Math.PI*(1-smooth(at[k]-.25,at[k],t));
   a=pivot;b=pivot+S2*Math.cos(phi);var by=Y-S2*Math.sin(phi)*.55;if(t>=at[1]&&t>=at[2]){a=steps[2][0];b=steps[2][1];by=Y}}
  if(by===undefined)var by=Y;
  // a: planted tip, (b,by): swinging tip; the hinge sits above their midpoint, legs rigid
  const mx=(a+b)/2,my=(Y+by)/2,dx=b-a,dy=by-Y,d=Math.hypot(dx,dy)||1,h=Math.sqrt(Math.max(0,L*L-(d/2)*(d/2)));
  let nx=-dy/d,ny=dx/d;if(ny>0){nx=-nx;ny=-ny}
  const hx=mx+nx*h,hy=my+ny*h-(1-on)*500-off*700;const tipA=[a,Y-(1-on)*500-off*700],tipB=[b,by-(1-on)*500-off*700];
  const leg=(tx,ty)=>{const ux=tx-hx,uy=ty-hy,l=Math.hypot(ux,uy),px=-uy/l,py=ux/l,P=`M${hx+px*9} ${hy+py*9}L${tx+px*1.5} ${ty+py*1.5}L${tx} ${ty}L${tx-px*1.5} ${ty-py*1.5}L${hx-px*9} ${hy-py*9}Z`;
   fill(P,'#6f7177');g.save();g.clip(new Path2D(P));for(let k=0;k<l;k+=3.2)line(hx+ux*k/l+px*9,hy+uy*k/l+py*9,hx+ux*(k+5)/l-px*2,hy+uy*(k+5)/l-py*2,'#25262b',.7);line(hx-px*3,hy-py*3,tx-px*.4,ty-py*.4,'#d9dbe0',1.2);g.restore();stroke(P,C.ink,1.8)};
  leg(...tipA);leg(...tipB);
  // the quadrant bar between the legs, and the hinge
  const q=.32;stroke(`M${hx+(tipA[0]-hx)*q} ${hy+(tipA[1]-hy)*q}Q${hx} ${hy+(Math.max(tipA[1],tipB[1])-hy)*.42} ${hx+(tipB[0]-hx)*q} ${hy+(tipB[1]-hy)*q}`,C.ink,3);
  ellipse(hx,hy,20,20,'#e0b13e',C.ink);ellipse(hx,hy,13,13,null,'#8f5f1e');ellipse(hx,hy,6,6,C.ink,null);line(hx,hy-20,hx,hy-46,C.ink,4);ellipse(hx,hy-50,8,8,'#e0b13e',C.ink);
  // exactly: sparks on both points and an engraved measuring arc between them
  const hit=A.performance.bump(44.42,44.5,45.25,t);if(hit){A.glow(tipA[0],tipA[1],90*hit,hit);A.glow(tipB[0],tipB[1],90*hit,hit);A.glow(hx,hy,60*hit,hit*.8);
   g.save();g.globalAlpha=hit;stroke(`M${tipA[0]} ${tipA[1]+16}Q${(tipA[0]+tipB[0])/2} ${tipA[1]+70} ${tipB[0]} ${tipB[1]+16}`,C.gold,3);stroke(`M${tipA[0]} ${tipA[1]+16}Q${(tipA[0]+tipB[0])/2} ${tipA[1]+70} ${tipB[0]} ${tipB[1]+16}`,C.ink,1);
   for(const x of [tipA[0],tipB[0]])line(x,tipA[1]+4,x,tipA[1]+28,C.ink,1.6);A.rays(960,939,40,24,60*hit,hit,0);g.restore()}
 }
 // v21 (Robin): on "which we cannot see" the roots draw back out of sight (a searcher looks for them), and rush back on "Oh".
 function roots(t){const cover=smooth(46.1,46.9,t),gone=smooth(41.15,41.85,t)*(1-smooth(43.2,43.5,t)),reveal=smooth(37,40.75,t)*(1-cover)*(1-gone);if(!reveal||cover>=1)return;
  g.save();g.beginPath();g.rect(76,760,1768,245);g.clip();
  // The flanking trees join the same living system as the central pair.
  for(const [x,dir,seed] of [[400,1,54],[1520,-1,67]]){
   const p=clamp(reveal*1.1-.08);
   S.woodyRoot([x,756,x+dir*25,845,x+dir*390,979,960,939],p,36,14,seed);
   S.woodyRoot([x,756,x-dir*15,808,x-dir*55,844,x-dir*94,879],p,24,3,seed+2,{rootlets:3});
  }
  for(let side=0;side<2;side++)for(let j=0;j<3;j++){
   const x=side?1220:690,end=940+j*19,dir=side?-1:1,phase=clamp(reveal*1.12-j*.055);
   // Unequal, tapering offshoots make the shared bundle read as wood rather than cable.
   if(j<2){const ox=x-dir*(28+j*19),oy=802+j*31;
    S.woodyRoot([x+(j-1)*10,756,x-dir*35,788,ox,oy,ox-dir*(77+j*29),oy+51+j*19],phase,24-j*4,3,side*7+j);
    S.woodyRoot([ox,oy,ox-dir*7,oy+29,ox-dir*15,oy+52,ox-dir*24,oy+71],clamp(phase*1.4-.4),12,1.5,side+j+6,{rootlets:2,rootletLen:40});
   }
   S.woodyRoot([x+(j-1)*10,756,x+dir*(35+j*20),856,end-dir*(130+j*17),971+j*8,end,926+j*8],phase,38-j*3,13+j,side*3+j);
  }
  // v20 (Robin's pick): "Oh, that's exactly how it works" (43.3-46.1 s). The root network turns into an engraved working
  // machine: brass gears grow in at its junctions on "that's", mesh and start turning on "exactly", a gold drive runs
  // between them on "how", and on "works" the whole machine spins up and every tree shivers. It folds away with the roots.
  // A visible central join is the thesis of the cross-section.
  if(reveal>.9){const k=smooth(.9,1,reveal),glint=A.performance.bump(40.6,40.8,41.6,t);g.save();g.translate(960,939);g.scale(k,k);
   ellipse(0,0,42,27,C.gold,C.ink);ellipse(0,0,32,19,null,'#8f5f1e');g.save();g.beginPath();g.ellipse(0,0,41,26,0,0,Math.PI*2);g.clip();for(let j=-40;j<44;j+=4)line(j,26,j+14,-26,'#7a5320',.6);g.restore();
   ellipse(-10,-7,9,5,'#fff3c4',null);if(glint)A.rays(0,0,46,28,40*glint,glint,t*.3);g.restore()}
  // Soil closes the cross-section across the whole network; no root is severed.
  // v16 (audit A3, A4): no wipe with straight cuts; the roots draw back along their own length after the spoken payoff.
  g.restore();
  machine(t,cover); // over the knot and outside the roots' clip, so the big gear and its crank are whole
 }
 function drawHeralds(raw,t){const arrive=smooth(7.25,9.25,raw);if(!arrive)return;
  g.save();g.translate(-500*(1-arrive),0);S.herald(290,294,-1,t,raw);g.restore();g.save();g.translate(500*(1-arrive),0);S.herald(1635,294,1,t,raw);g.restore()}
 function opening(raw){const t=Math.floor(Math.round(raw*24)/2)/12;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  g.save();g.translate(2*Math.sin(raw*.14),0);
  const sky=smooth(7.25,11.4,raw),ground=smooth(30.5,33,raw),cameraY=A.grove.state(raw).cameraY;
  if(sky){g.save();g.beginPath();g.moveTo(76,70);const ex=76+1830*sky;
   for(let y=70;y<=760;y+=10)g.lineTo(sky>=.995?1900:Math.min(1900,ex-60+48*noise(Math.floor(y/10)+3)+22*Math.sin(y*.045)),y); // v16: no notches once washed in (audit A8)
   g.lineTo(76,760);g.closePath();g.clip();S.sky(raw);g.restore()} // v11: hand-washed edge (audit A13)
  g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(0,cameraY); // v16: clouds stay inside the picture (audit A7)
  for(let i=0;i<5;i++){const p=smooth(11.7+i*.5,14.2+i*.5,raw);if(!p)continue;
   cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25-210*(1-p),.72+(i%2)*.15,i%2?-1:1)}
  g.restore();
  g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(0,cameraY);
  if(ground&&raw>=ALCHEMY_CUES.grove.landRetreat[0]/24){fill('M75 754H1845V775H75Z','#dcd09c');S.ground(t,false)}
  else if(ground){g.save();g.beginPath();g.rect(75,760,1770,610*ground);g.clip();
   fill('M75 754H1845V775H75Z','#dcd09c');S.ground(t,false);g.restore()} // v9: the same engraved soil section as the rest of the film
  // v22 (Robin): the angels and their clouds sit between the land and the trees, so the trees stay in front of them.
  const heraldsBehind=A.grove.draw(raw,()=>{g.save();g.translate(0,-cameraY*.7);drawHeralds(raw,t);g.restore()});
  roots(t);if(ground)S.turf();dividers(t); // dividers over the turf: the hinge stands above ground
  g.restore();
  // v11: heralds stand in front of the grove and move at 0.3x the camera dip, so their heads stay in the plate.
  if(!heraldsBehind){g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(0,cameraY*.3);drawHeralds(raw,t);g.restore()}
  chart(t);
  g.restore();border(raw);
  // The full registration ornaments arrive before the first chorus scene.
  const marks=smooth(44,46.8,raw);g.save();g.globalAlpha=marks;
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}g.restore();
 }
 A.draw=raw=>raw<ALCHEMY_CUES.chorus.sharedArrival[0]/24?opening(raw):later(raw);
 A.openingChart=chart;
 A.openingState=t=>({chapter:t<12.5?'spoken-chart':t<32.9?'brass-chart':t<47?'hidden-roots':'later-cut',portraits:portraits.filter(s=>s<=t).length});
})();
