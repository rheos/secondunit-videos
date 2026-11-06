/* Travel Agent: An Escape Brochure. Original Canvas animation, 2026-10-06.
   Each frame is a deterministic function of time. No generated footage. */
const canvas=document.getElementById('film'), g=canvas.getContext('2d');
const W=1920,H=1080,TAU=Math.PI*2;
const C={paper:'#eee5cd',light:'#faf3df',ink:'#203d3c',soft:'#476360',teal:'#348a86',sea:'#1d6669',pale:'#a2bbb0',red:'#c6533f',ochre:'#dca85e',shadow:'#c6bba3'};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)), mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const ease=t=>1-Math.pow(1-clamp(t),3), hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)};
let T=0;
const CUT1=127/24,CUT2=246/24,CUT3=346/24;
const audioEnergy=t=>(AUDIO.energy[Math.min(479,Math.max(0,Math.floor(t*24)))]||0);
const audioAccent=t=>(AUDIO.onset[Math.min(479,Math.max(0,Math.floor(t*24)))]||0);
function path(points,fill=C.ink,stroke=null,width=3){g.beginPath();for(let p of points){if(p[0]==='M')g.moveTo(p[1],p[2]);else if(p[0]==='L')g.lineTo(p[1],p[2]);else if(p[0]==='C')g.bezierCurveTo(...p.slice(1));else if(p[0]==='Q')g.quadraticCurveTo(...p.slice(1));else if(p[0]==='Z')g.closePath();}if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke()}}
function line(x1,y1,x2,y2,c=C.ink,w=3){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=c;g.lineWidth=w;g.stroke()}
function rect(x,y,w,h,c,stroke=null,lw=3){g.fillStyle=c;g.fillRect(x,y,w,h);if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.strokeRect(x,y,w,h)}}
function ellipse(x,y,rx,ry,c,stroke=null,lw=3){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);if(c){g.fillStyle=c;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke()}}
function at(x,y,s,rot,fn){g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);fn();g.restore()}
function text(str,x,y,size=30,c=C.ink,align='left',font='Georgia'){g.font=`${size}px ${font}`;g.fillStyle=c;g.textAlign=align;g.fillText(str,x,y)}
function hatch(x,y,w,h,spacing=12,col=C.ink,alpha=.15){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.globalAlpha=alpha;for(let i=-h;i<w;i+=spacing)line(x+i,y+h,x+i+h,y,col,1.5);g.restore()}
function strokeCurve(pts,col=C.ink,width=3){path(pts,null,col,width)}
function paper(x,y,w,h,rot=0){at(x,y,1,rot,()=>{rect(8,10,w,h,'#203d3c20');path([['M',0,2],['L',w,-2],['L',w-1,h],['L',2,h+3],['Z']],C.light,C.ink,2);});}
const grain=document.createElement('canvas');grain.width=grain.height=512;
{const a=grain.getContext('2d'),d=a.createImageData(512,512);for(let i=0;i<512*512;i++){let n=hash(i);d.data[i*4]=75;d.data[i*4+1]=57;d.data[i*4+2]=36;d.data[i*4+3]=n>.55?Math.floor((n-.55)*47):0;}a.putImageData(d,0,0);for(let i=0;i<900;i++){a.fillStyle=i%3?'#fff5':'#5444220b';a.fillRect(hash(i+70)*512,hash(i+600)*512,1+hash(i+9)*7,.7)}}
const grainPattern=g.createPattern(grain,'repeat');
function finish(){g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='multiply';g.fillStyle=grainPattern;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.strokeStyle=C.paper;g.lineWidth=34;g.strokeRect(0,0,W,H);g.strokeStyle='#203d3c44';g.lineWidth=1;g.strokeRect(27,27,W-54,H-54);g.restore()}
function star(x,y,r,c=C.light){path([['M',x,y-r],['Q',x+2,y-2,x+r,y],['Q',x+2,y+2,x,y+r],['Q',x-2,y+2,x-r,y],['Q',x-2,y-2,x,y-r],['Z']],c)}
function sun(x,y,r,t){ellipse(x+3,y+1,r,r,C.red);g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();for(let i=-r;i<r;i+=9){g.globalAlpha=.15;line(x-r,y+i,x+r,y+i-20,C.paper,2)}g.restore();for(let i=0;i<12;i++){let a=i*TAU/12+t*.02;line(x+Math.cos(a)*(r+14),y+Math.sin(a)*(r+14),x+Math.cos(a)*(r+23),y+Math.sin(a)*(r+23),C.red,1.6)}}
function cloud(x,y,s,t){at(x,y,s,0,()=>{strokeCurve([['M',-150,8],['Q',-124,-10,-102,0],['C',-96,-38,-48,-36,-39,-18],['C',-27,-61,35,-62,48,-20],['Q',74,-32,95,-2],['Q',125,-9,149,8]],C.ink,2);line(-155,17,154,17,C.ink,1.4);line(-105,27,113,27,C.ink,1);});}
function bird(x,y,s,t,red=false){at(x,y,s,-.1+Math.sin(t*1.5)*.08,()=>{let flap=Math.sin(Math.floor(t*12)/12*6.7);path([['M',-3,5],['C',-35,-12,-67,-20-flap*41,-111,-11-flap*65],['Q',-81,12-flap*18,-43,32],['Q',-12,39,13,14],['C',36,18,52,-8,72,-18],['Q',92,-22,108,-13],['L',80,-4],['Q',65,38,31,35],['L',-11,61],['L',-42,56],['L',-22,35],['Z']],red?C.red:C.ink,red?C.ink:null,1.3);path([['M',3,15],['Q',28,-19,22,-66-flap*65],['Q',52,-39-flap*21,52,-6],['Q',47,15,15,26],['Z']],red?C.red:C.ink,red?C.ink:null,1.3);line(-72,flap*-31, -31,23,C.paper,1.5);ellipse(75,-13,2.8,2.8,C.paper);});}
function ticket(x,y,s,rot,mark='ONE WAY'){at(x,y,s,rot,()=>{paper(-130,-55,260,110);g.setLineDash([3,5]);line(67,-50,67,48,C.ink,1);g.setLineDash([]);text(mark,-108,-14,18);line(-108,0,48,0,C.red,3);text('ANYWHERE',-108,28,15);for(let i=0;i<12;i++)line(82+i*3,-33,82+i*3,31,C.ink,i%3?1:2);ellipse(-130,0,9,9,C.paper);ellipse(130,0,9,9,C.paper);});}
function traveler(x,y,s,t,{walk=0,lean=0,arm=0,wind=1,back=false}={}){at(x,y,s,lean,()=>{
  let sw=Math.sin(t*5.8)*walk;
  ellipse(1,8,64,10,'#203d3c19');
  path([['M',-28,-107],['L',-30+sw*18,-12],['L',-55+sw*22,-5],['Q',-65+sw*22,4,-34+sw*22,3],['L',-6+sw*18,-4],['L',10,-98],['Z']],C.ink);
  path([['M',6,-108],['L',18-sw*22,-7],['L',41-sw*20,-4],['Q',59-sw*20,5,21-sw*20,8],['L',-3-sw*16,1],['L',-22,-91],['Z']],C.ink);
  path([['M',-22,-299],['Q',-58,-278,-55,-234],['L',-70,-112],['Q',-25,-92,39,-112],['L',25,-229],['L',27,-286],['Z']],C.ochre,C.ink,3);
  g.save();g.beginPath();g.moveTo(-22,-299);g.lineTo(-55,-234);g.lineTo(-70,-112);g.lineTo(39,-112);g.lineTo(25,-285);g.closePath();g.clip();hatch(-80,-310,135,220,9,C.ink,.21);g.restore();
  path([['M',-21,-291],['L',-11,-224],['L',5,-272],['L',20,-290]],null,C.ink,3);line(-11,-224,-14,-125,C.ink,2);for(let i=0;i<3;i++)ellipse(-2,-214+i*29,3,3,C.ink);
  path([['M',-12,-323],['L',-18,-292],['Q',0,-281,16,-294],['L',15,-321],['Z']],C.paper,C.ink,3);
  path([['M',-28,-359],['Q',-46,-337,-27,-311],['Q',-9,-293,14,-314],['L',20,-329],['L',35,-332],['L',20,-346],['Q',15,-373,-13,-372],['Z']],C.paper,C.ink,3);
  if(!back){ellipse(12,-347,2.2,3,C.ink);line(8,-355,18,-355,C.ink,2);strokeCurve([['M',6,-318],['Q',13,-318,17,-322]],C.ink,2);}
  path([['M',-56,-365],['Q',-37,-374,-26,-375],['L',-30,-401],['Q',-2,-412,22,-400],['L',24,-373],['Q',47,-368,52,-361],['Q',-7,-349,-56,-365],['Z']],C.ink);line(-26,-377,22,-376,C.paper,2);
  path([['M',-25,-302],['Q',-9,-293,24,-303],['L',20,-290],['Q',-8,-283,-25,-291],['Z']],C.red);
  let a=Math.sin(t*3)*6*wind*(.8+.4*audioEnergy(t));path([['M',-20,-295],['C',-53,-299,-69,-314+a,-94,-300+a],['L',-111,-287+a],['L',-99,-311+a],['Q',-69,-328+a,-21,-304],['Z']],C.red);
  let hx=mix(29,86,arm),hy=mix(-179,-254,arm);
  strokeCurve([['M',10,-276],['Q',41,-245,hx,hy]],C.ink,20);strokeCurve([['M',10,-276],['Q',41,-245,hx,hy]],C.ochre,14);ellipse(hx+4,hy+2,10,8,C.paper,C.ink,2);
  if(!arm){at(hx+2,hy+29,1,.02,()=>{rect(-18,-9,54,42,C.red,C.ink,3);strokeCurve([['M',-4,-10],['L',-4,-20],['L',17,-20],['L',17,-10]],C.ink,3);line(20,-6,20,29,C.paper,2);});}
});}
function plant(x,y,s,t){at(x,y,s,0,()=>{path([['M',-35,0],['L',-26,70],['L',30,70],['L',40,0],['Z']],C.red,C.ink,2);line(-42,0,45,0,C.ink,5);for(let i=0;i<6;i++){let k=i%2?-1:1,yy=-30-i*26,xx=k*(38+(i%3)*7)+Math.sin(t+i)*3;strokeCurve([['M',2,0],['Q',i*2,yy,xx,yy-23]],C.ink,2);path([['M',xx,yy-23],['Q',xx-k*40,yy-59,xx+k*15,yy-57],['Q',xx+k*23,yy-31,xx,yy-23]],C.teal,C.ink,1.5)}line(2,0,1,-201,C.ink,2);});}
function lamp(x,y,s,t){at(x,y,s,0,()=>{ellipse(0,0,54,10,C.ink);strokeCurve([['M',0,0],['L',0,-102],['L',47,-166]],C.ink,7);ellipse(0,-101,10,10,C.ochre,C.ink,3);path([['M',35,-177],['Q',68,-208,105,-178],['L',136,-149],['L',20,-149],['Z']],C.teal,C.ink,3);line(19,-148,137,-148,C.ink,5);});}
function poster(x,y,w,h,type,t){paper(x,y,w,h,-.008);g.save();g.beginPath();g.rect(x+14,y+14,w-28,h-65);g.clip();rect(x+14,y+14,w-28,h-65,C.pale);if(type==='sea'){sun(x+w*.66,y+h*.25,36,t);for(let i=0;i<6;i++){let yy=y+h*.42+i*23;path([['M',x,yy],['Q',x+w*.3,yy-20,x+w*.55,yy+7],['Q',x+w*.8,yy+24,x+w,yy-3],['L',x+w,y+h],['L',x,y+h],['Z']],i%2?C.teal:C.sea);}}else{sun(x+w*.3,y+h*.27,31,t);path([['M',x,y+h],['L',x+w*.6,y+45],['L',x+w,y+h],['Z']],C.paper);path([['M',x+w*.6,y+45],['L',x+w*.53,y+h],['L',x+w,y+h],['Z']],C.soft);path([['M',x,y+h],['L',x+w*.2,y+125],['L',x+w*.68,y+h],['Z']],C.light)}g.restore();text(type==='sea'?'ELSEWHERE':'FURTHER',x+w/2,y+h-19,21,C.ink,'center');}
function agency(t,{sea=0,scale=1}={}){
 rect(0,0,W,H,C.paper);rect(40,40,1840,746,'#e7dfc7');
 for(let i=0;i<18;i++)line(60+i*108,65,60+i*108,771,'#203d3c12',1);
 line(48,774,1872,774,C.ink,3);rect(48,776,1824,20,C.ink);rect(48,797,1824,231,'#d4c8ad');
 for(let i=-3;i<14;i++)line(960+(i-5)*105,798,960+(i-5)*330,1060,'#203d3c34',2);line(50,886,1870,886,'#203d3c22',2);line(50,997,1870,997,'#203d3c22',2);
 // A slim railway-station clock above the counter.
 ellipse(1010,159,64,64,C.light,C.ink,4);for(let i=0;i<12;i++){let a=i*TAU/12;line(1010+Math.sin(a)*50,159-Math.cos(a)*50,1010+Math.sin(a)*55,159-Math.cos(a)*55,C.ink,2)}at(1010,159,1,-t*.22,()=>{line(0,0,0,-43,C.ink,3);line(0,0,31,10,C.red,3)});ellipse(1010,159,5,5,C.ink);
 poster(1207,103,262,314,'sea',t);poster(1534,105,221,314,'mountain',t);
 // Ticket drawers, with engraved numbers and brass handles.
 rect(1440,488,351,291,C.soft,C.ink,4);for(let i=0;i<4;i++)for(let j=0;j<3;j++){let x=1452+j*110,y=499+i*65;rect(x,y,103,59,C.paper,C.ink,2);rect(x+33,y+27,35,10,C.ochre,C.ink,1.5);text(String(10+i*3+j),x+10,y+20,12);}
 plant(166,807,1.2,t);
 // Empty door: reflected routes and the suggestion of another identical office.
 rect(354,330,222,445,C.light,C.ink,5);rect(370,347,191,370,C.pale,C.ink,2);g.save();g.globalAlpha=.2;for(let i=0;i<5;i++)line(375,363+i*47,554,531+i*40,C.light,14);g.restore();ellipse(549,579,6,6,C.ochre,C.ink,2);
 // Clerk, with a long sleeve and an emphatic rubber stamp.
 at(1157,682,1,0,()=>{path([['M',-79,0],['L',-61,-163],['Q',-14,-183,33,-150],['L',62,0],['Z']],C.ink);path([['M',-35,-170],['L',-9,-139],['L',13,-167],['L',-2,-96],['Z']],C.light);path([['M',-36,-227],['C',-40,-261,18,-264,28,-230],['L',25,-187],['Q',-11,-164,-31,-195],['Z']],C.paper,C.ink,3);path([['M',-38,-222],['L',-40,-242],['Q',-9,-273,27,-242],['L',28,-221],['L',14,-237],['Q',-12,-233,-38,-222]],C.ink);ellipse(-9,-218,13,10,null,C.ink,2);ellipse(18,-218,12,10,null,C.ink,2);line(4,-220,7,-220,C.ink,2);line(-4,-190,10,-190,C.ink,1.7);let q=smooth(1.6,2.6,t)-smooth(3.3,4,t);strokeCurve([['M',-55,-145],['Q',-111,-102,-122-q*45,-32-q*13]],C.ink,29);strokeCurve([['M',-55,-145],['Q',-111,-102,-122-q*45,-32-q*13]],C.light,21);ellipse(-122-q*45,-32-q*13,17,10,C.paper,C.ink,2);});
 // Counter and furnishings.
 path([['M',855,678],['L',1517,678],['L',1550,704],['L',821,704],['Z']],C.ochre,C.ink,4);rect(854,706,662,240,C.soft,C.ink,4);rect(877,727,615,191,C.paper,C.ink,3);rect(896,747,577,151,C.paper,C.ink,1);hatch(899,748,571,147,13,C.ink,.11);text('DEPARTURES',1185,815,34,C.ink,'center');text('one way / any day',1185,853,19,C.soft,'center');
 lamp(1394,674,.78,t);ticket(1035-145*smooth(1.8,3.5,t),662,.38,-.03,'ONE WAY');
 rect(1200,642,60,30,C.ink);rect(1220,611,20,35,C.red,C.ink,2);ellipse(1230,610,22,9,C.red,C.ink,2);
 const walk=1-smooth(1.4,2.7,t);let xx=mix(571,747,ease(t/2.7));traveler(xx,947,1.14,t,{walk,arm:smooth(2,3.2,t),lean:-.025,wind:.25});
 if(sea>0){g.save();g.globalAlpha=sea;for(let i=0;i<4;i++){let y=455+i*60;path([['M',1230,y-200],['C',1150,y-100,1250,y,1080,y+70],['C',940,y+150,780,y+110,675,y+205],['L',1740,1040],['L',1740,430],['Z']],i%2?C.teal:C.sea);}g.restore();}
}
function waves(t,top=500,amplitude=22,foreground=true){for(let l=0;l<6;l++){let y=top+l*105;let col=[C.pale,C.teal,C.sea,'#398984','#245f63','#194e55'][l];g.beginPath();g.moveTo(-100,H+80);g.lineTo(-100,y);for(let x=-100;x<=W+100;x+=24){let z=y+Math.sin(x*.006+t*.67+l*1.9)*amplitude*(.9+.1*audioEnergy(t))+Math.sin(x*.013-t*.4+l)*amplitude*.3;g.lineTo(x,z)}g.lineTo(W+100,H+80);g.closePath();g.fillStyle=col;g.fill();g.strokeStyle=C.ink;g.lineWidth=2;g.stroke();for(let j=0;j<13;j++){let x=hash(j+l*44)*2150-100+(t*(l+1)*7)%80,yy=y+32+hash(j+123+l*11)*60;strokeCurve([['M',x,yy],['Q',x+30,yy-8,x+62,yy],['Q',x+85,yy+5,x+102,yy-3]],l<2?C.soft:C.paper,1.3);}}
}
function boat(x,y,s,t){at(x,y,s,Math.sin(t*1.4)*.055,()=>{
 path([['M',-209,-26],['L',-21,-94],['L',188,-25],['L',104,52],['L',-135,53],['Z']],C.light,C.ink,3);
 path([['M',-209,-26],['L',-16,14],['L',104,52],['L',-135,53],['Z']],C.ochre,C.ink,2);
 path([['M',-16,14],['L',-21,-94],['L',188,-25],['Z']],C.paper,C.ink,2);
 line(-16,14,105,52,C.ink,2);text('ONE WAY',-130,10,18,C.ink);for(let i=0;i<9;i++)line(15+i*10,-28,15+i*10,-12,C.ink,i%3?1:2);
});}
function flood(t){const u=t-CUT1;rect(0,0,W,H,C.paper);
 // The poster expands into a real horizon; the counter is now the jetty.
 sun(1440-u*16,212,93,t);cloud(453-u*8,171,1.1,t);cloud(1082-u*12,348,.56,t);
 for(let i=0;i<5;i++)strokeCurve([['M',80+i*330,380],['Q',160+i*330,364,266+i*330,380]],C.soft,1);
 waves(t,520,22);let rise=smooth(0,4.5,u)*35;
 path([['M',-30,705],['L',682,628],['L',839,687],['L',-30,834],['Z']],C.ochre,C.ink,4);path([['M',-30,834],['L',839,687],['L',837,731],['L',-30,882],['Z']],C.ink);
 for(let i=0;i<9;i++)line(i*98,718-i*10,i*98+125,803-i*18,C.ink,2);
 line(155,806,142,1080,C.ink,25);line(649,745,670,1080,C.ink,25);lamp(375,685,.7,t);
 at(200,482,.8,-.13,()=>{rect(-70,-20,169,72,C.light,C.ink,2);text('ELSEWHERE',15,25,18,C.ink,'center');line(16,52,16,218,C.ink,5)});
 const xx=965+u*52, yy=665+Math.sin(t*1.4)*10-rise;
 traveler(xx,yy-8,.55,t,{arm:.15,wind:1.8,lean:Math.sin(t)*.035});boat(xx,yy,1.03,t);
 // Spiral route, emerging from the boat into the empty sky.
 let q=smooth(.6,4.4,u);g.save();g.setLineDash([7,10]);g.lineDashOffset=-t*14;g.strokeStyle=C.red;g.lineWidth=3;g.beginPath();g.moveTo(xx-30,yy-230);g.bezierCurveTo(xx+135,yy-310,1155,300,925,292);g.bezierCurveTo(725,282,759,465,963,405);g.stroke();g.restore();
 for(let i=0;i<7;i++){let k=hash(i+70),bx=800+k*850,by=260+hash(i+80)*240;g.save();g.globalAlpha=q*.7;bird(bx+Math.sin(t+i)*15,by,.1+i*.006,t+i);g.restore();}
 let lift=smooth(2.2,4.6,u);ticket(mix(1140,1150,lift),mix(600,455,lift),mix(.22,.8,lift),-.25+Math.sin(t)*.06,'ONE WAY');
}
function mapLines(x,y,w,h,t){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 for(let i=0;i<14;i++){let yy=y+i*h/13;strokeCurve([['M',x-60,yy],['C',x+w*.25,yy+120*Math.sin(i),x+w*.6,yy-120,x+w+60,yy+20]],'#50736a55',1.4)}
 for(let i=0;i<15;i++){let xx=x+i*w/14;strokeCurve([['M',xx,y-60],['C',xx+160,y+h*.3,xx-80,y+h*.7,xx+40,y+h+40]],'#50736a3c',1.2)}
 path([['M',x+90,y+35],['Q',x+212,y+115,x+193,y+196],['L',x+310,y+234],['Q',x+286,y+354,x+425,y+405],['Q',x+455,y+500,x+670,y+560],['L',x+w,y+h],['L',x+w,y],['Z']],C.pale);
 for(let i=0;i<25;i++){let xx=x+hash(i+44)*w,yy=y+hash(i+200)*h;ellipse(xx,yy,2,2,C.soft);if(i%4===0 && yy>y+170)text(['PORT','NORTH','THE EDGE','WEST','UNKNOWN','AWAY'][i%6],xx+8,yy-8,13,C.soft);}
 g.restore();}
function mapScene(t){const u=t-CUT2;rect(0,0,W,H,C.paper);
 let zz=1+u*.023;at(960,550,zz,-.065+u*.007,()=>{
 paper(-747,-421,1494,842);mapLines(-723,-397,1446,793,t);
 // Concertina folds catch different light.
 for(let i=0;i<6;i++){let x=-747+i*249;rect(x,-421,249,842,i%2?'#203d3c0e':'#ffffff14');line(x,-421,x,421,'#203d3c36',2)}
 text('A MAP OF SOMEWHERE ELSE',-686,-327,29);line(-686,-301,-161,-301,C.ink,2);
 at(569,-284,1,t*.016,()=>{for(let i=0;i<4;i++){let a=i*Math.PI/2;at(0,0,1,a,()=>{path([['M',0,-60],['L',11,0],['L',0,60],['L',-11,0],['Z']],i%2?C.paper:C.ink,C.ink,1)})}ellipse(0,0,8,8,C.red);text('N',0,-76,17,C.ink,'center');});
 let p=ease(u/2.4),startX=-519,startY=192;
 g.save();g.setLineDash([10,9]);g.lineDashOffset=-t*18;g.beginPath();g.moveTo(startX,startY);g.bezierCurveTo(-640,-80,-75,213,-95,8);g.bezierCurveTo(-120,-160,-410,-124,-346,37);g.bezierCurveTo(-247,219,255,-160,466,-130);g.strokeStyle=C.red;g.lineWidth=5;g.stroke();g.restore();
 ellipse(startX,startY,13,13,C.red);ellipse(startX,startY,5,5,C.paper);
 ticket(-466,290,.67,-.045,'DEPARTURE');
 // The route lifts physically from paper, acquiring wings.
 let bx=mix(-100,345,smooth(.6,3.4,u)),by=mix(8,-184,smooth(.6,3.4,u));
 g.save();g.globalAlpha=.14;bird(bx+30,by+70,1.32,t,true);g.restore();
 let birth=smooth(.1,1.7,u);g.save();g.globalAlpha=birth;bird(bx,by,1.36,t,true);g.restore();
 for(let i=0;i<7;i++){let q=(u*.36+i/7)%1;at(bx-230*q,by+100*q,1,q*4,()=>{g.globalAlpha=(1-q)*birth;rect(-4,-12,8,24,i%2?C.red:C.ink)});}
 });
}
function mountain(x,y,w,h,c){path([['M',x-w/2,y],['L',x-w*.16,y-h*.69],['L',x,y-h],['L',x+w*.17,y-h*.51],['L',x+w/2,y],['Z']],c,C.ink,2);path([['M',x,y-h],['L',x+w*.06,y],['L',x+w/2,y],['Z']],C.soft,C.ink,1);path([['M',x-w*.16,y-h*.69],['L',x,y-h],['L',x+w*.17,y-h*.51],['L',x+w*.05,y-h*.61],['L',x-w*.02,y-h*.51],['Z']],C.light,C.ink,1);}
function destination(t){let u=t-CUT3;rect(0,0,W,H,C.paper);sun(1393,278,142,t);cloud(334-u*8,179,1.07,t);cloud(989-u*5,136,.51,t);cloud(1670-u*6,426,.69,t);
 // A landscape folded from the map, with its cartographic lines still visible.
 mountain(550,598,488,293,C.pale);mountain(756,603,450,416,C.paper);mountain(349,626,345,217,C.paper);
 for(let i=0;i<9;i++)strokeCurve([['M',90+i*34,583-i*16],['L',285+i*13,606-i*10]],C.soft,1);
 waves(t,625,18);
 // A distant island holds another travel agency: an unresolved circular journey.
 at(1490,625,.62,0,()=>{path([['M',-184,20],['Q',-25,-31,192,24],['L',119,59],['L',-101,53],['Z']],C.ochre,C.ink,3);rect(-80,-98,160,117,C.light,C.ink,3);path([['M',-101,-99],['L',0,-155],['L',101,-99],['Z']],C.red,C.ink,3);rect(-31,-46,45,63,C.ink);rect(28,-43,32,30,C.pale,C.ink,2);text('TRAVEL',0,-74,19,C.ink,'center');plant(-109,0,.39,t);});
 let xx=714+u*28, yy=824+Math.sin(t*1.4)*11;
 traveler(xx,yy-12,.61,t,{arm:.22,wind:1.4,lean:.015});boat(xx,yy,1.46,t);
 // Foreground swell partially masks the bottom of the boat.
 path([['M',-20,942],['C',440,850,566,933,940,941],['C',1300,951,1600,861,1940,923],['L',1940,1080],['L',-20,1080],['Z']],C.sea,C.ink,2);
 for(let i=0;i<20;i++){let x=hash(i+87)*1900,y=963+hash(i+223)*78;strokeCurve([['M',x,y],['Q',x+40,y-8,x+95,y-2]],C.pale,1.4)}
 bird(1018+u*49,339-Math.sin(u*.37)*85, .78-u*.045,t,true);
 for(let i=0;i<4;i++)bird(383+i*83+u*19,287+Math.sin(i+u)*22,.08,t+i);
}
function frame(t){T=clamp(t,0,19.999);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.lineCap='round';g.lineJoin='round';
 // Very slight registration drift, held on threes like an animated print.
 let j=Math.floor(T*8);g.save();g.translate((hash(j+55)-.5)*.6,(hash(j+81)-.5)*.6);
 if(T<CUT1){let z=1+T*.017;at(960,555,z,0,()=>{g.translate(-960,-555);agency(T,{sea:smooth(4.05,CUT1,T)*.5})});}
 else if(T<CUT2)flood(T);else if(T<CUT3)mapScene(T);else {let z=1+(T-CUT3)*.008;at(960,540,z,0,()=>{g.translate(-960,-540);destination(T)});}
 g.restore();finish();
 // A brief full-frame paper turn motivates each change of scale.
 for(let cut of [CUT1,CUT2,CUT3]){let d=T-cut;if(d>-.22&&d<.22){let p=(d+.22)/.44;let xx=mix(-4500,2500,p);g.save();g.translate(xx,0);path([['M',0,-100],['L',3500,-100],['L',4050,1180],['L',550,1180],['Z']],C.light);line(3500,-100,4050,1180,C.ochre,3);hatch(0,-50,4050,1200,16,C.ink,.035);g.restore();}}
}
window.__ready=true;window.__render=frame;window.__frameJPEG=(t,q=.94)=>{frame(t);return canvas.toDataURL('image/jpeg',q)};
const audio=document.getElementById('song'),button=document.getElementById('play');let playing=false,origin=0;
button.onclick=async()=>{if(playing){audio.pause();playing=false;button.textContent='Play the 20-second study';return;}audio.currentTime=AUDIO.start||0;await audio.play();origin=performance.now();playing=true;button.textContent='Pause';requestAnimationFrame(tick)};
function tick(){if(!playing)return;let t=audio.currentTime-(AUDIO.start||0);frame(Math.min(t,19.999));if(t>=20){audio.pause();playing=false;button.textContent='Replay the study';return;}requestAnimationFrame(tick)}
if(new URLSearchParams(location.search).has('offline'))document.body.classList.add('offline');frame(0);
