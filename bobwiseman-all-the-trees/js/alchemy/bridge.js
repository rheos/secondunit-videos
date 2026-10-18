/* Draft 4 (Bob's note on draft 3, 2026-10-18): in the love bridge "not enough is changing... i wish the angle changed
   or somehow the scene was refreshed more. maybe the heart gets much bigger much quicker or maybe something even more
   surreal happens". The bridge, 96.3-110.5 s:
   - the heart pumps up a size on every "love" (97.05, 98.02, 100.07, 103.45), each pump overshooting;
   - "that we need to know" (99.65): a cut to a tilted close-up on the dancing saints, while the heart, too big for its
     cradle, floats up behind them like a balloon;
   - "when the sun shines so hard" (102.45): cut back wide. The heart is now a giant sun bearing down behind their heads,
     and it ignites on "sun" as before;
   - "when the winter snows" (106.31): two puffed-up worthies, a bewigged statesman and an opera diva, sail across the
     sky in front of it; on "winter" (107.96) a cherub pops up on the left cloud and fires his snowball cannon; on "snows"
     (108.34) they burst into snow, zip about like let-go balloons and drop out of the picture, and the cold shrinks the
     heart back into its cradle.
   Bob named real people for the surreal moment; these are invented figures (Robin's call). Everything here is identity
   outside 96.3-110.5 s, so the rest of the film draws exactly as draft 3. Poses on twos (t), camera on the song clock (raw).
   Cut-outs: source/alchemy/bridge, tools/pack_bridge_media.py. Hooks live in extended.js (bridgeLift, bridgeCam, bridgeFront). */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise}=A;
 const img={};const oldLoad=A.load;
 A.load=async()=>{await oldLoad();const M=window.ALCHEMY_BRIDGE_MEDIA||{};
  await Promise.all(Object.keys(M).map(k=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{img[k]=im;res()};im.onerror=()=>rej(new Error('Missing bridge asset '+k));im.src=M[k]})))};
 const T={on:96.3,off:110.5,loves:[[97.05,.4],[98.02,.4],[100.07,.5],[103.45,.6]],cut:[99.65,102.45],
  rise:[[99.75,101.9,-120],[102.45,104.4,-40]],sail:106.31,cherub:107.62,fire:[107.96,108.08],snows:108.34,home:[107.96,109.3]};
 const ID={k:1,dx:0,dy:0,ray:1,behind:false,fa:0};
 const spring=u=>u<=0?0:1-Math.exp(-u*7)*Math.cos(u*16);
 const pulse=(u,w=.25)=>u<0||u>w*4?0:Math.exp(-u/w)*Math.sin(Math.min(1,u/.05)*Math.PI/2);

 // ---- the heart: pumps, lifts off, comes home in the cold ----
 A.bridgeLift=t=>{if(t<T.on||t>=T.off)return ID;
  let k=1;for(const [t0,d] of T.loves)k+=d*spring((t-t0)*1.4);
  let dy=0;for(const [a,b,d] of T.rise)dy+=d*smooth(a,b,t);
  dy+=10*Math.sin(t*3.1)*smooth(99.8,100.6,t); // it bobs like a balloon on a string
  const home=smooth(T.home[0],T.home[1],t),shiver=home>0&&home<1?.035*Math.sin(t*44)*(1-home):0;
  k=mix(k,1,home)+shiver;dy=mix(dy,0,home);
  return {k,dx:0,dy,ray:Math.sqrt(k),behind:t>=T.cut[0]&&t<T.home[1]+.05,fa:smooth(108.9,T.home[1]+.05,t)}};

 // ---- the cut: a tilted close-up on the saints for "that we need to know" ----
 A.bridgeCam=raw=>{if(raw<T.cut[0]||raw>=T.cut[1])return null;const u=(raw-T.cut[0])/(T.cut[1]-T.cut[0]);
  return {r:-.12+.03*u,z:1.5+.08*u,x:950-14*u,y:470-8*u}}; // keeps the view inside the drawn sky and ground

 // ---- the worthies, the cherub, the snow ----
 function cut(name,x,y,h,ax,ay,s=1,rot=0,alpha=1){const im=img[name];if(!im||s<=0)return;const k=h/im.height;
  g.save();g.globalAlpha*=alpha;g.translate(x,y);g.rotate(rot);g.scale(k*s,k*s);g.drawImage(im,-ax*im.width,-ay*im.height);g.restore()}
 function snowball(x,y,r){A.ellipse(x,y,r,r,'#f8f4ea',C.ink);g.save();g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.clip();
  for(let j=0;j<6;j++)A.line(x-r+j*r*.45,y+r,x+r*.2+j*r*.45,y-r*.2,'rgba(39,38,29,.35)',.7);g.restore()}
 function puff(x,y,u,seed,size=1){if(u<0||u>.8)return;const e=1-Math.pow(1-u/.8,2);
  g.save();g.globalAlpha=1-smooth(.35,.8,u);
  for(let j=0;j<11;j++){const a=noise(seed+j)*Math.PI*2,d=(30+70*noise(seed+j*3))*e*size,r=(16+16*noise(seed+j*7))*(1-.5*e)*size;A.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d*.8,r,r,'#fbf8f0','rgba(39,38,29,.45)')}
  g.restore()}
 // A worthy sails in, is hit, and zips about deflating like a let-go balloon until it drops out of the bottom.
 const WORTHIES=[{name:'statesman',h:250,from:2080,to:1240,y:262,t0:106.31,hit:108.34,seed:3,spin:1},
                 {name:'diva',h:300,from:2200,to:1560,y:318,t0:106.62,hit:108.44,seed:11,spin:-1}];
 function worthyAt(w,t){const sail=clamp((t-w.t0)/(w.hit-w.t0+.6)),x=mix(w.from,w.to,1-Math.pow(1-Math.min(1,(t-w.t0)/(w.hit-w.t0)),1.4)),
   y=w.y+14*Math.sin(t*2.6+w.seed);return {x:t<w.hit?x:w.to,y,sail}}
 function worthy(w,t){if(t<w.t0)return;const p=worthyAt(w,t),u=t-w.hit;
  if(u<0){cut(w.name,p.x,p.y,w.h,.5,.5,1,.05*Math.sin(t*2.1+w.seed));return}
  const s=mix(1,.28,smooth(0,.9,u)),zx=110*Math.sin(u*10+w.seed)*(1-smooth(.6,1.2,u)),zy=-90*Math.sin(u*7)*(1-smooth(.4,.9,u))+1100*Math.pow(Math.max(0,u-.45),2);
  cut(w.name,p.x+zx-40*u*w.spin,p.y+zy,w.h,.5,.5,s*(1+.12*Math.sin(u*31)),w.spin*u*9)}
 function bridgeFront(t,raw){if(t<T.sail||t>=T.off)return;
  for(const w of WORTHIES)worthy(w,t);
  // The cherub pops up on the left cloud, fires twice with a kick, then ducks away.
  const cx=300,cy=372,ch=230,inn=spring((t-T.cherub)*1.3),out=smooth(109.25,109.7,t),s=inn*(1-out);
  const kick=T.fire.reduce((v,f)=>v+pulse(t-f,.08),0);
  if(s>0)cut('cherub',cx-24*kick,cy,ch,.5,.95,s,-.1*kick);
  const im=img.cherub,cw=im?ch*im.width/im.height:326,mx=cx+(.86-.5)*cw,my=cy-(.95-.12)*ch;
  T.fire.forEach((f,i)=>{const w=WORTHIES[i],u=(t-f)/(w.hit-f);puff(mx+10,my-6,(t-f)*1.6,40+i,.45);
   if(u>=0&&u<1){const q=worthyAt(w,w.hit),x=mix(mx,q.x,u),y=mix(my,q.y,u)-120*Math.sin(Math.PI*u);snowball(x,y,12)}});
  for(const w of WORTHIES){const q=worthyAt(w,w.hit);puff(q.x,q.y,t-w.hit,w.seed,1.2)}
  // Then it snows over everything, and the snow is gone before the trumpets take the sky.
  const sn=smooth(T.snows,T.snows+.4,t)*(1-smooth(109.9,110.45,t));
  if(sn>0){g.save();g.globalAlpha=sn;for(let i=0;i<90;i++){const x0=60+noise(i+5)*1800,v=110+60*noise(i+9),y=-40+((noise(i+17)*900+(t-T.snows)*v)%940)+70,
   x=x0+18*Math.sin(t*1.7+i),r=2.6+2.4*noise(i+29);A.ellipse(x,y,r,r,'#fbf8f0','rgba(39,38,29,.7)')}g.restore()}
 }
 A.bridgeFront=bridgeFront;
})();
