/* Flat printed-paper cutouts. A frame is a pure function of requested time.
 * Fixed field/repaint principle: ink-bleed-reveal registry reference.
 * Every main illustration is finished artwork, never primitive geometry.
 */
(function () {
 'use strict';
 const W=1920,H=1080,TAU=Math.PI*2;
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
 const out=v=>1-Math.pow(1-clamp(v),4);
 const hash=n=>{let x=Math.imul(n+173,374761393);x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967296;};
 const twos=t=>Math.floor(t*12+1e-6)/12;
 const sheets={};
 function canvas(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
 function nudge(p){p=clamp(p);if(p<.2)return .1*Math.pow(p/.2,4);if(p<.38)return .1+.65*(p-.2)/.18;return .75+.25*out((p-.38)/.62);}
 const ready=Promise.all([
  ['city','assets/art/01-city-to-sea.png'],['light','assets/art/04-open-coast.png'],['dark','assets/art/05-overcast-coast.png'],['ribbon','assets/art/06-ink-ribbon-atlas.png']
 ].map(([name,src])=>new Promise((resolve,reject)=>{
  const im=new Image();im.onload=()=>{if(name==='ribbon'){sheets[name]=im;resolve();return;}const c=canvas();c.getContext('2d').drawImage(im,0,0,W,H);sheets[name]=c;resolve();};
  im.onerror=()=>reject(new Error('Missing artwork: '+src));im.src=src;
 })));
 let cityClose,wavePaths,ribbonPaths;
 ready.then(()=>{
  cityClose=canvas();const c=cityClose.getContext('2d');
  c.translate(W/2,H/2);c.scale(1.48,1.48);c.translate(-675,-570);c.drawImage(sheets.city,0,0);
  wavePaths=[
   new Path2D('M 410 625 C 690 460 1130 425 1650 565 L 2010 630 L 2010 875 C 1580 792 1410 656 1220 651 C 940 670 710 816 410 750 Z'),
   new Path2D('M 410 795 C 720 597 1080 560 1400 678 C 1580 674 1760 673 2050 790 L 2050 1060 C 1560 980 1290 835 1070 842 C 780 833 530 955 410 925 Z'),
   new Path2D('M 680 968 C 970 733 1290 705 1640 770 L 2010 912 L 2010 1170 L 680 1170 Z')
  ];
  ribbonPaths=[];
  const edge=(b,y)=>b+Math.sin(y*.021+b*.009)*12+Math.sin(y*.067+b*.02)*4;
  for(let i=0;i<7;i++){
   const p=new Path2D(),left=i*W/7,right=(i+1)*W/7;
   p.moveTo(edge(left,-40),-40);
   for(let y=-40;y<=1120;y+=24)p.lineTo(edge(left,y),y);
   for(let y=1120;y>=-40;y-=24)p.lineTo(edge(right,y),y);
   p.closePath();ribbonPaths.push(p);
  }
 });
 function energy(t,band){const a=window.TRAVEL_AUDIO;const n=clamp(Math.round(t*a.rate),0,a.bands.length-1);return a.bands[n][band];}
 function accent(t){let v=0;for(const at of window.TRAVEL_AUDIO.accents){const d=t-at;if(d>=0&&d<.24)v=Math.max(v,Math.exp(-d*19));}return v;}
 function paper(ctx,path,image,dx=0,dy=0,angle=0,scaleX=1,anchorX=960,anchorY=540){
  ctx.save();ctx.translate(anchorX+dx,anchorY+dy);ctx.rotate(angle);ctx.scale(scaleX,1);ctx.translate(-anchorX,-anchorY);
  ctx.save();ctx.translate(4,6);ctx.fillStyle='rgba(8,15,22,.19)';ctx.fill(path);ctx.restore();
  ctx.clip(path);ctx.drawImage(image,0,0);ctx.restore();
 }
 function sea(ctx,t,bright=false){
  const q=twos(t),im=bright?sheets.light:sheets.dark;ctx.drawImage(im,0,0);
  for(let i=0;i<3;i++){
   const phase=q*(.95+i*.18)+i*2.2;
   const dx=Math.sin(phase)*(21+i*17)+accent(q)*(4+i*3);
   const dy=Math.sin(phase*1.2)*(11+i*8)-energy(q,1)*(2+i*2);
   paper(ctx,wavePaths[i],im,dx,dy,Math.sin(phase*.65)*.009,1,1350,820);
  }
 }
 function city(ctx,t){
  ctx.drawImage(cityClose,0,0);const q=twos(t);
  for(let i=0;i<7;i++){
   const dx=Math.sin(q*1.3+i*.8)*4+accent(q)*(i%2?2:-2);
   const dy=(i%2?1:-1)*out((t-.25)/2.4)*(10+i*2);
   paper(ctx,ribbonPaths[i],cityClose,dx,dy,Math.sin(q*.4+i)*.002,1,(i+.5)*W/7,540);
  }
  ink(ctx,t,smooth((t-.3)/1.7),.18);
 }
 function departure(ctx,t){
  sea(ctx,t,false);const local=t-2.75;
  for(let i=6;i>=0;i--){
   const p=nudge((local-i*.11)/3.55),anchor=(i+.5)*W/7;
   const dx=-p*(1150+anchor*.82),dy=(i%2?1:-1)*Math.sin(p*Math.PI)*(90+i*16);
   const angle=(i%2?1:-1)*Math.sin(p*Math.PI)*.15,sx=1-.54*Math.sin(p*Math.PI);
   paper(ctx,ribbonPaths[i],cityClose,dx,dy,angle,sx,anchor,540);
  }
  if(local>2.9)ink(ctx,t,smooth((local-2.9)/1.2),.28);
 }
 function ink(ctx,t,progress=1,opacity=.83){
  if(t<5.8)return;
  const im=sheets.ribbon,cw=im.naturalWidth/2,ch=im.naturalHeight/2,q=twos(t);
  const swaps=[8.76,12.12,14.64];let pose=0;
  for(const at of swaps)if(q>=at)pose++;
  const birth=smooth((t-5.8)/1.55),relief=smooth((t-14.64)/1.75);
  ctx.save();ctx.globalAlpha=opacity*birth;
  ctx.translate(1120,690+Math.sin(q*1.15)*8);
  ctx.rotate(Math.sin(q*.8)*.018-relief*.04);
  ctx.scale(1+Math.sin(q*1.2)*.012,1+Math.sin(q*1.55)*.025-relief*.16);
  ctx.translate(-1120,-690);
  // Four replacement drawings; no geometric proxy for the knot.
  ctx.drawImage(im,(pose%2)*cw,Math.floor(pose/2)*ch,cw,ch,470,388,1250,703);
  ctx.restore();
 }
 function shadow(ctx,t){
  const p=smooth((t-7.25)/4.25);ctx.save();const scale=1.40+.07*p;
  ctx.translate(960,540);ctx.scale(scale,scale);ctx.translate(-1110,-655);
  sea(ctx,t,false);ink(ctx,t,1,.96);ctx.restore();
 }
 function listening(ctx,t){
  const p=smooth((t-11.5)/5.08);ctx.save();const scale=1.18-.14*p;
  ctx.translate(960,540);ctx.scale(scale,scale);ctx.translate(-1040+70*p,-555);
  sea(ctx,t,false);ink(ctx,t,1,.96-.37*p);ctx.restore();
 }
 function tearPath(radius){
  const p=new Path2D(),cx=1660,cy=198;
  for(let i=0;i<=120;i++){
   const a=i/120*TAU;
   const r=radius*(1+.035*Math.sin(a*11)+.019*Math.sin(a*37))+(hash(i)*2-1)*Math.min(11,radius*.035);
   const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
   if(i===0)p.moveTo(x,y);else p.lineTo(x,y);
  }p.closePath();return p;
 }
 function engravedSound(ctx,t){
  const events=[16.84,17.32,17.89,18.45];
  for(let k=0;k<events.length;k++){
   const age=t-events[k];if(age<0||age>1.65)continue;
   const radius=104+age*510,opacity=smooth(age/.16)*(1-smooth((age-1.08)/.57));
   ctx.save();ctx.globalAlpha=opacity*.8;ctx.strokeStyle=k%2?'#bd8742':'#efe0b6';
   for(let line=0;line<3;line++){
    ctx.lineWidth=line===1?2.5:1.4;ctx.beginPath();
    for(let j=0;j<=95;j++){
     const a=(.36+j/95*1.19)*Math.PI,r=radius+line*7+Math.sin(a*17+k)*2.8;
     const x=1660+Math.cos(a)*r,y=198+Math.sin(a)*r;
     if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }ctx.stroke();
   }ctx.restore();
  }
 }
 function sunlight(ctx,t){
  sea(ctx,t,false);const local=t-16.58,radius=37+out(local/1.35)*2100,tear=tearPath(radius);
  ctx.save();ctx.clip(tear);sea(ctx,t,true);ctx.restore();
  if(local<1.25){ctx.save();ctx.strokeStyle='#ecd4a2';ctx.lineWidth=4;ctx.stroke(tear);ctx.restore();}
  ink(ctx,t,1,.45*(1-smooth(local/1.8)));engravedSound(ctx,t);
 }
 function draw(canvas,t,scene){
  const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  [city,departure,shadow,listening,sunlight][scene](ctx,t);
 }
 window.TravelProof={ready,draw};
})();
