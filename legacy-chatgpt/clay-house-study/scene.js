import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
// Original miniature and performance. Scene/material architecture informed by PC Anatomy.
const W=1920,H=1080,DURATION=16,canvas=document.querySelector('#film');
const offline=new URLSearchParams(location.search).has('offline');if(offline)document.body.classList.add('offline');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new T.Scene();scene.background=new T.Color('#c9c0a8');scene.fog=new T.Fog('#c9c0a8',19,42);
const camera=new T.PerspectiveCamera(32,W/H,.05,70);
const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.08);scene.environment=env.texture;scene.environmentIntensity=.28;room.dispose();pmrem.dispose();
scene.add(new T.HemisphereLight('#ffefd7','#647564',1.15));
const key=new T.DirectionalLight('#fff1d2',3.2);key.position.set(-5,9,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:8,bottom:-5,near:.1,far:25});key.shadow.normalBias=.015;key.shadow.bias=-.00008;key.shadow.radius=6;scene.add(key);
const rim=new T.DirectionalLight('#ceddd9',1.2);rim.position.set(5,6,-4);scene.add(rim);
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ease=(t,a,b)=>smooth((t-a)/(b-a));
const rand=n=>{const v=Math.sin(n*127.1+39.7)*43758.5453;return v-Math.floor(v)};
function clayMap(seed){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,512,512);
 for(let j=0;j<100;j++){let x=rand(seed+j)*512,y=rand(seed+j+110)*512,r=18+rand(seed+j+200)*45;const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,j%2?'rgba(255,255,255,.09)':'rgba(0,0,0,.09)');grad.addColorStop(1,'rgba(128,128,128,0)');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);}
 // Local thumb impressions. Continuous rings are avoided at texture borders.
 for(let j=0;j<7;j++){const x=70+rand(seed+j+300)*360,y=70+rand(seed+j+400)*360;g.save();g.translate(x,y);g.rotate(rand(seed+j+500)*6.28);g.scale(1,.62);g.lineWidth=1.2;for(let k=0;k<12;k++){g.strokeStyle=k%2?'rgba(54,54,54,.26)':'rgba(204,204,204,.18)';g.beginPath();g.ellipse(0,0,8+k*1.5,12+k*1.7,0,.5,5.6);g.stroke();}g.restore();}
 const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=8;return tx;}
const bump=clayMap(71);
function clay(color,rough=.86){return new T.MeshPhysicalMaterial({color,roughness:rough,metalness:0,bumpMap:bump,bumpScale:.075,clearcoat:.06,clearcoatRoughness:.88});}
const teal=clay('#507f79'),roofMat=clay('#ad5d45'),cream=clay('#eed5a2'),dark=clay('#334d48'),ochre=clay('#bda776'),amber=clay('#e7b76a'),wingMat=clay('#dfcfaa'),wood=clay('#759c8c'),stone=clay('#8b9586');
function mesh(geo,mat,parent=scene,pos=[0,0,0]){const obj=new T.Mesh(geo,mat);obj.position.set(...pos);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
function pressed(geo,seed,amount=.017){const p=geo.attributes.position,n=geo.attributes.normal;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=amount*(Math.sin(x*7.1+y*3.4+seed)*Math.cos(z*5.3+y*4.2)+.4*Math.sin(x*17+z*13+seed));p.setXYZ(i,x+n.getX(i)*d,y+n.getY(i)*d,z+n.getZ(i)*d);}geo.computeVertexNormals();return geo;}
function box(size,mat,parent,pos,r=.07,seed=4){return mesh(pressed(new RoundedBoxGeometry(...size,5,r),seed),mat,parent,pos);}
function tube(points,r,mat,parent=scene){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),mat,parent);}
const ground=mesh(new T.PlaneGeometry(100,100),clay('#bfb49a'),scene);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
// Grounded miniature set: pressed stones, a low ridge and a shallow pond.
const plinth=mesh(new T.CylinderGeometry(5.25,5.45,.32,96),clay('#a69776'),scene,[0,-.20,0]);
mesh(new T.CylinderGeometry(1.85,1.87,.035,64),clay('#6e9d9d',.42),scene,[2.8,.012,-1.6]);
for(let j=0;j<16;j++){let a=j/16*Math.PI*2;const s=mesh(pressed(new T.SphereGeometry(1,18,12),j,.035),stone,scene,[2.8+1.95*Math.cos(a),.055,-1.6+1.95*Math.sin(a)]);s.scale.set(.22,.13,.15);s.rotation.y=j;}
for(let j=0;j<8;j++){const p=mesh(pressed(new T.SphereGeometry(1,18,12),j,.025),clay(j%2?'#8b9d76':'#73886c'),scene,[-3.3+rand(j)*.7,.15,-2.7+rand(j+13)*1.6]);p.scale.set(.5,.28,.4);}
for(let j=0;j<7;j++)box([.48,.07,.39],cream,scene,[-.55+Math.sin(j)*.13,.045,1.65+j*.42],.06,j);
// The darker footprint stays when the building leaves; the set is not attached to it.
box([2.8,.04,2.55],clay('#8e8971'),scene,[0,.016,0],.12);
const house=new T.Group();scene.add(house);
box([2.72,.12,2.45],teal,house,[0,.10,0],.05);
for(let side of[-1,1])box([.20,2.47,2.35],teal,house,[side*1.30,1.35,0],.07,side+10);
box([2.65,2.47,.20],teal,house,[0,1.35,-1.18],.07);
// Front is one thick extrusion with genuine window and doorway cutouts.
const frontShape=new T.Shape();frontShape.moveTo(-1.4,.1);frontShape.lineTo(1.4,.1);frontShape.lineTo(1.4,2.57);frontShape.lineTo(-1.4,2.57);frontShape.closePath();
function hole(x,y,w,h,r=.045){const p=new T.Path();p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);frontShape.holes.push(p);}
hole(-.56,1.35,1.12,.89);hole(-.97,.12,.65,1.06);
const facade=mesh(pressed(new T.ExtrudeGeometry(frontShape,{depth:.21,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:3,curveSegments:12}),8,.018),teal,house,[0,0,1.08]);
box([.55,.94,.11],wood,house,[-.645,.61,1.11],.04);mesh(new T.SphereGeometry(.035,12,10),cream,house,[-.43,.64,1.19]);
box([1.30,.10,.23],cream,house,[0,1.29,1.30],.035);box([1.30,.12,.19],cream,house,[0,2.29,1.30],.04);
for(let side of[-1,1])box([.10,.96,.19],cream,house,[side*.625,1.80,1.30],.035);
// Deep warm interior is enclosed by the side/back walls.
box([1.2,.93,.035],amber,house,[0,1.80,.86],.025);box([.045,.90,.10],dark,house,[0,1.8,1.05],.016);box([1.1,.045,.10],dark,house,[0,1.78,1.05],.016);
const shutters=[];
for(let side of[-1,1]){const hinge=new T.Group();hinge.position.set(side*.575,1.35,1.37);house.add(hinge);box([.55,.88,.09],wood,hinge,[-side*.275,.44,0],.035,side+80);for(let j=0;j<3;j++)box([.42,.024,.022],dark,hinge,[-side*.275,.2+j*.22,.055],.009);shutters.push({hinge,side});}
const roofShape=new T.Shape();roofShape.moveTo(-1.63,0);roofShape.lineTo(0,.94);roofShape.lineTo(1.63,0);roofShape.closePath();
mesh(pressed(new T.ExtrudeGeometry(roofShape,{depth:2.90,bevelEnabled:true,bevelThickness:.055,bevelSize:.055,bevelSegments:4}),17,.025),roofMat,house,[0,2.53,-1.45]);
// Rolled roof edges and tile seams are real raised clay, not screen-space lines.
for(let side of[-1,1]){tube([[side*1.60,2.54,-1.43],[side*1.62,2.54,0],[side*1.60,2.54,1.45]],.05,roofMat,house);
 for(let j=0;j<7;j++){const z=-1.34+j*.44;tube([[side*.12,3.44,z],[side*.8,3.04,z+.025],[side*1.53,2.59,z]],.012,clay('#9f563f'),house);}}
box([.39,.70,.44],roofMat,house,[.69,3.37,-.65],.07);box([.5,.12,.53],cream,house,[.69,3.73,-.65],.045);
// Wing roots stay outside the side walls. Folding is a hinge, not translation through walls.
const wings=[];
for(let side of[-1,1]){const root=new T.Group();root.position.set(side*1.96,1.89,-.25);house.add(root);const body=new T.Group();root.add(body);
 const arm=mesh(pressed(new T.SphereGeometry(1,28,18),43+side,.012),wingMat,body,[side*.78,0,0]);arm.scale.set(.94,.13,.43);
 for(let j=0;j<5;j++){const feather=mesh(pressed(new T.SphereGeometry(1,22,14),70+j,.013),wingMat,body,[side*(.70+j*.17),-.016,-.22+j*.13]);feather.scale.set(.68-j*.055,.10,.115);feather.rotation.y=side*(-.37+j*.13);}
 box([.57,.20,.23],wingMat,house,[side*1.68,1.89,-.25],.07);mesh(new T.SphereGeometry(.15,18,14),cream,house,[side*1.96,1.89,-.25]);wings.push({root,side});}
// A second lightweight piece is used only as a quiet scale cue.
const pebble=mesh(pressed(new T.SphereGeometry(1,16,12),900,.04),cream,scene,[1.1,.11,2.4]);pebble.scale.set(.19,.10,.14);
function hop(t,a,b,height){const u=clamp((t-a)/(b-a));return t>=a&&t<=b?height*Math.sin(Math.PI*u):0;}
function renderAt(time){const t=Math.max(0,Math.min(DURATION,time)),pose=Math.floor(t*12)/12;
 const open=ease(pose,2.7,4.1),tryWindow=(ease(pose,1.9,2.15)-ease(pose,2.5,2.7));
 for(const {hinge,side} of shutters)hinge.rotation.y=side*(open*1.66+tryWindow*.10*Math.sin(pose*28));
 const unfold=ease(pose,4.15,5.8),takeoff=ease(pose,10.1,12.9),first=hop(pose,6.4,7.2,.32),second=hop(pose,8.4,9.3,.56);
 const flying=pose>=10.1,flap=flying?Math.sin(pose*8.2)*.68:pose>5.7?Math.sin(pose*9)*.48:0;
 for(const {root,side} of wings){root.rotation.z=side*((1-unfold)*1.42+flap);root.rotation.y=side*(.08+ease(pose,12.9,16)*.1);}
 const anticipation=(ease(pose,6.0,6.35)-ease(pose,6.35,6.5))*.06+(ease(pose,9.4,9.95)-ease(pose,9.95,10.2))*.09;
 const settle=(ease(pose,7.2,7.32)-ease(pose,7.45,7.85))*.05+(ease(pose,9.3,9.43)-ease(pose,9.55,9.95))*.055;
 const squash=anticipation+settle;house.scale.set(1+squash*.45,1-squash,1+squash*.45);
 house.position.set(takeoff*.28,first+second+takeoff*1.73+(flying?Math.sin(pose*4)*.035*takeoff:0),-takeoff*.55);
 house.rotation.z=(first+second)*.045+takeoff*Math.sin(pose*2.1)*.018;house.rotation.y=-takeoff*.18;
 // Camera remains outside the miniature; a mild dolly and rising attention follow the action.
 const dolly=ease(t,0,6),follow=ease(t,10,14);camera.position.set(6.4-dolly*.4,4.45+follow*.55,10.8-dolly*.6);camera.lookAt(.15,1.75+follow*.95,0);
 renderer.render(scene,camera);window.__state={time:t,poseTime:pose,housePosition:house.position.toArray(),windowOpen:open,wingUnfold:unfold};
}
window.__render=renderAt;window.__frameJPEG=(t)=>{renderAt(t);return canvas.toDataURL('image/jpeg',.95)};window.__ready=true;renderAt(0);
const play=document.querySelector('#play'),seek=document.querySelector('#seek'),time=document.querySelector('#time');let playing=false,start=0,offset=0;
play.onclick=()=>{playing=!playing;if(playing){offset=Number(seek.value)>=16?0:Number(seek.value);start=performance.now();}play.textContent=playing?'Pause':'Play';};seek.oninput=()=>{playing=false;play.textContent='Play';renderAt(Number(seek.value));time.textContent=Number(seek.value).toFixed(1)+' / 16 s';};
function tick(now){if(playing){const t=Math.min(16,offset+(now-start)/1000);seek.value=String(t);renderAt(t);time.textContent=t.toFixed(1)+' / 16 s';if(t>=16){playing=false;play.textContent='Replay';}}requestAnimationFrame(tick);}if(!offline)requestAnimationFrame(tick);
