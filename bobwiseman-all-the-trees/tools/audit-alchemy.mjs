// Production render audit: resource errors, random access determinism, song-frame grid, cue coverage.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu']});
try {
 const p=await b.newPage({viewport:{width:1920,height:1080}}),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto('file://'+process.cwd()+'/alchemy.html?offline=1');await p.evaluate(()=>window.__ready);
 const hash=async t=>crypto.createHash('sha256').update(await p.evaluate(t=>window.__frameJPEG(t,.93),t)).digest('hex');
 const first=await hash(69.5);await hash(47);await hash(78.75);await hash(53.125);assert.equal(await hash(69.5),first,'Rendering must not depend on seek order');
 const states=await p.evaluate(()=>Array.from({length:780},(_,i)=>window.__alchemyState(47+i/24)));
 states.forEach((s,i)=>{assert.equal(s.songFrame,1128+i);assert.equal(s.poseFrame,1128+2*Math.floor(i/2))});
 const cues=await p.evaluate(()=>window.ALCHEMY_CUES);assert.ok(cues.brass.length>20,'Whole-span harmonic detection did not collapse');
 assert.ok(cues.brass.some(x=>x.time>75));for(let i=1;i<cues.brass.length;i++)assert.ok(cues.brass[i].time>cues.brass[i-1].time);
 for(const t of Object.values(cues.beats))assert.ok(t>=47&&t<79.5);
 const visible=await p.evaluate(()=>{const g=Alchemy.g;Alchemy.draw(69.5);const a=g.getImageData(0,0,1920,1080).data;let opaque=0;for(let i=3;i<a.length;i+=4)opaque+=a[i]===255;return opaque});assert.equal(visible,1920*1080);
 assert.deepEqual(errors,[]);
 const report={passed:true,dimensions:[1920,1080],frames:780,songFrames:'[1128,1908)',deterministicRandomAccess:true,opaquePixels:visible,resourceErrors:errors,brassCandidates:cues.brass.length,brassStatus:cues.brassStatus};
 fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/alchemy-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
} finally {await b.close()}
