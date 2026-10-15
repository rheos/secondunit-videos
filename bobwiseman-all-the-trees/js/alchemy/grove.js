/* A shared landscape, from nearby trunks to a distant vanishing point. */
(() => {
 const A=Alchemy,S=A.scene,{g,C,smooth,clamp,mix,noise,line,stroke,fill,ellipse}=A;
 const horizon={x:1040,y:455},depths=[1,.65,.40,.23,.125,.055],counts=[4,6,8,10,10,12];
 const trees=depths.flatMap((depth,row)=>Array.from({length:counts[row]},(_,i)=>{
  const seed=37+row*71+i*17;
  const x=row===0?[400,690,1220,1520][i]:horizon.x+mix(-1170,1170,i/(counts[row]-1))*depth+(noise(seed)-.5)*95*depth;
  return {id:`${row}-${i}`,row,seed,x,y:horizon.y+305*depth,depth,
   size:depth*(row===0&&[1,2].includes(i)?1:.85+noise(seed+2)*.2),
   start:()=>ALCHEMY_CUES.grove.firstTree+row*ALCHEMY_CUES.grove.depthDelay+(i%3)*3};
 }));
 function state(t){const c=ALCHEMY_CUES.grove,f=t*24,exit=smooth(...c.retreat,f);
  const down=smooth(...c.cameraDown,f),up=smooth(...c.cameraUp,f);
  const cameraY=110*smooth(...c.land,f)*(1-down)-135*down*(1-up);
  return {cameraY,land:smooth(...c.land,f)*(1-smooth(...c.landRetreat,f)),trees:trees.map(tree=>{
   const p=clamp((f-tree.start())/c.popDuration),grow=smooth(0,1,p);
   return {...tree,start:tree.start(),grow:grow*(1-exit),pop:p,exit};
  })};
 }
 function leaf(x,y,a,k){g.save();g.translate(x,y);g.rotate(a);g.scale(k,k);
  fill('M0 0Q-25-18-13-48Q14-30 0 0',C.green);stroke('M0 0Q-25-18-13-48Q14-30 0 0',C.ink,1.3);line(0,0,-12,-42,C.ink,.8);g.restore();
 }
 function treeShape(seed,t,depth){
  // v11: children are drawn before their parent and start in a narrow neck, so every join tucks under
  // the parent limb instead of showing a sawn-off butt end (audit A7).
  function branch(px,py,angle,length,level,id){const ex=px+Math.cos(angle)*length,ey=py+Math.sin(angle)*length;
   if(level>1){branch(ex,ey,angle-.44-noise(id)*.18,length*.72,level-1,id*2);branch(ex,ey,angle+.50+noise(id+1)*.16,length*.73,level-1,id*2+1)}
   S.woodyRoot([px,py,px+Math.cos(angle+.12)*length*.35,py+Math.sin(angle+.12)*length*.35,ex-12,ey+24,ex,ey],1,level*4+2,level*2,id,{neck:true});
   if(level===1){leaf(ex,ey,angle+1.7,.75);leaf(ex-8,ey+13,angle-.6,.65)}
  }
  const fork=depth<.15?2:3,bend=.09*Math.sin(t*1.8+seed);
  branch(0,-153,-2.38+bend,96,fork,seed);branch(2,-202,-.81+bend,109,fork,seed+20);branch(0,-293,-1.61+bend,76,fork,seed+40);
  S.woodyRoot([0,0,-12,-90,20,-203,0,-303],1,43,15,seed);
 }
 function draw(raw){const st=state(raw);if(!st.land)return;const t=Math.floor(Math.round(raw*24)/2)/12;
  g.save();g.beginPath();g.rect(76,70,1768,690);g.clip();
  const edge=mix(760,horizon.y,st.land);
  fill(`M76 ${edge+6}Q500 ${edge-9} 1040 ${edge}T1844 ${edge+3}V761H76Z`,'#e6d49c');
  // Thin distant escarpments and narrowing erosion marks establish a far plain.
  g.save();g.globalAlpha=st.land*.6;
  fill(`M76 ${edge+6}L190 ${edge-15}L285 ${edge-12}L354 ${edge-4}L600 ${edge+2}Z`,'#b8b99d');
  fill(`M1350 ${edge+2}L1490 ${edge-11}L1560 ${edge-9}L1660 ${edge-23}L1790 ${edge-21}L1844 ${edge+3}Z`,'#b8b99d');
  stroke(`M76 ${edge+6}Q500 ${edge-9} 1040 ${edge}T1844 ${edge+3}`,C.ink,1);
  for(let i=0;i<12;i++){const x=100+i*153;stroke(`M${x} 760Q${mix(x,1040,.65)} ${edge+83} ${1040+(x-1040)*.07} ${edge+4}`,'#a89567',.8)}
  // A winding unplanted route gives the repeating forms a readable negative space.
  fill(`M865 760Q967 640 1010 ${edge+48}L1040 ${edge}Q1038 ${edge+59} 1047 ${edge+104}Q1032 659 1034 760Z`,'#f4e4b4');
  for(let i=0;i<170;i++){const d=noise(i+10),y=edge+(760-edge)*d*d,x=80+noise(i+207)*1760;line(x,y,x+2+12*d,y-1,'#b29b69',.55)}
  g.restore();
  for(const tree of [...st.trees].reverse()){
   if(tree.grow<=0)continue;
   const {x,y,size,seed,depth,pop,exit}=tree,settle=1+.14*Math.sin(pop*Math.PI*2)*(1-pop),k=tree.grow*settle;
   // Shadows sit on the same perspective plane and grow with their tree.
   g.save();g.globalAlpha=.18*tree.grow;g.translate(x,y);g.scale(size,size);
   fill(`M-16 0L${-270*k} ${-68*k}L${-284*k} ${-79*k}L${-238*k} ${-68*k}L${-174*k} ${-42*k}L${-160*k} ${-57*k}L${-140*k} ${-39*k}L12 0Z`,'#514e4c');g.restore();
   g.save();g.beginPath();g.rect(x-245*size,y-500*size,490*size,500*size);g.clip();
   g.translate(x,y+400*size*exit);g.scale(size*(.97+.03*k)*k,size*k);
   g.rotate(.025*Math.sin(t*1.8+seed));treeShape(seed,t,depth);g.restore();
  }
  g.restore();
 }
 A.grove={draw,state,treeShape};
})();
