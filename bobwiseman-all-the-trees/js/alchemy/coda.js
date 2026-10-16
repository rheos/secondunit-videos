/* Draft 3 (Bob's note on draft 2, 2026-10-15): "I do get bored however during 2:05 - ending... Could you make the
   whole thing shrink down and other things pop up and take over?" From 2:05 the whole plate shrinks to a small print
   standing on a meadow, and three engraved giants that each grow a tree pop up and crowd it: a snail, a whale, and
   a king peering over the top. The camera dives back into the print for "Because I'm a tree too" (132.2-138.2 is the
   plain plate, so draft 2's pointing branch is untouched), then the print shrinks again: the roots of the print and
   of every giant grow down through the soil into one knot, and gold runs up them on the last trumpet phrase before
   the curtains close (stage.js draws the finale over this layer).
   One world, one camera: world units are plate pixels, the plate centred on (0,0), the meadow at y=G.
   Song-time pure: everything is a function of the song clock. Cut-outs: source/alchemy/coda, tools/pack_coda_media.py. */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise,line}=A;
 const plate=A.draw,W=1920,H=1080,X0=76,Y0=70,X1=1844,Y1=1005;
 const img={};const oldLoad=A.load;
 A.load=async()=>{await oldLoad();const M=window.ALCHEMY_CODA_MEDIA||{};
  await Promise.all(Object.keys(M).map(k=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{img[k]=im;res()};im.onerror=()=>rej(new Error('Missing coda asset '+k));im.src=M[k]})))};
 // The plate is copied into a small mip chain so a 0.22 shrink of fine engraved line resamples without moire.
 const P=[A.canvas(W,H),A.canvas(W/2,H/2),A.canvas(W/4,H/4)],PF=[1,.5,.25];
 const T={a:125.0,dive:[131.55,132.2],b:138.2,bar:110.97,beat:60/145,snail:127.42,whale:129.18,king:130.71,roots:139.11,gold:142.42};
 const G=486,ZA=.36,ZB=.28,CY=-250; // the camera looks a little low, so the giants have sky to fill
 const cam={z:1,cy:0};
 const S=(x,y)=>[960+x*cam.z,540+(y-cam.cy)*cam.z];

 // Gilliam shrink: a small swell (uh-oh), a fast suck-in past the mark, a damped bounce onto it.
 function shrink(raw,t0,z0,z1){const u=raw-t0;if(u<0)return z0;if(u<.4)return z0*(1+.035*smooth(0,.4,u));
  if(u<1.2){const q=(u-.4)/.8,e=q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;return Math.exp(mix(Math.log(z0*1.035),Math.log(z1*.92),e))}
  const v=u-1.2;return z1*(1-.08*Math.exp(-v*5)*Math.cos(v*14))}
 function camera(raw){
  if(raw<T.dive[0])return {z:shrink(raw,T.a,1,ZA),cy:CY*smooth(T.a+.4,T.a+1.3,raw)};
  if(raw<T.dive[1]){const e=smooth(T.dive[0],T.dive[1],raw);return {z:Math.exp(mix(Math.log(shrink(raw,T.a,1,ZA)),0,e)),cy:CY*(1-e)}}
  return {z:shrink(raw,T.b,1,ZB),cy:CY*smooth(T.b+.4,T.b+1.3,raw)}}
 const spring=u=>u<=0?0:1-Math.exp(-u*7)*Math.cos(u*16);           // 0 -> overshoot -> 1
 const wobble=u=>u<=0?0:Math.exp(-u*7)*Math.sin(u*16);              // the squash that rides the spring
 const beatPulse=(raw,off=0)=>{const b=(((raw-T.bar)/T.beat+off)%1+1)%1;return Math.exp(-b*6)};

 // A giant: world anchor (x,y) at image fraction (ax,ay), h world units tall.
 function giant(name,x,y,h,ax,ay,sx=1,sy=1,rot=0){const im=img[name];if(!im)return;const k=h/im.height,[X,Y]=S(x,y);
  g.save();g.translate(X,Y);g.rotate(rot);g.scale(k*cam.z*sx,k*cam.z*sy);g.drawImage(im,-ax*im.width,-ay*im.height);g.restore()}
 const GI={snail:{h:1700,ax:.5,ay:.87},whale:{h:1300,ax:.5,ay:.95},king:{h:2100,ax:.5,ay:1}},WX=-1700,KTOP=-1639;
 const snailX=raw=>mix(1900,1750,clamp((raw-T.snail-.4)/16.6));
 // Each giant's tree crown, measured off the cut-outs (tools/pack_coda_media.py output), for the gold glint.
 const CROWN={snail:[.611,.174],whale:[.689,.196],king:[.495,.2]};
 function crown(name,x){const gi=GI[name],im=img[name],w=gi.h*im.width/im.height,[fx,fy]=CROWN[name];
  return name==='king'?[x+(fx-.5)*w,KTOP+fy*gi.h]:[x+(fx-gi.ax)*w,G-(gi.ay-fy)*gi.h]}
 // Phase A: they pop up one per trumpet hit. Phase B: they were there all along, just out of shot, and barge
 // back in as the camera pulls away (the whale from the left, the snail from the right, the king from behind).
 function giants(raw,front){const B=raw>=T.b;
  if(!front){ // the king rises from behind the print on the trumpet, overshoots, settles, peers over the top
   const u=raw-(B?T.b+.75:T.king);if(u<=0)return;const s=spring(u*1.15),[,foot]=S(0,470);
   g.save();g.beginPath();g.rect(X0,Y0,X1-X0,foot-Y0);g.clip(); // he only ever shows above the print's foot, never in the meadow
   giant('king',0,KTOP+GI.king.h+(1-s)*2200,GI.king.h,.5,1,1+.02*beatPulse(raw,.5),1,.012*Math.sin(u*2.1));g.restore();return}
  { const u=raw-(B?T.b+.35:T.whale);if(u>0){let x,y,rot,sq,bob;
    if(!B){ // the whale leaps in from the left on an arc and lands in the meadow with a squash
     const fly=clamp(u/.55),land=u-.55;x=mix(-3500,WX,1-Math.pow(1-fly,2));y=G-760*Math.sin(Math.PI*fly)*(1-fly*.15);
     rot=fly<1?mix(-.45,.25,fly):.25*Math.exp(-land*6)*Math.cos(land*14);sq=land>0?wobble(land*1.2)*.18:0;bob=land>0?.025*beatPulse(raw,.25):0}
    else{const s=spring(u);x=WX-1500*(1-s);y=G;rot=-.06*wobble(u);sq=wobble(u)*.14;bob=.025*beatPulse(raw,.25)}
    giant('whale',x,y,GI.whale.h,GI.whale.ax,GI.whale.ay,1+sq,1-sq+bob,rot)}}
  { const u=raw-(B?T.b+.5:T.snail);if(u>0){const s=spring(u),w=wobble(u)*.12,crawl=.018*Math.sin((raw-T.snail)*5.2),bob=.02*beatPulse(raw);
    if(!B)giant('snail',snailX(raw),G,GI.snail.h,GI.snail.ax,GI.snail.ay,s*(1+w+crawl),s*(1-w+bob)); // pops up out of the meadow
    else giant('snail',snailX(raw)+1500*(1-s),G,GI.snail.h,GI.snail.ax,GI.snail.ay,1+w+crawl,1-w+bob)}} // slides back in, overshoots, bumps the print
 }

 // The meadow the print stands on: a grass edge, then ruled engraved soil with a few stones.
 const edge=x=>2.5*Math.sin(x*.011);
 function meadow(){const [,gy]=S(0,G);
  // An engraver's ruled sky, closer lines toward the zenith.
  for(let y=Y0+3,i=0;y<Math.min(gy,Y1);y+=mix(3.6,6.5,clamp((y-Y0)/(gy-Y0)))+.8*noise(i++))line(X0,y,X1,y,'rgba(70,60,40,.17)',.6);
  if(gy>=Y1)return;const band=gy+24*cam.z+6;
  g.fillStyle='#c9b07c';g.fillRect(X0,gy,X1-X0,Y1-gy);
  const deep=g.createLinearGradient(0,gy,0,Y1);deep.addColorStop(0,'rgba(120,88,44,0)');deep.addColorStop(1,'rgba(120,88,44,.32)');g.fillStyle=deep;g.fillRect(X0,gy,X1-X0,Y1-gy);
  for(let y=band+8,i=0;y<Y1;y+=4.2+1.4*noise(i++))line(X0,y,X1,y,'rgba(70,52,28,.34)',.6);
  g.beginPath();g.moveTo(X0,band);for(let x=X0;x<=X1;x+=16)g.lineTo(x,gy-2+edge(x));g.lineTo(X1,band);g.closePath();g.fillStyle='#cfd9a3';g.fill();
  g.beginPath();for(let x=X0;x<=X1;x+=16)x===X0?g.moveTo(x,gy-2+edge(x)):g.lineTo(x,gy-2+edge(x));g.strokeStyle=C.ink;g.lineWidth=1.6;g.stroke();
  line(X0,band,X1,band,'rgba(39,38,29,.5)',.8);
  for(let i=-60;i<=60;i++){const [tx]=S(i*90+40*noise(i+3),G);if(tx<X0||tx>X1)continue;const ty=gy-1+edge(tx),h=(26+18*noise(i+7))*Math.max(cam.z,.3);
   for(const d of [-1,0,1])line(tx,ty,tx+d*h*.35,ty-h*(d?.7:1),'#3f5a2c',.8)}}

 // Phase B: roots of the print and of every giant grow down into one knot, then gold runs up them.
 function roots(raw){if(raw<T.roots)return;const knot=S(0,G+700);
  const from=[[0,G+4,0],[-640,G+4,1],[640,G+4,2],[WX-250,G+10,3],[WX+200,G+10,4],[snailX(raw)+150,G+80,5],[snailX(raw)+420,G+90,6]];
  const curves=from.map(([x,y,i])=>{const a=S(x,y),dx=knot[0]-a[0];return [a[0],a[1],a[0]+dx*.08,a[1]+(knot[1]-a[1])*.75,knot[0]-dx*.55,knot[1]-12+8*noise(i),knot[0],knot[1]]});
  curves.forEach((b,i)=>{const p=smooth(T.roots+i*.16,T.roots+1.9+i*.12,raw);A.scene.woodyRoot(b,p,i<3?18:15,4,40+i,{rootlets:5,rootletLen:46,neck:true})});
  if(raw<T.gold)return;
  // Sap: a glow climbs each root from the knot back up to its owner, then the owner's tree catches the light.
  const u=clamp((raw-T.gold)/1.15);
  curves.forEach(b=>{g.beginPath();for(let i=0;i<=28;i++){const q=A.scene.bez(b,mix(1,1-u,i/28));i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}
   g.strokeStyle='rgba(229,175,51,.9)';g.lineWidth=3.4;g.lineCap='round';g.stroke();const q=A.scene.bez(b,1-u);A.glow(q[0],q[1],30,.85*(1-smooth(.85,1,u)))});
  A.glow(knot[0],knot[1],40+8*Math.sin(raw*6),.9*smooth(T.gold,T.gold+.3,raw));
  const lit=smooth(T.gold+1.0,T.gold+1.5,raw);if(!lit)return;
  for(const [x,y] of [crown('whale',WX),crown('snail',snailX(raw)),crown('king',0)]){const [X,Y]=S(x,y);A.glow(X,Y,70*cam.z/ZB,.6*lit*(.85+.15*beatPulse(raw)))}}

 function coda(raw){
  plate(raw);P[0].getContext('2d').drawImage(A.c,0,0);
  Object.assign(cam,camera(raw));
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();
  meadow();giants(raw,false);
  // The print, jostled about its foot each time a giant lands (calm again before the dive).
  const calm=1-smooth(T.dive[0]-.3,T.dive[0],raw)*(raw<T.b?1:0);
  const jolt=[[T.snail+.2,1],[T.whale+.55,-1],[T.king+.2,1],[T.b+.55,-1],[T.b+.7,1],[T.b+.95,1]].reduce((v,[t0,d])=>v+(raw>t0?d*.035*Math.exp(-(raw-t0)*5)*Math.sin((raw-t0)*18):0),0)*calm;
  let lv=0;while(lv<2&&PF[lv+1]>=cam.z)lv++;
  for(let i=1;i<=lv;i++){const q=P[i].getContext('2d');q.imageSmoothingQuality='high';q.drawImage(P[i-1],0,0,P[i].width,P[i].height)}
  const [fx,fy]=S(0,480);g.save();g.translate(fx,fy);g.rotate(jolt);g.translate(-fx,-fy);
  const [px,py]=S(-960,-540),k=cam.z/PF[lv],cx=49*PF[lv],cy0=42*PF[lv],cw=1822*PF[lv],ch=986*PF[lv];
  g.imageSmoothingQuality='high';g.drawImage(P[lv],cx,cy0,cw,ch,px+cx*k,py+cy0*k,cw*k,ch*k);g.restore();
  giants(raw,true);roots(raw);
  g.restore();g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 }
 A.coda={camera,T};
 A.draw=raw=>(raw<T.a||(raw>=T.dive[1]&&raw<T.b))?plate(raw):coda(raw);
})();
