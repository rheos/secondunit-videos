// Test the geometry used by the drawing, including odd song frames between held poses.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal']});
try {
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('file://'+process.cwd()+'/alchemy.html?offline=1');await page.evaluate(()=>window.__ready);
 const geometry=await page.evaluate(()=>{
  const faults=[],c=ALCHEMY_CUES.chorus,first={sol:null,luna:null};
  for(let f=0;f<3674;f++){
   const s=window.__alchemyState(f/24);
   if(s.songFrame!==f||s.poseFrame!==Math.floor(f/2)*2)faults.push(`grid ${f}`);
   if(s.chorus.sol.appear!==s.chorus.luna.appear)faults.push(`arrival ${f}`);
   for(const who of ['sol','luna']){
    const p=s.chorus[who],nodes=p.branchNodes.reduce((a,b)=>a+b,0);
    if(f<=c[who+'Branches'][0]&&nodes)faults.push(`early branches ${who} ${f}`);
    if(f>c[who+'Branches'][0]&&!nodes)faults.push(`missing branches ${who} ${f}`);
    if(nodes&&first[who]===null)first[who]=f;
    if(f<=c[who+'Leaves'][0]&&p.leaves.some(Boolean))faults.push(`early leaves ${who} ${f}`);
   }
  }
  const full=Alchemy.grove.state(36.5),early=Alchemy.grove.state(32.9);
  if(full.trees.filter(x=>x.grow===1).length!==50)faults.push('grove did not fill');
  if(early.trees.filter(x=>x.grow>0).length>=50)faults.push('no staggered growth');
  if(full.trees.some(x=>x.x<76||x.x>1844))faults.push('tree origins outside plate');
  const camera=[34,40,46].map(t=>Alchemy.grove.state(t).cameraY);
  if(!(camera[0]>100&&camera[1]<-130&&camera[2]===0))faults.push('camera does not return from root view');
  return {faults,firstBranchFrames:first,treeCount:full.trees.length,depthRows:new Set(full.trees.map(x=>x.row)).size,cameraY:camera,checkedSongFrames:3674};
 });
 assert.deepEqual(geometry.faults,[]);
 // A changed cue must change the rendered image, not just a disconnected debug label.
 const cueWiring=await page.evaluate(()=>{
  const f=ALCHEMY_CUES.chorus.solBranches[1],t=f/24;
  Alchemy.draw(t);const before=Alchemy.c.toDataURL();
  const saved=ALCHEMY_CUES.chorus.solBranches;ALCHEMY_CUES.chorus.solBranches=saved.map(x=>x+72);
  Alchemy.draw(t);const after=Alchemy.c.toDataURL();ALCHEMY_CUES.chorus.solBranches=saved;
  return before!==after;
 });assert.ok(cueWiring,'Cue edits must affect the real canvas');
 const samples=[30,32.9,33.5,34.5,36.5,38.5,40.75,44,46.5,47,49.5,54,56.708333,57.6,59.2,60.5,64.75,69.5,85,116,130,152.5],hashes={};
 fs.mkdirSync('out/v5-cue-stills',{recursive:true});
 for(const t of samples){const url=await page.evaluate(t=>window.__frameJPEG(t),t),bytes=Buffer.from(url.split(',')[1],'base64');hashes[t]=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(`out/v5-cue-stills/${t}.jpg`,bytes)}
 for(const t of [...samples].reverse()){const url=await page.evaluate(t=>window.__frameJPEG(t),t);assert.equal(crypto.createHash('sha256').update(Buffer.from(url.split(',')[1],'base64')).digest('hex'),hashes[t])}
 assert.deepEqual(errors,[]);
 const result={passed:true,...geometry,cueWiring,deterministicSampleCount:samples.length,errors};
 fs.writeFileSync('out/alchemy-v5-cues-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
} finally {await browser.close()}
