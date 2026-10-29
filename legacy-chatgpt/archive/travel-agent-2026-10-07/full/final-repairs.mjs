// One-time reviewed repairs, limited to shots 19, 21, and 22 (chunks 3 and 4).
// Preserve completed chunks whose scenes are unchanged; never re-use the affected span.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const dir=path.dirname(new URL(import.meta.url).pathname),root=path.dirname(dir),state=JSON.parse(fs.readFileSync(path.join(root,'out/full/state.json')));
if(state.status!=='complete')throw Error('Wait for the initial export to finish before applying repairs.');
const oldSignature=state.signature,p=path.join(dir,'journey.js');let s=fs.readFileSync(p,'utf8');
const before="actor(xx,yy,.68,t,{walk:1,dir:Math.sin(a)>0?-1:1,wind:.4});clockFace(959,552,125,t,true);";
const after="clockFace(959,552,125,t,true);actor(xx,yy,.68,t,{walk:1,dir:Math.sin(a)>0?-1:1,wind:.4});";
if(!s.includes(before))throw Error('Expected clock ordering not found; refusing a speculative replacement.');s=s.replace(before,after);
const start=s.indexOf('SCENES.mule='),end=s.indexOf('SCENES.carrot=',start);if(start<0||end<0)throw Error('Expected mule scene not found');
let scene=s.slice(start,end);scene=scene.replace('hills(t,901);','hills(t,901);rect(267,840,1235,52,C.paper);line(268,842,1500,842,C.soft,1.5);').replace('mule(981,825,1.09,t)','mule(981,840,1.09,t)').replace('1163,602','1163,621').replace('suitcase(873,635','suitcase(873,650');s=s.slice(0,start)+scene+s.slice(end);fs.writeFileSync(p,s);
const sources=['index.html','base.js','kit.js','journey.js','traps.js','release.js','timeline.js','player.js','audio-features.js'];
const signature=crypto.createHash('sha256').update(sources.map(f=>fs.readFileSync(path.join(dir,f))).join('\n')).digest('hex');
const oldDir=path.join(root,'out/full/chunks',oldSignature.slice(0,12)),newDir=path.join(root,'out/full/chunks',signature.slice(0,12));fs.mkdirSync(newDir,{recursive:true});
let copied=[];for(let i=0;i<14;i++){if(i===3||i===4)continue;let name=`part-${String(i).padStart(3,'0')}.mp4`,src=path.join(oldDir,name),dst=path.join(newDir,name);let done=JSON.parse(fs.readFileSync(src+'.done'));if(done.signature!==oldSignature)throw Error('Cache provenance mismatch');fs.copyFileSync(src,dst);fs.writeFileSync(dst+'.done',JSON.stringify({...done,signature,reusedFrom:oldSignature}));copied.push(i);}
fs.writeFileSync(path.join(root,'out/full/repair-log.json'),JSON.stringify({from:oldSignature,to:signature,reusedChunks:copied,rerenderChunks:[3,4],changes:['Clock painted behind the walker in shot 19','Ground contact corrected for the traveler and mule in shots 21–22']},null,2));
console.log('Repairs applied; re-use 12 unaffected chunks; re-render chunks 3 and 4.');
