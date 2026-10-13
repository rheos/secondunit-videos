/* Original allegory assembled from disclosed historical cut-outs. All geometry is song-time pure. */
(() => {
 const A=Alchemy,{g,C,smooth,clamp,mix,noise,stroke,fill,line,ellipse,piece,joint,rays,brass,cloud}=A;
 const roots=[];
 function rootCurve(s,i){const x=s?1220:690,sign=s?-1:1;return [x+(i-2)*10,782,x+sign*(12+i*38),835+(i%2)*47,960-sign*(178-i*53),1010-i*16,960+(i-2)*26,921+(i%3)*14]}
 for(let s=0;s<2;s++)for(let i=0;i<5;i++)roots.push(rootCurve(s,i));
 function bez(p,u){const v=1-u;return [v*v*v*p[0]+3*v*v*u*p[2]+3*v*u*u*p[4]+u*u*u*p[6],v*v*v*p[1]+3*v*v*u*p[3]+3*v*u*u*p[5]+u*u*u*p[7]]}
 function rootNetwork(t){const p=smooth(61,63.75,t);if(!p)return;
   for(let j=0;j<roots.length;j++){const b=roots[j],phase=clamp(p*1.18-(j%5)*.018);g.beginPath();for(let i=0;i<=72;i++){const v=bez(b,i/72*phase);i?g.lineTo(...v):g.moveTo(...v)}g.lineWidth=6;g.strokeStyle='#c6b384';g.stroke();g.lineWidth=1.7;g.strokeStyle=C.ink;g.stroke();
     for(let i=1;i<32*phase;i++){const v=bez(b,i/32);line(v[0]-3,v[1]+2,v[0]+3,v[1]-1,'#534b32',.6);if(i%6===0){const side=j%2?1:-1;stroke(`M${v[0]} ${v[1]}q${side*22} 17 ${side*35} 39q${side*9} 16 ${side*24} 21`,C.ink,1.1)}}
     // Slow colour travels through each connection, with fixed geometry underneath.
     const u=((t-61)*.075+j*.053)%1;if(u<phase){const v=bez(b,u);ellipse(v[0],v[1],4,2,C.gold)}
   }
   if(p>.94){const q=smooth(63.5,64,t);g.globalAlpha=q*.55;for(let i=0;i<5;i++)ellipse(960+(i-2)*26,921+(i%3)*14,3,2,C.gold);g.globalAlpha=1;}
 }
 function leaf(x,y,a,s,p){if(p<=0)return;g.save();g.translate(x,y);g.rotate(a);g.scale(s*p,s*p);fill('M0 0Q-25-18-13-48Q14-30 0 0',C.green);stroke('M0 0Q-25-18-13-48Q14-30 0 0');stroke('M0 0L-13-42',C.ink,.8);for(let j=0;j<5;j++)line(-3-j*2,-8-j*6,-13-j,-11-j*6,C.ink,.55);g.restore()}
 function bough(x,y,dir,open,leaves,t,seed=0){if(open<=0)return;g.save();g.translate(x,y);g.scale(dir,1);
  function grow(px,py,angle,len,depth,id){const stage=clamp(open*4-(4-depth)*.58);if(stage<=0)return;const drift=.025*Math.sin(t*.7+id),aa=angle+drift;
   const ex=px+Math.cos(aa)*len*stage,ey=py+Math.sin(aa)*len*stage,cx=px+Math.cos(aa+.23)*len*.52*stage,cy=py+Math.sin(aa+.23)*len*.52*stage;
   const path=`M${px} ${py}Q${cx} ${cy} ${ex} ${ey}`;stroke(path,'#c6ac70',Math.max(1,depth*2));stroke(path,C.ink,Math.max(.65,depth*.45));
   if(depth>1){const scale=.7+noise(id+seed)*.14;grow(ex,ey,aa-.48-noise(id)*.24,len*scale,depth-1,id*2+1);grow(ex,ey,aa+.47+noise(id+31)*.2,len*(scale-.1),depth-1,id*2+2)}
   if(depth<3){const q=clamp(leaves*1.5-noise(id+seed)*.4);leaf(ex,ey,aa+1.7,.42+noise(id+18)*.25,q);leaf(mix(px,ex,.6),mix(py,ey,.6),aa-.5,.35+noise(id+52)*.16,q)}
   for(let h=1;h<depth*3;h++){const u=h/(depth*3),xx=(1-u)*(1-u)*px+2*(1-u)*u*cx+u*u*ex,yy=(1-u)*(1-u)*py+2*(1-u)*u*cy+u*u*ey;line(xx-2,yy+1,xx+2,yy-1,C.ink,.5)}
  }
  grow(0,0,-.62,91,4,seed+1);g.restore()
 }
 function person(which,x,foot,t,raw){const moon=which==='luna',appear=moon?smooth(60.375,60.75,t):smooth(49.083,49.45,t);if(!appear)return;const s=.485, ox=moon?1030:325;g.save();g.translate(x,foot+28*(1-appear));g.scale(s,s);g.translate(-ox,-1200);g.globalAlpha=appear;
  const lift=moon?smooth(60.5,62.3,t):smooth(55.9,57.6,t),color=moon?C.rose:C.blue,wash=moon?smooth(60.375,61.05,t):smooth(49.083,50.7,t);
  const a=moon?-.29*lift:.44*lift, breath=Math.sin(t*1.6)*.009;
  if(moon){joint(892,355,a,()=>piece('luna-arm-l',color,wash));joint(1089,358,-.26*lift,()=>{piece('luna-upper',color,wash);joint(1100,512,.23*lift+breath,()=>piece('luna-fore',color,wash))})}
  else {joint(426,349,-.38*lift,()=>piece('sol-arm-r',color,wash));joint(230,344,a,()=>{piece('sol-upper',color,wash);joint(140,471,-.26*lift+breath,()=>piece('sol-fore',color,wash))})}
  piece(which+'-body',color,wash); // Torso covers upper-arm seams; forearms sit in front.
  function fore(name,cx,cy,rx,ry){piece(name,color,wash);g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.clip();piece(name,'#e3bb90',wash);g.restore()}
  if(moon)joint(1089,358,-.26*lift,()=>joint(1100,512,.23*lift+breath,()=>fore('luna-fore',954,420,38,50)));
  else joint(230,344,a,()=>joint(140,471,-.26*lift+breath,()=>fore('sol-fore',246,443,36,55)));
  const oh=moon?smooth(60.375,60.6,t)*(1-smooth(60.7,61.2,t)):smooth(49.083,49.25,t)*(1-smooth(49.4,50,t));
  joint(moon?994:332,290,Math.sin(t*.7)*.009,()=>{piece(which+'-head',moon?'#bdc9d3':C.gold,wash);rays(moon?992:333,164,174,83,32,.15+oh*.75+Math.exp(-Math.max(0,t-50.708)*8)*(t>=50.708&&t<51.5?.75:0)+brass(t)*.14)})
  g.restore();
  // Branches are continuations of the hands, in plate coordinates.
  const growth=smooth(moon?60.5:52.6,moon?62.1:54.1,t),green=smooth(moon?60.5:57.583,moon?61.2:58.4,t);
  const rot=(p,o,a)=>[o[0]+Math.cos(a)*(p[0]-o[0])-Math.sin(a)*(p[1]-o[1]),o[1]+Math.sin(a)*(p[0]-o[0])+Math.cos(a)*(p[1]-o[1])];
  const left=moon?rot([712,695],[892,355],a):rot(rot([242,418],[140,471],-.26*lift+breath),[230,344],a);
  const right=moon?rot(rot([944,402],[1100,512],.23*lift+breath),[1089,358],-.26*lift):rot([490,590],[426,349],-.38*lift);
  bough(x+(left[0]-ox)*s,foot+(left[1]-1200)*s,-1,growth,green,t,moon?39:3);bough(x+(right[0]-ox)*s,foot+(right[1]-1200)*s,1,growth,green,t,moon?52:15);
 }
 function herald(x,y,flip,t,raw){const p=brass(raw),s=.315;g.save();g.translate(x,y+Math.sin(raw*.5+x)*7);g.scale(s*flip,s);g.translate(-795,-805);
  joint(900,570,.028*Math.sin(t*1.3)-p*.045,()=>piece('fame-wing',C.cream));piece('fame-body',x<960?'#c96560':'#739d77');g.save();g.beginPath();g.ellipse(844,460,76,61,-.2,0,Math.PI*2);g.clip();piece('fame-body','#e4bd90');g.restore();piece('fame-drape',C.gold);
  joint(780,461,p*.04,()=>{piece('fame-arm','#e9be80');rays(390,305,30,47,300,p,3.55,.8)});g.restore();
  cloud(x+10,y+120,1.45,flip);
 }
 function bird(x,y,scale,t,dir=1,land=0,halo=1){g.save();g.translate(x,y);g.scale(scale*dir,scale);g.translate(-280,-360);joint(267,233,.11*Math.sin(t*9)*(1-land),()=>piece('bird-rear','#d7ad47'));piece('bird-body','#e9c986');joint(329,275,Math.sin(t*9)*.4*(1-land)+.15*land,()=>piece('bird-wing','#f2e6bd'));if(halo){g.globalAlpha=halo;ellipse(152,185,69,19,null,'#b88c29');ellipse(152,185,61,13,null,C.ink);g.globalAlpha=1}
  // Small long-bell instrument in the bird's beak; original engraving stays the body language.
  g.save();g.translate(84,298);g.rotate(-.1-brass(t)*.06);fill('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.gold);stroke('M0-4L-126-12L-165-33L-167 23L-126 5L0 4Z',C.ink,2.5);ellipse(-166,-5,7,28,C.earth,C.ink);rays(-175,-5,9,25,135,brass(t),Math.PI,.7);g.restore();g.restore()}
 function birds(t){if(t<64.666)return;for(let i=0;i<3;i++){const enter=smooth(64.666+i*.17,68.5+i*.12,t),landing=smooth(68.45,69.3,t),exit=smooth(75.292,76.6,t);const ret=i===0?smooth(77.708,78.6,t):0;const gone=exit*(1-ret);const targetX=[563,1280,885][i],targetY=[334,339,423][i];const x=mix(210+i*670,targetX,enter)+gone*(i%2?440:-600);const y=mix(220+i*45,targetY,enter)-Math.sin(enter*Math.PI)*110-gone*460;bird(x,y+(1-landing)*Math.sin(t*4+i)*14,.22,t,i%2?-1:1,landing*(1-gone),smooth(65.792,66.15,t))}}
 function roundel(x,y,r,t,type,on){const p=smooth(on,on+.25,t);if(!p)return;g.save();g.translate(x,y);g.scale(.85+.15*p,.85+.15*p);g.globalAlpha=p;ellipse(0,0,r+8,r+8,C.paper,C.ink);ellipse(0,0,r,r,type==='sun'?C.gold:type==='wind'?'#a0bcc5':'#c5ccd2',C.ink);g.save();g.beginPath();g.arc(0,0,r-3,0,Math.PI*2);g.clip();
  if(type==='sun'){g.scale(.25,.25);g.translate(-332,-170);piece('sol-head',C.gold);rays(332,170,155,50,30,.4+.15*Math.sin(t*2))}
  if(type==='wind'){g.globalAlpha=.8;for(let i=0;i<8;i++){let z=(t*23+i*20)%155-88;stroke(`M${z} ${-38+i*11}q35-10 66-1q17 4 28-5`,C.ink,1)}cloud(-39,12,.16);}
  if(type==='winter'){stroke('M0 66V-31M0 12L-24-16M0-12L22-36M0 34L31 2M-24-16L-40-21M22-36L33-39',C.ink,2.6);for(let i=0;i<14;i++){const xx=noise(i+5)*130-65,yy=(t*14+noise(i+18)*125)%125-65;line(xx-2,yy,xx+2,yy,'#fff7df',2);line(xx,yy-2,xx,yy+2,'#fff7df',2)}}
  g.restore();g.restore();}
 function ground(t){fill('M75 760Q480 746 960 761T1845 760V1005H75Z','#d9c99f');for(let i=0;i<190;i++){const x=85+i*9.25,y=765+noise(i+17)*10;line(x,y,x+6,y-2,C.ink,.7)}
 for(let i=0;i<1300;i++){const x=85+noise(i+66)*1750,y=790+noise(i+925)*205;line(x,y,x+3+noise(i)*6,y-2,'#a59872',.55)}
 stroke('M75 760Q480 746 960 761T1845 760',C.ink,2);rootNetwork(t)}
 function sky(){g.save();g.beginPath();g.rect(76,70,1768,690);g.clip();g.fillStyle=C.azure;g.fillRect(76,70,1768,690);g.globalAlpha=.12;g.drawImage(A.paper,0,0);g.globalAlpha=.37;
 for(let i=0;i<125;i++){let y=76+i*5.5;stroke(`M77 ${y}Q490 ${y-3} 966 ${y+1}T1844 ${y}`,C.ink,.7)}g.restore()}
 A.draw=(raw)=>{const frame=Math.round(raw*24),t=Math.floor(frame/2)/12;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(A.paper,0,0);g.save();g.translate(960,540);const zoom=1+.032*smooth(47,79.5,raw);g.scale(zoom,zoom);g.translate(-960+2*Math.sin(raw*.14),-540);sky();
  // Rear cloud layer has its own slow parallax; paper-coloured silhouettes occlude the sky hatch.
  for(let i=0;i<5;i++)cloud(160+i*400+Math.sin(raw*.15+i)*22,140+(i%2)*-25,.72+(i%2)*.15,i%2?-1:1);
  ground(t);herald(290,294,-1,t,raw);herald(1635,294,1,t,raw);
  person('sol',690,797,t,raw);person('luna',1220,797,t,raw);birds(t);
  roundel(820,163,63,t,'wind',71.875);roundel(960,135,64,t,'sun',72.875);roundel(1100,163,63,t,'winter',73.75);
  g.restore();g.strokeStyle=C.ink;g.lineWidth=1.4;g.strokeRect(57,50,1806,970);g.lineWidth=.6;g.strokeRect(63,56,1794,958);
  // Tiny print registration ornaments belong to the plate, not to an overlay UI.
  for(const x of [57,1863])for(const y of [50,1020]){line(x-7,y,x+7,y,C.ink,.8);line(x,y-7,x,y+7,C.ink,.8)}
 };
})();
