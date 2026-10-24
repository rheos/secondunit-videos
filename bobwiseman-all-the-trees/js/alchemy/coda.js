/* Draft 3 (Bob's note on draft 2, 2026-10-15): "I do get bored however during 2:05 - ending... Could you make the
   whole thing shrink down and other things pop up and take over?" From 2:05 the whole plate shrinks to a small print
   standing on a meadow, and three engraved giants that each grow a tree pop up and crowd it: a snail, a whale, and
   a king peering over the top. The camera dives back into the print for "Because I'm a tree too" (132.2-138.2 is the
   plain plate, so draft 2's pointing branch is untouched), then the print shrinks again.
   Draft 3b (Robin's Gilliam pass, references/terry-gilliam/AGENT-DIRECTION.txt): every arrival is caused by the one
   before (the snail's tree flings a seed, the whale bursts out of the soil where it lands, its spout waters the
   king up from behind the print); after the second shrink the whale swallows the print and blows it out of its
   blowhole, the cloud hand from "it's true" pokes it into the soil like a seed, roots grow from that push and run
   gold, and the king's crown hinges open like a lid and the six newcomers climb out of his head, as the curtains
   close (stage.js draws the finale over this layer).
   One world, one camera: world units are plate pixels, the plate centred on (0,0), the meadow at y=G.
   Song-time pure: everything is a function of the song clock. Cut-outs: source/alchemy/coda, tools/pack_coda_media.py. */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise,line}=A;
 const plate=A.draw,W=1920,H=1080,X0=76,Y0=70,X1=1844,Y1=1005;
 const img={};const oldLoad=A.load;
 A.load=async()=>{await oldLoad();const M=window.ALCHEMY_CODA_MEDIA||{};
  await Promise.all(Object.keys(M).map(k=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{img[k]=im;res()};im.onerror=()=>rej(new Error('Missing coda asset '+k));im.src=M[k]})))};
 // The plate is copied into a small mip chain so a small print of fine engraved line resamples without moire.
 const PF=[1,.5,.25,.125,.0625],P=PF.map(f=>A.canvas(Math.round(W*f),Math.round(H*f)));
 const T={a:125.0,dive:[131.55,132.2],b:138.2,bar:110.97,beat:60/145,snail:127.42,seed:[128.3,128.95],whale:129.18,
  spout:[130.15,130.66],king:130.71,gulp:139.12,blow:139.95,land:140.62,poke:140.77,roots:141.0,gold:142.42,
  push:[142.8,143.6],lid:143.25,climb:143.5};
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
  const p=smooth(...T.push,raw); // in on the king for the lid
  return {z:shrink(raw,T.b,1,ZB)*mix(1,1.45,p),cy:mix(CY*smooth(T.b+.4,T.b+1.3,raw),-640,p)}}
 const spring=u=>u<=0?0:1-Math.exp(-u*7)*Math.cos(u*16);           // 0 -> overshoot -> 1
 const wobble=u=>u<=0?0:Math.exp(-u*7)*Math.sin(u*16);              // the squash that rides the spring
 const beatPulse=(raw,off=0)=>{const b=(((raw-T.bar)/T.beat+off)%1+1)%1;return Math.exp(-b*6)};
 const bump=(a,b,c,raw)=>smooth(a,b,raw)*(1-smooth(b,c,raw));
 const qbez=(p0,p1,p2,u)=>{const v=1-u;return [v*v*p0[0]+2*v*u*p1[0]+u*u*p2[0],v*v*p0[1]+2*v*u*p1[1]+u*u*p2[1]]};

 // A giant: world anchor (x,y) at image fraction (ax,ay), h world units tall.
 function giant(name,x,y,h,ax,ay,sx=1,sy=1,rot=0){const im=img[name];if(!im)return;const k=h/im.height,[X,Y]=S(x,y);
  g.save();g.translate(X,Y);g.rotate(rot);g.scale(k*cam.z*sx,k*cam.z*sy);g.drawImage(im,-ax*im.width,-ay*im.height);g.restore()}
 const GI={snail:{h:1700,ax:.5,ay:.87},whale:{h:1300,ax:.5,ay:.95},king:{h:2100,ax:.5,ay:1}},WX=-1700,KTOP=-1639;
 const snailX=raw=>mix(1900,1750,clamp((raw-T.snail-.4)/16.6));
 // Each giant's tree crown, measured off the cut-outs (tools/pack_coda_media.py output), for the gold glint.
 const CROWN={snail:[.611,.174],whale:[.689,.196],king:[.495,.2]};
 function crown(name,x){const gi=GI[name],im=img[name],w=gi.h*im.width/im.height,[fx,fy]=CROWN[name];
  return name==='king'?[x+(fx-.5)*w,KTOP+fy*gi.h]:[x+(fx-gi.ax)*w,G-(gi.ay-fy)*gi.h]}
 // A point on the whale cut-out (image fractions) in world units, ignoring its small tilt.
 function onWhale(w,fx,fy){const gi=GI.whale,im=img.whale,ww=gi.h*im.width/im.height;return [w.x+(fx-gi.ax)*ww*w.sx,w.y-(gi.ay-fy)*gi.h*w.sy]}
 const MOUTH=[.983,.667],BLOWHOLE=[.725,.52];

 // The whale. Phase A: it bursts up out of the soil where the snail's seed landed and flops into the meadow.
 // Phase B: it slides back in from the left, lunges and swallows the print, bulges, and blows it out again.
 function whalePose(raw){const B=raw>=T.b,u=raw-(B?T.b+.35:T.whale);if(u<=0)return null;
  if(!B){const fly=clamp(u/.55),land=u-.55;
   return {x:WX,y:G+1400*(1-fly)-1100*Math.sin(Math.PI*fly),rot:fly<1?mix(-.8,.25,fly):.25*Math.exp(-land*6)*Math.cos(land*14),
    sx:1+(land>0?wobble(land*1.2)*.18:0),sy:1-(land>0?wobble(land*1.2)*.18-.025*beatPulse(raw,.25):0),buried:fly<.5}}
  const s=spring(u),lunge=420*bump(T.gulp-.14,T.gulp+.06,T.gulp+.5,raw);
  const gulp=bump(T.gulp+.1,T.gulp+.3,T.gulp+.8,raw),blow=bump(T.blow-.12,T.blow,T.blow+.3,raw);
  return {x:WX-1500*(1-s)+lunge,y:G,rot:-.06*wobble(u)-.08*bump(T.gulp-.14,T.gulp+.02,T.gulp+.4,raw)+.05*blow,
   sx:1+wobble(u)*.14-.06*gulp+.05*blow,sy:1-wobble(u)*.14+.12*gulp-.08*blow+.025*beatPulse(raw,.25),buried:false}}

 // The print's pose: its foot point in world units, scale about the foot, spin. Swallowed, blown out, poked in.
 function printPose(raw,jolt){const p={x:0,y:480,s:1,rot:jolt,sink:0,hide:false};if(raw<T.b)return p;
  const w=whalePose(raw);
  if(raw>=T.gulp-.04&&raw<T.blow){const q=smooth(T.gulp-.04,T.gulp+.22,raw);if(q>=1||!w){p.hide=true;return p}
   const m=onWhale(w,...MOUTH),s=mix(1,.07,q);return {...p,x:mix(0,m[0]-160,q*q),y:mix(480,m[1]+510*s,q*q),s,rot:-.5*q*q}}
  if(raw>=T.blow&&raw<T.land){const q=(raw-T.blow)/(T.land-T.blow),bh=onWhale(w||{x:WX,y:G,sx:1,sy:1},...BLOWHOLE);
   const c=qbez(bh,[-760,-2500],[0,-30],q),s=mix(.07,1,smooth(0,.55,q));
   return {...p,x:c[0],y:c[1]+510*s,s,rot:-Math.PI*2*(1-q)*(1-q*.3)}}
  const v=raw-T.land;if(v>0)p.rot=jolt+.05*Math.exp(-v*6)*Math.sin(v*20);
  p.sink=150*smooth(T.poke,T.poke+.24,raw);return p}

 // Phase A's seed: the snail's tree shudders and flings it over the print to where the whale will come up.
 function seed(raw){if(raw<T.seed[0]||raw>T.seed[1]+.35)return;const sn=crown('snail',snailX(raw));
  const q=clamp((raw-T.seed[0])/(T.seed[1]-T.seed[0])),c=qbez([sn[0]-60,sn[1]],[-200,-2300],[WX+120,G],q),[X,Y]=S(...c),k=cam.z*5;
  if(q<1){g.save();g.translate(X,Y);g.rotate(raw*9);g.scale(k,k);
   g.beginPath();g.ellipse(0,6,13,17,0,0,Math.PI*2);g.fillStyle='#b5823e';g.fill();g.strokeStyle=C.ink;g.lineWidth=1.4;g.stroke();
   for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*4.5,-6);g.lineTo(i*3.2,20);g.strokeStyle='rgba(39,38,29,.45)';g.lineWidth=.7;g.stroke()}
   g.beginPath();g.ellipse(0,-8,15,8,0,Math.PI,0);g.lineTo(15,-6);g.lineTo(-15,-6);g.closePath();g.fillStyle='#7a5a2e';g.fill();g.lineWidth=1.2;g.stroke();
   line(0,-16,3,-25,C.ink,1.6);g.restore()}
  else{const d=raw-T.seed[1],[gx,gy]=S(WX+120,G);for(let i=0;i<5;i++){const a=-Math.PI*(.2+.6*noise(i+30)),r=d*260*cam.z/ZA*(.6+noise(i+40)*.6);
   A.ellipse(gx+Math.cos(a)*r,gy+Math.sin(a)*r+d*d*900*cam.z,4*cam.z/ZA,3*cam.z/ZA,'#a98652',C.ink)}}}

 // Clods of soil thrown up when the whale bursts out of the meadow.
 function clods(raw){const u=raw-T.whale;if(u<0||u>.9)return;
  for(let i=0;i<14;i++){const a=-Math.PI*(.12+.76*noise(i+60)),v=(900+900*noise(i+70)),x=WX+(noise(i+80)-.5)*700,
   px=x+Math.cos(a)*v*u,py=G+Math.sin(a)*v*u+1500*u*u;if(py>G+20)continue;const [X,Y]=S(px,py),r=(14+16*noise(i+90))*cam.z;
   g.save();g.translate(X,Y);g.rotate(u*8*(noise(i)-.5));A.ellipse(0,0,r,r*.75,'#a98652',C.ink);line(-r*.5,-r*.1,r*.4,r*.2,'rgba(39,38,29,.5)',.7);g.restore()}}

 // An engraved water jet along a curve: ruled parallel strokes, droplets at the head.
 function jet(pts,width){if(pts.length<2)return;const n=pts.length-1,side=k=>pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(n,i+1)],
   dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,o=k*width*.5*mix(.4,1,i/n);return S(p[0]-dy/L*o,p[1]+dx/L*o)});
  const l=side(-1),rr=side(1);g.beginPath();l.forEach(([X,Y],i)=>i?g.lineTo(X,Y):g.moveTo(X,Y));for(let i=n;i>=0;i--)g.lineTo(...rr[i]);g.closePath();
  g.fillStyle='rgba(222,234,238,.96)';g.fill();g.strokeStyle=C.ink;g.lineWidth=1.3;g.lineJoin='round';g.stroke();
  for(const k of [-.45,0,.45]){g.beginPath();side(k).forEach(([X,Y],i)=>i?g.lineTo(X,Y):g.moveTo(X,Y));g.strokeStyle='rgba(70,104,128,.6)';g.lineWidth=1;g.stroke()}
  const h=pts.at(-1);for(let i=0;i<7;i++){const [X,Y]=S(h[0]+(noise(i+120)-.5)*width*1.8,h[1]+(noise(i+130)-.5)*width*1.4),rd=(30+22*noise(i+140))*cam.z;A.ellipse(X,Y,rd*.8,rd,'rgba(222,234,238,.96)',C.ink)}}
 function spouts(raw,w){if(!w)return;const bh=onWhale(w,...BLOWHOLE);
  if(raw<T.b){ // phase A: up, over the print, down behind it, where the king will rise
   const head=smooth(T.spout[0],T.spout[1],raw),tail=smooth(T.spout[1]+.1,T.spout[1]+.5,raw);if(head<=0||tail>=1)return;
   const pts=[];for(let i=0;i<=30;i++){const u=mix(tail,head,i/30);pts.push(qbez(bh,[-800,-2400],[0,-380],u))}jet(pts,150)}
  else if(raw>=T.blow-.02&&raw<T.blow+.55){ // phase B: a column that throws the print up
   const pr=printPose(raw,0),top=raw<T.land?[pr.x,pr.y-510*pr.s]:bh,tail=smooth(T.blow+.15,T.blow+.55,raw),pts=[];
   for(let i=0;i<=24;i++){const u=mix(tail,1,i/24);pts.push([mix(bh[0],top[0],u*u),mix(bh[1],top[1],u)])}jet(pts,130)}}

 // The king, in two pieces: the crown and its tree are a lid hinged at the crown's left end (cut-out pixels).
 const KCUT=[[98,413],[130,396],[200,378],[267,372],[335,378],[400,393],[440,413]],KHINGE=[98,413];
 const kpath=lid=>{const p=new Path2D(),[w,h]=[600,920];if(lid){p.moveTo(-40,-40);p.lineTo(w,-40);p.lineTo(w,413)}else{p.moveTo(-40,h);p.lineTo(w,h);p.lineTo(w,413)}
  for(let i=KCUT.length-1;i>=0;i--)p.lineTo(...KCUT[i]);p.lineTo(-40,413);p.closePath();return p};
 const LID=kpath(true),HEAD=kpath(false);
 function kingLid(raw){const u=raw-T.lid;return u<=0?0:1.95*spring(u*1.25)}
 function king(raw,x,y,sx,rot){const im=img.king;if(!im)return;const gi=GI.king,k=gi.h/im.height,[X,Y]=S(x,y),a=kingLid(raw);
  g.save();g.translate(X,Y);g.rotate(rot);g.scale(k*cam.z*sx,k*cam.z);g.translate(-.5*im.width,-im.height);
  if(a<=0){g.drawImage(im,0,0);g.restore();return}
  g.save();g.clip(HEAD);g.drawImage(im,0,0);g.restore();
  const o=smooth(0,.5,a); // the open skull: a dark engraved hollow along the cut
  g.save();g.beginPath();g.ellipse(269,398,172,30*o,0,0,Math.PI*2);g.fillStyle='#d9b88c';g.fill();g.clip();
  for(let i=0;i<30;i++){const xx=100+i*12;line(xx,398-34*o,xx-4,398,'rgba(110,80,48,.45)',1)} // the far inside wall, hatched
  g.beginPath();g.ellipse(269,398+12*o,160,24*o,0,0,Math.PI*2);g.fillStyle='#21190f';g.fill();g.restore();
  g.beginPath();g.ellipse(269,398,172,30*o,0,0,Math.PI*2);g.strokeStyle=C.ink;g.lineWidth=2.4;g.stroke();
  climbers(raw,true);
  g.save();g.translate(...KHINGE);g.rotate(-a);g.translate(-KHINGE[0],-KHINGE[1]);g.clip(LID);g.drawImage(im,0,0);g.restore();
  g.restore()}

 // The six newcomers climb out of the king's head one per half beat and hop down onto the print's top edge.
 const CLIMB=[['owl',-860],['hare',860],['fox',-600],['fish',600],['moth',-330],['keeper',330]],CH=430;
 function climbers(raw,inside){const im=A.assets&&A.assets.ensemble,D=A.puppets&&A.puppets.defs;if(!im||!D)return;
  const cw=im.width/3,ch=im.height/2,headY=KTOP+398/900*GI.king.h,pr=printPose(raw,0),top=pr.y+pr.sink-1020;
  CLIMB.forEach(([name,lx],i)=>{const t0=T.climb+i*T.beat/2,u=raw-t0;if(u<=0)return;const d=D[name],kk=CH/d.height,rise=clamp(u/.22),hop=clamp((u-.22)/.42);
   if(inside!==(hop<=0))return; // still in the hollow: drawn inside the king, behind his lid; out: in front of everything
   let x,y,rot=0,sq=0;
   if(hop<=0){x=(lx>0?60:-60)+lx*.04;y=headY+CH*.9*(1-spring(rise*1.2))}
   else if(hop<1){const c=qbez([lx*.08,headY-40],[lx*.6,headY-CH*1.5],[lx,top],hop);x=c[0];y=c[1];rot=(lx>0?1:-1)*.5*Math.sin(Math.PI*hop)}
   else{x=lx;y=top;sq=wobble((u-.64)*1.4)*.2-.03*beatPulse(raw,i*.25)}
   const draw=(X,Y,z)=>{g.save();g.translate(X,Y);g.rotate(rot);g.scale(kk*z*(1+sq),kk*z*(1-sq));
    g.drawImage(im,(d.cell%3)*cw,Math.floor(d.cell/3)*ch,cw,ch,-200,-(d.feet[0][1]+d.feet[1][1])/2,400,640);g.restore()};
   if(inside){ // in king-image pixels: clip to the hollow and everything above its far rim
    const kp=img.king.height/GI.king.h,X=269+x*kp,Y=398+(y-headY)*kp;g.save();const c=new Path2D();c.rect(-200,-600,1000,998);c.ellipse(269,398,172,26,0,0,Math.PI);g.clip(c);draw(X,Y,kp);g.restore()}
   else{const [X,Y]=S(x,y);draw(X,Y,cam.z)}})}

 // Each giant draws itself; the king only ever shows above the print's foot, never in the meadow.
 function giants(raw,front,pr){const B=raw>=T.b;
  if(!front){const u=raw-(B?T.poke+.4:T.king);if(u<=0)return; // phase A: watered up by the spout; phase B: after the poke
   const s=spring(u*1.15),[,foot]=S(0,470);g.save();g.beginPath();g.rect(X0,Y0,X1-X0,foot-Y0);g.clip();
   king(raw,0,KTOP+GI.king.h+(1-s)*2200,1+.02*beatPulse(raw,.5),.012*Math.sin(u*2.1));g.restore();return}
  const w=whalePose(raw);
  if(w){const [,gy]=S(0,G);g.save();if(w.buried){g.beginPath();g.rect(X0,Y0,X1-X0,gy-Y0);g.clip()}
   giant('whale',w.x,w.y,GI.whale.h,GI.whale.ax,GI.whale.ay,w.sx,w.sy,w.rot);g.restore()}
  { const u=raw-(B?T.b+.5:T.snail);if(u>0){const s=spring(u),w=wobble(u)*.12,crawl=.018*Math.sin((raw-T.snail)*5.2),bob=.02*beatPulse(raw),
    fling=B?0:wobble((raw-T.seed[0]+.12)*1.4)*.16*(raw>T.seed[0]-.12?1:0);
    if(!B)giant('snail',snailX(raw),G,GI.snail.h,GI.snail.ax,GI.snail.ay,s*(1+w+crawl),s*(1-w+bob),fling); // pops up out of the meadow
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

 // The cloud hand from "it's true" comes down from outside the frame and pokes the print into the soil.
 function hand(raw,pr){const H=A.openingImg&&A.openingImg.cloudhand,Bx=window.ALCHEMY_OPENING_BOX&&window.ALCHEMY_OPENING_BOX.cloudhand;
  if(!H||!Bx||raw<T.poke-.32||raw>T.poke+1)return;const top=pr.y+pr.sink-1020;
  const tipY=mix(-3600,top,smooth(T.poke-.32,T.poke,raw))-3600*smooth(T.poke+.5,T.poke+.95,raw),k=2300/Bx.h*cam.z,[X,Y]=S(-20,tipY);
  g.save();g.translate(X,Y);g.rotate(-.04);g.scale(k,k);g.translate(-Bx.tip[0],-Bx.tip[1]);g.drawImage(H,0,0);g.restore()}

 // Phase B: roots of the print and of every giant grow down into one knot, then gold runs up them.
 function roots(raw,pr){if(raw<T.roots)return;const knot=S(0,G+700),sk=pr.sink;
  const from=[[0,G+sk,0],[-640,G+sk,1],[640,G+sk,2],[WX-250,G+10,3],[WX+200,G+10,4],[snailX(raw)+150,G+80,5],[snailX(raw)+420,G+90,6]];
  const curves=from.map(([x,y,i])=>{const a=S(x,y),dx=knot[0]-a[0];return [a[0],a[1],a[0]+dx*.08,a[1]+(knot[1]-a[1])*.75,knot[0]-dx*.55,knot[1]-12+8*noise(i),knot[0],knot[1]]});
  curves.forEach((b,i)=>{const p=smooth(T.roots+i*.09,T.roots+1.15+i*.06,raw);A.scene.woodyRoot(b,p,i<3?18:15,4,40+i,{rootlets:5,rootletLen:46,neck:true})});
  if(raw<T.gold)return;
  // Sap: a glow climbs each root from the knot back up to its owner, then the owner's tree catches the light.
  const u=clamp((raw-T.gold)/1.15);
  curves.forEach(b=>{g.beginPath();for(let i=0;i<=28;i++){const q=A.scene.bez(b,mix(1,1-u,i/28));i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}
   g.strokeStyle='rgba(229,175,51,.9)';g.lineWidth=3.4;g.lineCap='round';g.stroke();const q=A.scene.bez(b,1-u);A.glow(q[0],q[1],30,.85*(1-smooth(.85,1,u)))});
  A.glow(knot[0],knot[1],40+8*Math.sin(raw*6),.9*smooth(T.gold,T.gold+.3,raw));
  const lit=smooth(T.gold+1.0,T.gold+1.5,raw);if(!lit)return;
  for(const [x,y] of [crown('whale',WX),crown('snail',snailX(raw))]){const [X,Y]=S(x,y);A.glow(X,Y,70*cam.z/ZB,.6*lit*(.85+.15*beatPulse(raw)))}}

 function coda(raw){
  plate(raw);P[0].getContext('2d').drawImage(A.c,0,0);
  Object.assign(cam,camera(raw));
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  g.save();g.beginPath();g.rect(X0,Y0,X1-X0,Y1-Y0);g.clip();
  // The print, jostled about its foot each time a giant lands (calm again before the dive).
  const calm=1-smooth(T.dive[0]-.3,T.dive[0],raw)*(raw<T.b?1:0);
  const jolt=[[T.snail+.2,1],[T.whale+.55,-1],[T.king+.2,1],[T.b+.55,-1],[T.b+.7,1],[T.b+.95,1],[T.land,-1],[T.poke+.05,1]].reduce((v,[t0,d])=>v+(raw>t0?d*.035*Math.exp(-(raw-t0)*5)*Math.sin((raw-t0)*18):0),0)*calm;
  const pr=printPose(raw,raw>=T.gulp-.04&&raw<T.land?0:jolt);
  meadow();giants(raw,false,pr);spouts(raw,whalePose(raw));
  if(!pr.hide){const sz=cam.z*pr.s;let lv=0;while(lv<PF.length-1&&PF[lv+1]>=sz)lv++;
   for(let i=1;i<=lv;i++){const q=P[i].getContext('2d');q.imageSmoothingQuality='high';q.drawImage(P[i-1],0,0,P[i].width,P[i].height)}
   const [fx,fy]=S(pr.x,pr.y+pr.sink),[,gy]=S(0,G),f=PF[lv];g.save();
   if(pr.sink>0){g.beginPath();g.moveTo(X0,Y0);g.lineTo(X1,Y0);for(let x=X1;x>=X0;x-=16)g.lineTo(x,gy-2+edge(x));g.closePath();g.clip()} // pushed into the soil
   g.translate(fx,fy);g.rotate(pr.rot);g.scale(sz/f,sz/f);g.imageSmoothingQuality='high';
   g.drawImage(P[lv],49*f,42*f,1822*f,986*f,(49-960)*f,(42-1020)*f,1822*f,986*f);g.restore()}
  giants(raw,true,pr);seed(raw);clods(raw);roots(raw,pr);climbers(raw,false);hand(raw,pr);
  g.restore();g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 }
 A.coda={camera,T};
 A.draw=raw=>(raw<T.a||(raw>=T.dive[1]&&raw<T.b))?plate(raw):coda(raw);
})();
