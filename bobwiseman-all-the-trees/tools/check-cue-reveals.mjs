// Test the geometry used by the drawing, including odd song frames between held poses.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
const tag=process.argv[2]||'v7';
assert.match(tag,/^v[0-9]+$/);
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--disable-accelerated-2d-canvas']});
try {
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('file://'+process.cwd()+'/alchemy.html?offline=1');await page.evaluate(()=>window.__ready);
 const geometry=await page.evaluate(()=>{
  const faults=[],c=ALCHEMY_CUES.chorus,first={sol:null,luna:null};
  for(let f=0;f<3674;f++){
   const s=window.__alchemyState(f/24);
   if(s.songFrame!==f||s.poseFrame!==Math.floor(f/2)*2)faults.push(`grid ${f}`);
   if(f>=ALCHEMY_CUES.grove.retreat[0]&&s.grove.trees.some(t=>t.grow>0)&&s.grove.land!==1)faults.push(`ground retreats before trees ${f}`);
   if(s.chorus.sol.appear!==s.chorus.luna.appear)faults.push(`arrival ${f}`);
   for(const who of ['sol','luna']){
    const p=s.chorus[who],nodes=p.branchNodes.reduce((a,b)=>a+b,0);
    if(f<=c[who+'Branches'][0]&&nodes)faults.push(`early branches ${who} ${f}`);
    if(f>c[who+'Branches'][0]&&f<1908&&!nodes)faults.push(`missing branches ${who} ${f}`);
    if(nodes&&first[who]===null)first[who]=f;
    if(f<=c[who+'Leaves'][0]&&p.leaves.some(Boolean))faults.push(`early leaves ${who} ${f}`);
   }
  }
  for(const t of [81,85,97,103,128,131])for(const who of ['sol','luna'])if(Alchemy.scene.chorusState(t)[who].branchNodes.some(Boolean))faults.push(`branches should recede ${who} ${t}`);
  for(const t of [85.5,99,104,132,143.5,145])for(const [i,c] of Alchemy.ensemble.cast.entries())if(t>c.on+3){const p=Alchemy.puppets.pose(c,t),root=Alchemy.ensemble.widerRootCurve(c,i,1,t);if(Math.hypot(root[0]-p.feet[0][0],root[1]+4-p.feet[0][1])>.001)faults.push(`root missed foot ${c.id} ${t}`)}
  const full=Alchemy.grove.state(36.5),early=Alchemy.grove.state(32.9);
  if(full.trees.filter(x=>x.grow===1).length!==50)faults.push('grove did not fill');
  if(early.trees.filter(x=>x.grow>0).length>=50)faults.push('no staggered growth');
  if(full.trees.some(x=>x.x<76||x.x>1844))faults.push('tree origins outside plate');
  const camera=[34,40,46].map(t=>Alchemy.grove.state(t).cameraY);
  if(!(camera[0]>100&&camera[1]<-130&&camera[2]===0))faults.push('camera does not return from root view');
  return {faults,firstBranchFrames:first,treeCount:full.trees.length,depthRows:new Set(full.trees.map(x=>x.row)).size,cameraY:camera,checkedSongFrames:3674};
 });
 assert.deepEqual(geometry.faults,[]);
 const acting=await page.evaluate(()=>{
  const c=ALCHEMY_CUES.performance,errors=[],states={},contact=[],lateContact=[];let active=0;
  for(let f=0;f<3674;f++){const t=f/24,h=Alchemy.scene.heraldPose(290,294,-1,t,t);states[h.cue.state]=(states[h.cue.state]||0)+1;
   if(f<c.firstReveal&&(h.cue.visible||h.cue.attack))errors.push('early horn '+f);
   if(f===c.firstReveal&&(!h.cue.visible||h.cue.attack!==1))errors.push('missed reveal');
   if(h.cue.attack>0)active++;
   const camera=Alchemy.performance.rootCamera(t);if(!Object.values(camera).every(Number.isFinite))errors.push('invalid camera '+f);
   if(f>=c.reply.birdContact){const b=Alchemy.ensemble.finalBirdPose(t),error=Math.hypot(b.foot[0]-b.target[0],b.foot[1]-b.target[1]);lateContact.push(error);if(error>1)errors.push('late bird contact '+f)}
   if(!h.bell.every(Number.isFinite)||!h.grip.every(Number.isFinite))errors.push('invalid anchors '+f);
   if(f>=1656&&f<=1806)for(let i=0;i<3;i++){const p=Alchemy.scene.birdPose(i,t),err=Math.hypot(p.foot[0]-p.target[0],p.foot[1]-p.target[1]);if(err>4.5)errors.push('bird contact '+f);contact.push(err)}
  }
  for(const [who,index] of [['luna',7],['sol',2]]){const pts=Alchemy.ensemble.replyPackets(c.reply[who]/24),goal=Alchemy.scene.bez(Alchemy.scene.roots[index],0);if(!pts.some(p=>Math.hypot(p[0]-goal[0],p[1]-goal[1])<.01))errors.push('reply misses '+who)}
  if(Alchemy.grove.state(48).trees.every(t=>t.grow===0))errors.push('early grove departure');
  for(const t of [62,68])if(JSON.stringify(Alchemy.performance.rootCamera(t))!==JSON.stringify({z:1,x:960,y:540}))errors.push('camera does not return '+t);
  return {errors,states,rayActivePercent:active/3674*100,maxBirdContactError:Math.max(...contact),maxLateBirdContactError:Math.max(...lateContact)};
 });assert.deepEqual(acting.errors,[]);assert.ok(acting.states.rest>0);assert.ok(acting.rayActivePercent<25);
 // When the exact score is supplied, sound emission stops at the note-off, while the pose may recover.
 const scoreWiring=await page.evaluate(()=>{const saved=ALCHEMY_TRUMPET_SCORE;window.ALCHEMY_TRUMPET_SCORE={verified:true,intervals:[[240,264],[288,300]]};
  const rows=[239,240,263,264,270,287,288,299,300].map(f=>({f,...Alchemy.performance.horn(f/24)}));window.ALCHEMY_TRUMPET_SCORE=saved;return rows});
 for(const row of scoreWiring){const playing=(row.f>=240&&row.f<264)||(row.f>=288&&row.f<300);assert.equal(row.play,playing?1:0);assert.equal(row.attack>0,playing)}
 // A changed cue must change the rendered image, not just a disconnected debug label.
 const cueWiring=await page.evaluate(()=>{
  const f=ALCHEMY_CUES.chorus.solBranches[1],t=f/24;
  Alchemy.draw(t);const before=Alchemy.c.toDataURL();
  const saved=ALCHEMY_CUES.chorus.solBranches;ALCHEMY_CUES.chorus.solBranches=saved.map(x=>x+72);
  Alchemy.draw(t);const after=Alchemy.c.toDataURL();ALCHEMY_CUES.chorus.solBranches=saved;
  return before!==after;
 });assert.ok(cueWiring,'Cue edits must affect the real canvas');
 const samples=[43.75,44.5,45,48,48.75,49.041667,63,64,64.8,65.6,66.375,67.7,111,112.5,120,122,135.75,136.375,137.916667,138.4,138.75,140,142.9,143.375,145,8,9.5,11.375,11.416667,11.6,12,16.6,17.3,30,32.9,33.5,34.5,36.5,38.5,40.75,44,46.5,47,49.5,54,56.708333,57.6,59.2,60.5,64.75,66.1,68.5,69.5,72.5,74.8,78.5,78.958333,85,96.5,101,102.3,102.625,106.6,106.958333,108.5,116,130,134,137,152.5],hashes={};
 fs.mkdirSync(`out/${tag}-cue-stills`,{recursive:true});
 for(const t of samples){const url=await page.evaluate(t=>window.__frameJPEG(t),t),bytes=Buffer.from(url.split(',')[1],'base64');hashes[t]=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(`out/${tag}-cue-stills/${t}.jpg`,bytes)}
 for(const t of [...samples].reverse()){const url=await page.evaluate(t=>window.__frameJPEG(t),t);assert.equal(crypto.createHash('sha256').update(Buffer.from(url.split(',')[1],'base64')).digest('hex'),hashes[t],`deterministic seek at ${t}s`)}
 assert.deepEqual(errors,[]);
 const result={passed:true,...geometry,acting,cueWiring,scoreWiring,deterministicSampleCount:samples.length,errors};
 fs.writeFileSync(`out/alchemy-${tag}-cues-audit.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
} finally {await browser.close()}
