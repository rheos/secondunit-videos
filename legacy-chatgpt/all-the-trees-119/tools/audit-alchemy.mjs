// Resource errors, random access, song-frame grid and whole-cut cue coverage.
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
 const cues=await p.evaluate(()=>window.ALCHEMY_CUES),[start,end]=cues.range,firstFrame=Math.round(start*24),endFrame=Math.round(end*24),count=endFrame-firstFrame;
 const samples=[0,.75,2.5,8,13,18,27,32,34,38,40.75,44,46.5,47,49.5,57.5,69.5,77,85,99,108.5,116,123,130,145,152.5].filter(t=>t>=start&&t<end),hashes={};
 for(const t of samples)hashes[t]=await hash(t);
 for(const t of [...samples].reverse())assert.equal(await hash(t),hashes[t],'Rendering must not depend on seek order at '+t);
 assert.equal(new Set(Object.values(hashes)).size,samples.length,'Different sections should produce different images');
 const states=await p.evaluate(({start,count})=>Array.from({length:count},(_,i)=>window.__alchemyState(start+i/24)),{start,count});
 states.forEach((s,i)=>{assert.equal(s.songFrame,firstFrame+i);assert.equal(s.poseFrame,2*Math.floor((firstFrame+i)/2))});
 assert.ok(cues.brass.length>20);assert.ok(cues.brass.some(x=>x.time>end-8),'Late brass candidates are missing');
 for(let i=1;i<cues.brass.length;i++)assert.ok(cues.brass[i].time>cues.brass[i-1].time);
 for(const t of Object.values(cues.beats))assert.ok(t>=start&&t<=end);
 const visible=await p.evaluate(()=>{const g=Alchemy.g;Alchemy.draw(130);const a=g.getImageData(0,0,1920,1080).data;let opaque=0;for(let i=3;i<a.length;i+=4)opaque+=a[i]===255;return opaque});assert.equal(visible,1920*1080);
 let preservedV2=null;
 if(process.argv[2]){await p.addScriptTag({content:fs.readFileSync(process.argv[2],'utf8')});for(const t of samples.filter(t=>t>=49.5&&t<79.5))assert.equal(await hash(t),hashes[t],'V2 passage changed at '+t);preservedV2=true}
 assert.deepEqual(errors,[]);
 const report={passed:true,dimensions:[1920,1080],frames:count,songFrames:[firstFrame,endFrame],deterministicRandomAccess:true,sampledSongTimes:samples,opaquePixels:visible,resourceErrors:errors,brassCandidates:cues.brass.length,brassStatus:cues.brassStatus,preservedV2};
 fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/alchemy-v4-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
} finally {await b.close()}
