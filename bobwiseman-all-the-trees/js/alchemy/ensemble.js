/* Six original generated engraved puppets. Bitmap atlas is local; joints and timing are deterministic. */
(() => {
 const A=Alchemy,{g,C,smooth,mix,clamp,ellipse,line,stroke}=A;
 const defs={
  owl:{cell:0,neck:178,shoulders:[[120,201],[266,199]],elbows:[[88,283],[297,287]],hands:[[41,368],[349,364]],hip:425,knee:540,feet:[[138,614],[272,608]],height:627},
  keeper:{cell:1,neck:205,shoulders:[[111,210],[284,210]],elbows:[[78,293],[321,299]],hands:[[31,370],[371,371]],hip:411,knee:514,feet:[[109,610],[294,608]],height:628},
  moth:{cell:2,neck:183,shoulders:[[128,224],[264,223]],elbows:[[89,307],[308,307]],hands:[[35,365],[360,365]],hip:450,knee:550,feet:[[161,612],[258,612]],height:625},
  fox:{cell:3,neck:149,shoulders:[[124,172],[256,171]],elbows:[[88,245],[300,245]],hands:[[42,312],[369,304]],hip:359,knee:482,feet:[[101,603],[277,600]],height:625},
  fish:{cell:4,neck:165,shoulders:[[128,188],[265,189]],elbows:[[86,268],[300,275]],hands:[[48,328],[349,333]],hip:365,knee:489,feet:[[111,610],[290,610]],height:628},
  hare:{cell:5,neck:206,shoulders:[[139,220],[257,220]],elbows:[[91,283],[306,284]],hands:[[56,354],[365,356]],hip:392,knee:506,feet:[[146,608],[290,602]],height:625}
 };
 const turn=(p,o,a)=>[o[0]+Math.cos(a)*(p[0]-o[0])-Math.sin(a)*(p[1]-o[1]),o[1]+Math.sin(a)*(p[0]-o[0])+Math.cos(a)*(p[1]-o[1])];
 function shape(poly){const p=new Path2D();poly.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p}
 function joint(x,y,a,fn){g.save();g.translate(x,y);g.rotate(a);g.translate(-x,-y);fn();g.restore()}
 function image(d){const im=A.assets.ensemble,cw=im.width/3,ch=im.height/2;g.drawImage(im,(d.cell%3)*cw,Math.floor(d.cell/3)*ch,cw,ch,0,0,400,640)}
 // Deform a continuous textured mesh: moving joints never expose rectangular cuts.
 function deform(v,p){const d=p.d;let out=[...v];
  const add=(to,w)=>{out[0]+=(to[0]-v[0])*w;out[1]+=(to[1]-v[1])*w};
  const head=1-smooth(d.neck-22,d.neck+32,v[1]);add(turn(v,[200,d.neck],p.head),head);
  for(let i=0;i<2;i++){const sh=d.shoulders[i],hand=d.hands[i],u=clamp((v[1]-sh[1])/(hand[1]-sh[1]));
   const edge=mix(sh[0]+(i?-25:25),hand[0]+(i?-35:35),u);
   const side=i?smooth(edge-18,edge+24,v[0]):1-smooth(edge-24,edge+18,v[0]);
   const w=side*smooth(d.neck-20,d.neck+42,v[1])*(1-smooth(hand[1]+10,hand[1]+75,v[1]));
   add(turn(v,sh,p.angles[i]),w);
  }
  if(d.cell!==0&&d.cell!==2){const side=smooth(185,215,v[0]),w=smooth(d.hip-15,d.hip+55,v[1]);
   add(turn(v,[150,d.hip],p.leg),w*(1-side));add(turn(v,[260,d.hip],-p.leg),w*side);
  }return out;
 }
 function texture(d){if(d.texture)return d.texture;const im=A.assets.ensemble,cw=im.width/3,ch=im.height/2,c=document.createElement('canvas');c.width=400;c.height=640;c.getContext('2d').drawImage(im,(d.cell%3)*cw,Math.floor(d.cell/3)*ch,cw,ch,0,0,400,640);return d.texture=c}
 function mesh(p){const im=texture(p.d),nx=14,ny=24,dx=400/nx,dy=640/ny,points=[];
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++)points.push(deform([x*dx,y*dy],p));
  function tri(src,dst){const [s0,s1,s2]=src,[a,b,c]=dst,det=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);
   const ax=((b[0]-a[0])*(s2[1]-s0[1])-(c[0]-a[0])*(s1[1]-s0[1]))/det,bx=((c[0]-a[0])*(s1[0]-s0[0])-(b[0]-a[0])*(s2[0]-s0[0]))/det;
   const ay=((b[1]-a[1])*(s2[1]-s0[1])-(c[1]-a[1])*(s1[1]-s0[1]))/det,by=((c[1]-a[1])*(s1[0]-s0[0])-(b[1]-a[1])*(s2[0]-s0[0]))/det;
   g.save();const cx=(a[0]+b[0]+c[0])/3,cy=(a[1]+b[1]+c[1])/3;g.beginPath();dst.forEach((q,i)=>{const x=cx+(q[0]-cx)*1.012,y=cy+(q[1]-cy)*1.012;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.clip();
   g.transform(ax,ay,bx,by,a[0]-ax*s0[0]-bx*s0[1],a[1]-ay*s0[0]-by*s0[1]);g.drawImage(im,0,0);g.restore();
  }
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const i=y*(nx+1)+x,a=[x*dx,y*dy],b=[(x+1)*dx,y*dy],c=[x*dx,(y+1)*dy],d=[(x+1)*dx,(y+1)*dy];tri([a,b,c],[points[i],points[i+1],points[i+nx+1]]);tri([b,d,c],[points[i+1],points[i+nx+2],points[i+nx+1]])}
 }
 function pose(c,t,receive=0){const d=defs[c.sprite],enter=smooth(c.on,c.on+1.1,t),q=(t-c.on)*145/60*Math.PI+c.phase;
  const intro=1-smooth(c.on+1.8,c.on+3.1,t),r=A.performance.reaction;
  const reply=c.role==='mischief'?r(t,ALCHEMY_CUES.performance.reply.launch,1.55):0;
  const bird=c.role==='caretaker'?r(t,ALCHEMY_CUES.performance.reply.birdContact):0;
  const active=(1-smooth(95,97,t))+smooth(123,125,t),beat=Math.sin(q);
  const hop=(c.sprite==='hare'?25:c.sprite==='fox'?17:4)*Math.max(0,beat)*active;
  let lean=(c.sprite==='keeper'?.055:.09)*Math.sin(q*.5)*active+(c.x<960?1:-1)*.18*receive-.2*reply;
  // v12: rises out of the soil, not a ghost fade (audit F9, C11).
  const scale=c.k*.91,footY=797-hop+(1-enter)*d.height*c.k*.95,step=(c.sprite==='fox'?12:c.sprite==='hare'?10:8)*Math.sin(q*.5)*active;
  const x=c.x+step; // v11: short step-in, no slide through neighbours (audit C5, D3, D10)
  const bow=(c.sprite==='owl'?A.performance.bump(c.on+1,c.on+1.5,c.on+2.5,t)*.22:0);
  const reach=c.sprite==='fox'?.44:c.sprite==='hare'?.37:.26;
  const armL=reach*Math.sin(q*.5-.8)*active+.22*intro-.45*receive,armR=-reach*Math.sin(q*.5+.4)*active-.2*intro+.42*receive;
  const lift=c.role==='caretaker'?smooth(3290,3360,t*24):0;
  const angles=[armL+.58*lift-.2*bird,armR];
  // Two little conversations have preparation, a held look, answer and recovery.
  const offer=A.performance.bump(85.8,86.6,88.1,t),answer=A.performance.bump(87.3,88.1,89.4,t);
  const stumble=A.performance.bump(100.2,100.8,102.0,t),steady=A.performance.bump(100.65,101.2,102.5,t);
  if(c.sprite==='fox'){lean+=.1*offer;angles[1]-=.6*offer}
  if(c.sprite==='owl'){lean-=.15*answer;angles[0]+=.25*answer}
  if(c.sprite==='fish'){lean+=.08*stumble;angles[0]-=.3*stumble} // v11: stumbles away from her (audit C6)
  if(c.sprite==='keeper'){lean+=.18*steady;angles[0]-=.45*steady}
  const world=p=>{const v=turn([(p[0]-200)*scale,(p[1]-d.height)*scale],[0,0],lean+bow);return [x+v[0],footY+v[1]]};
  const p={d,enter,q,scale,footY,x,lean:lean+bow,angles,receive,lift,bird,world,head:(c.sprite==='owl'?.16:.07)*Math.sin(q*.25)+.12*receive,leg:.11*beat*active*(c.sprite==='fox'||c.sprite==='hare'?1.5:1)};
  p.hands=d.hands.map(v=>world(deform(v,p)));p.feet=d.feet.map(v=>world(deform(v,p)));return p;
 }
 function draw(c,t,receive=0,headOnly=false){const p=pose(c,t,receive),d=p.d;if(!p.enter||headOnly)return;
  g.save();g.translate(p.x,p.footY);g.rotate(p.lean);g.scale(p.scale,p.scale);g.translate(-200,-d.height);mesh(p);g.restore();
  // A consequence remains after a root delivery: a warm, visible chest medallion.
  const index=c.index,bloom=smooth(ALCHEMY_CUES.performance.finalRelay[index],ALCHEMY_CUES.performance.finalRelay[index]+8,t*24);
  // v11: the relay's consequence is the flowering sprig (extended.js), not a chest disc that read as a UI button (audit D2).
  if(c.role==='caretaker'&&p.lift){const h=p.hands[0];stroke(`M${h[0]} ${h[1]}q-6 -35 -10 -76`,C.earth,9*p.lift);stroke(`M${h[0]} ${h[1]}q-6 -35 -10 -76`,C.ink,1.4);stroke(`M${h[0]-6} ${h[1]-40}l8 -23M${h[0]-9} ${h[1]-60}l-5 -22`,C.ink,2*p.lift)}
 }
 function perch(c,t){const p=pose(c,t,0),h=p.hands[0];return [h[0]-10,h[1]-76]}
 A.puppets={draw,pose,perch,defs};
})();
