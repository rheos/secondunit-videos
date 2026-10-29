/* Night Departure. Original scene, geometry and animation. Renderer attribution in LICENSE-functional-emotions. */
const s=Paint.sctx,f=Paint.fctx,ink=Paint.ictx,mask=Paint.mctx;
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,sm=x=>{x=clamp(x);return x*x*(3-2*x)},ramp=(t,a,b)=>sm((t-a)/(b-a)),hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)},vadd=(a,b)=>a.map((n,i)=>n+b[i]),sub=(a,b)=>a.map((n,i)=>n-b[i]),mul=(a,n)=>a.map(v=>v*n),dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0),norm=a=>mul(a,1/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
let cam,faces=[],lines=[],TIME=0;
function camera(pos,target,lens=950,roll=0){let fw=norm(sub(target,pos)),rt=norm(cross(fw,[0,1,0])),up=cross(rt,fw);cam={pos,fw,rt,up,lens,roll};}
function project(p){let q=sub(p,cam.pos),z=dot(q,cam.fw);if(z<.6)return null;let x=dot(q,cam.rt)*cam.lens/z,y=-dot(q,cam.up)*cam.lens/z;return [960+x*Math.cos(cam.roll)-y*Math.sin(cam.roll),540+x*Math.sin(cam.roll)+y*Math.cos(cam.roll),z];}
function clipNear(pts){let out=[];for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],za=dot(sub(a,cam.pos),cam.fw),zb=dot(sub(b,cam.pos),cam.fw);if(za>=.65)out.push(a);if((za>=.65)!==(zb>=.65)){let q=(.65-za)/(zb-za);out.push(a.map((v,j)=>mix(v,b[j],q)));}}return out;}
function polygon(pts,c,edge,glow=0){pts=clipNear(pts);if(pts.length<3)return;let ps=pts.map(project);if(ps.some(p=>!p))return;let z=ps.reduce((a,p)=>a+p[2],0)/ps.length;if(ps.every(p=>p[0]<-150)||ps.every(p=>p[0]>2070)||ps.every(p=>p[1]<-150)||ps.every(p=>p[1]>1230))return;faces.push({ps,c,edge,glow,z});}
function line3(pts,c,w=1){let ps=pts.map(project);if(ps.some(p=>!p))return;faces.push({ps,c,w,z:ps.reduce((a,p)=>a+p[2],0)/ps.length,line:true});}
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
function city(t,lift=0){
 let allRise=ramp(lift,0,.94)*36;
 // Separate torn foundations leave the traveller a clear corridor through the rising city.
 if(allRise>.1){let y=allRise-.5;for(let side of [-1,1])box(side*30,y-2,94,28,2,310,'#27384a','#1b2a3b','#33444e');for(let j=0;j<24;j++){let x=(j%2?1:-1)*(36+hash(j)*4),z=-55+hash(j+11)*290;polygon([[x-3,y-2,z-3],[x+3,y-2,z-3],[x+hash(j)*2,y-7-hash(j+3)*9,z+1]],'#233449');line3([[x,y-3,z],[x+Math.sin(t+j)*1.3,y-12,z+2],[x+Math.sin(t*.6+j)*3,y-18,z+5]],'#756e5f',1.8);}}
 for(let b of buildings){let release=ramp(lift,hash(b.id+39)*.045,.91),rise=release*36,sway=release*Math.sin(t*.35+b.id)*.4,x=b.x+sway,y=rise,z=b.z;
 let col=['#3f4d56','#48515b','#435460','#535259','#555751'][b.id%5],side=['#233347','#263849','#293445'][b.id%3];box(x,y,z,b.w,b.h,b.d,col,side,'#8e8d83');box(x,y+b.h,z,b.w+.7,.6,b.d+.7,'#667379','#354957','#95968b');
 if(b.id%4===0){box(x+.6,y+b.h+.7,z,2,3,2,'#495761','#283b4d','#8e8e82');line3([[x+.6,y+b.h+3.7,z],[x+.6,y+b.h+8,z]],'#a9aba0',1.8);}
 if(b.id%5===1){for(let sig of[-1,1])polygon([[x-b.w*.56,y+b.h+.8,z+sig*b.d*.52],[x+b.w*.56,y+b.h+.8,z+sig*b.d*.52],[x,y+b.h+5,z+sig*b.d*.52]],'#785f59');}
 if(b.id%7===2){for(let j=0;j<3;j++)box(x,y+b.h+j*1.8,z,b.w*(.8-j*.18),1.8,b.d*(.8-j*.18),'#59616b','#273b4c','#88918e');}
 if(b.id===19){box(x,y+b.h,z,b.w*.48,11,b.d*.48,'#68787a','#3b5062','#aaa48c');for(let k=0;k<5;k++)line3([[x-b.w*.24,y+b.h+2+k*1.6,z-b.d*.25],[x+b.w*.24,y+b.h+2+k*1.6,z-b.d*.25]],'#d0bc8b',2);}
 let cols=Math.max(2,Math.floor(b.w/2.4)),rows=Math.floor((b.h-3)/3.5),sg=Math.sign(cam.pos[2]-z),sx=Math.sign(cam.pos[0]-x);
 for(let row=0;row<rows;row++)for(let co=0;co<cols;co++){let id=b.id*91+row*7+co;if(hash(id+45)<.5)continue;let xx=x-b.w*.5+1+(co+.5)*(b.w-2)/cols,yy=y+2+row*3.5,zz=z+sg*(b.d/2+.07),ww=.66+hash(id)*.3,hh=1.9;let peel=ramp(t,8.8+hash(id)*3.7,11+hash(id)*3.7)*(.6+release);facadeWindow(xx,yy,zz,ww,hh,'z',id,t,peel);
 if(co===0)facadeWindow(x+sx*(b.w/2+.07),yy,z,.8,hh,'x',id+13,t,peel*.7);}
 // A warm line moves from liberated openings into the roof; not a whole-frame pulse.
 if(release>.04){let edgeY=y+b.h;line3([[x-b.w*.5,edgeY,z+sg*b.d*.5],[x+b.w*.5,edgeY,z+sg*b.d*.5]],release>.4?'#b99768':'#778282',2.2);}
 // Broken ledges and masonry establish material without a uniform grid.
 for(let j=0;j<Math.floor(b.h/7);j++){let yy=y+1+j*7;line3([[x-b.w*.5,yy,z+sg*(b.d*.5+.1)],[x+b.w*.5,yy,z+sg*(b.d*.5+.1)]],'#7b817f',1.6);}
 }
}
function windowWing(pos,w,h,t,id,open=1){let [x,y,z]=pos,ph=t*(4+hash(id)*2)+id,angle=.3+Math.sin(ph)*.55*open,fold=Math.cos(angle),dz=Math.sin(angle)*w;let warm=id%3?'#ecbe76':'#d98e5d';
 quad([x-w*fold,y,z+dz],[x,y-.05,z],[x,y+h,z],[x-w*fold,y+h*.96,z+dz],warm,'#574c44',.10);
 quad([x,y-.05,z],[x+w*fold,y,z+dz],[x+w*fold,y+h*.96,z+dz],[x,y+h,z],warm,'#574c44',.10);
 if(w>1.4){for(let j=0;j<7;j++){let local=-w*.86+j*w*.25,hh=h*(.13+hash(j+8)*.32),right=local+w*.15;
 const gp=(q,v,off)=>[x+q*fold,y+v,z+Math.abs(q)*Math.sin(angle)+off];
 for(let off of[-.02,.02])quad(gp(local,0,off),gp(right,0,off),gp(right,hh,off),gp(local,hh,off),'#3c4850');}}

 if(id===71)quad([x-w*fold,y,z+dz-.04],[x-w*.68*fold,y,z+dz-.04],[x-w*.68*fold,y+h*.14,z+dz-.04],[x-w*fold,y+h*.14,z+dz-.04],'#a45245');
 line3([[x,y,z-.06],[x,y+h,z-.06]],'#312e36',3);line3([[x-w*fold,y+h*.52,z+dz],[x+w*fold,y+h*.52,z+dz]],'#564435',1.5);
}
function ground(t,fade=0){quad([-4000,-.1,-4000],[4000,-.1,-4000],[4000,-.1,250],[-4000,-.1,250],'#101d2c');
 for(let z=-70;z<300;z+=3){let col=z%6===0?'#435367':'#25364d';box(0,.04,z,8,.2,.4,col,'#1d273a',col);}for(let x of [-1.35,1.35])for(let z=-90;z<400;z+=5){quad([x-.10,.28,z],[x+.1,.28,z],[x+.1,.28,z+5],[x-.1,.28,z+5],'#a6a194');}
 for(let i=0;i<90;i++){let z=hash(i+44)*350-60,x=(hash(i+56)-.5)*100,w=hash(i+12)*5;line3([[x,.02,z],[x+w,.02,z+.06]],i%3?'#394352':'#786650',1.7);}
}
function sparks(t,n=60){for(let j=0;j<n;j++){let age=(t*.38+hash(j))%1,x=960+(hash(j+12)-.5)*1600*age,y=780-age*780+Math.sin(j)*25;s.globalAlpha=(1-age)*.30;s.strokeStyle=j%3?'#c7945f':'#88a1b4';s.lineWidth=1+hash(j)*2;s.beginPath();s.moveTo(x,y);s.lineTo(x+hash(j+3)*10-5,y+8+hash(j)*15);s.stroke();}s.globalAlpha=1;}
function atmosphere(t){let g=s.createLinearGradient(0,300,0,980);g.addColorStop(0,'rgba(106,141,159,0)');g.addColorStop(.58,'rgba(100,138,157,.07)');g.addColorStop(1,'rgba(22,37,57,0)');s.fillStyle=g;s.fillRect(0,0,W,H);}
function bigFragments(t){for(let j=0;j<16;j++){let start=10+hash(j+13)*2.5,u=ramp(t,start,start+4),x=(j%2?1:-1)*(13+hash(j+17)*21),y=12+u*44+hash(j)*12,z=55+hash(j+1)*94;box(x,y,z,2.5+hash(j+2)*3,5+hash(j)*8,2.5,'#526277','#273850','#a0a098');for(let r=0;r<3;r++)quad([x-.6,y+1+r*2.5,z-1.3],[x+.6,y+1+r*2.5,z-1.3],[x+.6,y+2.5+r*2.5,z-1.3],[x-.6,y+2.5+r*2.5,z-1.3],'#e7ba77',null,.10);for(let side of [-1,1])windowWing([x+side*(3.7+Math.sin(t*3+j)*.5),y+4,z],2.3,4,t,j+side,1);line3([[x,y,z],[x+1,y-6,z+1],[x+Math.sin(t+j)*2,y-9,z+2]],'#8c8a75',2);}}

// The camera is the traveller. There is no avatar, face, body or reflection.
// This frame is the inside of the carriage, seen from a seated eye position.
function carriageAperture(t){
 const open=ramp(t,4.5,7.2),pass=ramp(t,6.8,9.2),scale=1+pass*4;
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
function causeway(){
 // The rail bed becomes a slender stone viaduct, then ends before the door.
 for(let z=236;z<610;z+=8){let h=31*(1-ramp(z,236,355))+5;box(0,h-1,z,7,1,8.05,'#56656a','#344951','#879289');
 for(let x of[-1.35,1.35])quad([x-.1,h+.08,z-4],[x+.1,h+.08,z-4],[x+.1,h+.08,z+4],[x-.1,h+.08,z+4],'#c1b590');
 for(let zz of[-3,0,3])box(0,h+.01,z+zz,4,.13,.34,'#3f4546','#283c48','#697772');
 if(z%24===20){for(let side of[-1,1])box(side*2.7,-2,z,.8,h+1,.95,'#617576','#344b56','#b3a28a');}
 }
}
function islands(t){
 for(let j=0;j<12;j++){
 let side=j%2?1:-1,x=side*(27+hash(j+68)*55),z=285+j*23,y=1+hash(j)*3,w=8+hash(j+4)*12,h=8+hash(j+1)*18;
 for(let k=0;k<7;k++){let a=k/7*TAU,b=(k+1)/7*TAU;polygon([[x, y+3,z],[x+Math.cos(a)*w,-2,z+Math.sin(a)*w*.7],[x+Math.cos(b)*w,-2,z+Math.sin(b)*w*.7]],k%2?'#3b5260':'#526573');}
 box(x,y,z,w*.55,h,w*.48,'#73847f','#435c64','#b1ac91');
 polygon([[x-w*.33,y+h,z-w*.3],[x+w*.33,y+h,z-w*.3],[x,y+h+5,z]],'#8c6a56');polygon([[x+w*.33,y+h,z-w*.3],[x+w*.33,y+h,z+w*.3],[x,y+h+5,z]],'#624f4a');
 for(let row=0;row<3;row++){quad([x-1,y+2+row*h/3,z-w*.245],[x+1,y+2+row*h/3,z-w*.245],[x+1,y+4+row*h/3,z-w*.245],[x-1,y+4+row*h/3,z-w*.245],'#e3bb7c');}
 // A lighthouse lantern sends its beam across the water, not at the camera.
 if(j===4||j===9){box(x,y+h,z,3,7,3,'#aaa993','#526a72','#d4c49a');circle3(x,y+h+5,z-1.55,.8,'z','#f2ce8c');let a=t*.24+j;line3([[x,y+h+5,z],[x+Math.sin(a)*24,y+h-1,z+Math.cos(a)*22]],'#d6bb86',2);}
 for(let r=0;r<5;r++){let yy=-1.55,zz=z-8-r*4;line3([[x-w*.25-r*.2,yy,zz],[x+w*.25+r*.2,yy,zz]],r%2?'#ac9872':'#708886',3);}
 }
}
function cliffs(){
 for(let side of[-1,1])for(let j=0;j<19;j++){
 const z=455+j*9,x=side*(24+Math.sin(j*.58)*7),h=22+hash(j+side+133)*36,w=8+hash(j+201)*12;
 polygon([[x-side*w,-2,z-7],[x+side*w,-2,z-7],[x+side*w*.7,h*.8,z+1],[x,h,z-3],[x-side*w*.3,h*.7,z-9]],j%3?'#455f69':'#66797b');
 polygon([[x+side*w,-2,z-7],[x+side*w,-2,z+9],[x+side*w*.7,h*.8,z+1]],'#2b4555');
 line3([[x,h,z-3],[x-side*w*.3,h*.7,z-9],[x-side*w*.6,3,z-8]],'#93998a',2);
 }
}
function threshold(t){
 const z=665,base=2,top=55,w=21,ang=ramp(t,55,63.5)*Math.PI*.49;
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
const SHOTS=[{a:0,b:4.5,key:'through-the-glass'},{a:4.5,b:7.2,key:'panes-open'},{a:7.2,b:10,key:'cross-the-threshold'},{a:10,b:14,key:'windows-take-flight'},{a:14,b:17.5,key:'among-the-roofs'},{a:17.5,b:26,key:'leave-the-city'},{a:26,b:38,key:'viaduct-over-water'},{a:38,b:46,key:'island-lanterns'},{a:46,b:55,key:'stone-passage'},{a:55,b:65,key:'the-door-opens'},{a:65,b:72,key:'towards-the-sun'}];
window.EDIT=SHOTS.map((o,i)=>({...o,id:i+1,startFrame:o.a*24,endFrame:o.b*24}));
function renderFrame(t){
 t=clamp(t,0,71.999);TIME=t;
 for(let g of[s,f,mask]){g.setTransform(.5,0,0,.5,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);}
 ink.clearRect(0,0,W,H);f.fillStyle='#000';f.fillRect(0,0,W,H);mask.fillStyle='#000';mask.fillRect(0,0,W,H);faces=[];
 const free=ramp(t,7.2,10.5),rise=ramp(t,9,18.8),late=ramp(t,11.3,19),z=-37+t*7.3+free*6+Math.max(0,t-20)*4.7;
 // One unbroken eyeline: notice the right-hand facades, turn back towards
 // the opening, then look up as the windows draw the street into the air.
 const glance=(ramp(t,.4,2.5)-ramp(t,3.3,6.4))*9;
 const gazeUp=2+rise*11+(ramp(t,11,13.5)-ramp(t,15.8,18))*5;
 const descent=ramp(t,24,37),eyeY=4.1+rise*40-4*ramp(t,24,30)-31*ramp(z,236,355)+8*ramp(t,64,71),eyeX=Math.sin(t*.35)*free*1.4;
 camera([eyeX,eyeY+Math.sin(t*7)*.018*(1-free),z],[eyeX+glance-3*ramp(t,14,18)+10*(ramp(t,32,35)-ramp(t,37,41)),eyeY+gazeUp*(1-ramp(t,24,34))-2*ramp(t,27,34)+8*ramp(t,64,71),z+38],970,.006*Math.sin(t*.8)+free*.012*Math.sin(t*.5));
 sky(t,late);
 const sun=project([30,85,1900]);if(sun){s.fillStyle='#e9c38b';s.beginPath();s.arc(sun[0],sun[1],970*42/sun[2],0,TAU);s.fill();}
 sea(t);ground(t);trackFurniture(t);city(t,late);causeway();islands(t);cliffs();threshold(t);
 if(t>10)bigFragments(t);
 flush();atmosphere(t);
 // Rain belongs to the glass and disappears as we pass through it.
 if(t<8){s.globalAlpha=.12*(1-ramp(t,5,8));for(let j=0;j<65;j++){let x=hash(j)*1920,y=(hash(j+300)*1200+t*55)%1200;s.strokeStyle='#b4c2c3';s.lineWidth=1.3;s.beginPath();s.moveTo(x,y);s.lineTo(x-7,y+28+hash(j+42)*40);s.stroke();}s.globalAlpha=1;}
 carriageAperture(t);sparks(t,t>9?24:0);
 Paint.present(t,{boil:6,strokeK:.46,impasto:.32,ground:.015,groundCol:'#10192c',gap:.01,fauve:.14,shadowTint:'#19294d',hiTint:'#f1c68b',flowK:.16,flowAng:-.16,flowBias:.65,bloom:.55,grain:.025,vig:.24,dash:.04,smear:[0,0],inkSoft:.5,wave:[.25,.009,.003,.8],waveK:.2});
}
const canvas=document.getElementById('c');Paint.init(canvas);window.__render=renderFrame;window.__frameJPEG=(t,q=.94)=>{renderFrame(t);return canvas.toDataURL('image/jpeg',q)};window.__ready=true;
const audioEl=document.getElementById('a'),offline=new URLSearchParams(location.search).has('offline');if(offline){document.body.classList.add('offline');renderFrame(0);}else{audioEl.currentTime=0;canvas.onclick=()=>audioEl.paused?audioEl.play():audioEl.pause();function loop(){if(audioEl.currentTime>=72){audioEl.pause();audioEl.currentTime=0;}renderFrame(audioEl.currentTime);requestAnimationFrame(loop);}loop();}
