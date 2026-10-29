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
function sky(t,late){let g=s.createLinearGradient(0,0,160,1080);g.addColorStop(0,late?'#455b72':'#102239');g.addColorStop(.47,late?'#7a8990':'#455e70');g.addColorStop(.78,late?'#9b8b77':'#75878a');g.addColorStop(1,'#111e32');s.fillStyle=g;s.fillRect(0,0,W,H);
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
 // A continuous torn foundation makes the lifting city read as one place.
 if(allRise>.1){let y=allRise-.5;box(0,y-2,94,84,2,310,'#27384a','#1b2a3b','#33444e');for(let j=0;j<24;j++){let x=(j%2?1:-1)*(36+hash(j)*4),z=-55+hash(j+11)*290;polygon([[x-3,y-2,z-3],[x+3,y-2,z-3],[x+hash(j)*2,y-7-hash(j+3)*9,z+1]],'#233449');line3([[x,y-3,z],[x+Math.sin(t+j)*1.3,y-12,z+2],[x+Math.sin(t*.6+j)*3,y-18,z+5]],'#756e5f',1.8);}}
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
function ground(t,fade=0){quad([-4000,-.1,-4000],[4000,-.1,-4000],[4000,-.1,4000],[-4000,-.1,4000],'#101d2c');
 for(let z=-70;z<300;z+=3){let col=z%6===0?'#435367':'#25364d';box(0,.04,z,8,.2,.4,col,'#1d273a',col);}for(let x of [-1.35,1.35])for(let z=-90;z<400;z+=5){quad([x-.10,.28,z],[x+.1,.28,z],[x+.1,.28,z+5],[x-.1,.28,z+5],'#a6a194');}
 for(let i=0;i<90;i++){let z=hash(i+44)*350-60,x=(hash(i+56)-.5)*100,w=hash(i+12)*5;line3([[x,.02,z],[x+w,.02,z+.06]],i%3?'#394352':'#786650',1.7);}
}
function train(t,detach=0){let head=t*7-16;
 for(let car=3;car>=0;car--){let z=head-car*15,y=.72+Math.sin(t*12+car)*.055;box(0,y,z,5.4,4.8,13.4,car===0?'#813f38':'#264351','#1b3544','#4a636a');for(let seg=0;seg<12;seg++){let a=seg/12*Math.PI,b=(seg+1)/12*Math.PI;quad([Math.cos(a)*2.65,y+4.65+Math.sin(a)*1.13,z-6.6],[Math.cos(b)*2.65,y+4.65+Math.sin(b)*1.13,z-6.6],[Math.cos(b)*2.65,y+4.65+Math.sin(b)*1.13,z+6.6],[Math.cos(a)*2.65,y+4.65+Math.sin(a)*1.13,z+6.6],seg<6?'#526976':'#304856');}
 for(let zz=z-5.5;zz<z+6;zz+=2.6){let pts=[];for(let k=0;k<=12;k++){let a=k/12*Math.PI;pts.push([Math.cos(a)*2.66,y+4.66+Math.sin(a)*1.14,zz]);}line3(pts,'#89918a',1.1);}
 box(0,y+.1,z,4.5,.5,13.5,'#111f2e','#172b3b','#334652');
 for(let j=0;j<5;j++){let zz=z-5+j*2.5;for(let k=0;k<7;k++){let xx=3.2+k*.43,w=.22+hash(j*8+k)*.40;quad([xx,.035,zz-w],[xx+.20,.035,zz-w],[xx+.20,.035,zz+w],[xx,.035,zz+w],k<2?'#66543e':'#2b3d48');}}
 // red lower band, metal ribs, brass frames, empty black sockets after release.
 for(let side of [-1,1]){let x=side*2.72;
 for(let zz=z-6.2;zz<z+6.2;zz+=.55){circle3(x+side*.025,y+1.4,zz,.035,'x','#b7a17c');circle3(x+side*.025,y+4.55,zz,.035,'x','#b7a17c');}
 for(let zz=z-6.5;zz<z+6.5;zz+=2.6)line3([[x,y+1.4,zz],[x,y+4.6,zz]],'#476675',1.4);quad([x,y+.6,z-6.4],[x,y+.6,z+6.4],[x,y+1.15,z+6.4],[x,y+1.15,z-6.4],'#a05445');for(let j=0;j<5;j++){let zz=z-5+j*2.5,dep=detach*ramp(t,5.2+j*.34+car*.5,7+j*.3+car*.5),bot=y+2;quad([x,bot-.18,zz-.91],[x,bot-.18,zz+.91],[x,bot+2.22,zz+.91],[x,bot+2.22,zz-.91],'#a18d6c');quad([x+side*.03,bot,zz-.75],[x+side*.03,bot,zz+.75],[x+side*.03,bot+2.05,zz+.75],[x+side*.03,bot+2.05,zz-.75],'#070f1b');
 if(dep<.01){quad([x+side*.05,bot+.08,zz-.67],[x+side*.05,bot+.08,zz+.67],[x+side*.05,bot+1.99,zz+.67],[x+side*.05,bot+1.99,zz-.67],(j+car)%3?'#d5a665':'#b57647',null,.10);
 // Reader silhouette, lamp, reflected diagonal pass: scale-sized details.
 if((j+car)%2===0){circle3(x+side*.065,bot+1.33,zz,.20,'x','#33333a');quad([x+side*.07,bot+.12,zz-.26],[x+side*.07,bot+.12,zz+.32],[x+side*.07,bot+1.18,zz+.12],[x+side*.07,bot+1.18,zz-.1],'#33313b');}}
 else if(side===1){windowWing([x+dep*9,bot+dep*(10+car*2),zz+dep*2],.8,2,t,j+car*5,dep);}
 }
 for(let zz of [z-4.4,z+4.4]){circle3(side*2.5,.9,zz,1,'x','#101621');circle3(side*2.52,.9,zz,.67,'x','#56606a');circle3(side*2.54,.9,zz,.28,'x','#b3a278');for(let k=0;k<8;k++){let a=k/8*TAU-t*8;line3([[side*2.56,.9,zz],[side*2.56,.9+Math.sin(a)*.66,zz+Math.cos(a)*.66]],'#182d3c',2);}}
 }
 if(car===0){polygon([[-2.65,y+4.7,z+6.73],[-2.25,y+5.25,z+6.73],[-1.3,y+5.63,z+6.73],[0,y+5.8,z+6.73],[1.3,y+5.63,z+6.73],[2.25,y+5.25,z+6.73],[2.65,y+4.7,z+6.73]],'#3d5665');
 for(let xx of[-1.12,1.12]){quad([xx-.92,y+2.3,z+6.74],[xx+.92,y+2.3,z+6.74],[xx+.92,y+4.3,z+6.74],[xx-.92,y+4.3,z+6.74],'#98876f');quad([xx-.80,y+2.44,z+6.77],[xx+.80,y+2.44,z+6.77],[xx+.80,y+4.16,z+6.77],[xx-.80,y+4.16,z+6.77],'#6d8993');line3([[xx-.67,y+2.45,z+6.8],[xx+.36,y+3.35,z+6.8]],'#1d2b38',2);}
 for(let yy of[y+.42,y+.63,y+.84])line3([[-1.0,yy,z+6.80],[1,yy,z+6.80]],'#bca887',2);
 box(0,y+.10,z+6.9,4.9,.22,.28,'#a6a08d','#374552','#b2b0a1');
 for(let xx of[-1.8,1.8])circle3(xx,y+1.25,z+6.80,.51,'z','#b28e59');for(let xx of [-1.8,1.8]){circle3(xx,y+1.25,z+6.82,.36,'z','#f0d99c');let pp=project([xx,y+1.25,z+6.8]);if(pp){f.fillStyle='rgba(220,173,85,.20)';f.beginPath();f.ellipse(pp[0],pp[1],22,18,0,0,TAU);f.fill();}}}
 }
}
function sparks(t,n=60){for(let j=0;j<n;j++){let age=(t*.38+hash(j))%1,x=960+(hash(j+12)-.5)*1600*age,y=780-age*780+Math.sin(j)*25;s.globalAlpha=(1-age)*.30;s.strokeStyle=j%3?'#c7945f':'#88a1b4';s.lineWidth=1+hash(j)*2;s.beginPath();s.moveTo(x,y);s.lineTo(x+hash(j+3)*10-5,y+8+hash(j)*15);s.stroke();}s.globalAlpha=1;}
function atmosphere(t){let g=s.createLinearGradient(0,300,0,980);g.addColorStop(0,'rgba(106,141,159,0)');g.addColorStop(.58,'rgba(100,138,157,.07)');g.addColorStop(1,'rgba(22,37,57,0)');s.fillStyle=g;s.fillRect(0,0,W,H);}
function passengerReaction(u){
 // A neighbouring traveller notices, leans toward the escaping pane, then braces.
 // Profile silhouette; the planted forearm and coat move from shared local anchors.
 const notice=ramp(u,.18,.7),lean=ramp(u,.65,1.45),brace=ramp(u,1.7,2.3),settle=ramp(u,2.7,3.4);
 s.save();s.beginPath();s.rect(-810,-280,405,560);s.clip();
 let light=s.createLinearGradient(-800,-280,-470,280);light.addColorStop(0,'#805940');light.addColorStop(.6,'#b28a5c');light.addColorStop(1,'#dbb17a');s.fillStyle=light;s.fillRect(-810,-280,405,560);
 // Upholstery and a brass lamp establish the carriage interior behind the figure.
 s.fillStyle='#593c3d';s.fillRect(-795,90,230,210);s.strokeStyle='#d7b77c';s.lineWidth=5;s.beginPath();s.moveTo(-764,-260);s.lineTo(-764,-138);s.stroke();s.fillStyle='#e2bf82';s.beginPath();s.ellipse(-764,-127,44,14,0,0,TAU);s.fill();
 s.translate(-620+lean*32-brace*16,120-brace*12+settle*5);s.rotate(lean*.11-brace*.12);
 s.fillStyle='#253441';s.beginPath();s.moveTo(-97,163);s.bezierCurveTo(-103,50,-89,-44,-48,-67);s.bezierCurveTo(-10,-83,33,-63,55,-29);s.lineTo(94,161);s.closePath();s.fill();
 s.strokeStyle='#536068';s.lineWidth=8;s.beginPath();s.moveTo(-44,-41);s.lineTo(-10,37);s.lineTo(15,155);s.stroke();
 // Head turns toward the right-hand window before the body follows.
 s.save();s.translate(-9+notice*13,-106-brace*8);s.rotate(-notice*.14+brace*.06);
 s.fillStyle='#8e806e';s.beginPath();s.moveTo(-36,-40);s.bezierCurveTo(9,-66,37,-33,34,-9);s.lineTo(51,8);s.lineTo(34,16);s.lineTo(32,42);s.lineTo(4,47);s.lineTo(-20,27);s.closePath();s.fill();
 s.fillStyle='#22313c';s.beginPath();s.moveTo(-47,-24);s.lineTo(-34,-68);s.quadraticCurveTo(-5,-84,33,-65);s.lineTo(42,-25);s.closePath();s.fill();s.beginPath();s.ellipse(1,-24,68,12,.05,0,TAU);s.fill();
 s.strokeStyle='#c3a87b';s.lineWidth=5;s.beginPath();s.moveTo(-29,-31);s.lineTo(32,-34);s.stroke();s.fillStyle='#1c2934';s.beginPath();s.ellipse(31,0,4,3,0,0,TAU);s.fill();s.restore();
 // The near elbow bends; the hand settles visibly on the sill rather than floating.
 s.strokeStyle='#344754';s.lineWidth=33;s.lineCap='round';s.beginPath();s.moveTo(31,-23);s.quadraticCurveTo(72,22,74+brace*24,71-brace*29);s.lineTo(139+brace*15,134+brace*14);s.stroke();
 s.save();s.translate(0,brace*14);s.fillStyle='#b49a76';s.beginPath();s.moveTo(127+brace*15,123);s.quadraticCurveTo(145+brace*15,112,163+brace*15,124);s.lineTo(180+brace*15,135);s.lineTo(179+brace*15,146);s.lineTo(139+brace*15,147);s.closePath();s.fill();s.restore();
 s.restore();s.lineCap='butt';
 s.fillStyle='#89785c';s.fillRect(-819,268,421,19);s.strokeStyle='#ccb184';s.lineWidth=4;s.beginPath();s.moveTo(-819,268);s.lineTo(-398,268);s.stroke();
}
function closeWindow(t,u){sky(t,0);let strain=Math.exp(-Math.pow((u-1.4)/.27,2)),vibration=Math.sin(t*36)*(1+5*strain),opening=ramp(u,.85,1.9),escape=ramp(u,1.85,3.2);
 s.save();f.save();mask.save();for(let g of[s,f,mask]){g.translate(1110+vibration,530);g.rotate(-.045+u*.015);g.scale(.94+u*.025,.94+u*.025);}
 s.fillStyle='#223946';s.fillRect(-1600,-1000,3200,2000);s.fillStyle='#734238';s.fillRect(-1600,340,3200,65);
 for(let x=-620;x<1500;x+=640){s.fillStyle='#101b27';s.fillRect(x-201,-284,410,562);s.strokeStyle='#93866c';s.lineWidth=18;s.strokeRect(x-215,-299,440,592);}
 passengerReaction(u);
 s.fillStyle='#080e19';s.fillRect(-224,-302,450,602);s.strokeStyle='#bda478';s.lineWidth=15;s.strokeRect(-236,-316,474,630);
 // Recessed interior remains after the glass leaves: far wall, curtain, empty sill.
 s.fillStyle='#192b39';s.fillRect(-208,-284,60,560);s.fillStyle='#35424a';s.fillRect(-208,269,416,18);
 let xx=escape*640,yy=-escape*600,ang=-opening*.18-escape*.53;
 // Elastic paint seams lag behind the glass, becoming thin before they tear.
 for(let j=0;j<5;j++){let torn=ramp(u,2.02+j*.10,2.10+j*.10);if(torn>=1)continue;let ax=202,ay=-230+j*102,bx=xx+202*Math.cos(ang)-(ay)*Math.sin(ang),by=yy+202*Math.sin(ang)+ay*Math.cos(ang);s.fillStyle=j%2?'#ba8656':'#d9b67a';s.globalAlpha=.74;s.beginPath();s.moveTo(ax,ay-7);s.quadraticCurveTo((ax+bx)*.5+45,(ay+by)*.5+30,bx,by-4);s.lineTo(bx,by+4);s.quadraticCurveTo((ax+bx)*.5+18,(ay+by)*.5+34,ax,ay+7);s.closePath();s.fill();}s.globalAlpha=1;
 for(let g of[s,f,mask]){g.save();g.translate(xx,yy);g.rotate(ang);g.scale(1-opening*.10,1-opening*.05);}
 let gr=s.createLinearGradient(-230,-290,230,310);gr.addColorStop(0,'#efcf92');gr.addColorStop(.48,'#bd8653');gr.addColorStop(1,'#633f39');s.fillStyle=gr;s.fillRect(-211,-298,422,596);
 for(let j=0;j<11;j++){let x=-205+j*40,h=80+hash(j+8)*210;s.fillStyle=j%2?'#6c655c':'#7d7563';s.globalAlpha=.6;s.fillRect(x,295-h,26,h);for(let k=0;k<5;k++){s.fillStyle='#ebce8f';s.fillRect(x+4,295-h+12+k*37,8,13);}}s.globalAlpha=1;
 s.strokeStyle='#463b36';s.lineWidth=14;s.strokeRect(-211,-298,422,596);s.beginPath();s.moveTo(0,-298);s.lineTo(0,298);s.moveTo(-211,10);s.lineTo(211,10);s.stroke();s.strokeStyle='#e9c795';s.lineWidth=3;s.strokeRect(-203,-290,406,580);
 // A small red corner gives this pane an identity that survives the change of scale.
 s.fillStyle='#a45245';s.fillRect(-204,250,38,39);
 f.fillStyle='rgba(195,123,46,.055)';f.fillRect(-201,-288,402,576);mask.fillStyle='#aaa';mask.fillRect(-222,-310,444,620);
 for(let g of[s,f,mask])g.restore();
 for(let g of[s,f,mask])g.restore();
 for(let j=0;j<20;j++){let a=u-2.15-hash(j)*.2;if(a>0&&a<1.2){s.globalAlpha=1-a/1.2;let x=1320+Math.cos(j*2.4)*a*210,y=500+Math.sin(j*2.4)*a*160+a*a*250;s.fillStyle=j%2?'#dcc394':'#7a806c';s.fillRect(x,y,4+hash(j)*6,3);}}s.globalAlpha=1;
}
function bigFragments(t){for(let j=0;j<16;j++){let start=10+hash(j+13)*2.5,u=ramp(t,start,start+4),x=(hash(j+17)-.5)*64,y=12+u*44+hash(j)*12,z=55+hash(j+1)*94;box(x,y,z,2.5+hash(j+2)*3,5+hash(j)*8,2.5,'#526277','#273850','#a0a098');for(let r=0;r<3;r++)quad([x-.6,y+1+r*2.5,z-1.3],[x+.6,y+1+r*2.5,z-1.3],[x+.6,y+2.5+r*2.5,z-1.3],[x-.6,y+2.5+r*2.5,z-1.3],'#e7ba77',null,.10);for(let side of [-1,1])windowWing([x+side*(3.7+Math.sin(t*3+j)*.5),y+4,z],2.3,4,t,j+side,1);line3([[x,y,z],[x+1,y-6,z+1],[x+Math.sin(t+j)*2,y-9,z+2]],'#8c8a75',2);}}
const SHOTS=[{a:0,b:2,key:'carriage'},{a:2,b:4,key:'approach'},{a:4,b:7.5,key:'release'},{a:7.5,b:9.75,key:'follow'},{a:9.75,b:12.5,key:'city'},{a:12.5,b:15.25,key:'fragments'},{a:15.25,b:17.75,key:'reveal'},{a:17.75,b:20,key:'after'}];window.EDIT=SHOTS.map((o,i)=>({...o,id:i+1,startFrame:o.a*24,endFrame:o.b*24}));
function renderFrame(t){t=clamp(t,0,19.999);TIME=t;for(let g of[s,f,mask]){g.setTransform(.5,0,0,.5,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);}ink.clearRect(0,0,W,H);f.fillStyle='#000';f.fillRect(0,0,W,H);mask.fillStyle='#000';mask.fillRect(0,0,W,H);faces=[];
 let sh=SHOTS.find(o=>t>=o.a&&t<o.b),u=t-sh.a,progress=u/(sh.b-sh.a),head=t*7-16,late=ramp(t,10,18),smear=[0,0];
 sky(t,late);
 if(sh.key==='release'){closeWindow(t,u);}else{
 if(sh.key==='carriage')camera([8+u*.6,5.7+u*.3,head+10-u*2],[0,3.3,head-10+u*2],1030,-.06+u*.024);
 if(sh.key==='approach')camera([10-u*1.2,3.8+u*.6,head+18],[0,3,head-6],1080,-.035+u*.025);
 if(sh.key==='follow')camera([17+u*3,12+u*6,head+2],[10+u*4,12+u*7,head-4],860,-.06-u*.025);
 if(sh.key==='city')camera([78-u*2,22+u*7,head+75],[0,18+u*7,head-15],1060,.035-u*.018);
 if(sh.key==='fragments')camera([18-u*6,33+u*4,120-u*4],[0,40+u*3,75],880,-.08+u*.035);
 if(sh.key==='reveal')camera([120+u*10,40-u*2,295+u*8],[0,35,94],970,.015-u*.006);
 if(sh.key==='after')camera([156+u*7,34-u*.6,319+u*7],[0,32,94],1030,0);
 ground(t);city(t,late);train(t,ramp(t,7.15,9));
 if(sh.key==='follow'){let p=[10+u*4,12+u*7,head-4];windowWing(p,2,4,t,71,1);for(let j=0;j<9;j++){let q=[p[0]-4-hash(j)*15,p[1]-2-hash(j)*10,p[2]-10-hash(j)*14];windowWing(q,.9,2,t,j,1);}}
 if(t>10)bigFragments(t);flush();atmosphere(t);
 }
 // Painted rain slashes are a near-plane cue and stop as the city is freed.
 if(t<9.75){s.globalAlpha=.11;for(let j=0;j<85;j++){let x=(hash(j)*2200-t*350)%2200,y=(hash(j+300)*1200+t*440)%1200;s.strokeStyle='#a8b3b5';s.lineWidth=1.3;s.beginPath();s.moveTo(x,y);s.lineTo(x-20,y+42);s.stroke();}s.globalAlpha=1;}
 sparks(t,t>9?45:12);
 let energy=AUDIO.energy[Math.min(479,Math.floor(t*24))]||0;
 Paint.present(t,{boil:6,strokeK:.46,impasto:.32,ground:.015,groundCol:'#10192c',gap:.01,fauve:.14,shadowTint:'#19294d',hiTint:'#f1c68b',flowK:.16,flowAng:-.16,flowBias:.65,bloom:.55,grain:.025,vig:.24,dash:.04,smear,inkSoft:.5,wave:[.25,.009,.003,.8],waveK:.2});
}
const canvas=document.getElementById('c');Paint.init(canvas);window.__render=renderFrame;window.__frameJPEG=(t,q=.94)=>{renderFrame(t);return canvas.toDataURL('image/jpeg',q)};window.__ready=true;
const audioEl=document.getElementById('a'),offline=new URLSearchParams(location.search).has('offline');if(offline){document.body.classList.add('offline');renderFrame(0);}else{audioEl.currentTime=0;canvas.onclick=()=>audioEl.paused?audioEl.play():audioEl.pause();function loop(){if(audioEl.currentTime>=20){audioEl.pause();audioEl.currentTime=0;}renderFrame(audioEl.currentTime);requestAnimationFrame(loop);}loop();}
