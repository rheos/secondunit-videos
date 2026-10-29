/* Deterministic ink-and-wash kit. Real engraved ink is separate from its colour mask. */
window.Alchemy = (() => {
 const W=1920,H=1080, c=document.getElementById('c'), g=c.getContext('2d',{willReadFrequently:true});

 const C={paper:'#f3e7c8',ink:'#27261d',azure:'#558dab',blue:'#537ac0',rose:'#cb6770',green:'#5d9446',gold:'#e5af33',earth:'#c6b384',cream:'#fff1d3'};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)); const smooth=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
 const mix=(a,b,p)=>a+(b-a)*p;const noise=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
 const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
 const assets={},tints=new Map();

 const loadImage=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Missing alchemy asset: '+url));im.src=url});
 async function load(){
   // Classic scripts also work under file:// for the established project renderer.
   const names=['sol-body','sol-upper','sol-fore','sol-arm-r','sol-head','luna-body','luna-arm-l','luna-upper','luna-fore','luna-head','cloud','bird-body','bird-wing','bird-rear','fame-body','fame-arm','fame-wing','fame-drape'];
   await Promise.all(names.map(async n=>{const [ink,mask]=await Promise.all(['ink','mask'].map(k=>loadImage(ALCHEMY_MEDIA[n+'-'+k])));assets[n]={ink,mask,box:ALCHEMY_PIECES[n].box}}));
   assets.ensemble=await loadImage(ALCHEMY_ENSEMBLE_IMAGE);
 }
 function stroke(path,color=C.ink,width=1.5){g.strokeStyle=color;g.lineWidth=width;g.stroke(new Path2D(path))}
 function fill(path,color){g.fillStyle=color;g.fill(new Path2D(path))}
 function line(x1,y1,x2,y2,color=C.ink,width=1){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.stroke()}
 function ellipse(x,y,rx,ry,color,outline=null){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(color){g.fillStyle=color;g.fill()}if(outline){g.strokeStyle=outline;g.lineWidth=1.3;g.stroke()}}
 function tinted(name,color){const key=name+color;if(tints.has(key))return tints.get(key);const a=assets[name],o=canvas(a.mask.width,a.mask.height),q=o.getContext('2d',{willReadFrequently:true});q.drawImage(a.mask,0,0);q.globalCompositeOperation='source-in';q.fillStyle=color;q.fillRect(0,0,o.width,o.height);q.globalCompositeOperation='source-atop';
   // Fixed paper pores and broad uneven brush passes, never per-frame noise.
   q.fillStyle=C.paper; q.globalAlpha=.13; for(let i=0;i<22;i++){q.beginPath();q.ellipse(noise(i+71)*o.width,noise(i+152)*o.height,20+noise(i+43)*o.width*.6,3+noise(i+22)*20,-.12,0,Math.PI*2);q.fill()}
   q.globalAlpha=.17;for(let i=0;i<o.width*o.height/250;i++){q.fillRect(noise(i+421)*o.width,noise(i+713)*o.height,1,2)}tints.set(key,o);return o;
 }
 function piece(name,color=C.paper,reveal=1){const a=assets[name],b=a.box,w=b[2]-b[0],h=b[3]-b[1];g.drawImage(tinted(name,C.paper),b[0],b[1]);if(reveal>0){g.save();if(reveal<1){g.beginPath();g.ellipse(b[0]+w*.5,b[1]+h*.78,Math.max(1,w*.9*reveal),Math.max(1,h*reveal),-.15,0,Math.PI*2);g.clip()}g.drawImage(tinted(name,color),b[0]-1,b[1]+.7);g.restore()}g.drawImage(a.ink,b[0],b[1])}
 function joint(x,y,angle,fn){g.save();g.translate(x,y);g.rotate(angle);g.translate(-x,-y);fn();g.restore()}
 function rays(x,y,r,n,length,p,angle=0,spread=Math.PI*2){if(p<=0)return;g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha=clamp(p);for(let j=0;j<n;j++){const a=-spread/2+spread*j/(n-1),l=length*(.65+.35*noise(j+81))*p;line(Math.cos(a)*r,Math.sin(a)*r,Math.cos(a)*(r+l),Math.sin(a)*(r+l),j%4===0?'#b38327':C.ink,.65)}g.restore()}
 function brass(t){let v=0;for(const n of ALCHEMY_CUES.brass){const d=t-n.time;if(d>=0&&d<.65)v=Math.max(v,Math.exp(-d*6.5)*(.5+n.strength*.5))}return v}
 function cloud(x,y,s,flip=1){g.save();g.translate(x,y);g.scale(s*flip*.14,s*.14);g.translate(-1086,-362);piece('cloud',C.cream);g.restore()}
 // Paper is stable in plate space. No animated grain shimmer.
 const paper=canvas(W,H), pg=paper.getContext('2d',{willReadFrequently:true});pg.fillStyle=C.paper;pg.fillRect(0,0,W,H);for(let i=0;i<65000;i++){const a=noise(i+237);pg.globalAlpha=.03+a*.07;pg.fillStyle=i%3?'#87794c':'#fff9ed';pg.fillRect(noise(i+812)*W,noise(i+522)*H,1+a*2,1)}pg.globalAlpha=1;
 return {W,H,c,g,C,clamp,smooth,mix,noise,canvas,assets,load,stroke,fill,line,ellipse,piece,joint,rays,brass,cloud,paper};
})();
