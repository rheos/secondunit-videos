/* v13 opening (Robin, 2026-10-14): the song opens on a radio. Static, a co-op radio DJ reading Toronto gig
   listings, the dial turning, a French singer on another station, then the song proper at 16.55 s.
   Here it is a theatre: closed curtains in the plate, a herald reads the listings (the DJ), each named act
   pins its medallion to the curtain, the dial turn is a gust of aether that spins him off, a troubadour sings
   the French station as the curtains open on the scene, and the stage clears as the trumpets come in.
   Song-time pure: everything is a function of the song clock, poses on twos. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,smooth,clamp,mix,noise,line,stroke,fill,ellipse}=A;
 const base=A.draw,W=1920,H=1080,X0=76,X1=1844,Y0=70,Y1=1005,CB=932;
 const T={staticEnd:2.25,heraldIn:[1.2,2.1],dial:11.5,heraldOut:[11.6,12.45],singerIn:[12.3,13.1],open:[13.35,16.5],singerOut:[16.5,17.5],clear:[17.3,18.6],floorOut:[29.6,33.0]};
 const img={};A.openingImg=img;
 const oldLoad=A.load;
 A.load=async()=>{await oldLoad();const M=window.ALCHEMY_OPENING_MEDIA||{};
  await Promise.all(Object.keys(M).map(k=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{img[k]=im;res()};im.onerror=()=>rej(new Error('Missing opening asset '+k));im.src=M[k]})))};
 const V=window.ALCHEMY_VOICE||{env:[]};
 const voice=f=>V.env[Math.max(0,Math.min(V.env.length-1,f))]||0;
 // Mouth open on voiced frames, with a little hysteresis so a syllable reads as one opening.
 const mouth=f=>voice(f)>.6||(voice(f-1)>.6&&voice(f)>.42);

 // ---- curtains: engraved crimson velvet, folds hatched in ink, gold fringe ----
 function panel(side,o,t,ripple){const outer=side<0?X0:X1,closedW=(X1-X0)/2+10,w=mix(closedW,135,o),inner=outer-side*w;
  const lift=o*o*260,top=150;
  const path=new Path2D();path.moveTo(outer,top);path.lineTo(inner,top);
  path.bezierCurveTo(inner,mix(CB,top,.35),inner+side*w*.12*o,CB-lift,inner+side*w*.35*o,CB-lift*.75);
  path.quadraticCurveTo(mix(inner,outer,.6),CB-lift*.25,outer,CB+4);path.closePath();
  g.save();g.clip(path);g.fillStyle='#7d2430';g.fillRect(X0,top,X1-X0,CB-top+10);
  // Velvet folds: each fold shades from a dark crease to a lit crest, hatched in its shadow (engraved drapery).
  const N=10,wob=(y,i)=>(5+ripple*14)*Math.sin(y*.011+i*1.9+t*(1.1+ripple*5))*(.35+.65*Math.abs(i/N));
  for(let i=0;i<N;i++){const xa=mix(outer,inner,i/N),xb=mix(outer,inner,(i+1)/N);
   const band=new Path2D();band.moveTo(xa+wob(top,i),top);for(let y=top;y<=CB+12;y+=22)band.lineTo(xa+wob(y,i),y);
   for(let y=CB+12;y>=top;y-=22)band.lineTo(xb+wob(y,i+1),y);band.closePath();
   const gr=g.createLinearGradient(xa,0,xb,0);gr.addColorStop(0,'#1e0609');gr.addColorStop(.25,'#5a1621');gr.addColorStop(.55,'#8f2a37');gr.addColorStop(.68,'#a2384a');gr.addColorStop(.82,'#6e1b28');gr.addColorStop(1,'#22070b');
   g.fillStyle=gr;g.fill(band);
   const hatch=new Path2D();for(let k=0;k<14;k++){const u=k/14*.42,xx=mix(xa,xb,u);hatch.moveTo(xx+wob(top,i),top);for(let y=top;y<=CB+12;y+=22)hatch.lineTo(xx+mix(wob(y,i),wob(y,i+1),u),y)}
   for(let k=0;k<5;k++){const u=.86+k*.03,xx=mix(xa,xb,u);hatch.moveTo(xx+wob(top,i+1),top);for(let y=top;y<=CB+12;y+=22)hatch.lineTo(xx+mix(wob(y,i),wob(y,i+1),u),y)}
   g.strokeStyle='rgba(24,8,8,.5)';g.lineWidth=.8;g.stroke(hatch);
   const crest=new Path2D(),cu=.6;crest.moveTo(mix(xa,xb,cu)+wob(top,i),top);for(let y=top;y<=CB+12;y+=22)crest.lineTo(mix(xa,xb,cu)+mix(wob(y,i),wob(y,i+1),cu),y);
   g.strokeStyle='rgba(230,150,150,.18)';g.lineWidth=7;g.stroke(crest)}
  g.restore();
  g.strokeStyle=C.ink;g.lineWidth=2;g.stroke(path);
  // gold fringe along the hem
  const hem=[];for(let k=0;k<=40;k++){const s=k/40,x=mix(inner+side*w*.35*o,outer,s),y=mix(CB-lift*.75,CB+4,s)-Math.sin(s*Math.PI)*lift*.2;hem.push([x,y])}
  for(const [x,y] of hem){line(x,y-14,x,y+2,'#c9962e',3);line(x,y-14,x,y+2,C.ink,.6)}
 }
 function valance(drop,t){const y0=Y0-drop;g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();
  fill(`M${X0} ${y0}H${X1}V${y0+96}H${X0}Z`,'#4f141c');const sw=5,span=(X1-X0)/sw;
  for(let k=0;k<sw;k++){const a=X0+k*span,b=a+span,m=(a+b)/2,depth=118;
   const p=new Path2D(`M${a} ${y0}L${b} ${y0}L${b} ${y0+40}Q${m} ${y0+depth+40} ${a} ${y0+40}Z`);
   g.fillStyle='#7f2630';g.fill(p);g.save();g.clip(p);for(let j=0;j<16;j++){const yy=y0+20+j*9;stroke(`M${a} ${yy}Q${m} ${yy+depth*.9} ${b} ${yy}`,'rgba(30,12,10,.45)',.8)}
   for(let j=0;j<3;j++){const yy=y0+44+j*22;stroke(`M${a+20} ${yy}Q${m} ${yy+depth*.7} ${b-20} ${yy}`,'rgba(236,170,150,.5)',2)}g.restore();
   g.strokeStyle=C.ink;g.lineWidth=1.8;g.stroke(p);
   for(let s=0;s<=30;s++){const u=s/30,x=mix(a,b,u),y=y0+40+Math.sin(u*Math.PI)*depth*.5*1.0;line(x,y,x,y+14,'#c9962e',3);line(x,y,x,y+14,C.ink,.6)}
   // tassel at each joint
   if(k>0){g.save();g.translate(a,y0+40);g.rotate(.06*Math.sin(t*1.3+k));ellipse(0,8,9,9,'#d9a63a',C.ink);fill('M-9 14L9 14L13 58L-13 58Z','#c9962e');stroke('M-9 14L9 14L13 58L-13 58Z',C.ink,1);for(let q=-10;q<=10;q+=4)line(q,18,q*1.2,57,C.ink,.5);g.restore()}
  }
  // gold cartouche with the constant sun face at the centre of the valance
  g.save();g.translate(960,y0+64);ellipse(0,0,52,52,'#e0b13e',C.ink);ellipse(0,0,44,44,null,'#8f5f1e');g.save();g.beginPath();g.arc(0,0,42,0,Math.PI*2);g.clip();g.scale(.25,.25);g.translate(-333,-170);A.piece('sol-head',C.gold);g.restore();g.restore();
  g.restore()}
 // ---- the stage floor: engraved boards in perspective, a row of footlights ----
 function floor(a,t,cut=0){if(a<=0)return;g.save();if(cut){g.beginPath();g.rect(X0,cut,X1-X0,Y1-cut);g.clip()}g.globalAlpha=a;const back=772,vx=960,vy=300;
  fill(`M${X0} ${back}H${X1}V${Y1}H${X0}Z`,'#c9a46c');
  for(let k=-14;k<=14;k++){const xb=vx+k*68,xf=vx+k*150;stroke(`M${xb} ${back}L${xf} ${Y1}`,'#5b4022',1.1)}
  for(let j=0;j<7;j++){const y=back+Math.pow(j/7,1.6)*(Y1-back);stroke(`M${X0} ${y}H${X1}`,'#6b4d2a',.8)}
  g.globalAlpha=a*.35;for(let y=back+4;y<Y1;y+=5)line(X0,y,X1,y,'#3a2a14',.5);g.globalAlpha=a;
  stroke(`M${X0} ${back}H${X1}`,C.ink,2);
  // footlights: shell reflectors with candle flames, flickering on twos
  for(let k=0;k<11;k++){const x=X0+90+k*(X1-X0-180)/10,y=Y1-22,fl=.8+.2*Math.sin(Math.floor(t*12)*1.9+k*2.3);
   fill(`M${x-26} ${y+10}Q${x} ${y-26} ${x+26} ${y+10}Z`,'#d8c79a');stroke(`M${x-26} ${y+10}Q${x} ${y-26} ${x+26} ${y+10}Z`,C.ink,1.2);
   A.glow(x,y-14,30*fl,.55);fill(`M${x-4} ${y}Q${x-5} ${y-12} ${x} ${y-24*fl}Q${x+5} ${y-12} ${x+4} ${y}Z`,C.gold);stroke(`M${x-4} ${y}Q${x-5} ${y-12} ${x} ${y-24*fl}Q${x+5} ${y-12} ${x+4} ${y}Z`,C.ink,.8)}
  g.restore()}
 // ---- aether: engraved interference across the plate (radio static, the dial turning) ----
 // v16 (audit A9): radio static as broken engraved snow that changes every frame, over the whole picture.
 function aether(a,t){if(a<=0)return;g.save();g.globalAlpha=Math.min(1,a);const step=Math.round(t*24),P=new Path2D(),Q=new Path2D();
  for(let k=0;k<1400;k++){const x=X0+noise(step*13.1+k*1.7)*(X1-X0),y=Y0+noise(step*7.3+k*2.9)*(Y1-Y0),l=3+9*noise(k+step);(k%4?P:Q).moveTo(x,y);(k%4?P:Q).lineTo(x+l,y+(noise(k*3+step)-.5)*2)}
  for(let k=0;k<6;k++){const y=Y0+noise(step*3.7+k)*(Y1-Y0);P.moveTo(X0,y);for(let x=X0;x<=X1;x+=40)P.lineTo(x,y+(noise(x+step+k)-.5)*5)}
  g.strokeStyle=C.ink;g.lineWidth=1.1;g.stroke(P);g.strokeStyle='#f3e7c8';g.lineWidth=1.6;g.stroke(Q);g.restore()}
 // ---- performers: registered open/closed mouth cut-outs ----
 function performer(name,x,feet,h,flip,f,lean=0,squash=1){const pose=img[name],o=pose||img[name+'-open'],c=img[name+'-closed'];if(!o)return;
  const im=pose?pose:mouth(f)?o:(c||o),box=window.ALCHEMY_OPENING_BOX?.[name.split('-')[0]]||[0,0,o.width,o.height],k=h/(box[3]-box[1]);
  g.save();g.translate(x,feet);g.rotate(lean);g.scale(k*flip,k*squash);g.translate(-(box[0]+box[2])/2,-box[3]);g.drawImage(im,0,0);g.restore()}
 // v18 (Robin): the notes leave his mouth, not his chest. mx,my = his mouth on screen.
 function notes(f,t,mx,my){for(let n=0;n<14;n++){const born=Math.round(13.2*24)+n*7;if(f<born||voice(born)<.5)continue;const age=(f-born)/24;if(age>1.6)continue;
  // Robin preferred these heading out to the right, into the blue, sooner than rising
  const x=mx+44+age*240+10*Math.sin(age*5+n)*Math.min(1,age*3),y=my-8-age*80-(n%3)*14*Math.min(1,age*2)+12*Math.sin(age*7+n),a=Math.min(1,age*10)*(1-age/1.6);g.save();g.globalAlpha=a;g.translate(x,y);g.rotate(-.2);
  const k=.6+.6*Math.min(1,age*2.5);g.scale(k,k);ellipse(0,0,11,8,C.gold,C.ink);line(10,0,10,-36,C.ink,2.4);stroke('M10 -36q14 7 12 22',C.ink,2.4);g.restore()}} // gold notes, readable on the velvet
 function stage(raw){const t=Math.floor(Math.round(raw*24)/2)/12,f=Math.round(raw*24);
  base(raw);
  const open=smooth(...T.open,raw),clear=smooth(...T.clear,raw),ripple=A.performance.bump(11.4,11.8,13.4,raw)+.25*A.performance.bump(0,.3,2.3,raw);
  g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();
  floor(1-smooth(29.6,30.6,raw),t); // v16 (audit A13): the boards go before the soil rises
  if(clear<1){const slide=clear*1;for(const side of [-1,1]){g.save();g.translate(side*slide*240,0);panel(side,open,t,ripple);g.restore()}}
  // the playbill medallions hang in front of the curtain from the herald's names on
  if(raw<16.6&&A.openingChart){g.save();g.translate(2*Math.sin(raw*.14),0);A.openingChart(t);g.restore()}
  aether((raw<2.2?1:0)+(raw>=11.5&&raw<12.4?1:0),t); // hard on/off, like a dial
  // the herald (the DJ): walks in, reads, is spun off by the dial turn
  if(raw>=T.heraldIn[0]&&raw<T.heraldOut[1]){const inP=smooth(...T.heraldIn,raw),outP=smooth(...T.heraldOut,raw);
   const walk=Math.abs(Math.sin(t*9))*(inP<1||outP>0?8:0),spin=smooth(11.55,11.8,raw);
   const x=mix(2020,1545,inP)+outP*560,flip=raw<11.55?1:Math.cos(spin*Math.PI)>=0?1:-1,sq=raw>11.55&&raw<11.8?Math.abs(Math.cos(spin*Math.PI))*.9+.1:1;
   // v16 (audit A11): she points the scroll toward each coin as it lands and shifts her weight between names.
   const coin=[2.62,4.88,8.85,9.7,10.45,11.5].reduce((v,c)=>Math.max(v,A.performance.bump(c-.15,c+.1,c+.9,raw)),0),sway=.025*Math.sin(t*1.7);
   performer('herald',x-18*coin,Y1-6-walk-5*voice(f)-6*coin,640,flip*sq,raw<11.55?f:0,.03*voice(f)-.02-.09*coin+sway)}
  // the troubadour (the French station): steps in, sings as the curtains open, bows and leaves
  if(raw>=T.singerIn[0]&&raw<17.7){const inP=smooth(...T.singerIn,raw),outP=smooth(16.95,17.6,raw),bow=A.performance.bump(16.45,16.7,16.95,raw);
   const walk=Math.abs(Math.sin(t*9))*(inP<1||outP>0?8:0),sing=raw>13.1&&raw<16.45;
   // v16 (audit A6): a forward bow toward the audience, then he walks off behind the left curtain.
   g.save();if(outP>0){g.beginPath();g.rect(X0+130,Y0,X1,Y1);g.clip()}
   const sx=mix(-260,380,inP)-outP*420,sy=Y1-6-walk,lean=sing?-.05*voice(f)+.015*Math.sin(t*6):-.26*bow,k=650/760;
   performer('singer',sx,sy,650,-1,sing?f:0,lean,1-.04*bow);g.restore();
   // his mouth: (264,68) in the packed 434x760 cut-out, mirrored, scaled and leaned about the feet
   const ox=-k*(264.3-217),oy=k*(67.7-760),mouthX=sx+ox*Math.cos(lean)-oy*Math.sin(lean),mouthY=sy+ox*Math.sin(lean)+oy*Math.cos(lean);
   if(sing)notes(f,t,mouthX,mouthY)}
  g.restore();
  valance(clear*260,t);
 }
 // v17 (rethink 14): the bookend. The valance drops back in, the curtains close over the emblem as the last phrase
 // ends, the herald and the troubadour step out in front for a curtain call, and the picture fades to paper.
 function finale(raw){const t=Math.floor(Math.round(raw*24)/2)/12;A.noFade=true;base(raw);A.noFade=false;
  const close=smooth(145.4,147.6,raw),drop=smooth(144.6,145.8,raw);
  g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();
  if(close>0)for(const side of [-1,1])panel(side,1-close,t,.2*A.performance.bump(145.4,146.2,147.8,raw));
  floor(smooth(146.6,147.4,raw),t,0);
  const call=smooth(147.0,147.5,raw),bow=A.performance.bump(148.1,148.4,148.9,raw);
  if(call>0){performer('herald',mix(1990,1500,call),Y1-6,600,1,0,-.22*bow);performer('singer',mix(-130,420,call),Y1-6,610,-1,0,.22*bow)}
  // v24 (Robin): little Bob with his toy piano and Junos crosses the apron in front of the closed curtain, stops centre
  // to lift his hat to us between the two bowing performers, and walks off right. Card-stock print, warmed to the plate.
  LITTLE_BOB.draw(g,raw,{tIn:146.8,tOut:150.6,y:996,h:200,stop:{t0:147.95,t1:148.75},beats:[],
   grade:kg=>{kg.globalCompositeOperation='multiply';kg.fillStyle='#ead6a8';kg.fillRect(0,0,1920,1080)}});
  g.restore();valance(260*(1-drop),t);
  const fade=smooth(150.2,151.4,raw);if(fade){g.save();g.globalAlpha=fade;g.drawImage(A.paper,0,0);g.restore()}}
 // v21 (Robin): "which we cannot see" - an old searcher with a lantern and a magnifying glass (Diogenes looking in
 // daylight) comes looking for the roots just as they vanish, peers, scratches his head ("where did they go?"), jumps
 // back on "Oh" as they rush back and the machine starts, then studies it through his glass and leaves for chorus 1.
 function searcher(raw){const t=Math.floor(Math.round(raw*24)/2)/12,cam=A.grove.state(raw).cameraY;
  const inP=smooth(40.6,41.4,raw),outP=smooth(47.3,47.4,raw);if(inP<=0||outP>=1)return;
  // v22 (Robin's reference: the confused look-around): straightens on "we cannot" and looks over one shoulder, turns to
  // look the other way on "see", then faces us palm up ("where did it go?") until "Oh". Turns are paper-puppet flips.
  // v22: he never sees it (Robin: the surprised pose looked like he saw something). On "Oh" the machine starts under his
  // feet while he is still palm up and puzzled; then he wanders off the wrong way, peering at the ground with his glass.
  const pose=raw<41.45?'peer':raw<42.45?'look':raw<44.0?'palms':'peer';
  let dir=raw>=41.95&&raw<42.45?-1:raw>=44.0?-1:1;
  const turnAt=[41.45,41.95,42.45,44.0],flipK=turnAt.reduce((v,a)=>Math.min(v,Math.min(1,Math.abs(raw-a)/.09)),1);
  const leave=smooth(44.1,47.4,raw),walking=(inP<1)||raw>44.1,walk=walking?Math.abs(Math.sin(t*(raw>44.1?6:9)))*6:0;
  const x=mix(-220,640,inP)-leave*900;
  const sway=pose==='look'?.025*Math.sin(t*3):pose==='palms'?.02*Math.sin(t*4):0,peer=pose==='peer'?.04*Math.sin(t*3):0;
  g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();g.translate(0,cam);
  performer('searcher-'+pose,x,766-walk,330,dir*(.15+.85*flipK),0,peer+sway);g.restore()} // walks off the wrong way
 A.draw=raw=>{if(raw<T.floorOut[1])return stage(raw);if(raw>=144.6)return finale(raw);base(raw);if(raw>40.5&&raw<47.5)searcher(raw)};
})();
