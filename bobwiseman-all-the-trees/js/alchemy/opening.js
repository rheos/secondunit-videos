/* Spoken lead-in. One face acquires different emblems, then the chart becomes a root plate. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,clamp,smooth,mix,noise,line,stroke,fill,ellipse,piece,cloud}=A;
 const later=A.draw;
 const portraits=[1.875,4.708,8,10.458,17,24];
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
 function chart(t){const handoff=smooth(30.7,33.8,t);
  for(let i=0;i<portraits.length;i++){const born=smooth(portraits[i],portraits[i]+.65,t);if(!born||handoff>=1)continue;
   const side=i%2,settle=smooth(2.9,4.65,t),baseX=mix(960,650+(i%3)*310,settle),baseY=mix(470,i<3?402:654,settle);
   const x=mix(baseX,(side?1220:690)+(i%3-1)*48,handoff),y=mix(baseY,468+(i%3)*25,handoff);
   const hit=A.performance.horn(t).attack,k=born*(1-handoff)*(i===0?mix(1.8,1,settle):1)*(1+.05*hit),beat=.45+.55*smooth(12.5,14,t);
   g.save();g.translate(x,y+beat*7*Math.sin(S.pulse(t)+i));g.rotate(.045*beat*Math.sin(S.pulse(t)+i*.8));g.scale(k,k);
   ellipse(0,0,91,91,C.paper,C.ink);ellipse(0,0,85,85,null,'#ad9662');
   // Keep the same historical face; only the emblem above it changes.
   g.save();g.beginPath();g.arc(0,0,80,0,Math.PI*2);g.clip();g.scale(.43,.43);g.translate(-333,-164);piece('sol-head',C.gold,smooth(12.5,18,t));g.restore();
   if(hit&&born>=1)A.rays(0,0,96,36,26*hit,hit*.9,i*.4);crown(i,t);g.restore();
  }
 }
 function roots(t){const reveal=smooth(37,40.75,t),cover=smooth(43.5,45.1,t);if(!reveal||cover>=1)return;
  g.save();g.beginPath();g.rect(76,760,1768,245);g.clip();
  // The flanking trees join the same living system as the central pair.
  for(const [x,dir,seed] of [[230,1,54],[1690,-1,67]]){
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
  // A visible central join is the thesis of the cross-section.
  if(reveal>.9){const k=smooth(.9,1,reveal),glint=A.performance.bump(40.6,40.8,41.6,t);g.save();g.translate(960,939);g.scale(k,k);
   ellipse(0,0,42,27,C.gold,C.ink);ellipse(0,0,32,19,null,'#8f5f1e');g.save();g.beginPath();g.ellipse(0,0,41,26,0,0,Math.PI*2);g.clip();for(let j=-40;j<44;j+=4)line(j,26,j+14,-26,'#7a5320',.6);g.restore();
   ellipse(-10,-7,9,5,'#fff3c4',null);if(glint)A.rays(0,0,46,28,40*glint,glint,t*.3);g.restore()}
  // Soil closes the cross-section across the whole network; no root is severed.
  if(cover){g.save();g.beginPath();g.rect(76,700,884*cover,700);g.rect(1844-884*cover,700,884*cover,700);g.clip();S.ground(t,false);g.restore()} // v11 (audit A10)
  g.restore();
 }
 function opening(raw){const t=Math.floor(Math.round(raw*24)/2)/12;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  g.save();g.translate(2*Math.sin(raw*.14),0);
  const sky=smooth(7.25,11.4,raw),ground=smooth(30.5,33,raw),cameraY=A.grove.state(raw).cameraY;
  if(sky){g.save();g.beginPath();g.moveTo(76,70);const ex=76+1830*sky;
   for(let y=70;y<=760;y+=10)g.lineTo(Math.min(1844,ex-60+48*noise(Math.floor(y/10)+3)+22*Math.sin(y*.045)),y);
   g.lineTo(76,760);g.closePath();g.clip();S.sky();g.restore()} // v11: hand-washed edge (audit A13)
  g.save();g.beginPath();g.rect(58,51,1804,958);g.clip();g.translate(0,cameraY);
  for(let i=0;i<5;i++){const p=smooth(11.7+i*.5,14.2+i*.5,raw);if(!p)continue;
   cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25-210*(1-p),.72+(i%2)*.15,i%2?-1:1)}
  g.restore();
  g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(0,cameraY);
  if(ground&&raw>=ALCHEMY_CUES.grove.landRetreat[0]/24){fill('M75 754H1845V775H75Z','#dcd09c');S.ground(t,false)}
  else if(ground){g.save();g.beginPath();g.rect(75,760,1770,610*ground);g.clip();
   fill('M75 754H1845V775H75Z','#dcd09c');S.ground(t,false);g.restore()} // v9: the same engraved soil section as the rest of the film
  A.grove.draw(raw);roots(t);if(ground)S.turf();g.restore();
  // v11: heralds stand in front of the grove and move at 0.3x the camera dip, so their heads stay in the plate.
  const arrive=smooth(7.25,9.25,raw);
  if(arrive){g.save();g.beginPath();g.rect(76,70,1768,935);g.clip();g.translate(0,cameraY*.3);
   g.save();g.translate(-500*(1-arrive),0);S.herald(290,294,-1,t,raw);g.restore();g.save();g.translate(500*(1-arrive),0);S.herald(1635,294,1,t,raw);g.restore();g.restore()}
  chart(t);
  g.restore();border(raw);
  // The full registration ornaments arrive before the first chorus scene.
  const marks=smooth(44,46.8,raw);g.save();g.globalAlpha=marks;
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}g.restore();
 }
 A.draw=raw=>raw<ALCHEMY_CUES.chorus.sharedArrival[0]/24?opening(raw):later(raw);
 A.openingState=t=>({chapter:t<12.5?'spoken-chart':t<32.9?'brass-chart':t<47?'hidden-roots':'later-cut',portraits:portraits.filter(s=>s<=t).length});
})();
