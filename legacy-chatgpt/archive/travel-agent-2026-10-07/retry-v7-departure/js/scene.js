/* Night Departure. Original scene, geometry and animation. Renderer attribution in LICENSE-functional-emotions. */
const s=Paint.sctx,f=Paint.fctx,ink=Paint.ictx,mask=Paint.mctx;
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,sm=x=>{x=clamp(x);return x*x*(3-2*x)},ramp=(t,a,b)=>sm((t-a)/(b-a)),hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)},vadd=(a,b)=>a.map((n,i)=>n+b[i]),sub=(a,b)=>a.map((n,i)=>n-b[i]),mul=(a,n)=>a.map(v=>v*n),dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0),norm=a=>mul(a,1/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const HERO_ID=99971;
const DURATION=90,FRAME_COUNT=DURATION*24;
function routeX(z){
 if(z>710){let u=Math.min(1,(z-710)/170);return 90*(1-Math.cos(u*Math.PI/2))+Math.max(0,z-880)*90*Math.PI/340;}
 return z>295&&z<440?-11*Math.sin((z-295)/145*Math.PI):0;
}
let cam,faces=[],lines=[],TIME=0,MODEL=null;
function modelPoint(p){if(!MODEL)return p;const [x,y,z]=p,[tx,ty,tz,yaw,bank,scale]=MODEL;const bx=x*Math.cos(bank)-y*Math.sin(bank),by=x*Math.sin(bank)+y*Math.cos(bank);return [tx+scale*(bx*Math.cos(yaw)+z*Math.sin(yaw)),ty+by*scale,tz+scale*(-bx*Math.sin(yaw)+z*Math.cos(yaw))];}
function place(pos,yaw,bank,scale,draw){MODEL=[...pos,yaw,bank,scale];draw();MODEL=null;}
function travelZ(t){return -37+t*7.3+ramp(t,4.3,7.5)*6+Math.max(0,t-20)*4.7;}
function eyeHeight(t){return 4.1+ramp(t,6.5,16)*36-31*ramp(travelZ(t),236,355);}

function camera(pos,target,lens=950,roll=0){let fw=norm(sub(target,pos)),rt=norm(cross(fw,[0,1,0])),up=cross(rt,fw);cam={pos,fw,rt,up,lens,roll};}
function project(p){let q=sub(p,cam.pos),z=dot(q,cam.fw);if(z<.6)return null;let x=dot(q,cam.rt)*cam.lens/z,y=-dot(q,cam.up)*cam.lens/z;return [960+x*Math.cos(cam.roll)-y*Math.sin(cam.roll),540+x*Math.sin(cam.roll)+y*Math.cos(cam.roll),z];}
function clipNear(pts){let out=[];for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],za=dot(sub(a,cam.pos),cam.fw),zb=dot(sub(b,cam.pos),cam.fw);if(za>=.65)out.push(a);if((za>=.65)!==(zb>=.65)){let q=(.65-za)/(zb-za);out.push(a.map((v,j)=>mix(v,b[j],q)));}}return out;}
function polygon(pts,c,edge,glow=0){pts=clipNear(pts.map(modelPoint));if(pts.length<3)return;let ps=pts.map(project);if(ps.some(p=>!p))return;let z=ps.reduce((a,p)=>a+p[2],0)/ps.length;if(ps.every(p=>p[0]<-150)||ps.every(p=>p[0]>2070)||ps.every(p=>p[1]<-150)||ps.every(p=>p[1]>1230))return;faces.push({ps,c,edge,glow,z});}
function line3(pts,c,w=1){let ps=pts.map(modelPoint).map(project);if(ps.some(p=>!p))return;faces.push({ps,c,w,z:ps.reduce((a,p)=>a+p[2],0)/ps.length,line:true});}
function path(g,ps){g.beginPath();ps.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));}
function flush(){DepthPaint.render(faces,s,f);faces=[];}
function quad(a,b,c,d,col,edge,g=0){polygon([a,b,c,d],col,edge,g)}
function box(x,y,z,w,h,d,col,side,top){let a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y+h,z-d/2],e=[x-w/2,y+h,z-d/2],a2=[x-w/2,y,z+d/2],b2=[x+w/2,y,z+d/2],c2=[x+w/2,y+h,z+d/2],e2=[x-w/2,y+h,z+d/2];quad(a,b,c,e,col);quad(a2,e2,c2,b2,col);quad(a,e,e2,a2,side);quad(b,b2,c2,c,side);quad(e,c,c2,e2,top);}
function circle3(x,y,z,r,plane,col){let p=[];for(let i=0;i<36;i++){let a=i/36*TAU;p.push(plane==='x'?[x,y+Math.sin(a)*r,z+Math.cos(a)*r]:[x+Math.cos(a)*r,y+Math.sin(a)*r,z]);}polygon(p,col);}
function sky(t,late){const colour=(a,b)=>'#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),late)).toString(16).padStart(2,'0')).join('');let g=s.createLinearGradient(0,0,160,1080);g.addColorStop(0,colour('#102239','#455b72'));g.addColorStop(.47,colour('#455e70','#7a8990'));g.addColorStop(.78,colour('#75878a','#9b8b77'));g.addColorStop(1,'#111e32');s.fillStyle=g;s.fillRect(0,0,W,H);
 for(let i=0;i<55;i++){let x=hash(i+4)*2100-90-t*(2+hash(i)*3),y=hash(i+71)*620,r=hash(i+15)*2.8+1;s.fillStyle=i%7?'#798a9d':'#d7c1a0';s.globalAlpha=.3+hash(i)*.45;s.beginPath();s.ellipse((x+2200)%2200,y,r,r*.6,0,0,TAU);s.fill();}s.globalAlpha=1;
 // Long directional sky marks, layered banks of cloud, not a flat texture.
 for(let j=0;j<7;j++){s.strokeStyle=['#263f56','#3c5868','#426174','#283448'][j%4];s.lineWidth=15+j*3;s.globalAlpha=.15;s.beginPath();for(let i=0;i<=40;i++){let x=i*56-100,y=120+j*88+Math.sin(i*.15+j*1.8+t*.09)*(24+j*4);i?s.lineTo(x,y):s.moveTo(x,y);}s.stroke();}s.globalAlpha=1;
}
const buildings=[];for(let k=0;k<48;k++){let side=k%2?1:-1,j=Math.floor(k/2);buildings.push({id:k,x:side*(24+hash(k+9)*16),z:j*12-45+hash(k)*5,w:5+hash(k+2)*7,d:6+hash(k+3)*9,h:11+hash(k+4)*32,seed:hash(k+5)});}
function facadeWindow(x,y,z,w,h,axis,id,t,peel){
 const p=(u,v,away=0)=>axis==='z'?[x+u,y+v,z+away]:[x+away,y+v,z+u];
 let facing=axis==='z'?Math.sign(cam.pos[2]-z):Math.sign(cam.pos[0]-x),out=facing*.08;
 quad(p(-w,-.12),p(w,-.12),p(w,h+.16),p(-w,h+.16),'#757a78');
 quad(p(-w+.12,0,out),p(w-.12,0,out),p(w-.12,h,out),p(-w+.12,h,out),'#0b1c2c');
 if(peel<.05){quad(p(-w+.18,.12,out*1.3),p(w-.18,.12,out*1.3),p(w-.18,h-.06,out*1.3),p(-w+.18,h-.06,out*1.3),id%4?'#b38c5c':'#ddba7e',null,.035);line3([p(0,0,out*1.5),p(0,h,out*1.5)],'#253140',1.4);}
 else{let v=p(peel*(hash(id)*2-1),peel*(2+hash(id+1)*5),out+facing*peel*2);windowWing(v,w*.86,h,t,id,peel*.5);}
}
function inView(p,r){const d=sub(p,cam.pos),z=dot(d,cam.fw);return z+r>.6&&z-r<900&&Math.abs(dot(d,cam.rt))<Math.max(0,z)*1.05+r*1.6&&Math.abs(dot(d,cam.up))<Math.max(0,z)*.59+r*1.6;}
function city(t,lift=0){
 if(travelZ(t)>285)return;
 let allRise=ramp(lift,0,.94)*36;
 // Separate torn foundations leave the traveller a clear corridor through the rising city.
 if(allRise>.1){let y=allRise-.5;for(let side of [-1,1])box(side*30,y-2,94,28,2,310,'#27384a','#1b2a3b','#33444e');for(let j=0;j<24;j++){let x=(j%2?1:-1)*(36+hash(j)*4),z=-55+hash(j+11)*290;polygon([[x-3,y-2,z-3],[x+3,y-2,z-3],[x+hash(j)*2,y-7-hash(j+3)*9,z+1]],'#233449');line3([[x,y-3,z],[x+Math.sin(t+j)*1.3,y-12,z+2],[x+Math.sin(t*.6+j)*3,y-18,z+5]],'#756e5f',1.8);}}
 for(let b of buildings){let release=ramp(lift,hash(b.id+39)*.045,.91),rise=release*36,sway=release*Math.sin(t*.35+b.id)*.4,x=b.x+sway,y=rise,z=b.z;
 if(!inView([x,y+b.h*.5,z],Math.hypot(b.w,b.h,b.d)*.55))continue;
 let col=['#3f4d56','#48515b','#435460','#535259','#555751'][b.id%5],side=['#233347','#263849','#293445'][b.id%3];box(x,y,z,b.w,b.h,b.d,col,side,'#8e8d83');box(x,y+b.h,z,b.w+.7,.6,b.d+.7,'#667379','#354957','#95968b');
 if(b.id%4===0){box(x+.6,y+b.h+.7,z,2,3,2,'#495761','#283b4d','#8e8e82');line3([[x+.6,y+b.h+3.7,z],[x+.6,y+b.h+8,z]],'#a9aba0',1.8);}
 if(b.id%5===1){for(let sig of[-1,1])polygon([[x-b.w*.56,y+b.h+.8,z+sig*b.d*.52],[x+b.w*.56,y+b.h+.8,z+sig*b.d*.52],[x,y+b.h+5,z+sig*b.d*.52]],'#785f59');}
 if(b.id%7===2){for(let j=0;j<3;j++)box(x,y+b.h+j*1.8,z,b.w*(.8-j*.18),1.8,b.d*(.8-j*.18),'#59616b','#273b4c','#88918e');}
 if(b.id===19){box(x,y+b.h,z,b.w*.48,11,b.d*.48,'#68787a','#3b5062','#aaa48c');for(let k=0;k<5;k++)line3([[x-b.w*.24,y+b.h+2+k*1.6,z-b.d*.25],[x+b.w*.24,y+b.h+2+k*1.6,z-b.d*.25]],'#d0bc8b',2);}
 let cols=Math.max(2,Math.floor(b.w/2.4)),rows=Math.floor((b.h-3)/3.5),sg=Math.sign(cam.pos[2]-z),sx=Math.sign(cam.pos[0]-x);
 for(let row=0;row<rows;row++)for(let co=0;co<cols;co++){let id=b.id*91+row*7+co;if(hash(id+45)<.5&&id!==826)continue;let xx=x-b.w*.5+1+(co+.5)*(b.w-2)/cols,yy=y+2+row*3.5,zz=z+sg*(b.d/2+.07),ww=.66+hash(id)*.3,hh=1.9;let peel=ramp(t,2.4+hash(id)*5.5,4.0+hash(id)*5.5)*(.6+release);if(id===826){quad([xx-1.15,yy-.1,zz],[xx+1.15,yy-.1,zz],[xx+1.15,yy+2.4,zz],[xx-1.15,yy+2.4,zz],'#988468');quad([xx-1.02,yy,zz-.06],[xx+1.02,yy,zz-.06],[xx+1.02,yy+2.25,zz-.06],[xx-1.02,yy+2.25,zz-.06],'#101e2c');}else facadeWindow(xx,yy,zz,ww,hh,'z',id,t,peel);
 if(co===0)facadeWindow(x+sx*(b.w/2+.07),yy,z,.8,hh,'x',id+13,t,peel*.7);}
 // A warm line moves from liberated openings into the roof; not a whole-frame pulse.
 if(release>.04){let edgeY=y+b.h;line3([[x-b.w*.5,edgeY,z+sg*b.d*.5],[x+b.w*.5,edgeY,z+sg*b.d*.5]],release>.4?'#b99768':'#778282',2.2);}
 // Broken ledges and masonry establish material without a uniform grid.
 for(let j=0;j<Math.floor(b.h/7);j++){let yy=y+1+j*7;line3([[x-b.w*.5,yy,z+sg*(b.d*.5+.1)],[x+b.w*.5,yy,z+sg*(b.d*.5+.1)]],'#7b817f',1.6);}
 }
}
function windowWing(pos,w,h,t,id,open=1){let [x,y,z]=pos,ph=t*(4+hash(id)*2)+id,angle=.15+Math.sin(ph)*.30*open+(ATTACK[Math.max(0,Math.min(FRAME_COUNT-1,Math.floor(TIME*24)-(id===HERO_ID?0:(Math.abs(id)%7)*2)))]||0)*.72*open,fold=Math.cos(angle),dz=Math.sin(angle)*w;let warm=id%3?'#ecbe76':'#d98e5d';if(id===HERO_ID)warm=TIME>59?'#f0cf8d':'#dcad6d';
 quad([x-w*fold,y,z+dz],[x,y-.05,z],[x,y+h,z],[x-w*fold,y+h*.96,z+dz],warm,'#574c44',.10);
 quad([x,y-.05,z],[x+w*fold,y,z+dz],[x+w*fold,y+h*.96,z+dz],[x,y+h,z],warm,'#574c44',.10);
 if(w>1.4){for(let j=0;j<7;j++){let local=-w*.86+j*w*.25,hh=h*(.13+hash(j+8)*.32),right=local+w*.15;
 const gp=(q,v,off)=>[x+q*fold,y+v,z+Math.abs(q)*Math.sin(angle)+off];
 for(let off of[-.02,.02])quad(gp(local,0,off),gp(right,0,off),gp(right,hh,off),gp(local,hh,off),id===HERO_ID?(TIME<44.75?'#3c4850':TIME<59.125?'#182d49':TIME<65?'#8b866c':'#dbc58a'):'#3c4850');
 if(id===HERO_ID&&TIME<65){for(let off of[-.045,.045]){
 let col=TIME<44.75?'#3c4850':TIME<59.125?'#182d49':'#8b866c';
 if(j===2||j===5)polygon([gp(local,hh,off),gp(right,hh,off),gp((local+right)/2,hh+h*.075,off)],col);
 if(j===4)line3([gp((local+right)/2,hh,off),gp((local+right)/2,hh+h*.11,off)],col,1.3);
 for(let floor=0;floor<3;floor++){let v=h*.035+floor*h*.055;if(v+h*.025<hh)quad(gp(local+w*.04,v,off),gp(local+w*.07,v,off),gp(local+w*.07,v+h*.022,off),gp(local+w*.04,v+h*.022,off),'#c6a773');}
 }}
}}


 line3([[x,y,z-.06],[x,y+h,z-.06]],'#312e36',3);line3([[x-w*fold,y+h*.52,z+dz],[x+w*fold,y+h*.52,z+dz]],'#564435',1.5);
}
function ground(t,fade=0){
 quad([-4000,-.1,-4000],[4000,-.1,-4000],[4000,-.1,250],[-4000,-.1,250],'#101d2c');
 const h=ramp(t,6.5,16)*36;
 for(let z=-100;z<236;z+=8){if(z<cam.pos[2]-20||z>cam.pos[2]+700)continue;box(0,h-.7,z,7,.7,8.05,'#44535e','#233749','#7f857d');
 for(let x of[-1.35,1.35])quad([x-.11,h+.06,z-4],[x+.11,h+.06,z-4],[x+.11,h+.06,z+4],[x-.11,h+.06,z+4],'#b6ad91');
 for(let zz of[-3,0,3])box(0,h,z+zz,4,.13,.3,'#344454','#233449','#758077');
 if(z%32===28){box(-3.1,-.1,z,.5,h,.7,'#334653','#223749','#727b75');box(3.1,-.1,z,.5,h,.7,'#334653','#223749','#727b75');}}
 for(let i=0;i<90;i++){let z=hash(i+44)*300-60,x=(hash(i+56)-.5)*100,w=hash(i+12)*5;line3([[x,.02,z],[x+w,.02,z+.06]],i%3?'#394352':'#786650',1.7);}
 // Low sea wall makes the land-to-water boundary visible in the side glance.
 for(let x=-220;x<220;x+=14)box(x,0,247,14,2.6,4,'#536269','#253f50','#8b8c7b');
}

function sparks(t,n=60){for(let j=0;j<n;j++){let age=(t*.38+hash(j))%1,x=960+(hash(j+12)-.5)*1600*age,y=780-age*780+Math.sin(j)*25;s.globalAlpha=(1-age)*.30;s.strokeStyle=j%3?'#c7945f':'#88a1b4';s.lineWidth=1+hash(j)*2;s.beginPath();s.moveTo(x,y);s.lineTo(x+hash(j+3)*10-5,y+8+hash(j)*15);s.stroke();}s.globalAlpha=1;}
function atmosphere(t){let g=s.createLinearGradient(0,300,0,980);g.addColorStop(0,'rgba(106,141,159,0)');g.addColorStop(.58,'rgba(100,138,157,.07)');g.addColorStop(1,'rgba(22,37,57,0)');s.fillStyle=g;s.fillRect(0,0,W,H);}
function bigFragments(t){for(let j=0;j<16;j++){let start=5+hash(j+13)*3.5,u=ramp(t,start,start+4),x=(j%2?1:-1)*(13+hash(j+17)*21),y=12+u*44+hash(j)*12,z=55+hash(j+1)*94;box(x,y,z,2.5+hash(j+2)*3,5+hash(j)*8,2.5,'#526277','#273850','#a0a098');for(let r=0;r<3;r++)quad([x-.6,y+1+r*2.5,z-1.3],[x+.6,y+1+r*2.5,z-1.3],[x+.6,y+2.5+r*2.5,z-1.3],[x-.6,y+2.5+r*2.5,z-1.3],'#e7ba77',null,.10);for(let side of [-1,1])windowWing([x+side*(3.7+Math.sin(t*3+j)*.5),y+4,z],2.3,4,t,j+side,1);line3([[x,y,z],[x+1,y-6,z+1],[x+Math.sin(t+j)*2,y-9,z+2]],'#8c8a75',2);}}

// The camera is the traveller. There is no avatar, face, body or reflection.
// This frame is the inside of the carriage, seen from a seated eye position.
function carriageAperture(t){
 const open=ramp(t,2,4.5),pass=ramp(t,4.3,6.6),scale=1+pass*4;
 if(pass>=1)return;
 s.save();s.translate(960+Math.sin(t*8)*1.4*(1-pass),530+Math.sin(t*10)*.8);s.scale(scale,scale);
 const L=-785,R=785,T=-410,B=385;
 s.fillStyle='#172e3a';s.beginPath();s.rect(-4000,-3000,8000,6000);s.rect(L,T,R-L,B-T);s.fill('evenodd');
 // Painted wood, inset brass, rounded inner bevel, worn lower sill.
 s.strokeStyle='#354c56';s.lineWidth=44;s.strokeRect(L-22,T-22,R-L+44,B-T+44);
 s.strokeStyle='#968b71';s.lineWidth=14;s.strokeRect(L-4,T-4,R-L+8,B-T+8);
 s.strokeStyle='#d2b681';s.lineWidth=3;s.strokeRect(L+4,T+4,R-L-8,B-T-8);
 s.fillStyle='#26343b';s.fillRect(L-40,B+12,R-L+80,55);s.fillStyle='#735646';s.fillRect(-1100,B+73,2200,18);
 for(let x=-780;x<=780;x+=120){s.fillStyle='#b8a383';s.beginPath();s.arc(x,T-23,2.8,0,TAU);s.fill();s.beginPath();s.arc(x,B+43,2.8,0,TAU);s.fill();}
 // Two transparent panes swing away from our gaze. Their glass marks and
 // centre rail compress towards the hinges, leaving the view unobstructed.
 for(let side of [-1,1]){
   let hinge=side*782,edge=side*(open*775),width=Math.abs(hinge-edge),shift=36*Math.sin(open*Math.PI);
   s.fillStyle='rgba(108,146,155,.07)';s.fillRect(Math.min(hinge,edge),T,width,B-T);
   s.strokeStyle='#655d50';s.lineWidth=12;s.beginPath();s.moveTo(hinge,T);s.lineTo(edge,T+shift);s.lineTo(edge,B-shift);s.lineTo(hinge,B);s.stroke();
   s.strokeStyle='#c4ad80';s.lineWidth=2;s.beginPath();s.moveTo(edge-side*6,T+shift);s.lineTo(edge-side*6,B-shift);s.stroke();
   s.globalAlpha=(1-open)*.16;s.strokeStyle='#c4d1c7';s.lineWidth=7;s.beginPath();s.moveTo(hinge-side*width*.15,T+100);s.lineTo(hinge-side*width*.7,B-90);s.stroke();s.globalAlpha=1;
   // Small latch, object detail only; nobody operates it on screen.
   s.fillStyle='#ba9a62';s.fillRect(edge-7,120,14,40);s.fillRect(edge-side*32,151,36,8);
 }
 s.restore();
}
function trackFurniture(t){
 // Near objects cross the field quickly; the far city moves slowly.
 for(let z=-15;z<150;z+=27){for(let side of [-1,1]){let x=side*9;box(x,0,z,.28,10,.28,'#465662','#26374a','#898b7d');line3([[x,9.7,z],[x-side*2,10.4,z]],'#687873',3);}line3([[-9,10.3,z],[0,11,z+2],[9,10.3,z]],'#263644',2);}
}

function sea(t){
 quad([-4000,-2,250],[4000,-2,250],[4000,-2,4000],[-4000,-2,4000],'#345b69');
 // Horizontal strokes belong to world-space water, with parallax as we pass.
 for(let j=0;j<360;j++){let z=250+hash(j+81)*1250,x=(hash(j+71)-.5)*1400,len=3+hash(j)*40,y=-1.85+Math.sin(t*.65+j)*.12;
 quad([x,y,z],[x+len,y,z],[x+len+2,y,z+1],[x+1,y,z+1],['#577b83','#6b9291','#254c5d','#8b9c8f'][j%4]);}
 // Receding light on the water beyond the last threshold.
 for(let j=0;j<65;j++){let z=720+j*13,w=2+j*.18+Math.sin(j*4+t)*2,x=18+Math.sin(j*2)*5;quad([x-w,-1.5,z],[x+w,-1.5,z],[x+w*.7,-1.5,z+3],[x-w*.7,-1.5,z+3],j%3?'#bcac80':'#d8b97d');}
}
function causeway(t){
 for(let z=236;z<1450;z+=8){if(z<cam.pos[2]-20||z>cam.pos[2]+750)continue;let h=31*(1-ramp(z,236,355))+5,x=routeX(z),h2=31*(1-ramp(z+8,236,355))+5,x2=routeX(z+8);
 let lit=ramp(t,30+(z-265)/28,30.6+(z-265)/28),warm=z>665;
 quad([x-3.5,h,z],[x+3.5,h,z],[x2+3.5,h2,z+8],[x2-3.5,h2,z+8],warm?'#b3a07b':lit?'#92967f':'#58696d');
 for(let side of[-1,1])quad([x+side*3.5,h,z],[x+side*3.5,h-1.4,z],[x2+side*3.5,h2-1.4,z+8],[x2+side*3.5,h2,z+8],'#3e5860');
 for(let side of[-1,1])quad([x+side*1.35-.1,h+.08,z],[x+side*1.35+.1,h+.08,z],[x2+side*1.35+.1,h2+.08,z+8],[x2+side*1.35-.1,h2+.08,z+8],lit?'#d3bf8a':'#6c7978');
 for(let zz of[1,4,7]){let q=zz/8,xx=mix(x,x2,q),yy=mix(h,h2,q);box(xx,yy+.01,z+zz,4,.13,.28,'#4b5553','#283c48','#8b8e77');}
 if(z%24===20)for(let side of[-1,1])box(x+side*2.7,-2,z,.8,h+1,.95,'#617576','#344b56','#b3a28a');
 }
 // The unchosen straight spur remains dark where our illuminated branch turns.
 for(let z=300;z<432;z+=8){let h=31*(1-ramp(z,236,355))+4.6;
 quad([-2.9,h,z],[2.9,h,z],[2.9,h,z+8],[-2.9,h,z+8],'#3f535e');}
}
function shutterSignal(x,y,z,t,index){
 const onset=30+index*.48,open=ramp(t,onset,onset+.55),w=2.4,h=7.5;
 box(x,y-.4,z,5.8,8.3,1,'#8f8b75','#4c6267','#c3ac7c');
 quad([x-w,y,z-.55],[x+w,y,z-.55],[x+w,y+h,z-.55],[x-w,y+h,z-.55],open?'#f4dba0':'#1e3949');
 for(let side of[-1,1]){let hx=x+side*w,edge=hx-side*w*Math.cos(open*1.9),dz=-w*Math.sin(open*1.9);
 quad([hx,y,z-.62],[edge,y,z+dz-.62],[edge,y+h,z+dz-.62],[hx,y+h,z-.62],side<0?'#a97c51':'#80644e');
 for(let q of[.12,.86])line3([[mix(hx,edge,q),y+.4,z+dz*q-.66],[mix(hx,edge,q),y+h-.4,z+dz*q-.66]],'#cfb786',2.5);
 for(let yy of[1.3,3.7,6.2])line3([[hx, y+yy,z-.68],[edge,y+yy,z+dz-.68]],'#5f5548',2);}
 if(open>.01){
  const rx=routeX(z+12),hh=31*(1-ramp(z+12,236,355))+5.16;
  let reach=open;quad([x-1,-1.65,z-1],[x+1,-1.65,z+2],[mix(x,rx+5,reach),-1.65,z+21],[mix(x,rx-5,reach),-1.65,z+16],'#b4a276');
  quad([rx-3.25,hh,z+11],[rx+3.25,hh,z+11],[rx+3.25,hh,z+18],[rx-3.25,hh,z+18],'#d8c18c');
  for(let k=0;k<4;k++)line3([[mix(x,rx,k/4)-2,-1.6,z+3+k*3],[mix(x,rx,k/4)+2,-1.6,z+3+k*3]],'#d9bb7c',2.5);
 }
}

function islands(t){
 for(let j=0;j<10;j++){
 let side=j%2?1:-1,x=side*(j===0?12:20+hash(j+68)*14),z=270+j*22,y=1.5,w=7+hash(j+4)*6,deck=31*(1-ramp(z,236,355))+5,h=Math.max(16,deck+11);
 for(let k=0;k<7;k++){let a=k/7*TAU,b=(k+1)/7*TAU;polygon([[x,3,z],[x+Math.cos(a)*w,-2,z+Math.sin(a)*w*.7],[x+Math.cos(b)*w,-2,z+Math.sin(b)*w*.7]],k%2?'#3b5260':'#526573');}
 box(x,y,z,w*.55,h,w*.48,'#73847f','#435c64','#b1ac91');
 polygon([[x-w*.33,y+h,z-w*.3],[x+w*.33,y+h,z-w*.3],[x,y+h+5,z]],'#8c6a56');polygon([[x+w*.33,y+h,z-w*.3],[x+w*.33,y+h,z+w*.3],[x,y+h+5,z]],'#624f4a');
 shutterSignal(x,Math.max(6,deck+1),z-w*.25-.6,t,j);
 for(let r=0;r<5;r++)line3([[x-w*.3-r*.2,-1.55,z-8-r*3],[x+w*.3+r*.2,-1.55,z-8-r*3]],r%2?'#ac9872':'#708886',3);
 }
}
function cityMemory(t){
 const appear=ramp(t,38,44.72),spread=ramp(t,44.72,49);if(appear===0||t>55)return;
 const zz=travelZ(t)+25,xx=15+spread*4;
 for(let j=0;j<9;j++){
  const x=xx+(j-4)*2.1,z=zz+Math.sin(j*.8)*3,h=8+hash(j+28)*18;
  for(let k=0;k<7;k++){let u=k/7,v=(k+.85)/7,drift=Math.sin(t*1.5+k+j)*.55;
   quad([x+drift,-1.68,z+u*h],[x+1.6+drift,-1.68,z+u*h],[x+1.6-drift,-1.68,z+v*h],[x-drift,-1.68,z+v*h],k%3?'#213b50':'#2a4556');
   if(k%2===0)quad([x+.4+drift,-1.65,z+u*h+.3],[x+.8+drift,-1.65,z+u*h+.3],[x+.8+drift,-1.65,z+u*h+.65],[x+.4+drift,-1.65,z+u*h+.65],'#a6946d');
  }
  polygon([[x,-1.67,z+h],[x+1.6,-1.67,z+h],[x+.8,-1.67,z+h+2]],'#213b50');
 }
}

function cliffs(t){
 const release=ramp(t,44.75,53.25);
 for(let side of[-1,1])for(let j=0;j<19;j++){
 const z=455+j*9,x=side*(32+Math.sin(j*.58)*5+release*(10+hash(j+61)*22)),h=18+hash(j+side+133)*24,w=8+hash(j+201)*12;
 polygon([[x-side*w,-2,z-7],[x+side*w,-2,z-7],[x+side*w*.7,h*.8,z+1],[x,h,z-3],[x-side*w*.3,h*.7,z-9]],j%3?'#455f69':'#66797b');
 polygon([[x+side*w,-2,z-7],[x+side*w,-2,z+9],[x+side*w*.7,h*.8,z+1]],'#2b4555');
 line3([[x,h,z-3],[x-side*w*.3,h*.7,z-9],[x-side*w*.6,3,z-8]],'#93998a',2);
 }
}
function threshold(t){
 const z=665,base=2,top=55,w=21,ang=ramp(t,59.125,64.2)*Math.PI*.49;
 for(let side of[-1,1]){box(side*(w+2),base,z,4,top-base,5,'#9c9783','#65797a','#cebd96');box(side*(w+2),base,z,5,2,6,'#767f78','#48636c','#b8ae91');}
 box(0,top,z,48,4,6,'#b2a58b','#63797c','#d7c49b');
 // Carved horizontal marks and an arch of individual stones give the gate weight.
 for(let side of[-1,1])for(let y=8;y<top;y+=6)line3([[side*(w+.1),y,z-2.6],[side*(w+3.9),y,z-2.6]],'#566d72',2);
 for(let side of[-1,1]){
 let hinge=side*w,edge=side*w-side*Math.cos(ang)*w,away=Math.sin(ang)*w;
 const p=(q,y,off=0)=>[mix(hinge,edge,q),y,z+away*q+off];
 quad(p(0,base),p(1,base),p(1,top),p(0,top),side<0?'#996c4e':'#755345');
 for(let q of[.08,.92])line3([p(q,base+2,-.1),p(q,top-2,-.1)],'#c8a777',5);
 for(let y of[base+3,19,37,top-3])line3([p(.08,y,-.1),p(.92,y,-.1)],'#c8a777',5);
 for(let k=0;k<5;k++)line3([p(.18+k*.16,base+5,-.05),p(.18+k*.16,top-5,-.05)],'#6b584c',1.5);
 let pp=p(.84,23,-.25);circle3(pp[0],pp[1],pp[2],.6,'z','#d5b378');
 }
}

// Architectural performers: detailed silhouettes, hinged window wings and
// trailing pipes. No human figure or traveller is drawn.
function flyingHouse(t,id){
 const h=id%3===0?13:8,w=id%3===1?8:5,d=5;
 box(0,0,0,w,h,d,['#5e737b','#866e65','#667f7c'][id%3],'#304653','#a8aa97');
 box(0,-.7,0,w+1,.7,d+.8,'#77776c','#334a53','#a39b82');
 for(let sg of[-1,1])polygon([[-w*.58,h,sg*d*.55],[w*.58,h,sg*d*.55],[0,h+3.6,sg*d*.55]],'#9f6d50');
 quad([-w*.58,h,-d*.55],[0,h+3.6,-d*.55],[0,h+3.6,d*.55],[-w*.58,h,d*.55],'#80544a');
 quad([0,h+3.6,-d*.55],[w*.58,h,-d*.55],[w*.58,h,d*.55],[0,h+3.6,d*.55],'#b18460');
 box(w*.24,h+1.2,.7,.8,3,.8,'#8e8876','#546472','#c3b394');
 for(let row=0;row<3;row++)for(let col of[-1,1]){
 let x=col*w*.26,y=1.4+row*(h-2)/3;
 for(let sg of[-1,1]){quad([x-.6,y,sg*2.55],[x+.6,y,sg*2.55],[x+.6,y+1.6,sg*2.55],[x-.6,y+1.6,sg*2.55],'#edc381');line3([[x,y,sg*2.59],[x,y+1.6,sg*2.59]],'#635549',2);line3([[x-.75,y-.15,sg*2.61],[x+.75,y-.15,sg*2.61]],'#c3b692',2);}
 }
 if(id%3===0){circle3(0,h-1.3,-2.57,1.1,'z','#d6c49d');let a=t*.4;line3([[0,h-1.3,-2.6],[Math.sin(a)*.7,h-1.3+Math.cos(a)*.7,-2.6]],'#3b4647',3);}
 for(let side of[-1,1])windowWing([side*(w*.5+2.1),h*.32,0],3.5,5,t,id*13+side,1.45);
 for(let j=0;j<3;j++)line3([[(j-1)*1.5,-.5,0],[(j-1)*1.5+Math.sin(t*1.2+j),-3-j*.7,1],[(j-1)*1.5+Math.sin(t+j)*2,-4-j,2]],'#938c74',2);
}
const encounters=[
 {a:3,b:10,id:0,side:-1,scale:.7,up:7},
 {a:12,b:20,id:1,side:1,scale:1.05,up:11},
 {a:21,b:29,id:2,side:-1,scale:1.25,up:3},
 {a:32,b:40,id:3,side:1,scale:.85,up:6},
 {a:40,b:48,id:4,side:-1,scale:1.05,up:3},
 {a:48,b:56,id:5,side:1,scale:.65,up:9}
];
function encountersAt(t){
 for(let e of encounters){if(e.a>=21||t<e.a||t>e.b)continue;let u=(t-e.a)/(e.b-e.a),mid=(e.a+e.b)/2;
 let x=e.side*mix(51,-57,sm(u)),z=travelZ(mid)+35+u*7,y=eyeHeight(mid)+e.up+Math.sin(u*Math.PI)*3;
 place([x,y,z],e.side*(.32+u*.85),e.side*Math.sin(u*TAU)*.16,e.scale,()=>flyingHouse(t,e.id));
 }
}
function flock(t){
 // Distinct passages with readable gaps. The first single window is the seed;
 // subsequent passages gather into a ribbon and ultimately lead through the door.
 const passages=[{a:3.2,b:8,n:5,side:1},{a:8,b:14,n:11,side:-1},{a:18,b:24,n:9,side:1}];
 for(let e of passages){for(let j=0;j<e.n;j++){
 let u=(t-e.a-j*.095)/(e.b-e.a);if(u<0||u>1)continue;
 let mid=(e.a+e.b)/2,z=travelZ(mid)+18+(j%4)*5+u*14;
 let x=e.side*(mix(26,-32,u)+Math.sin(u*Math.PI)*5)+Math.sin(j*2.4)*2;
 let y=eyeHeight(mid)+1+Math.sin(u*Math.PI)*(e.a<1?3:7)+(j%5)*1.05;
 let size=j===0?1.65:.65+hash(j+51)*.65;
 place([x,y,z],Math.sin(u*TAU+j)*.32,e.side*(u-.5)*.7,1,()=>windowWing([0,0,0],size,size*1.65,t,330+j,1.5));
 }}
}

// No airborne buildings accompany the traveller beyond the shore.

function musicAt(t){return MUSIC[Math.min(FRAME_COUNT-1,Math.floor(t*24))]||[0,0,0,0];}

// The opening window leaves the scene early; it is not a permanent guide.
const heroKeys=[
 [4.4,-4,3,20,.08,1],[6.2,4,5,25,.10,1],[8.2,23,16,28,.3,.9],[10.5,90,40,35,.6,.7]
];

function heroState(t){
 let right=heroKeys.findIndex(k=>k[0]>=t);if(right<0)right=heroKeys.length-1;
 let a=heroKeys[Math.max(0,right-1)],b=heroKeys[right],u=a===b?0:ramp(t,a[0],b[0]);
 const k=a.map((x,i)=>mix(x,b[i],u));
 let x=k[1],y=eyeHeight(t)+k[2],z=travelZ(t)+k[3],detach=ramp(t,.85,4.4);
 const home=buildings[9],cols=Math.max(2,Math.floor(home.w/2.4));
 const anchor=[home.x-home.w*.5+1+.5*(home.w-2)/cols,5.5,home.z-home.d/2-.2];
 return {pos:[mix(anchor[0],x,detach),mix(anchor[1],y,detach),mix(anchor[2],z,detach)],bank:k[4]*detach,scale:mix(.48,k[5],detach),detach};
}
function travellingWindow(t){
 if(t>10.5)return;
 const h=heroState(t),m=musicAt(t),answer=ramp(t,59.125,68);
 place(h.pos,.16*Math.sin(t*.65)*h.detach,h.bank+.015*Math.sin(t*1.8),h.scale,()=>{
   windowWing([0,0,0],2.3,4.6,t,HERO_ID,h.detach*(1+answer*.25));
   // Worn brass outer corners make this one readable amongst the flock.
   // The pane leaves the frame rather than hovering over every scene.
 });
}
function sunPerformance(t){
 if(t<59.12)return;
 const point=project([0,240,1900]);if(!point)return;
 const m=musicAt(t),sing=ramp(t,59.125,61.2),release=1-ramp(t,66.2,69),radius=970*90/point[2];
 s.save();s.globalAlpha=ramp(t,59.12,60);s.translate(point[0],point[1]);
 if(sing*release>0){for(let j=0;j<28;j++){
  const a=j/28*TAU,base=radius*1.08,tip=base+sing*release*radius*(.30+hash(j)*.36+m[j%2+1]*.35);
  s.fillStyle=j%3?'#d6b478':'#b18f67';s.beginPath();s.moveTo(Math.cos(a-.021)*base,Math.sin(a-.021)*base);s.lineTo(Math.cos(a+.021)*base,Math.sin(a+.021)*base);s.lineTo(Math.cos(a)*tip,Math.sin(a)*tip);s.closePath();s.fill();
 }}
 s.fillStyle='#e9c38b';s.beginPath();s.arc(0,0,radius,0,TAU);s.fill();s.restore();
}
function sunWindows(t){
 if(t<59.12||t>70)return;
 const gather=ramp(t,59.12,62.5),depart=ramp(t,65.5,69.5);
 for(let j=0;j<12;j++){
  const a=j/12*TAU+clamp(t-62.5,0,3)*.7,rad=19+(1-gather)*(30+hash(j)*25);
  let x=routeX(755)+Math.cos(a)*rad+depart*(j%2?80:-80),y=30+Math.sin(a)*rad*.8-depart*14,z=755+(1-gather)*Math.sin(j)*30-depart*(80+j*4);
  place([x,y,z],Math.sin(a)*.25,a*.12,1,()=>windowWing([0,0,0],2.1,4.5,t,700+j,1.4));
 }
 // The released light has a destination on the rail bed, which we pass over.
 for(let j=0;j<9;j++){
  let on=59.12+j*.65,level=ramp(t,on,on+.24)*(1-ramp(t,on+1.2,on+2.1));if(level<=0)continue;
  let z=690+j*9,w=3.3;quad([routeX(z)-w,5.22,z],[routeX(z)+w,5.22,z],[routeX(z)+w,5.22,z+6],[routeX(z)-w,5.22,z+6],level>.5?'#ead4a1':'#c3b184');
 }
}
function garden(t){
 if(travelZ(t)<320)return;
 for(let side of[-1,1]){
  // Raised causeway gardens belong to the approaching land, visible before entry.
  for(let k=0;k<28;k++){
   let z=785+k*7,x=routeX(z)+side*(8+hash(k+71)*16),h=1.5+hash(k)*2.8;
   if(!inView([x,h+2,z],7))continue;
   box(x,-1.5,z,5,h,7,'#718079','#425f63','#9b9c7f');
   for(let j=0;j<7;j++){
    let xx=x+(j-3)*.5,zz=z+Math.sin(j)*2,top=h+1+hash(k+j)*3,bend=Math.sin(t*.7+k+j)*.5;
    line3([[xx,h-1.5,zz],[xx+bend,top,zz+.5]],j%2?'#969977':'#5b766a',2.2);
    polygon([[xx,h-1,zz],[xx+bend+(j%2?1.3:-1.3),top*.65,zz+.2],[xx+bend,top,zz+.5]],j%3?'#8a9b7e':'#b0b08b');
   }
  }
  // A pair of road lanes physically curls away, making room for the narrow route.
  let open=ramp(t,73.72,80);
  for(let j=0;j<20;j++){
   let u=j/20,v=(j+1)/20,z=815+u*50,z2=815+v*50;
   let x=routeX(z)+side*(8+open*u*u*20),x2=routeX(z2)+side*(8+open*v*v*20),y=3+open*u*u*17,y2=3+open*v*v*17;
   quad([x-2.2,y,z],[x+2.2,y,z],[x2+2.2,y2,z2],[x2-2.2,y2,z2],'#66706b');
   if(j%2===0)quad([x-.12,y+.1,z],[x+.12,y+.1,z],[x2+.12,y2+.1,z2],[x2-.12,y2+.1,z2],'#cab889');
  }
  let tilt=ramp(t,73.72,78),x=routeX(814)+side*11,z=814;
  box(x,3,z,.35,9,.35,'#626d69','#344d57','#b3ae88');
  place([x,12,z],0,side*tilt*1.5,1,()=>{box(0,0,0,1.1,2.8,.75,'#505751','#283f4d','#a7a283');for(let j=0;j<3;j++)circle3(0,.5+j*.85,-.42,.24,'z',j===2?'#c5b87d':'#304b4e');});
 }
 for(let z of[847,949])bentLamp(z,t);
 // A deep masonry arch provides a readable foreground occlusion before the return.
 const z=892,ax=routeX(z);
 for(let side of[-1,1])box(ax+side*6.2,4,z,3.2,16,10,'#728080','#3a5662','#b0aa8d');
 box(ax,20,z,15.6,3.5,10,'#8d9183','#4b6169','#c1b28b');
 for(let side of[-1,1])polygon([[ax+side*4.6,16,z-5.1],[ax+side*4.6,20,z-5.1],[ax+side*1.8,20,z-5.1]],'#939580');
}
function bentLamp(z,t){
 const x=routeX(z)+7;
 box(x,5,z,1.8,1.4,1.8,'#8b8874','#4d6566','#b8ad87');
 line3([[x,6,z],[x,11,z],[x-1.2,14,z],[x-4,14.5,z]],'#53635f',5);
 line3([[x,11,z],[x-3,11.8,z]],'#7b806c',3);
 box(x-4,12.5,z,1.8,2,.9,'#d6bc7d','#777967','#c5b183');
 polygon([[x-5.15,14.5,z-.65],[x-2.85,14.5,z-.65],[x-4,15.3,z]],'#5d726d');
 line3([[x-4.7,12.6,z-.5],[x-3.7,13.25,z-.5],[x-4.3,13.65,z-.5],[x-3.3,14.3,z-.5]],'#50635e',2);
 polygon([[x-3.7,5.19,z],[x-.5,5.19,z],[x-4,5.19,z+12]],'#66786d');
 // The same two little ledge stones establish identity without a coloured badge.
 box(x+.4,6.4,z+.2,.8,.5,.5,'#b7a989','#66786b','#d0bd92');
}
function carriageEdge(t){
 if(t<6.6)return;
 s.save();s.fillStyle='#253a43';s.beginPath();s.moveTo(0,1028);s.quadraticCurveTo(950,1084,1920,1028);s.lineTo(1920,1080);s.lineTo(0,1080);s.fill();
 s.strokeStyle='#a99a76';s.lineWidth=8;s.beginPath();s.moveTo(0,1030);s.quadraticCurveTo(950,1084,1920,1030);s.stroke();
 s.strokeStyle='#526465';s.lineWidth=2;s.beginPath();s.moveTo(0,1042);s.quadraticCurveTo(960,1088,1920,1042);s.stroke();s.restore();
}

const SHOTS=[{a:0,b:6,key:'window-release'},{a:6,b:15,key:'city-rises'},{a:15,b:23,key:'shore-departure'},{a:23,b:30,key:'island-approach'},{a:30,b:38,key:'vocal-shutters-answer'},{a:38,b:44.72,key:'take-lit-branch'},{a:44.72,b:53.28,key:'memory-on-water'},{a:53.28,b:59.12,key:'door-approach'},{a:59.12,b:66,key:'sun-window-response'},{a:66,b:73.72,key:'pass-the-spectacle'},{a:73.72,b:84.14,key:'roads-curl-away'},{a:84.14,b:90,key:'landmark-returns'}];
window.EDIT=SHOTS.map((o,i)=>({...o,id:i+1,startFrame:Math.round(o.a*24),endFrame:Math.round(o.b*24)}));

function renderFrame(t){
 t=clamp(t,0,DURATION-.001);TIME=t;
 for(let g of[s,f,mask]){g.setTransform(.5,0,0,.5,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);}
 ink.clearRect(0,0,W,H);f.fillStyle='#000';f.fillRect(0,0,W,H);mask.fillStyle='#000';mask.fillRect(0,0,W,H);faces=[];
 const free=ramp(t,4.3,7.5),rise=ramp(t,6.5,16),late=ramp(t,6,16),z=travelZ(t);
 const glance=(ramp(t,.4,2.5)-ramp(t,3.3,6.4))*9;
 const eyeY=eyeHeight(t),eyeX=routeX(z)+Math.sin(t*.35)*free*.28;
 const cityLook=(ramp(t,18.7,21)-ramp(t,23.2,26))*-.95;
 const firstShutter=(ramp(t,28.7,29.8)-ramp(t,31.1,34))*-.17;
 const reflectionLook=(ramp(t,40,43)-ramp(t,49,52))*.42;
 const yaw=cityLook+firstShutter+reflectionLook;
 let targetY=eyeY+2+rise*5*(1-ramp(t,18,26))-1.8*ramp(t,27,34);
 targetY-=4*(ramp(t,40,43)-ramp(t,49,52));
 targetY+=7*(ramp(t,59.12,61.4)-ramp(t,65.7,68));
 const lens=t>=38&&t<44.72?1110:970;
 camera([eyeX,eyeY,z],[routeX(z+38)+Math.sin(yaw)*38+glance,targetY,z+Math.cos(yaw)*38],lens,.004*Math.sin(t*.8));
 window.__cameraState={time:t,position:[...cam.pos],forward:[...cam.fw],hero:heroState(t)};
 sky(t,late);
 sunPerformance(t);
 sea(t);if(t<35)ground(t);if(t<28)trackFurniture(t);city(t,late);causeway(t);islands(t);cityMemory(t);cliffs(t);threshold(t);travellingWindow(t);encountersAt(t);flock(t);sunWindows(t);garden(t);
 if(t>5&&t<28)bigFragments(t);
 flush();atmosphere(t);
 // Rain belongs to the glass and disappears as we pass through it.
 if(t<6){s.globalAlpha=.12*(1-ramp(t,3,6));for(let j=0;j<65;j++){let x=hash(j)*1920,y=(hash(j+300)*1200+t*55)%1200;s.strokeStyle='#b4c2c3';s.lineWidth=1.3;s.beginPath();s.moveTo(x,y);s.lineTo(x-7,y+28+hash(j+42)*40);s.stroke();}s.globalAlpha=1;}
 carriageAperture(t);carriageEdge(t);sparks(t,t>9&&t<25?12:0);
 Paint.present(t,{boil:6,strokeK:.46,impasto:.32,ground:.015,groundCol:'#10192c',gap:.01,fauve:.14,shadowTint:'#19294d',hiTint:'#f1c68b',flowK:.16,flowAng:-.16,flowBias:.65,bloom:.55,grain:.025,vig:.24,dash:.04,smear:[0,0],inkSoft:.5,wave:[.25,.009,.003,.8],waveK:.2});
}
const canvas=document.getElementById('c');Paint.init(canvas);window.__render=renderFrame;window.__frameJPEG=(t,q=.94)=>{renderFrame(t);return canvas.toDataURL('image/jpeg',q)};window.__ready=true;
const audioEl=document.getElementById('a'),offline=new URLSearchParams(location.search).has('offline');if(offline){document.body.classList.add('offline');renderFrame(0);}else{audioEl.currentTime=0;canvas.onclick=()=>audioEl.paused?audioEl.play():audioEl.pause();function loop(){if(audioEl.currentTime>=DURATION){audioEl.pause();audioEl.currentTime=0;}renderFrame(audioEl.currentTime);requestAnimationFrame(loop);}loop();}
