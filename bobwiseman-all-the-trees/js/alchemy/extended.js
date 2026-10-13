/* Extended local rough cut. Absolute song time; v2's first passage remains its own scene. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,smooth,clamp,mix,noise,stroke,fill,line,ellipse,rays,cloud}=A;
 const lookTest=A.draw;
 const cast=[
  {id:'west',which:'luna',x:285,k:.65,on:81.22,phase:1.4,color:'#739d77'},
  {id:'east',which:'sol',x:1635,k:.65,on:91.56,phase:3.8,color:C.gold},
  {id:'far-west',which:'sol',x:165,k:.46,on:123.5,phase:2.5,color:C.rose},
  {id:'inner-west',which:'luna',x:475,k:.70,on:125.0,phase:4.4,color:C.blue},
  {id:'inner-east',which:'sol',x:1440,k:.70,on:127.0,phase:.8,color:'#739d77'},
  {id:'far-east',which:'luna',x:1765,k:.46,on:129.0,phase:5.7,color:C.gold}
 ];
 const abstract=t=>smooth(109.7,112,t)*(1-smooth(120.5,122.7,t));
 A.leafSeason=t=>1-.82*smooth(107.96,109.5,t)+.82*smooth(122.7,125.3,t);
 function actor(c,t,headOnly=false){const p=smooth(c.on,c.on+1.25,t);if(!p)return;
  g.save();g.translate(c.x,797);g.scale(c.k*(.86+.14*p),c.k*p);g.translate(-(c.which==='luna'?1220:690),-797);
  S.person(c.which,t,{phase:c.phase,color:c.color,headOnly});g.restore();
 }
 function widerRoots(t){for(let c=0;c<cast.length;c++){const a=cast[c],p=smooth(a.on+.6,a.on+3.0,t);if(!p)continue;
  for(let j=0;j<3;j++){const end=910+j*51,side=a.x<960?1:-1;
   const b=[a.x+(j-1)*9,784,a.x+(j-1)*37,848+j*16,end-side*(70+c*8),988-j*14,end,922+j*13];
   S.woodyRoot(b,clamp(p*1.1-j*.04),22*a.k+5,7+j,c+j);
  }
 }}
 function heart(t,a,raysOnly=false){const birth=smooth(96.3,97.4,t);if(!birth)return;
  const rise=smooth(96.3,100.1,t),sun=smooth(104.55,105.5,t),final=smooth(122.7,128,t);
  const x=950,y=mix(929,mix(348,412,a),rise)-final*34;
  const radius=mix(18,118,rise)*(1+a*.55)*(1+.025*Math.sin(S.pulse(t)*2));
  if(raysOnly){if(sun){g.save();g.translate(x,y);g.scale(birth,birth);rays(0,0,radius*1.1,84,115+final*90,.45+sun*.25+A.brass(t)*.18,t*.018);g.restore()}return}
  // The heart is attached to the same root junction; it does not arrive as a floating icon.
  const stem=`M960 936C936 759 990 ${y+210} ${x} ${y+radius*.7}`;
  stroke(stem,'#d1b780',12*rise);stroke(stem,C.ink,1.8);
  g.save();g.translate(x,y);g.scale(birth,birth);
  if(sun){ellipse(0,0,radius*1.07,radius*1.07,C.gold,C.ink);
   g.save();g.beginPath();g.arc(0,0,radius*1.07,0,Math.PI*2);g.arc(0,0,radius*.63,0,Math.PI*2,true);g.clip();g.scale(radius/160,radius/160);g.translate(-333,-164);A.piece('sol-head',C.gold);g.restore();
   ellipse(0,0,radius*.96,radius*.96,null,'#926324');

  }
  const path=new Path2D('M0 1C-.18 .85-1 .25-.86-.3C-.78-.78-.2-.8 0-.36C.22-.82.85-.74.9-.22C1 .23.25 .76 0 1Z');
  g.save();g.scale(radius,radius);g.fillStyle=C.rose;g.fill(path);g.strokeStyle=C.ink;g.lineWidth=1.8/radius;g.stroke(path);g.clip(path);
  g.globalAlpha=.57;
  for(let j=0;j<75;j++){const yy=-.82+j*.026;stroke(`M-1 ${yy}Q-.18 ${yy-.23} 1 ${yy+.14}`,C.ink,.0075)}
  for(let j=0;j<200;j++){const xx=noise(j+80)*2-1,yy=noise(j+621)*2-1;line(xx,yy,xx+.014,yy-.017,C.ink,.004)}
  g.globalAlpha=.36;for(let j=0;j<17;j++){const yy=.12+j*.045;stroke(`M.05 ${yy}Q.67 ${yy-.25} .96 ${yy-.72}`,C.ink,.012)}
  g.globalAlpha=1;
  for(let j=0;j<17;j++){const xx=-.92+j*.11;stroke(`M${xx} .93Q${xx+.15} .1 ${xx+.3}-.9`,'#864c43',.0035)}
  g.restore();g.restore();
 }
 function fallingLeaves(t){if(t<107.96||t>111.6)return;
  for(let i=0;i<22;i++){const u=clamp((t-107.96-noise(i+18)*.9)/2.5);if(!u||u>=1)continue;
   const x=490+noise(i+39)*940+Math.sin(u*5+i)*32,y=355+noise(i+52)*140+u*330;
   g.save();g.translate(x,y);g.rotate(u*6+i);g.scale(1-u*.5,1-u*.5);fill('M0 0Q-15-20 0-36Q17-17 0 0','#bf9638');stroke('M0 0Q-15-20 0-36Q17-17 0 0',C.ink,1);line(0,0,0,-31,C.ink,.7);g.restore();
  }
 }
 function heraldPosition(flip,t){const a=abstract(t),x=mix(flip<0?290:1635,flip<0?495:1425,a),y=mix(294-55*smooth(79.5,83,t),510,a),scale=1+a*.48;
  return {x,y,scale};
 }
 function bellPoint(x,y,flip,t,raw){const p=A.brass(raw),q=S.pulse(t)+(flip<0?0:Math.PI*.6),bob=6*Math.sin(q*2-.5),rock=.105*Math.sin(q);
  const rotate=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
  const arm=rotate(390-780,305-461,.10*Math.sin(q-.4)+p*.065);
  const body=rotate((780+arm[0]-795)*.315*flip,(461+arm[1]-805)*.315-112,rock);
  return [x+body[0],y+112+bob+body[1]];
 }
 function brassRibbons(t,raw){const a=abstract(t);if(!a)return;const p=A.brass(raw);
  for(const flip of [-1,1]){const h=heraldPosition(flip,t),source=bellPoint(0,0,flip,t,raw),x=h.x+source[0]*h.scale,y=h.y+source[1]*h.scale;
   g.save();g.globalAlpha=a*.8;
   // Curved engraved sound lines leave the actual instrument bell and orbit the shared heart.
   for(let j=0;j<15;j++){const phase=t*.62+j*.36+(flip<0?0:Math.PI),r=150+j*8+p*23;
    const ex=960+Math.cos(phase)*r,ey=412+Math.sin(phase)*r*.72;
    const path=`M${x} ${y}C${mix(x,960,.42)} ${y-180-j*6} ${960-flip*(250+j*8)} ${412+Math.sin(phase)*270} ${ex} ${ey}`;
    stroke(path,j%3?C.gold:C.ink,j%3?2.6:1.1);
    if(j%4===0)ellipse(ex,ey,5,5,C.gold,C.ink);
   }
   g.restore();
  }
 }
 function orbitBirds(t){const p=smooth(136,137.5,t);if(!p)return;
  for(let i=0;i<5;i++){const angle=(t-136)*.34+i*Math.PI*2/5,x=960+Math.cos(angle)*640,y=200+Math.sin(angle)*90;
   S.bird(x,y,.18*p,t,Math.sin(angle)>0?1:-1,0,1);
  }
 }
 function border(){g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 }
 function extended(raw){const frame=Math.round(raw*24),t=Math.floor(frame/2)/12,a=abstract(t);
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);
  // A continuous widening from the existing look test, then a final pull-back to the whole plate.
  const zoom=1.032-.032*smooth(79.5,85,raw)-.075*smooth(136,149,raw);
  g.save();g.translate(960,540);g.scale(zoom,zoom);g.translate(-960+2*Math.sin(raw*.14),-540);S.sky();
  for(let i=0;i<5;i++)cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25,.72+(i%2)*.15,i%2?-1:1);
  S.ground(t);widerRoots(t);
  if(a){g.save();g.globalAlpha=a;fill('M75 758Q480 746 960 760T1845 759V828Q1460 803 960 829T75 828Z','#d9c99f');for(let i=0;i<210;i++){const x=80+noise(i+722)*1760,y=772+noise(i+185)*40;line(x,y,x+8,y-3,'#9b8a62',.8)}stroke('M75 828Q510 815 960 829T1845 828','#b6a578',1);g.restore()}
  orbitBirds(t);heart(t,a,true);
  for(const flip of [-1,1]){const h=heraldPosition(flip,t);g.save();g.translate(h.x,h.y);g.scale(h.scale,h.scale);const oldX=flip<0?290:1635;g.translate(-oldX,-294);S.herald(oldX,294,flip,t,raw);g.restore()}
  // The cast retreats below the soil while its musical emblem occupies the sky.
  g.save();g.beginPath();g.rect(76,70,1768,731);g.clip();g.translate(0,a*620);
  for(const c of cast)actor(c,t);
  S.person('sol',t);S.person('luna',t);for(const c of cast)actor(c,t,true);if(t<82)S.birds(t);g.restore();fallingLeaves(t);heart(t,a);brassRibbons(t,raw);
  // Last verse roundels physically leave their row before the next chorus builds its cast.
  if(t<81.3){g.save();g.translate(0,-330*smooth(79.5,81.3,t));S.roundel(820,163,63,t,'wind',71.875);S.roundel(960,135,64,t,'sun',72.875);S.roundel(1100,163,63,t,'winter',73.75);g.restore()}
  g.restore();border();
  const fade=smooth(148.6,153.066,raw);if(fade){g.save();g.globalAlpha=fade;g.drawImage(A.paper,0,0);g.restore()}
 }
 A.draw=raw=>raw<79.5?lookTest(raw):extended(raw);
 A.extendedState=t=>({chapter:t<79.5?'look-test':t<96.3?'community':t<110?'heart-sun':t<122.7?'brass':t<136?'grove':'outro',cast:2+cast.filter(c=>t>=c.on+1.25).length,abstract:abstract(t),foliage:A.leafSeason(t)});
})();
